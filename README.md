# Music Analyzer Frontend

A modern, interactive music analysis web application built with React and Vite. This frontend provides a comprehensive platform for analyzing music tracks, visualizing audio data, extracting instrument-specific information, and exploring music lyrics.

## Features

- **User Authentication**: Secure sign-in and sign-up with Google OAuth integration
- **Audio Visualization**: Real-time waveform visualization while playing audio
- **Music Analysis**: Detailed analysis of songs including:
  - Instrument separation (Bass, Drums, Vocals, Guitar, Piano, Flute, Violin, and Other instruments)
  - Frequency analysis
  - Tonality/Key detection
  - BPM and tempo information
  - Audio duration and metadata
- **Lyrics Display**: View song lyrics synchronized with music analysis
- **AI-Powered Chatbot**: Interactive music chatbot for personalized recommendations and discussions
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Protected Routes**: Secure access to authenticated features

## Tech Stack

- **Frontend Framework**: React 19.1.0
- **Build Tool**: Vite 7.0.4
- **Styling**: Tailwind CSS 4.1.11 with @tailwindcss/vite
- **Routing**: React Router DOM 7.7.1
- **API Client**: Axios 1.11.0
- **Data Visualization**: D3.js 7.9.0
- **Icons**: Lucide React 0.533.0
- **Authentication**: @react-oauth/google 0.12.2
- **ESLint**: For code quality and consistency

## Project Structure

```
music-analyzer-frontend/
├── src/
│   ├── api/              # API client and configuration
│   │   └── api.js        # Axios instance and API calls
│   ├── auth/             # Authentication components
│   │   ├── SignIn.jsx
│   │   ├── SignUp.jsx
│   │   └── UserProfile.jsx
│   ├── compoments/       # Reusable components
│   │   ├── AudioPlayerWithVisualizer.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── chatbot/
│   │       └── MusicChatbot.jsx
│   ├── design/           # Design and layout components
│   │   ├── Background.jsx
│   │   ├── Quotes.jsx
│   │   └── quotes.json
│   ├── page/             # Page components
│   │   ├── Home.jsx
│   │   ├── HomeAfterLogin.jsx
│   │   ├── Song.jsx      # Main song analysis page
│   │   ├── Lyrics.jsx
│   │   ├── Bass.jsx
│   │   ├── Drum.jsx
│   │   ├── Flute.jsx
│   │   ├── Guitar.jsx
│   │   ├── Piano.jsx
│   │   ├── Violin.jsx
│   │   ├── Vocal.jsx
│   │   └── Other.jsx
│   ├── App.jsx           # Main app component with routing
│   ├── main.jsx          # Application entry point
│   ├── App.css
│   └── index.css
├── public/               # Static assets
├── .env                  # Environment variables (DO NOT commit)
├── .env.example          # Example environment variables
├── vite.config.js        # Vite configuration
├── eslint.config.js      # ESLint configuration
├── vercel.json           # Vercel deployment configuration
├── package.json          # Project dependencies
└── index.html            # HTML entry point
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager
- A Google OAuth Client ID (from [Google Cloud Console](https://console.cloud.google.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd music-analyzer-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update the following variables:
   - `VITE_FRONTEND_URL`: Your frontend URL (default: http://localhost:5173)
   - `VITE_BACKEND_URL`: Your backend API URL (default: http://127.0.0.1:8000)
   - `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth Client ID

   See [Environment Variables](#-environment-variables) section for details.

### Development

1. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:5173`

2. **Run ESLint to check code quality**
   ```bash
   npm run lint
   ```

3. **Fix ESLint issues automatically**
   ```bash
   npm run lint -- --fix
   ```

### Production Build

1. **Build for production**
   ```bash
   npm run build
   ```
   
   This generates an optimized production build in the `dist/` directory.

2. **Preview production build locally**
   ```bash
   npm run preview
   ```

## Environment Variables

The application requires the following environment variables. Copy `.env.example` to `.env` and update the values:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_FRONTEND_URL` | Frontend application URL | `http://localhost:5173` |
| `VITE_BACKEND_URL` | Backend API server URL | `http://127.0.0.1:8000` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID for authentication | `502237455221-xxx.apps.googleusercontent.com` |

### Getting Google Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add your frontend URL to authorized JavaScript origins
6. Copy the Client ID and paste it in `.env`

## API Integration

The frontend connects to a backend FastAPI server. All API requests are made through `src/api/api.js` which includes:

- **Base URL**: Configurable via `VITE_BACKEND_URL`
- **Authentication**: Bearer token authentication via `Authorization` header
- **Error Handling**: Centralized error parsing and handling
- **Token Management**: Automatic token refresh from localStorage

### Key API Endpoints

- `POST /auth/google` - Google OAuth authentication
- `GET /auth/users/me` - Get current user information
- `GET /songs/:id` - Get song analysis data
- `GET /lyrics/:songId` - Get song lyrics

## Authentication

The application uses Google OAuth 2.0 for authentication:

- **Public Routes**: Home, Sign In, Sign Up pages
- **Protected Routes**: Home After Login, Song Analysis, Lyrics (require authentication)
- **Token Storage**: Auth tokens are stored in localStorage
- **Auto Token Injection**: Tokens are automatically included in all API requests

## Styling

The project uses **Tailwind CSS 4.1.11** for styling with:
- Dark-themed UI with gradient accents
- Responsive design for mobile, tablet, and desktop
- Backdrop blur effects for modern aesthetics
- Custom color schemes for music visualization

## Features in Detail

### Audio Visualization
- Real-time waveform display during playback
- WebAudio API integration for frequency analysis
- Canvas-based rendering for smooth animations

### Instrument Analysis
Dedicated pages for analyzing specific instruments:
- **Bass**: Low-frequency analysis
- **Drums**: Percussion pattern detection
- **Vocals**: Voice frequency and clarity analysis
- **Guitar**: String frequency detection
- **Piano**: Key and chord analysis
- **Flute**: Wind instrument characteristics
- **Violin**: String instrument analysis
- **Other**: Additional instruments and sounds

### Music Chatbot
AI-powered assistant for:
- Music recommendations
- Playlist suggestions
- Music discussion and analysis
- Artist information

## Deployment

The application is configured for deployment on **Vercel** with a `vercel.json` configuration file that:
- Rewrites all routes to `index.html` for SPA support
- Optimizes static assets
- Enables API integration with the backend

### Deploy to Vercel

1. Push your code to a Git repository (GitHub, GitLab, Bitbucket)
2. Import the repository in Vercel
3. Set environment variables in Vercel project settings
4. Deploy automatically

## Project Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint for code quality |
| `npm run preview` | Preview production build locally |

## Debugging

### Common Issues

1. **CORS Errors**: Ensure backend URL is correct and CORS is enabled on the backend
2. **Authentication Failures**: Check Google Client ID in `.env`
3. **Audio Visualization Not Working**: Verify browser supports WebAudio API
4. **Protected Routes Not Working**: Check authentication token in localStorage

### Browser DevTools

- Check **Network** tab for API requests
- Check **Console** for error messages
- Check **Application** > **Local Storage** for auth token

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

This project is part of an internship program.

## Support

For issues or questions:
- Check existing issues in the repository
- Create a new issue with detailed description
- Contact the development team

## Acknowledgments

- React and Vite communities
- Google OAuth for authentication
- D3.js for data visualization
- Tailwind CSS for styling
- All contributors and team members
