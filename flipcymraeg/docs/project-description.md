# FlipCymru v2.0 - Welsh Language Learning Platform

## Project Overview

FlipCymru v2.0 is a comprehensive Welsh language learning platform built with Next.js, React, and Firebase. The application provides an interactive environment for users to learn Welsh through vocabulary practice, structured lessons, custom flashcards, and real-time translation tools.

## Key Features

### 🎯 Core Learning Features
- **Vocabulary Practice**: Interactive flashcard system with spaced repetition
- **Custom Flashcards**: Users can create and manage their own flashcard sets
- **Structured Lessons**: Progressive learning modules with tracked completion
- **Live Translation**: Real-time English-to-Welsh and Welsh-to-English translation
- **Text-to-Speech**: Audio pronunciation for Welsh words and phrases
- **Progress Tracking**: Detailed analytics of learning progress and achievements

### 👥 User Management
- **Authentication**: Secure user registration and login via Firebase Auth
- **User Profiles**: Personalized learning experience with progress persistence
- **Settings Management**: Customizable user preferences and learning settings
- **Role-based Access**: Different access levels for regular users and administrators

### 🛠 Administrative Features
- **Admin Dashboard**: Comprehensive management interface for administrators
- **User Management**: Admin tools for managing user accounts and permissions
- **Vocabulary Management**: CRUD operations for public vocabulary database
- **Lesson Management**: Tools for creating and managing lesson content
- **Analytics**: System-wide usage statistics and user progress analytics

## Technical Architecture

### Frontend Stack
- **Framework**: Next.js 14 with App Router
- **UI Library**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context API for authentication and settings
- **Audio**: Web Audio API integration for text-to-speech functionality

### Backend Services
- **Database**: Firebase Firestore for real-time data storage
- **Authentication**: Firebase Authentication
- **File Storage**: Firebase Storage for audio files and assets
- **AI Integration**: Google Gemini API for translation services
- **Text-to-Speech**: Google Cloud Text-to-Speech API

### Key Libraries and Dependencies
- `firebase`: Firebase SDK for authentication and database
- `@google/generative-ai`: Gemini AI integration
- `lucide-react`: Icon library
- `tailwindcss`: Utility-first CSS framework
- `@radix-ui`: Accessible UI primitives

## Database Structure

### Collections

#### Users Collection (`users`)
\`\`\`typescript
{
  uid: string,
  email: string,
  displayName: string,
  role: 'user' | 'admin',
  createdAt: Timestamp,
  settings: {
    autoPlay: boolean,
    speechRate: number,
    theme: string
  }
}
\`\`\`

#### Public Vocabulary (`publicVocabulary`)
\`\`\`typescript
{
  id: string,
  welsh: string,
  english: string,
  category: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  audioUrl?: string,
  createdAt: Timestamp
}
\`\`\`

#### User Progress (`userProgress`)
\`\`\`typescript
{
  userId: string,
  vocabularyId: string,
  correct: number,
  incorrect: number,
  lastReviewed: Timestamp,
  mastered: boolean,
  points: number
}
\`\`\`

#### Custom Flashcards (`customFlashcards`)
\`\`\`typescript
{
  id: string,
  userId: string,
  welsh: string,
  english: string,
  category: string,
  createdAt: Timestamp
}
\`\`\`

#### Lessons (`lessons`)
\`\`\`typescript
{
  id: string,
  title: string,
  description: string,
  content: string,
  difficulty: string,
  order: number,
  isPublished: boolean,
  createdAt: Timestamp
}
\`\`\`

## User Roles and Permissions

### Regular Users
- Access to vocabulary practice and custom flashcards
- Lesson viewing and progress tracking
- Live translation tools
- Personal settings management
- Progress analytics viewing

### Administrators
- All regular user permissions
- User management (view, edit, delete users)
- Vocabulary database management
- Lesson content management
- System analytics and reporting
- Database seeding and maintenance tools

## File Structure

\`\`\`
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx               # Landing page
│   └── admin/
│       └── page.tsx           # Admin dashboard page
├── components/
│   ├── admin/                 # Admin-specific components
│   ├── auth/                  # Authentication components
│   ├── dashboard/             # Main dashboard components
│   ├── landing/               # Landing page components
│   ├── sidebar/               # Navigation components
│   └── ui/                    # Reusable UI components
├── contexts/
│   ├── auth-context.tsx       # Authentication state management
│   └── settings-context.tsx   # User settings management
├── lib/
│   ├── firebase.ts            # Firebase configuration
│   ├── *-service.ts           # Service layer for data operations
│   ├── gemini-service.ts      # AI translation service
│   └── text-to-speech.ts      # TTS functionality
├── scripts/
│   ├── setup_database.py      # Database initialization
│   ├── seed_public_vocabulary.py # Vocabulary seeding
│   ├── populate_lessons.py    # Lesson content seeding
│   └── welsh_learning_backend.py # Backend utilities
└── docs/
    ├── database-seeding-guide.md
    ├── lesson-population-guide.md
    └── project-description.md
\`\`\`

## API Integrations

### Google Gemini AI
- **Purpose**: Real-time translation between English and Welsh
- **Configuration**: Requires `NEXT_PUBLIC_GEMINI_API_KEY`
- **Usage**: Translation service for live translation feature

### Google Cloud Text-to-Speech
- **Purpose**: Audio pronunciation of Welsh words and phrases
- **Configuration**: Requires `NEXT_PUBLIC_GOOGLE_TTS_API_KEY`
- **Usage**: Generates audio for vocabulary practice and lessons

### Firebase Services
- **Firestore**: Real-time database for all application data
- **Authentication**: User registration, login, and session management
- **Storage**: File storage for audio files and user-generated content

## Environment Variables

\`\`\`env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_GOOGLE_TTS_API_KEY=your_tts_api_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
\`\`\`

## Setup and Installation

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Configure environment variables** (see above)
4. **Run database setup scripts**:
   - `python scripts/setup_database.py`
   - `python scripts/seed_public_vocabulary.py`
   - `python scripts/populate_lessons.py`
5. **Start development server**: `npm run dev`

## Features in Detail

### Vocabulary Practice System
- Spaced repetition algorithm for optimal learning
- Progress tracking with points system (10 points per correct answer)
- Mastery tracking based on consecutive correct answers
- Audio pronunciation for each vocabulary item
- Category-based organization of vocabulary

### Custom Flashcard System
- User-generated content with CRUD operations
- Personal flashcard collections
- Integration with main vocabulary practice system
- Export and sharing capabilities

### Lesson System
- Structured learning modules with progressive difficulty
- Rich text content with embedded media support
- Completion tracking and progress persistence
- Admin tools for content management

### Live Translation
- Real-time bidirectional translation (English ↔ Welsh)
- Powered by Google Gemini AI
- Context-aware translations
- Audio playback of translations

### Progress Analytics
- Detailed learning statistics
- Points system with different categories
- Mastery tracking and streaks
- Visual progress indicators
- Historical data and trends

## Security and Privacy

- Firebase Authentication for secure user management
- Firestore security rules for data protection
- Role-based access control for admin features
- Client-side data validation and sanitization
- Secure API key management

## Future Enhancements

- Mobile app development (React Native)
- Offline learning capabilities
- Social features (leaderboards, challenges)
- Advanced analytics and reporting
- Integration with additional Welsh language resources
- Gamification elements (badges, achievements)
- Voice recognition for pronunciation practice

## Contributing

This project follows standard React/Next.js development practices. Key areas for contribution include:
- Additional vocabulary content
- New lesson modules
- UI/UX improvements
- Performance optimizations
- Mobile responsiveness enhancements
- Accessibility improvements

## License

[License information to be added]

---

**Last Updated**: January 2025
**Version**: 2.0
**Maintainer**: FlipCymru Development Team
