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