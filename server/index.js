import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: 'http://localhost:8080',
    credentials: true
}));
app.use(express.json());

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3001/auth/github/callback';

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
            return res.status(400).json({ error: 'Failed to get access token' });
        }

        // Get user data from GitHub
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const userData = userResponse.data;

        // Redirect back to frontend with user data
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
            })
        )}`;

        res.redirect(frontendURL);
    } catch (error) {
        console.error('OAuth error:', error.response?.data || error.message);
        res.redirect('http://localhost:8080/login?error=auth_failed');
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 OAuth server running on http://localhost:${PORT}`);
    console.log(`📝 GitHub OAuth callback: ${REDIRECT_URI}`);
});
