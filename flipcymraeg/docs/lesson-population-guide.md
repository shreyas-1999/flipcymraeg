# Welsh Learning App - Lesson Population Guide

This guide explains how to populate your Welsh learning app with comprehensive lessons using the provided Python script.

## 📋 Prerequisites

### 1. Install Required Dependencies
\`\`\`bash
pip install firebase-admin
\`\`\`

### 2. Get Firebase Service Account Key
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file

### 3. Set Environment Variable
You have two options:

**Option A: Export as Environment Variable**
\`\`\`bash
export FIREBASE_SERVICE_ACCOUNT_KEY='{"type": "service_account", "project_id": "your-project-id", ...}'
\`\`\`

**Option B: Create a .env file**
\`\`\`bash
# Create .env file in your project root
echo 'FIREBASE_SERVICE_ACCOUNT_KEY={"type": "service_account", ...}' > .env
\`\`\`

## 🚀 Running the Script

### 1. Navigate to Scripts Directory
\`\`\`bash
cd scripts
\`\`\`

### 2. Run the Population Script
\`\`\`bash
python populate_lessons.py
\`\`\`

### 3. Expected Output
\`\`\`
🚀 Starting Welsh Lesson Population Script
==================================================
✅ Firebase Admin SDK initialized successfully
📚 Creating lesson data...
📝 Created 7 lessons to populate

💾 Populating lessons in Firestore...
✅ Created lesson: Welsh Greetings and Basic Phrases (ID: abc123...)
✅ Created lesson: Numbers 1-20 in Welsh (ID: def456...)
✅ Created lesson: Family Members in Welsh (ID: ghi789...)
✅ Created lesson: Welsh Colors and Descriptions (ID: jkl012...)
✅ Created lesson: Days of the Week and Time (ID: mno345...)
✅ Created lesson: Welsh Food and Drink (ID: pqr678...)
✅ Created lesson: Advanced Welsh Grammar: Mutations (ID: stu901...)

🎉 Successfully created 7 lessons!

📊 Summary:
   • Total lessons created: 7
   • Categories covered: Basics, Numbers, Family, Colors, Time, Food, Grammar
   • Difficulty levels: Beginner, Intermediate, Advanced
   • Total points available: 550

🔥 Next steps:
   1. Check your Firebase Console to verify lessons were created
   2. Test the lessons in your Welsh learning app
   3. Create an admin user to manage lessons
   4. Add more lessons using this script as a template

✅ Lesson population completed successfully!
\`\`\`

## 📚 Lesson Content Overview

The script creates 7 comprehensive lessons with rich content:

### 1. **Welsh Greetings and Basic Phrases** (Beginner)
- **Category**: Basics
- **Points**: 50 | **Duration**: 15 minutes
- **Content**: Common greetings, polite expressions, meeting people
- **Skills**: Vocabulary, conversation practice, basic exercises

### 2. **Numbers 1-20 in Welsh** (Beginner)
- **Category**: Numbers
- **Points**: 75 | **Duration**: 20 minutes
- **Content**: Numbers 1-20 with pronunciation, counting practice
- **Skills**: Number recognition, practical usage, age/time expressions

### 3. **Family Members in Welsh** (Beginner)
- **Category**: Family
- **Points**: 60 | **Duration**: 18 minutes
- **Content**: Immediate and extended family vocabulary
- **Skills**: Possessive forms, family descriptions, relationships

### 4. **Welsh Colors and Descriptions** (Beginner)
- **Category**: Colors
- **Points**: 45 | **Duration**: 12 minutes
- **Content**: Color vocabulary, adjective usage, mutations
- **Skills**: Descriptive language, basic grammar, object descriptions

### 5. **Days of the Week and Time** (Intermediate)
- **Category**: Time
- **Points**: 80 | **Duration**: 25 minutes
- **Content**: Calendar vocabulary, time expressions, scheduling
- **Skills**: Time telling, appointment making, temporal expressions

### 6. **Welsh Food and Drink** (Intermediate)
- **Category**: Food
- **Points**: 90 | **Duration**: 30 minutes
- **Content**: Traditional Welsh cuisine, restaurant vocabulary
- **Skills**: Ordering food, cultural knowledge, dining conversations

### 7. **Advanced Welsh Grammar: Mutations** (Advanced)
- **Category**: Grammar
- **Points**: 150 | **Duration**: 45 minutes
- **Content**: Soft, nasal, and aspirate mutations with examples
- **Skills**: Advanced grammar, linguistic understanding, complex rules

## 🔧 Content Structure

Each lesson includes multiple content types:

### **Vocabulary Sections**
- Welsh words with English translations
- Pronunciation guides
- Usage examples
- Context-specific vocabulary groups

### **Grammar Sections**
- Rule explanations
- Pattern recognition
- Mutation examples
- Structural understanding

### **Conversation Sections**
- Real-world dialogue examples
- Practical usage scenarios
- Interactive conversation practice
- Cultural context

### **Exercise Sections**
- Multiple choice questions
- Translation exercises
- Grammar practice
- Progress assessment

## 🎯 Proficiency System

The lessons are designed with a progressive difficulty system:

### **Beginner Level** (0-499 points)
- Basic vocabulary and phrases
- Simple grammar concepts
- Essential communication skills
- Foundation building

### **Intermediate Level** (500-999 points)
- Complex vocabulary
- Advanced grammar introduction
- Cultural content
- Practical applications

### **Advanced Level** (1000+ points)
- Sophisticated grammar rules
- Linguistic concepts
- Complex language structures
- Mastery-level content

## 🔍 Verification Steps

### 1. Check Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to **Firestore Database**
3. Look for the `lessons` collection
4. Verify all 7 lessons are present with correct structure

### 2. Test in Your App
1. Log in as a regular user
2. Navigate to the Lessons section
3. Verify lessons appear with correct difficulty levels
4. Test lesson content and progression
5. Verify audio functionality works

### 3. Admin Dashboard Verification
1. Log in as an admin user
2. Go to **Admin Dashboard** → **Lessons**
3. Verify you can see and edit all lessons
4. Test lesson management features
5. Check analytics data

## 🛠️ Troubleshooting

### Common Issues and Solutions

#### **Permission Denied Error**
\`\`\`
Error: Missing or insufficient permissions
\`\`\`
**Solutions:**
- Check your Firestore security rules
- Verify service account has proper permissions
- Ensure the service account key is valid

#### **Firebase Not Initialized**
\`\`\`
Error initializing Firebase: [details]
\`\`\`
**Solutions:**
- Verify your service account JSON is correct
- Check the FIREBASE_SERVICE_ACCOUNT_KEY environment variable
- Ensure the project ID matches your Firebase project

#### **Import Errors**
\`\`\`
ModuleNotFoundError: No module named 'firebase_admin'
\`\`\`
**Solutions:**
\`\`\`bash
pip install firebase-admin
# or if using conda
conda install -c conda-forge firebase-admin
\`\`\`

#### **JSON Parse Error**
\`\`\`
Error: Invalid JSON in FIREBASE_SERVICE_ACCOUNT_KEY
\`\`\`
**Solutions:**
- Check that the JSON is properly formatted
- Ensure all quotes are properly escaped
- Verify the entire JSON object is included

### **Environment Variable Issues**

If you're having trouble with environment variables:

**For macOS/Linux:**
\`\`\`bash
# Check if variable is set
echo $FIREBASE_SERVICE_ACCOUNT_KEY

# Set temporarily
export FIREBASE_SERVICE_ACCOUNT_KEY='{"type": "service_account", ...}'

# Set permanently (add to ~/.bashrc or ~/.zshrc)
echo 'export FIREBASE_SERVICE_ACCOUNT_KEY="..."' >> ~/.bashrc
\`\`\`

**For Windows:**
\`\`\`cmd
# Check if variable is set
echo %FIREBASE_SERVICE_ACCOUNT_KEY%

# Set temporarily
set FIREBASE_SERVICE_ACCOUNT_KEY={"type": "service_account", ...}

# Set permanently
setx FIREBASE_SERVICE_ACCOUNT_KEY "{"type": "service_account", ...}"
\`\`\`

## 🎨 Customization

### Adding Your Own Lessons

To add custom lessons, modify the `create_lesson_data()` function:

```python
def create_lesson_data():
    lessons = [
        {
            "title": "Your Custom Lesson Title",
            "description": "Detailed description of what students will learn",
            "category": "Your Category",
            "difficulty": "Beginner|Intermediate|Advanced",
            "requiredProficiency": "Beginner|Intermediate|Advanced",
            "pointsReward": 75,
            "estimatedDuration": 20,
            "published": True,
            "createdBy": "system",
            "tags": ["tag1", "tag2", "tag3"],
            "content": [
                {
                    "type": "vocabulary|grammar|conversation|exercise",
                    "title": "Section Title",
                    "content": "Section description",
                    "examples": [
                        {"welsh": "Welsh text", "english": "English translation"}
                    ],
                    "exercises": [
                        {
                            "question": "Your question?",
                            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                            "correctAnswer": "Option 1",
                            "explanation": "Why this is correct"
                        }
                    ]
                }
            ]
        }
        # Add more lessons...
    ]
    return lessons
