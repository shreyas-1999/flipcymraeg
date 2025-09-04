from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import httpx
import base64
import os
import time
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

app = FastAPI(title="Welsh Learning API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Environment variables
GOOGLE_TTS_API_KEY = os.getenv("GOOGLE_TTS_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Pydantic models
class TTSRequest(BaseModel):
    text: str
    languageCode: str = "cy-GB"
    speed: float = 1.0

class TTSResponse(BaseModel):
    audioContent: str

class TranslationRequest(BaseModel):
    text: str
    sourceLanguage: str
    targetLanguage: str
    dialect: Optional[str] = None
    formality: Optional[str] = None

class TranslationResponse(BaseModel):
    translatedText: str
    pronunciation: Optional[str] = None
    examples: List[Dict[str, str]] = []

class GeminiTranslationRequest(BaseModel):
    englishWord: str
    category: str

class GeminiTranslationResponse(BaseModel):
    welsh: str
    pronunciation: str
    examples: List[Dict[str, str]]

class PronunciationRequest(BaseModel):
    targetWord: str
    audioData: str  # base64 encoded audio

class PronunciationResponse(BaseModel):
    transcription: str
    accuracy: str
    feedback: str

class PerformanceTestRequest(BaseModel):
    englishWord: str
    category: str

class PerformanceTestResponse(BaseModel):
    welsh: str
    pronunciation: str
    examples: List[Dict[str, str]]
    performance: Dict[str, Any]

class DeckTestRequest(BaseModel):
    category: str
    description: Optional[str] = ""
    numberOfCards: int = 10

class DeckTestResponse(BaseModel):
    cards: List[Dict[str, Any]]
    performance: Dict[str, Any]

@app.get("/")
async def root():
    return {"message": "Welsh Learning API is running"}

@app.post("/api/tts/synthesize", response_model=TTSResponse)
async def synthesize_speech(request: TTSRequest):
    """Synthesize speech using Google Text-to-Speech API"""
    if not GOOGLE_TTS_API_KEY:
        raise HTTPException(status_code=500, detail="Google TTS API key not configured")
    
    request_body = {
        "input": {"text": request.text},
        "voice": {
            "languageCode": request.languageCode,
            "ssmlGender": "FEMALE",
        },
        "audioConfig": {
            "audioEncoding": "LINEAR16",
            "sampleRateHertz": 24000,
            "speakingRate": request.speed,
            "pitch": 0,
            "volumeGainDb": 0,
        },
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://texttospeech.googleapis.com/v1/text:synthesize?key={GOOGLE_TTS_API_KEY}",
                json=request_body,
                headers={"Content-Type": "application/json"},
                timeout=30.0
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail=f"TTS API error: {response.text}")
            
            data = response.json()
            return TTSResponse(audioContent=data["audioContent"])
    
    except httpx.TimeoutException:
        raise HTTPException(status_code=408, detail="TTS API request timeout")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS API error: {str(e)}")

@app.post("/api/translation/translate", response_model=TranslationResponse)
async def translate_text(request: TranslationRequest):
    """Translate text using Gemini API"""
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")
    
    dialect_note = get_dialect_note(request.dialect)
    formality_note = get_formality_note(request.formality)
    source_language_name = "English" if request.sourceLanguage == "en" else "Welsh"
    target_language_name = "English" if request.targetLanguage == "en" else "Welsh"
    
    prompt = f"""
Translate the following {source_language_name} text to {target_language_name}:

"{request.text}"

{dialect_note}
{formality_note}

Please provide your response in the following JSON format:
{{
  "translatedText": "the translation",
  "pronunciation": "phonetic pronunciation guide (only if translating to Welsh)",
  "examples": [
    {{
      "welsh": "example sentence in Welsh",
      "english": "example sentence in English"
    }}
  ]
}}

Provide 2-3 example sentences showing how the translated text would be used in context. Make sure the examples are natural and commonly used.
"""
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={GEMINI_API_KEY}",
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {
                        "temperature": 0.3,
                        "topK": 40,
                        "topP": 0.95,
                        "maxOutputTokens": 1024,
                    },
                },
                headers={"Content-Type": "application/json"},
                timeout=30.0
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail=f"Gemini API error: {response.text}")
            
            data = response.json()
            generated_text = data["candidates"][0]["content"]["parts"][0]["text"]
            
            # Extract JSON from the response
            json_match = None
            try:
                # Try to find JSON in the response
                start = generated_text.find('{')
                end = generated_text.rfind('}') + 1
                if start != -1 and end != 0:
                    json_text = generated_text[start:end]
                    translation_data = json.loads(json_text)
                    
                    return TranslationResponse(
                        translatedText=translation_data.get("translatedText", ""),
                        pronunciation=translation_data.get("pronunciation"),
                        examples=translation_data.get("examples", [])
                    )
            except (json.JSONDecodeError, KeyError):
                pass
            
            raise HTTPException(status_code=500, detail="Failed to parse translation response")
    
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Request failed: {str(e)}")

@app.post("/api/gemini/translate-to-welsh", response_model=GeminiTranslationResponse)
async def translate_to_welsh(request: GeminiTranslationRequest):
    """Translate English word to Welsh using Gemini API"""
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")
    
    prompt = f"""
You are a Welsh language expert. Please translate the English word "{request.englishWord}" to Welsh and provide the following information in JSON format:

{{
 "welsh": "Welsh translation of the word",
 "pronunciation": "Phonetic pronunciation guide (like BOH-reh dah)",
 "examples": [
   {{
     "welsh": "Welsh sentence using the word in context",
     "english": "English translation of the Welsh sentence"
   }},
   {{
     "welsh": "Another Welsh sentence using the word",
     "english": "English translation of this sentence"
   }},
   {{
     "welsh": "Third Welsh sentence using the word",
     "english": "English translation of this sentence"
   }}
 ]
}}

The word belongs to the category: {request.category}

Please ensure:
1. The Welsh translation is accurate and commonly used
2. The pronunciation guide uses simple phonetic spelling that English speakers can understand
3. The example sentences are practical and show different uses of the word
4. All Welsh text uses proper Welsh spelling and grammar
5. Return ONLY the JSON object, no additional text

Word to translate: "{request.englishWord}"
Category: "{request.category}"
"""
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={GEMINI_API_KEY}",
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {
                        "temperature": 0.3,
                        "topK": 40,
                        "topP": 0.95,
                        "maxOutputTokens": 1024,
                    },
                },
                headers={"Content-Type": "application/json"},
                timeout=30.0
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail=f"Gemini API error: {response.text}")
            
            data = response.json()
            generated_text = data["candidates"][0]["content"]["parts"][0]["text"]
            
            # Clean up the response and parse JSON
            cleaned_text = generated_text.replace("\`\`\`json", "").replace("\`\`\`", "").strip()
            
            try:
                parsed_response = json.loads(cleaned_text)
                return GeminiTranslationResponse(
                    welsh=parsed_response["welsh"],
                    pronunciation=parsed_response["pronunciation"],
                    examples=parsed_response["examples"]
                )
            except (json.JSONDecodeError, KeyError) as e:
                raise HTTPException(status_code=500, detail=f"Failed to parse translation response: {str(e)}")
    
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Request failed: {str(e)}")

@app.post("/api/pronunciation/evaluate", response_model=PronunciationResponse)
async def evaluate_pronunciation(request: PronunciationRequest):
    """Evaluate pronunciation using Gemini API"""
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")
    
    prompt = f"""You are a Welsh pronunciation expert. The user is trying to pronounce the Welsh word "{request.targetWord}". 

Listen to the audio and evaluate their pronunciation. Respond with ONLY a JSON object:

{{
  "transcription": "What the user said phonetically",
  "accuracy": "perfect" | "close" | "incorrect", 
  "feedback": "Brief, encouraging feedback (max 2 sentences)"
}}

Guidelines:
- "perfect": Pronunciation matches Welsh pronunciation very closely
- "close": Recognizable but needs minor improvement
- "incorrect": Significantly off or unrecognizable

Keep feedback brief and encouraging. Focus on the most important pronunciation tip if not perfect.

Target word: "{request.targetWord}"
"""
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={GEMINI_API_KEY}",
                json={
                    "contents": [{
                        "parts": [
                            {"text": prompt},
                            {
                                "inline_data": {
                                    "mime_type": "audio/webm",
                                    "data": request.audioData
                                }
                            }
                        ]
                    }],
                    "generationConfig": {
                        "temperature": 0.3,
                        "topK": 40,
                        "topP": 0.95,
                        "maxOutputTokens": 512,
                    },
                },
                headers={"Content-Type": "application/json"},
                timeout=30.0
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail=f"Gemini API error: {response.text}")
            
            data = response.json()
            generated_text = data["candidates"][0]["content"]["parts"][0]["text"]
            
            # Clean up the response and parse JSON
            cleaned_text = generated_text.replace("\`\`\`json", "").replace("\`\`\`", "").strip()
            
            try:
                result = json.loads(cleaned_text)
                return PronunciationResponse(
                    transcription=result.get("transcription", ""),
                    accuracy=result.get("accuracy", "incorrect"),
                    feedback=result.get("feedback", "Sorry, I couldn't evaluate your pronunciation. Please try again.")
                )
            except (json.JSONDecodeError, KeyError):
                return PronunciationResponse(
                    transcription="",
                    accuracy="incorrect",
                    feedback="Sorry, I couldn't evaluate your pronunciation. Please try again."
                )
    
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Request failed: {str(e)}")

# Performance testing endpoints
@app.post("/api/performance/test-flashcard", response_model=PerformanceTestResponse)
async def test_flashcard_performance(request: PerformanceTestRequest):
    """Test single flashcard generation with performance metrics"""
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")
    
    start_time = time.time()
    network_start = time.time()
    
    # Same prompt as the regular translate-to-welsh endpoint
    prompt = f"""
You are a Welsh language expert. Please translate the English word "{request.englishWord}" to Welsh and provide the following information in JSON format:

{{
 "welsh": "Welsh translation of the word",
 "pronunciation": "Phonetic pronunciation guide (like BOH-reh dah)",
 "examples": [
   {{
     "welsh": "Welsh sentence using the word in context",
     "english": "English translation of the Welsh sentence"
   }},
   {{
     "welsh": "Another Welsh sentence using the word",
     "english": "English translation of this sentence"
   }},
   {{
     "welsh": "Third Welsh sentence using the word",
     "english": "English translation of this sentence"
   }}
 ]
}}

The word belongs to the category: {request.category}

Please ensure:
1. The Welsh translation is accurate and commonly used
2. The pronunciation guide uses simple phonetic spelling that English speakers can understand
3. The example sentences are practical and show different uses of the word
4. All Welsh text uses proper Welsh spelling and grammar
5. Return ONLY the JSON object, no additional text

Word to translate: "{request.englishWord}"
Category: "{request.category}"
"""

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={GEMINI_API_KEY}",
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {
                        "temperature": 0.3,
                        "topK": 40,
                        "topP": 0.95,
                        "maxOutputTokens": 1024,
                    },
                },
                headers={"Content-Type": "application/json"},
                timeout=30.0
            )
            
            network_end = time.time()
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail=f"Gemini API error: {response.text}")
            
            data = response.json()
            generated_text = data["candidates"][0]["content"]["parts"][0]["text"]
            
            # Clean and parse JSON
            cleaned_text = generated_text.replace("\`\`\`json\n", "").replace("\n\`\`\`", "").strip()
            result = json.loads(cleaned_text)
            
            end_time = time.time()
            
            # Calculate performance metrics
            total_time = end_time - start_time
            network_time = network_end - network_start
            processing_time = total_time - network_time
            
            performance = {
                "totalTime": round(total_time * 1000, 2),  # Convert to milliseconds
                "networkTime": round(network_time * 1000, 2),
                "processingTime": round(processing_time * 1000, 2),
                "responseSize": len(response.content),
                "statusCode": response.status_code,
                "timestamp": time.time()
            }
            
            return PerformanceTestResponse(
                welsh=result["welsh"],
                pronunciation=result["pronunciation"],
                examples=result["examples"],
                performance=performance
            )
            
        except httpx.TimeoutException:
            raise HTTPException(status_code=408, detail="Gemini API request timeout")
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Failed to parse Gemini response")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")

@app.post("/api/performance/test-deck", response_model=DeckTestResponse)
async def test_deck_performance(request: DeckTestRequest):
    """Test deck generation with performance metrics"""
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")
    
    start_time = time.time()
    cards = []
    card_performances = []
    difficulties = ["Beginner", "Intermediate", "Advanced"]
    
    # Generate test words for the category
    test_words = {
        "food": ["recipe", "flavor", "ingredient", "kitchen", "meal", "taste", "cooking", "dining", "nutrition", "appetite"],
        "animals": ["habitat", "wildlife", "creature", "mammal", "species", "behavior", "nature", "forest", "ocean", "farm"],
        "weather": ["climate", "season", "temperature", "forecast", "atmosphere", "storm", "sunshine", "rainfall", "wind", "humidity"],
        "colors": ["shade", "bright", "dark", "rainbow", "paint", "artistic", "vibrant", "pale", "colorful", "design"],
        "feelings": ["emotion", "mood", "heart", "mind", "spirit", "joy", "peace", "energy", "comfort", "hope"],
    }
    
    # Get test words for the category or use generic words
    category_lower = request.category.lower()
    word_list = test_words.get(category_lower, ["word", "language", "learning", "study", "practice", "knowledge", "education", "skill", "practice", "understanding"])
    
    async with httpx.AsyncClient() as client:
        for i in range(min(request.numberOfCards, len(word_list))):
            card_start = time.time()
            network_start = time.time()
            
            word = word_list[i]
            difficulty = difficulties[i % len(difficulties)]
            
            # Create prompt for this specific word
            prompt = f"""
You are a Welsh language expert. Please translate the English word "{word}" to Welsh and provide the following information in JSON format:

{{
 "welsh": "Welsh translation of the word",
 "pronunciation": "Phonetic pronunciation guide (like BOH-reh dah)",
 "examples": [
   {{
     "welsh": "Welsh sentence using the word in context",
     "english": "English translation of the Welsh sentence"
   }},
   {{
     "welsh": "Another Welsh sentence using the word",
     "english": "English translation of this sentence"
   }},
   {{
     "welsh": "Third Welsh sentence using the word",
     "english": "English translation of this sentence"
   }}
 ]
}}

The word belongs to the category: {request.category}
Difficulty level: {difficulty}

Please ensure:
1. The Welsh translation is accurate and commonly used
2. The pronunciation guide uses simple phonetic spelling that English speakers can understand
3. The example sentences are practical and show different uses of the word
4. All Welsh text uses proper Welsh spelling and grammar
5. Return ONLY the JSON object, no additional text

Word to translate: "{word}"
Category: "{request.category}"
"""

            try:
                response = await client.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={GEMINI_API_KEY}",
                    json={
                        "contents": [{"parts": [{"text": prompt}]}],
                        "generationConfig": {
                            "temperature": 0.3,
                            "topK": 40,
                            "topP": 0.95,
                            "maxOutputTokens": 1024,
                        },
                    },
                    headers={"Content-Type": "application/json"},
                    timeout=30.0
                )
                
                network_end = time.time()
                
                if response.status_code == 200:
                    data = response.json()
                    generated_text = data["candidates"][0]["content"]["parts"][0]["text"]
                    
                    # Clean and parse JSON
                    cleaned_text = generated_text.replace("\`\`\`json\n", "").replace("\n\`\`\`", "").strip()
                    result = json.loads(cleaned_text)
                    
                    card_end = time.time()
                    
                    # Calculate performance for this card
                    card_total_time = card_end - card_start
                    card_network_time = network_end - network_start
                    card_processing_time = card_total_time - card_network_time
                    
                    card_performance = {
                        "cardIndex": i + 1,
                        "word": word,
                        "difficulty": difficulty,
                        "totalTime": round(card_total_time * 1000, 2),
                        "networkTime": round(card_network_time * 1000, 2),
                        "processingTime": round(card_processing_time * 1000, 2),
                        "responseSize": len(response.content),
                        "statusCode": response.status_code,
                        "success": True
                    }
                    
                    card_performances.append(card_performance)
                    
                    # Add the card data
                    cards.append({
                        "english": word,
                        "welsh": result["welsh"],
                        "pronunciation": result["pronunciation"],
                        "category": request.category,
                        "difficulty": difficulty,
                        "examples": result["examples"],
                        "performance": card_performance
                    })
                    
                else:
                    # Handle failed card generation
                    card_end = time.time()
                    card_performance = {
                        "cardIndex": i + 1,
                        "word": word,
                        "difficulty": difficulty,
                        "totalTime": round((card_end - card_start) * 1000, 2),
                        "networkTime": round((network_end - network_start) * 1000, 2),
                        "processingTime": 0,
                        "responseSize": 0,
                        "statusCode": response.status_code,
                        "success": False,
                        "error": f"API error: {response.status_code}"
                    }
                    card_performances.append(card_performance)
                    
            except Exception as e:
                card_end = time.time()
                card_performance = {
                    "cardIndex": i + 1,
                    "word": word,
                    "difficulty": difficulty,
                    "totalTime": round((card_end - card_start) * 1000, 2),
                    "networkTime": 0,
                    "processingTime": 0,
                    "responseSize": 0,
                    "statusCode": 0,
                    "success": False,
                    "error": str(e)
                }
                card_performances.append(card_performance)
    
    end_time = time.time()
    
    # Calculate overall performance metrics
    total_time = end_time - start_time
    successful_cards = len([p for p in card_performances if p["success"]])
    failed_cards = len(card_performances) - successful_cards
    
    avg_card_time = sum([p["totalTime"] for p in card_performances if p["success"]]) / max(successful_cards, 1)
    avg_network_time = sum([p["networkTime"] for p in card_performances if p["success"]]) / max(successful_cards, 1)
    
    total_response_size = sum([p["responseSize"] for p in card_performances])
    
    performance = {
        "totalTime": round(total_time * 1000, 2),
        "averageCardTime": round(avg_card_time, 2),
        "averageNetworkTime": round(avg_network_time, 2),
        "successfulCards": successful_cards,
        "failedCards": failed_cards,
        "totalCards": len(card_performances),
        "successRate": round((successful_cards / len(card_performances)) * 100, 2) if card_performances else 0,
        "totalResponseSize": total_response_size,
        "averageResponseSize": round(total_response_size / max(successful_cards, 1), 2),
        "cardPerformances": card_performances,
        "timestamp": time.time()
    }
    
    return DeckTestResponse(
        cards=cards,
        performance=performance
    )

def get_dialect_note(dialect: Optional[str]) -> str:
    """Get dialect note for translation"""
    if dialect == "north":
        return "Use North Welsh dialect and vocabulary preferences."
    elif dialect == "south":
        return "Use South Welsh dialect and vocabulary preferences."
    else:
        return "Use standard Welsh that would be understood across Wales."

def get_formality_note(formality: Optional[str]) -> str:
    """Get formality note for translation"""
    if formality == "formal":
        return "Use formal language appropriate for official or academic contexts."
    elif formality == "informal":
        return "Use casual, everyday language that would be used in informal conversations."
    else:
        return "Use standard formality level appropriate for general communication."

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
