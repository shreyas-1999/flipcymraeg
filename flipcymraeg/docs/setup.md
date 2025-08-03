# Detailed Setup Guide

This guide provides step-by-step instructions for setting up FlipCymru v2.0 from scratch.

## Prerequisites

### Required Software
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **Python**: Version 3.8 or higher (for database scripts)
- **Git**: For version control

### Required Accounts
- **Firebase Account**: For backend services
- **Google Cloud Account**: For AI services
- **Vercel Account**: For deployment (optional)

## Step 1: Project Setup

### 1.1 Clone and Install
\`\`\`bash
# Clone the repository
git clone <repository-url>
cd flipcymru-v2

# Install Node.js dependencies
npm install

# Install Python dependencies
pip install firebase-admin google-cloud-firestore
\`\`\`

### 1.2 Environment Configuration
Create `.env.local` in the project root:
\`\`\`env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Google Cloud Services
NEXT_PUBLIC_GOOGLE_TTS_API_KEY=your_text_to_speech_api_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
\`\`\`

## Step 2: Firebase Setup

### 2.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name (e.g., "flipcymru-v2")
4. Enable Google Analytics (optional)
5. Create project

### 2.2 Enable Authentication
1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password"
5. Enable "Google" provider
6. Configure OAuth consent screen

### 2.3 Create Firestore Database
1. Go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (we'll update rules later)
4. Select a location close to your users

### 2.4 Get Firebase Configuration
1. Go to Project Settings (gear icon)
2. Scroll to "Your apps" section
3. Click "Web" icon to add web app
4. Register app with nickname
5. Copy configuration values to `.env.local`

### 2.5 Generate Service Account Key
1. Go to Project Settings > Service accounts
2. Click "Generate new private key"
3. Save the JSON file securely
4. Set environment variable:
\`\`\`bash
export GOOGLE_APPLICATION_CREDENTIALS="path/to/serviceAccountKey.json"
\`\`\`

## Step 3: Google Cloud Services

### 3.1 Enable APIs
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to "APIs & Services" > "Library"
4. Enable the following APIs:
   - Text-to-Speech API
   - Generative AI API (for Gemini)

### 3.2 Create API Keys
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Create separate keys for TTS and Gemini
4. Restrict keys to specific APIs for security
5. Add keys to `.env.local`

## Step 4: Database Setup

### 4.1 Deploy Firestore Rules
\`\`\`bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project
firebase init firestore

# Deploy security rules
firebase deploy --only firestore:rules
\`\`\`

### 4.2 Run Database Scripts
\`\`\`bash
# Set up initial database structure
python scripts/setup_database.py

# Seed public vocabulary
python scripts/seed_public_vocabulary.py

# Populate lessons
python scripts/populate_lessons.py
\`\`\`

### 4.3 Create First Admin User
1. Register a user account through the app
2. Note the user's UID from Firebase Auth console
3. Update the admin user ID in `populate_lessons.py`
4. Run the script to grant admin privileges

## Step 5: Development Server

### 5.1 Start Development
\`\`\`bash
npm run dev
\`\`\`

### 5.2 Verify Setup
1. Visit `http://localhost:3000`
2. Test user registration
3. Test Google sign-in
4. Verify lessons load correctly
5. Test audio pronunciation
6. Check admin panel (if admin user created)

## Step 6: Production Deployment

### 6.1 Vercel Deployment
1. Connect repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically

### 6.2 Update Firebase Configuration
1. Add production domain to Firebase Auth
2. Update Firestore rules for production
3. Configure CORS for APIs

## Troubleshooting

### Common Issues

**Firebase Connection Issues**
- Verify all environment variables are correct
- Check Firebase project settings
- Ensure APIs are enabled

**Authentication Problems**
- Verify OAuth configuration
- Check authorized domains in Firebase Auth
- Ensure proper redirect URLs

**Database Permission Errors**
- Check Firestore rules
- Verify user authentication
- Ensure proper collection structure

**Audio Not Working**
- Verify TTS API key
- Check browser permissions
- Test with different browsers

### Getting Help
- Check Firebase Console for errors
- Review browser developer tools
- Verify all environment variables
- Test with minimal configuration first

## Security Checklist

- [ ] Environment variables are secure
- [ ] Firebase rules are properly configured
- [ ] API keys are restricted
- [ ] HTTPS is enabled in production
- [ ] CORS is properly configured
- [ ] Service account key is secure