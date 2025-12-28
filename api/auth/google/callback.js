import axios from 'axios';

export default async function handler(req, res) {
    // CORS headers
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

    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const REDIRECT_URI = `${protocol}://${host}/api/auth/google/callback`;

    try {
        // Exchange code for tokens
        const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
            redirect_uri: REDIRECT_URI
        });

        const accessToken = tokenResponse.data.access_token;

        // Get User Info
        const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const userData = userResponse.data;

        // Redirect to frontend
        const frontendBaseUrl = process.env.VITE_APP_URL || `${protocol}://${host}`;
        const frontendURL = `${frontendBaseUrl}/auth/callback?user=${encodeURIComponent(
            JSON.stringify({
                id: userData.id,
                login: userData.name || userData.email.split('@')[0], // Fallback for pure Google users
                name: userData.name,
                avatar_url: userData.picture,
                email: userData.email,
                googleToken: accessToken
            })
        )}`;

        res.redirect(frontendURL);

    } catch (error) {
        console.error('Google OAuth error:', error.response?.data || error.message);
        const errorDetails = error.response?.data?.error_description || error.response?.data?.error || error.message;
        const frontendBaseUrl = process.env.VITE_APP_URL || `${protocol}://${host}`;
        res.redirect(`${frontendBaseUrl}/login?error=auth_failed&details=${encodeURIComponent(errorDetails)}`);
    }
}
