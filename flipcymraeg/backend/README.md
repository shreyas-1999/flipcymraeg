# Welsh Learning App Backend

This is the FastAPI backend server for the Welsh Learning App that handles all external API calls including Google Text-to-Speech, Gemini AI translation, and pronunciation evaluation.

## Features

- **Text-to-Speech**: Convert Welsh text to audio using Google TTS API
- **Translation**: Translate text between languages using Gemini AI
- **Welsh Translation**: Specialized Welsh translation with pronunciation and examples
- **Pronunciation Evaluation**: Evaluate user pronunciation using Gemini AI
- **Performance Testing**: Test and measure API performance for flashcard generation

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- pip (Python package installer)

### Installation

1. **Clone the repository and navigate to the backend directory:**
   \`\`\`bash
   cd backend
   \`\`\`

2. **Create a virtual environment:**
   \`\`\`bash
   python -m venv venv
   \`\`\`

3. **Activate the virtual environment:**
   - On Windows:
     \`\`\`bash
     venv\Scripts\activate
     \`\`\`
   - On macOS/Linux:
     \`\`\`bash
     source venv/bin/activate
     \`\`\`

4. **Install dependencies:**
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

5. **Set up environment variables:**
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   
   Edit the `.env` file and add your API keys:
   \`\`\`env
   GOOGLE_TTS_API_KEY=your_google_tts_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   \`\`\`

### Running the Server

1. **Start the development server:**
   \`\`\`bash
   uvicorn main:app --reload
   \`\`\`

2. **The server will be available at:**
   - API: http://localhost:8000
   - Interactive API docs: http://localhost:8000/docs
   - Alternative docs: http://localhost:8000/redoc

### API Endpoints

#### Text-to-Speech
- `POST /api/tts/synthesize` - Convert text to speech

#### Translation
- `POST /api/translation/translate` - General text translation
- `POST /api/gemini/translate-to-welsh` - Specialized Welsh translation

#### Pronunciation
- `POST /api/pronunciation/evaluate` - Evaluate pronunciation

#### Performance Testing
- `POST /api/performance/test-flashcard` - Test single flashcard generation performance
- `POST /api/performance/test-deck` - Test deck generation performance

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_TTS_API_KEY` | Google Text-to-Speech API key | Yes |
| `GEMINI_API_KEY` | Google Gemini AI API key | Yes |

### Getting API Keys

#### Google TTS API Key
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Text-to-Speech API
4. Create credentials (API key)
5. Copy the API key to your `.env` file

#### Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key to your `.env` file

### Development

The server uses FastAPI with automatic reload enabled during development. Any changes to the code will automatically restart the server.

### Production Deployment

For production deployment, consider:

1. **Use a production WSGI server:**
   \`\`\`bash
   pip install gunicorn
   gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
   \`\`\`

2. **Set environment variables securely**
3. **Configure CORS for your specific domain**
4. **Use HTTPS**
5. **Implement rate limiting**
6. **Add logging and monitoring**

### Troubleshooting

#### Common Issues

1. **Import errors**: Make sure the virtual environment is activated and dependencies are installed
2. **API key errors**: Verify that your API keys are correctly set in the `.env` file
3. **CORS errors**: Check that the frontend URL is allowed in the CORS configuration
4. **Timeout errors**: API calls have a 30-second timeout; check your network connection

#### Logs

The server logs will show detailed information about requests and any errors. Check the console output for debugging information.
