# OpenSource Compass

**An intelligent platform for discovering open-source issues tailored to your skills.**

OpenSource Compass uses real GitHub API data and an intelligent matching algorithm to help students and developers find the perfect open-source issues to contribute to based on their skills, experience level, and interests.

## ✨ Features

- 🔍 **Real GitHub Integration**: Live data from GitHub's API
- 🎯 **Intelligent Matching**: 5-factor scoring algorithm (skill match, difficulty, activity, popularity, freshness)
- 🚀 **Personalized Recommendations**: Issues matched to your exact skill set
- 📊 **Match Score Breakdown**: See why each issue is recommended
- ⚡ **Smart Caching**: Optimized API usage with TTL-based caching
- 🔐 **GitHub OAuth**: Secure authentication with your GitHub account
- 🎨 **Modern UI**: Brutal design system with smooth animations
- 📱 **Responsive**: Works on all devices

## 🛠 Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Express.js (OAuth server)
- **API**: GitHub REST API v3
- **State Management**: React Hooks + localStorage caching
- **Routing**: React Router v6

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- GitHub account
- GitHub OAuth App (for authentication)

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/yourusername/open-source-navigator.git
cd open-source-navigator
```

2. **Install dependencies**:
```bash
npm install
cd server && npm install && cd ..
```

3. **Set up GitHub OAuth App**:
   - Go to GitHub Settings → Developer settings → OAuth Apps → New OAuth App
   - Application name: `OpenSource Compass`
   - Homepage URL: `http://localhost:8080`
   - Authorization callback URL: `http://localhost:3001/auth/github/callback`
   - Save your Client ID and Client Secret

4. **Configure environment variables**:

Create `.env` in the root:
```env
VITE_GITHUB_CLIENT_ID=your_client_id_here
VITE_BACKEND_URL=http://localhost:3001
```

Create `server/.env`:
```env
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
PORT=3001
```

5. **Run the application**:

Terminal 1 - Backend:
```bash
npm run dev:server
```

Terminal 2 - Frontend:
```bash
npm run dev
```

6. **Open your browser**: Navigate to `http://localhost:8080`

## 📖 How It Works

### Intelligent Matching Algorithm

The platform uses a sophisticated 5-factor scoring system:

1. **Skill Match (40%)**: Matches your languages/frameworks with issue requirements
2. **Difficulty Match (30%)**: Aligns issue complexity with your experience level
3. **Activity Score (15%)**: Prioritizes actively maintained repositories
4. **Popularity Score (10%)**: Balances popularity (not too competitive, not too obscure)
5. **Freshness Score (5%)**: Slight boost for recently opened issues

### Caching Strategy

- **Repository data**: 1 hour TTL
- **Issue data**: 15 minutes TTL
- **Rate limit status**: 1 minute TTL
- **User recommendations**: 30 minutes TTL

### API Rate Limits

- **Authenticated**: 5,000 requests/hour (using OAuth token)
- **Unauthenticated**: 60 requests/hour

## 🎯 Usage

1. **Sign in** with your GitHub account
2. **Complete onboarding**: Select your programming languages, frameworks, and experience level
3. **Browse recommendations**: View personalized repository and issue suggestions
4. **Filter results**: Use filters for beginner-friendly, GSoC, or Hacktoberfest issues
5. **View match scores**: See why each issue is recommended with detailed breakdowns
6. **Start contributing**: Click through to GitHub and make your first contribution!

## 📦 Available Scripts

- `npm run dev` - Start frontend development server
- `npm run dev:server` - Start backend OAuth server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🚢 Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables:
   - `VITE_GITHUB_CLIENT_ID`
   - `VITE_BACKEND_URL`
4. Deploy

### Backend (Vercel Serverless)

The backend can be deployed as Vercel Serverless Functions. Update your GitHub OAuth App callback URL to your production domain.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- GitHub API for providing comprehensive repository and issue data
- shadcn/ui for the beautiful component library
- The open-source community for inspiration

---

**Made with ❤️ for the open-source community**
