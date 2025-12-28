import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const prisma = new PrismaClient();

// Middleware
app.use(cors({
    origin: 'http://localhost:8080',
    credentials: true
}));
app.use(express.json());

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3001/auth/github/callback';
const GOOGLE_REDIRECT_URI = 'http://localhost:3001/auth/google/callback';

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'OAuth server is running' });
});

// GitHub OAuth callback endpoint
app.get('/auth/github/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).json({ error: 'No code provided' });
    }

    try {
        // Exchange code for access token
        const tokenResponse = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
                client_id: GITHUB_CLIENT_ID,
                client_secret: GITHUB_CLIENT_SECRET,
                code: code,
                redirect_uri: REDIRECT_URI,
            },
            {
                headers: {
                    Accept: 'application/json',
                },
            }
        );

        const accessToken = tokenResponse.data.access_token;

        if (!accessToken) {
            console.error('Token exchange failed:', tokenResponse.data);
            return res.status(400).json({
                error: 'Failed to get access token',
                received_data: tokenResponse.data,
            });
        }

        // Get user data from GitHub
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const userData = userResponse.data;

        // Upsert user in database
        const user = await prisma.user.upsert({
            where: { githubId: userData.id.toString() },
            update: {
                username: userData.login,
                // We don't overwrite preferences here to preserve user settings
            },
            create: {
                githubId: userData.id.toString(),
                username: userData.login,
                preferences: '{}', // Default empty preferences
            },
        });

        // Redirect back to frontend with user data
        // We can pass the database ID or just stick with GitHub ID for now
        const frontendURL = `http://localhost:8080/auth/callback?user=${encodeURIComponent(
            JSON.stringify({
                id: userData.id.toString(),
                login: userData.login,
                name: userData.name || userData.login,
                avatar_url: userData.avatar_url,
                email: userData.email,
                bio: userData.bio,
                public_repos: userData.public_repos,
                followers: userData.followers,
                following: userData.following,
                dbUser: user, // Pass DB user object too if needed
            })
        )}`;

        res.redirect(frontendURL);
    } catch (error) {
        console.error('OAuth error:', error.response?.data || error.message);
        const errorDetails = error.response?.data?.error_description || error.response?.data?.error || error.message;
        res.redirect(`http://localhost:8080/login?error=auth_failed&details=${encodeURIComponent(errorDetails)}`);
    }
});

// Google OAuth endpoints
app.get('/auth/google', (req, res) => {
    const scope = encodeURIComponent('https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_REDIRECT_URI}&response_type=code&scope=${scope}&access_type=offline`;
    res.redirect(authUrl);
});

app.get('/auth/google/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).json({ error: 'No code provided' });
    }

    try {
        const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
            redirect_uri: GOOGLE_REDIRECT_URI
        });

        const accessToken = tokenResponse.data.access_token;

        const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const userData = userResponse.data;

        // Upsert user based on email (primary) or googleId
        let user;

        // First try to find by Google ID
        user = await prisma.user.findUnique({
            where: { googleId: userData.id }
        });

        if (!user && userData.email) {
            // Then try by email to link accounts
            user = await prisma.user.findFirst({
                where: { email: userData.email }
            });

            if (user) {
                // Link Google ID to existing account
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { googleId: userData.id }
                });
            }
        }

        if (!user) {
            // Create new user
            user = await prisma.user.create({
                data: {
                    googleId: userData.id,
                    email: userData.email,
                    username: userData.name || userData.email.split('@')[0],
                    avatarUrl: userData.picture,
                    preferences: '{}'
                }
            });
        }

        const frontendURL = `http://localhost:8080/auth/callback?user=${encodeURIComponent(
            JSON.stringify({
                id: user.googleId || user.githubId, // specific logic for frontend might need adjustment, but assuming ID works
                login: user.username,
                name: user.username,
                avatar_url: userData.picture,
                email: userData.email,
                dbUser: user
            })
        )}`;

        res.redirect(frontendURL);

    } catch (error) {
        console.error('Google OAuth error:', error.response?.data || error.message);
        res.redirect(`http://localhost:8080/login?error=auth_failed&details=${encodeURIComponent('Google login failed')}`);
    }
});

// User Preferences Endpoints

// Get user preferences
app.get('/api/user/:githubId/preferences', async (req, res) => {
    try {
        const { githubId } = req.params;
        const user = await prisma.user.findUnique({
            where: { githubId },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(JSON.parse(user.preferences));
    } catch (error) {
        console.error('Error fetching preferences:', error);
        res.status(500).json({ error: 'Failed to fetch preferences' });
    }
});

// Update user preferences
app.put('/api/user/:githubId/preferences', async (req, res) => {
    try {
        const { githubId } = req.params;
        const preferences = req.body;

        const user = await prisma.user.update({
            where: { githubId },
            data: {
                preferences: JSON.stringify(preferences),
            },
        });

        res.json(JSON.parse(user.preferences));
    } catch (error) {
        console.error('Error updating preferences:', error);
        res.status(500).json({ error: 'Failed to update preferences' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 OAuth server running on http://localhost:${PORT}`);
    console.log(`📝 GitHub OAuth callback: ${REDIRECT_URI}`);
});
