# Deployment Guide

This guide covers deploying FlipCymru v2.0 to production environments.

## Pre-Deployment Checklist

### Code Preparation
- [ ] All tests pass
- [ ] Code is properly linted and formatted
- [ ] Environment variables are configured
- [ ] Build process completes successfully
- [ ] Database is seeded with initial data

### Security Review
- [ ] Firestore rules are production-ready
- [ ] API keys are properly restricted
- [ ] Authentication is properly configured
- [ ] CORS policies are set correctly
- [ ] Service account permissions are minimal

### Performance Optimization
- [ ] Images are optimized
- [ ] Bundle size is acceptable
- [ ] Caching strategies are implemented
- [ ] Database queries are optimized
- [ ] CDN is configured for static assets

## Vercel Deployment (Recommended)

### 1. Initial Setup

\`\`\`bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link project
vercel link
\`\`\`

### 2. Environment Variables

Add the following environment variables in Vercel dashboard:

\`\`\`env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_production_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_production_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_production_app_id

# Google Cloud Services
NEXT_PUBLIC_GOOGLE_TTS_API_KEY=your_production_tts_key
NEXT_PUBLIC_GEMINI_API_KEY=your_production_gemini_key
\`\`\`

### 3. Deploy

\`\`\`bash
# Deploy to production
vercel --prod

# Or deploy automatically on git push
# (configure in Vercel dashboard)
\`\`\`

### 4. Custom Domain

1. Go to Vercel dashboard
2. Select your project
3. Go to "Domains" tab
4. Add your custom domain
5. Configure DNS records as instructed

## Alternative Deployment Options

### Netlify

\`\`\`bash
# Build the application
npm run build

# Deploy to Netlify
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=.next
\`\`\`

### Docker Deployment

\`\`\`dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
\`\`\`

\`\`\`bash
# Build and run Docker container
docker build -t flipcymru-v2 .
docker run -p 3000:3000 flipcymru-v2
\`\`\`

### Traditional VPS/Server

\`\`\`bash
# On your server
git clone <repository-url>
cd flipcymru-v2

# Install dependencies
npm ci --only=production

# Build application
npm run build

# Start with PM2 (recommended)
npm install -g pm2
pm2 start npm --name "flipcymru" -- start
pm2 save
pm2 startup
\`\`\`

## Firebase Configuration for Production

### 1. Update Authentication Settings

1. Go to Firebase Console > Authentication > Settings
2. Add your production domain to "Authorized domains"
3. Configure OAuth redirect URIs for Google sign-in

### 2. Update Firestore Rules

Deploy production-ready Firestore rules:

\`\`\`bash
firebase deploy --only firestore:rules --project your-production-project
\`\`\`

### 3. Configure CORS for Cloud Functions

If using Cloud Functions, configure CORS:

\`\`\`javascript
// In your Cloud Function
const cors = require('cors')({
  origin: ['https://your-domain.com'],
  credentials: true
});
\`\`\`

## Google Cloud Configuration

### 1. API Key Restrictions

1. Go to Google Cloud Console > APIs & Services > Credentials
2. Edit your API keys
3. Add application restrictions:
   - HTTP referrers for web keys
   - IP addresses for server keys
4. Restrict to specific APIs only

### 2. Quota Management

1. Monitor API usage in Google Cloud Console
2. Set up billing alerts
3. Configure quota limits
4. Implement rate limiting in your application

## Database Migration

### Production Database Setup

\`\`\`bash
# Set production service account
export GOOGLE_APPLICATION_CREDENTIALS="path/to/production-serviceAccount.json"

# Run production database setup
python scripts/setup_database.py --production

# Seed production data
python scripts/seed_public_vocabulary.py --production
python scripts/populate_lessons.py --production
\`\`\`

### Data Migration Script

```python
# scripts/migrate_to_production.py
import firebase_admin
from firebase_admin import credentials, firestore

def migrate_data():
    # Initialize both development and production
    dev_cred = credentials.Certificate('dev-serviceAccount.json')
    prod_cred = credentials.Certificate('prod-serviceAccount.json')
    
    dev_app = firebase_admin.initialize_app(dev_cred, name='dev')
    prod_app = firebase_admin.initialize_app(prod_cred, name='prod')
    
    dev_db = firestore.client(dev_app)
    prod_db = firestore.client(prod_app)
    
    # Migrate collections
    migrate_collection(dev_db, prod_db, 'publicVocabulary')
    migrate_collection(dev_db, prod_db, 'lessons')

def migrate_collection(source_db, target_db, collection_name):
    docs = source_db.collection(collection_name).stream()
    batch = target_db.batch()
    
    for doc in docs:
        doc_ref = target_db.collection(collection_name).document(doc.id)
        batch.set(doc_ref, doc.to_dict())
    
    batch.commit()
    print(f"Migrated {collection_name}")

if __name__ == "__main__":
    migrate_data()
```