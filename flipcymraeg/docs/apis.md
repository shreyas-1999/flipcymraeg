# API Documentation

This document describes the API services and functions used in FlipCymru v2.0.

## Service Architecture

The application uses a service-oriented architecture with the following key services:

### Authentication Service (`contexts/auth-context.tsx`)
Manages user authentication and session state.

### Firebase Services
- `lib/firebase.ts` - Firebase configuration and initialization
- `lib/vocabulary-service.ts` - Vocabulary management
- `lib/lesson-service.ts` - Lesson content management
- `lib/admin-service.ts` - Administrative functions

### AI Services
- `lib/gemini-service.ts` - Google Gemini AI integration
- `lib/text-to-speech.ts` - Text-to-speech functionality
- `lib/translation-service.ts` - Translation services

## Authentication API

### AuthContext Methods

\`\`\`typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}
\`\`\`

### Usage Examples

\`\`\`typescript
// Sign in with email/password
const { signIn } = useAuth();
await signIn('user@example.com', 'password');

// Sign up new user
const { signUp } = useAuth();
await signUp('user@example.com', 'password', 'Display Name');

// Google sign-in
const { signInWithGoogle } = useAuth();
await signInWithGoogle();
\`\`\`

## Vocabulary Service API

### Core Functions

\`\`\`typescript
// Get user's vocabulary cards
getVocabularyCards(userId: string): Promise<VocabularyCard[]>

// Add new vocabulary card
addVocabularyCard(userId: string, card: Omit<VocabularyCard, 'id'>): Promise<string>

// Update vocabulary card
updateVocabularyCard(userId: string, cardId: string, updates: Partial<VocabularyCard>): Promise<void>

// Delete vocabulary card
deleteVocabularyCard(userId: string, cardId: string): Promise<void>

// Update card mastery
updateCardMastery(userId: string, cardId: string, correct: boolean): Promise<void>
\`\`\`

### Data Types

\`\`\`typescript
interface VocabularyCard {
  id: string;
  welsh: string;
  english: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  pronunciation?: string;
  exampleSentence?: string;
  masteryLevel: number;
  lastReviewed: Timestamp;
  nextReview: Timestamp;
  createdAt: Timestamp;
}
\`\`\`

## Lesson Service API

### Core Functions

\`\`\`typescript
// Get all lessons
getLessons(): Promise<Lesson[]>

// Get lesson by ID
getLessonById(lessonId: string): Promise<Lesson | null>

// Get lessons by level
getLessonsByLevel(level: 'beginner' | 'intermediate' | 'advanced'): Promise<Lesson[]>

// Update lesson progress
updateLessonProgress(userId: string, lessonId: string, progress: LessonProgress): Promise<void>

// Get user's lesson progress
getUserLessonProgress(userId: string): Promise<LessonProgress[]>
\`\`\`

### Data Types

\`\`\`typescript
interface Lesson {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  content: LessonContent[];
  exercises: Exercise[];
  estimatedDuration: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface LessonContent {
  type: 'text' | 'audio' | 'image' | 'video';
  content: string;
  welsh?: string;
  english?: string;
}

interface Exercise {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'translation';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}
\`\`\`

## Text-to-Speech API

### Core Functions

\`\`\`typescript
// Speak Welsh text
speakWelsh(text: string, rate?: number): Promise<void>

// Get available voices
getAvailableVoices(): Promise<SpeechSynthesisVoice[]>

// Set voice preferences
setVoicePreferences(voiceId: string, rate: number, pitch: number): void

// Stop current speech
stopSpeech(): void
\`\`\`

### Usage Examples

\`\`\`typescript
import { speakWelsh } from '@/lib/text-to-speech';

// Speak at normal speed
await speakWelsh('Bore da');

// Speak at slow speed
await speakWelsh('Bore da', 0.7);
\`\`\`

## Translation Service API

### Core Functions

\`\`\`typescript
// Translate text using Gemini AI
translateText(text: string, fromLang: string, toLang: string): Promise<string>

// Get translation with context
getContextualTranslation(text: string, context: string): Promise<TranslationResult>

// Batch translate multiple texts
batchTranslate(texts: string[], fromLang: string, toLang: string): Promise<string[]>
\`\`\`

### Data Types

\`\`\`typescript
interface TranslationResult {
  translation: string;
  confidence: number;
  alternatives?: string[];
  context?: string;
}
\`\`\`

## Admin Service API

### User Management

\`\`\`typescript
// Get all users
getAllUsers(): Promise<AdminUser[]>

// Update user role
updateUserRole(userId: string, isAdmin: boolean): Promise<void>

// Get user statistics
getUserStatistics(): Promise<UserStats>

// Delete user account
deleteUser(userId: string): Promise<void>
\`\`\`

### Content Management

\`\`\`typescript
// Add new lesson
addLesson(lesson: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>

// Update lesson
updateLesson(lessonId: string, updates: Partial<Lesson>): Promise<void>

// Delete lesson
deleteLesson(lessonId: string): Promise<void>

// Bulk import vocabulary
bulkImportVocabulary(cards: VocabularyCard[]): Promise<void>
\`\`\`

### Analytics

\`\`\`typescript
// Get platform analytics
getPlatformAnalytics(): Promise<PlatformAnalytics>

// Get user engagement metrics
getUserEngagementMetrics(): Promise<EngagementMetrics>

// Get lesson completion rates
getLessonCompletionRates(): Promise<CompletionRates>
\`\`\`

## Error Handling

All services implement consistent error handling:

\`\`\`typescript
try {
  const result = await someServiceFunction();
  // Handle success
} catch (error) {
  if (error instanceof FirebaseError) {
    // Handle Firebase-specific errors
    console.error('Firebase error:', error.code, error.message);
  } else {
    // Handle general errors
    console.error('Service error:', error);
  }
}
\`\`\`

## Rate Limiting and Quotas

### Google Cloud Services
- **Text-to-Speech**: 1 million characters per month (free tier)
- **Gemini AI**: Rate limits apply based on your plan
- **Firebase**: Quotas based on your Firebase plan

### Best Practices
- Implement caching for frequently accessed data
- Use batch operations when possible
- Handle rate limit errors gracefully
- Monitor usage through Google Cloud Console

## Security Considerations

### API Key Security
- Never expose API keys in client-side code
- Use environment variables for sensitive data
- Implement proper CORS policies
- Regularly rotate API keys

### Data Validation
- Validate all inputs before processing
- Sanitize user-generated content
- Implement proper authentication checks
- Use Firestore security rules

### Privacy
- Encrypt sensitive user data
- Implement proper data retention policies
- Provide data export/deletion capabilities
- Comply with GDPR and other regulations

