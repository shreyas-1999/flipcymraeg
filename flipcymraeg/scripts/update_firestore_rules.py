"""
Updated Firestore Security Rules for Welsh Learning App with Translation History

Copy these rules to your Firebase Console > Firestore Database > Rules
"""

rules = """
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // User's custom flashcards
      match /customFlashcards/{flashcardId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // User's practice sessions
      match /practiceSessions/{sessionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // User's translation history (NEW)
      match /translationHistory/{historyId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Public vocabulary - read-only for all authenticated users
    match /publicVocabulary/{cardId} {
      allow read: if request.auth != null;
      // Only admins can write to public vocabulary
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Admin-only collections
    match /analytics/{document=**} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
"""

print("Updated Firestore Security Rules:")
print("=" * 50)
print(rules)
print("=" * 50)
print("\nInstructions:")
print("1. Go to Firebase Console > Firestore Database > Rules")
print("2. Replace the existing rules with the rules above")
print("3. Click 'Publish' to apply the changes")
print("\nNew features added:")
print("- Translation history storage for each user")
print("- Proper security rules for translation data")
print("- Maintains existing security for all other collections")
