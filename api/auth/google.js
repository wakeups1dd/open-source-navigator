export default function handler(req, res) {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;

    // Determine redirect URI
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const REDIRECT_URI = `${protocol}://${host}/api/auth/google/callback`;

    if (!GOOGLE_CLIENT_ID) {
        return res.status(500).json({ error: 'Missing GOOGLE_CLIENT_ID configuration' });
    }

    const scope = encodeURIComponent('https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${scope}&access_type=offline`;

    res.redirect(authUrl);
}
