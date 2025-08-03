# Database Seeding Guide for FlipCymraeg

This guide will help you seed your Firestore database with comprehensive Welsh vocabulary flashcards.

## 📋 Prerequisites

1. **Firebase Project Setup**
   - Ensure your Firebase project is created and configured
   - Firestore database is enabled
   - Authentication is set up

2. **Service Account Key**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Download the JSON file (keep it secure!)

3. **Python Environment**
   - Python 3.7 or higher
   - Firebase Admin SDK

## 🚀 Step-by-Step Instructions

### Step 1: Install Dependencies

\`\`\`bash
pip install firebase-admin
\`\`\`

### Step 2: Prepare the Script

1. **Download the service account key:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to Project Settings (gear icon) → Service Accounts
   - Click "Generate new private key"
   - Save the JSON file securely (e.g., `serviceAccountKey.json`)

2. **Update the script:**
   - Open `scripts/seed_public_vocabulary.py`
   - Update line 8: Replace `'path/to/your/serviceAccountKey.json'` with your actual file path
   - Update line 15: Replace `"your_admin_user_id_here"` with your admin user ID

### Step 3: Get Your Admin User ID

1. **Sign in to your app** and go to `/admin`
2. **Copy your User ID** from the "Access Denied" screen
3. **Update the script** with your User ID

### Step 4: Run the Seeding Script

\`\`\`bash
cd your-project-directory
python scripts/seed_public_vocabulary.py
\`\`\`

### Step 5: Set Up Admin Access

After seeding, you need admin access to manage the vocabulary:

1. **Go to Firebase Console → Firestore Database**
2. **Create a new collection** called `admin_users`
3. **Add a document** with your User ID as the document ID:
   \`\`\`json
   {
     "uid": "your_user_id_here",
     "email": "your_email@example.com",
     "isAdmin": true,
     "adminLevel": "super",
     "createdAt": "2024-01-15T10:00:00Z"
   }
   \`\`\`

### Step 6: Update Firestore Security Rules

Add these rules to your Firestore security rules:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public vocabulary - readable by all authenticated users
    match /public_vocabulary/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/admin_users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/admin_users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // User vocabulary progress - users can only access their own
    match /user_vocabulary_progress/{document} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Custom flashcards - users can only access their own
    match /custom_flashcards/{document} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Admin users - only readable by the user themselves
    match /admin_users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/admin_users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/admin_users/$(request.auth.uid)).data.adminLevel == "super";
    }
    
    // User profiles
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
\`\`\`

## 📊 What Gets Seeded

The script will add **150+ vocabulary cards** across these categories:

- **Greetings** (10 cards) - Basic Welsh greetings and responses
- **Politeness** (6 cards) - Thank you, please, sorry, etc.
- **Numbers** (12 cards) - Numbers 1-10, 20, 100
- **Family** (11 cards) - Family members and relationships
- **Colors** (8 cards) - Basic colors
- **Places** (10 cards) - Common locations
- **Food & Drink** (8 cards) - Basic food and beverages
- **Weather** (5 cards) - Weather conditions
- **Animals** (6 cards) - Common animals
- **Body Parts** (5 cards) - Basic body parts
- **Time** (4 cards) - Time-related words

Each card includes:
- ✅ Welsh word with proper spelling
- ✅ English translation
- ✅ Phonetic pronunciation guide
- ✅ Difficulty level (Beginner/Intermediate/Advanced)
- ✅ Category classification
- ✅ 3 example sentences in Welsh with English translations

## 🔧 Troubleshooting

### Common Issues:

1. **"Permission denied" error:**
   - Check your service account key path
   - Ensure the JSON file is valid
   - Verify Firestore is enabled in your project

2. **"Admin user not found" error:**
   - Make sure you've created the admin_users document
   - Verify the User ID matches exactly
   - Check the document structure

3. **"Import error" for firebase_admin:**
   \`\`\`bash
   pip install --upgrade firebase-admin
   \`\`\`

4. **Script runs but no data appears:**
   - Check Firestore console for the `public_vocabulary` collection
   - Verify your project ID is correct
   - Check for any error messages in the script output

## 🎯 Next Steps

After successful seeding:

1. **Test the vocabulary practice** - Go to the Vocabulary tab and try practicing
2. **Access admin dashboard** - Visit `/admin` to manage vocabulary
3. **Create custom flashcards** - Test the custom flashcard creation
4. **Check user progress** - Practice some cards and verify progress tracking

## 🔒 Security Notes

- **Never commit** your service account key to version control
- **Store the key securely** and limit access
- **Use environment variables** in production
- **Regularly rotate** service account keys
- **Monitor Firestore usage** to avoid unexpected costs

## 📝 Customization

To add more vocabulary:

1. **Edit the script** - Add more entries to the `vocabulary_data` array
2. **Follow the format** - Ensure each entry has all required fields
3. **Test thoroughly** - Run with a small batch first
4. **Update categories** - Add new categories as needed

The vocabulary data is structured to provide a solid foundation for Welsh language learning, covering essential everyday words and phrases that learners need to get started.
