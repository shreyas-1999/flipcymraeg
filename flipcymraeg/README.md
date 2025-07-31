# FlipCymru v2.0 - Welsh Language Learning Platform

A comprehensive Welsh language learning platform built with Next.js, Firebase, and AI-powered features.

## 🌟 Features

### Core Learning Features
- **Interactive Lessons**: 7 comprehensive Welsh lessons with exercises and quizzes
- **Smart Flashcards**: AI-powered vocabulary cards with spaced repetition
- **Audio Pronunciation**: Text-to-speech with normal and slow speed options
- **Live Translation**: Real-time Welsh-English translation powered by Google Gemini
- **Progress Tracking**: Detailed analytics and learning progress monitoring
- **Proficiency System**: Beginner, Intermediate, and Advanced level content

### User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Mode**: Customizable theme preferences
- **Offline Support**: Cached audio and content for offline learning
- **User Dashboard**: Personalized learning dashboard with statistics
- **Custom Vocabulary**: Create and manage personal flashcard collections

### Admin Features
- **Admin Dashboard**: Comprehensive management interface
- **User Management**: Monitor and manage user accounts
- **Content Management**: Add, edit, and organize lessons and vocabulary
- **Analytics**: Detailed usage statistics and learning insights
- **Bulk Operations**: Import/export vocabulary and lesson content

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Firebase account
- Google Cloud account (for Gemini AI and TTS)

### Installation

1. **Clone the repository**
\`\`\`bash
git clone <repository-url>
cd flipcymru-v2
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Set up environment variables**
Create a `.env.local` file in the root directory:
\`\`\`env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Services
NEXT_PUBLIC_GOOGLE_TTS_API_KEY=your_tts_api_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
\`\`\`

4. **Set up Firebase**
- Create a Firebase project
- Enable Authentication (Email/Password and Google)
- Set up Firestore database
- Configure storage rules

5. **Deploy Firestore rules**
\`\`\`bash
firebase deploy --only firestore:rules
\`\`\`

6. **Seed the database**
\`\`\`bash
# Install Python dependencies
pip install firebase-admin

# Set up service account
export GOOGLE_APPLICATION_CREDENTIALS="path/to/serviceAccountKey.json"

# Run database setup
python scripts/setup_database.py
python scripts/seed_public_vocabulary.py
python scripts/populate_lessons.py
\`\`\`

7. **Start the development server**
\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to see the application.

## 📁 Project Structure

\`\`\`
flipcymru-v2/
├── app/                          # Next.js app directory
│   ├── admin/                    # Admin dashboard pages
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Landing page
├── components/                   # React components
│   ├── admin/                   # Admin-specific components
│   ├── auth/                    # Authentication components
│   ├── dashboard/               # User dashboard components
│   ├── landing/                 # Landing page components
│   ├── sidebar/                 # Navigation components
│   └── ui/                      # Reusable UI components
├── contexts/                     # React contexts
│   └── auth-context.tsx         # Authentication context
├── lib/                         # Utility libraries and services
│   ├── firebase.ts              # Firebase configuration
│   ├── *-service.ts             # Various service modules
│   └── text-to-speech.ts        # TTS functionality
├── scripts/                     # Database and setup scripts
│   ├── setup_database.py        # Initial database setup
│   ├── seed_public_vocabulary.py # Vocabulary seeding
│   └── populate_lessons.py      # Lesson population
├── docs/                        # Documentation
└── firestore.rules              # Firestore security rules
\`\`\`

## 🔧 Configuration

### Firebase Setup
1. Create a new Firebase project
2. Enable Authentication with Email/Password and Google providers
3. Create a Firestore database
4. Set up the following collections:
   - `users` - User profiles and progress
   - `publicVocabulary` - Shared vocabulary cards
   - `customFlashcards` - User-created flashcards
   - `lessons` - Learning lessons and content
   - `userProgress` - Learning progress tracking

### Google Cloud Services
1. Enable Text-to-Speech API
2. Enable Gemini AI API
3. Create API keys and add to environment variables

## 📚 Usage Guide

### For Learners
1. **Sign Up**: Create an account or sign in with Google
2. **Choose Level**: Select your Welsh proficiency level
3. **Start Learning**: Access lessons, flashcards, and practice exercises
4. **Track Progress**: Monitor your learning journey in the dashboard
5. **Create Custom Content**: Build personal flashcard collections

### For Administrators
1. **Access Admin Panel**: Navigate to `/admin` (requires admin privileges)
2. **Manage Users**: View and manage user accounts
3. **Content Management**: Add/edit lessons and vocabulary
4. **Analytics**: Monitor platform usage and learning metrics
5. **Bulk Operations**: Import/export content in bulk

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

### Key Technologies
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Firebase (Auth, Firestore, Storage)
- **AI Services**: Google Gemini, Text-to-Speech API
- **State Management**: React Context API
- **Audio**: Web Audio API with custom controls

### Database Schema

#### Users Collection
\`\`\`typescript
interface User {
  uid: string;
  email: string;
  displayName: string;
  isAdmin: boolean;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  preferences: {
    theme: 'light' | 'dark';
    language: 'en' | 'cy';
  };
}
\`\`\`

#### Lessons Collection
\`\`\`typescript
interface Lesson {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  content: LessonContent[];
  exercises: Exercise[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
\`\`\`

#### Public Vocabulary Collection
\`\`\`typescript
interface VocabularyCard {
  id: string;
  welsh: string;
  english: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  pronunciation?: string;
  exampleSentence?: string;
  createdAt: Timestamp;
}
\`\`\`

## 🚀 Deployment

### Vercel Deployment (Recommended)
1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
1. Build the application: `npm run build`
2. Deploy the `.next` folder to your hosting provider
3. Ensure environment variables are configured

## 🔒 Security

### Firestore Rules
The application uses comprehensive Firestore security rules to:
- Protect user data and privacy
- Restrict admin operations to authorized users
- Prevent unauthorized data access
- Validate data structure and types

### Authentication
- Secure email/password authentication
- Google OAuth integration
- Protected routes and API endpoints
- Session management with Firebase Auth

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add new feature'`
5. Push to the branch: `git push origin feature/new-feature`
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation in the `/docs` folder
- Review the database seeding guides
- Check Firebase console for any configuration issues
- Ensure all environment variables are properly set

## 🔄 Version History

- **v2.0**: Complete rewrite with Next.js 14, enhanced UI, AI integration
- **v1.0**: Initial version with basic vocabulary features

---

**FlipCymru v2.0** - Empowering Welsh language learning through technology 🏴󠁧󠁢󠁷󠁬󠁳󠁿

