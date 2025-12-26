import axios from 'axios';

export default async function handler(req, res) {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { code } = req.query;

    if (!code) {
        return res.status(400).json({ error: 'No code provided' });
    }

    const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || process.env.VITE_GITHUB_CLIENT_ID;
    const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

    // Dynamic redirect URI based on environment
    // In production, this runs on the same domain usually
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    // This must MATCH exactly what was sent in the authorize step
    // We will assume the frontend sends the user to /api/auth/callback
    const REDIRECT_URI = `${protocol}://${host}/api/auth/callback`;

    console.log('Using Redirect URI:', REDIRECT_URI); // Debug log

    try {
        // Exchange code for access token
        const tokenResponse = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
                client_id: GITHUB_CLIENT_ID,
                client_secret: GITHUB_CLIENT_SECRET,
                code: code,
                redirect_uri: REDIRECT_URI, // This needs to match exactly what standard OAuth flow expects
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
                details: tokenResponse.data
            });
        }

        // Get user data from GitHub
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const userData = userResponse.data;

        // Redirect back to frontend
        // Use the host header to determine where to redirect back to
        const frontendBaseUrl = process.env.VITE_APP_URL || `${protocol}://${host}`;

        const frontendURL = `${frontendBaseUrl}/auth/callback?user=${encodeURIComponent(
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
                githubToken: accessToken, // useful if you want to make calls from client
            })
        )}`;

        res.redirect(frontendURL);
    } catch (error) {
        console.error('OAuth error:', error.response?.data || error.message);
        const errorDetails = error.response?.data?.error_description || error.response?.data?.error || error.message;
        const frontendBaseUrl = process.env.VITE_APP_URL || `${protocol}://${host}`;
        res.redirect(`${frontendBaseUrl}/login?error=auth_failed&details=${encodeURIComponent(errorDetails)}`);
    }
}
