"""
Populate Welsh Learning Lessons Script
This script populates the Firestore database with comprehensive Welsh lessons.
"""

import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
import sys

def main():
    try:
        # Initialize Firebase Admin SDK
        print("Initializing Firebase Admin SDK...")
        
        # Update this path to your service account key file
        cred = credentials.Certificate('path/to/your/serviceAccountKey.json')
        firebase_admin.initialize_app(cred)
        
        # Get Firestore client
        db = firestore.client()
        
        # Admin user ID - update this to your actual admin user ID
        ADMIN_USER_ID = "your_admin_user_id_here"
        
        print("Connected to Firestore successfully!")
        
        # Define comprehensive Welsh lessons
        lessons_data = [
            {
                "title": "Welsh Greetings and Basic Phrases",
                "description": "Learn essential Welsh greetings and polite expressions for everyday conversations.",
                "category": "Basics",
                "difficulty": "Beginner",
                "requiredProficiency": "Beginner",
                "pointsReward": 25,
                "estimatedDuration": 20,
                "published": True,
                "createdBy": ADMIN_USER_ID,
                "tags": ["greetings", "basics", "conversation", "polite"],
                "content": [
                    {
                        "type": "vocabulary",
                        "title": "Basic Greetings",
                        "content": "Learn the most common Welsh greetings used in daily life.",
                        "welsh": "Bore da",
                        "english": "Good morning",
                        "pronunciation": "BOH-reh dah",
                        "examples": [
                            {"welsh": "Bore da, sut mae?", "english": "Good morning, how are you?"},
                            {"welsh": "Bore da i chi", "english": "Good morning to you"}
                        ]
                    },
                    {
                        "type": "vocabulary",
                        "title": "Afternoon and Evening Greetings",
                        "content": "Greetings for different times of the day.",
                        "welsh": "Prynhawn da",
                        "english": "Good afternoon",
                        "pronunciation": "PRIN-hown dah",
                        "examples": [
                            {"welsh": "Prynhawn da, pawb", "english": "Good afternoon, everyone"},
                            {"welsh": "Noswaith dda", "english": "Good evening"}
                        ]
                    },
                    {
                        "type": "conversation",
                        "title": "Meeting Someone New",
                        "content": "A typical conversation when meeting someone for the first time in Welsh.",
                        "examples": [
                            {"welsh": "Helo, beth yw eich enw chi?", "english": "Hello, what is your name?"},
                            {"welsh": "Fy enw i yw...", "english": "My name is..."},
                            {"welsh": "Hyfryd cwrdd â chi", "english": "Nice to meet you"},
                            {"welsh": "Sut mae pethau?", "english": "How are things?"}
                        ]
                    },
                    {
                        "type": "exercise",
                        "title": "Greeting Practice",
                        "content": "Practice using Welsh greetings in different situations.",
                        "exercises": [
                            {
                                "question": "How do you say 'Good morning' in Welsh?",
                                "options": ["Bore da", "Prynhawn da", "Noswaith dda"],
                                "correctAnswer": "Bore da",
                                "explanation": "Bore da is used for morning greetings until around noon."
                            },
                            {
                                "question": "What does 'Sut mae?' mean?",
                                "options": ["Good morning", "How are you?", "Thank you"],
                                "correctAnswer": "How are you?",
                                "explanation": "Sut mae? is a common way to ask how someone is doing."
                            }
                        ]
                    }
                ]
            },
            {
                "title": "Numbers 1-20 in Welsh",
                "description": "Master Welsh numbers from 1 to 20 with proper pronunciation and usage examples.",
                "category": "Numbers",
                "difficulty": "Beginner",
                "requiredProficiency": "Beginner",
                "pointsReward": 30,
                "estimatedDuration": 25,
                "published": True,
                "createdBy": ADMIN_USER_ID,
                "tags": ["numbers", "counting", "basics", "mathematics"],
                "content": [
                    {
                        "type": "vocabulary",
                        "title": "Numbers 1-10",
                        "content": "Learn the first ten numbers in Welsh with pronunciation guides.",
                        "examples": [
                            {"welsh": "un", "english": "one", "pronunciation": "een"},
                            {"welsh": "dau", "english": "two", "pronunciation": "die"},
                            {"welsh": "tri", "english": "three", "pronunciation": "tree"},
                            {"welsh": "pedwar", "english": "four", "pronunciation": "PED-war"},
                            {"welsh": "pump", "english": "five", "pronunciation": "pimp"},
                            {"welsh": "chwech", "english": "six", "pronunciation": "khwekh"},
                            {"welsh": "saith", "english": "seven", "pronunciation": "sythe"},
                            {"welsh": "wyth", "english": "eight", "pronunciation": "ooith"},
                            {"welsh": "naw", "english": "nine", "pronunciation": "now"},
                            {"welsh": "deg", "english": "ten", "pronunciation": "deeg"}
                        ]
                    },
                    {
                        "type": "vocabulary",
                        "title": "Numbers 11-20",
                        "content": "Continue learning Welsh numbers from eleven to twenty.",
                        "examples": [
                            {"welsh": "un deg un", "english": "eleven", "pronunciation": "een deeg een"},
                            {"welsh": "un deg dau", "english": "twelve", "pronunciation": "een deeg die"},
                            {"welsh": "un deg tri", "english": "thirteen", "pronunciation": "een deeg tree"},
                            {"welsh": "un deg pedwar", "english": "fourteen", "pronunciation": "een deeg PED-war"},
                            {"welsh": "un deg pump", "english": "fifteen", "pronunciation": "een deeg pimp"},
                            {"welsh": "un deg chwech", "english": "sixteen", "pronunciation": "een deeg khwekh"},
                            {"welsh": "un deg saith", "english": "seventeen", "pronunciation": "een deeg sythe"},
                            {"welsh": "un deg wyth", "english": "eighteen", "pronunciation": "een deeg ooith"},
                            {"welsh": "un deg naw", "english": "nineteen", "pronunciation": "een deeg now"},
                            {"welsh": "dau ddeg", "english": "twenty", "pronunciation": "die theg"}
                        ]
                    },
                    {
                        "type": "grammar",
                        "title": "Using Numbers with Nouns",
                        "content": "Learn how numbers change when used with different nouns in Welsh.",
                        "examples": [
                            {"welsh": "un gath", "english": "one cat"},
                            {"welsh": "dwy gath", "english": "two cats"},
                            {"welsh": "tair cath", "english": "three cats"},
                            {"welsh": "pedair cath", "english": "four cats"}
                        ]
                    },
                    {
                        "type": "exercise",
                        "title": "Number Recognition",
                        "content": "Test your knowledge of Welsh numbers.",
                        "exercises": [
                            {
                                "question": "What is 'pump' in English?",
                                "options": ["four", "five", "six"],
                                "correctAnswer": "five",
                                "explanation": "Pump means five in Welsh."
                            },
                            {
                                "question": "How do you say 'fifteen' in Welsh?",
                                "options": ["un deg pump", "un deg pedwar", "un deg chwech"],
                                "correctAnswer": "un deg pump",
                                "explanation": "Fifteen is 'un deg pump' - literally 'one ten five'."
                            }
                        ]
                    }
                ]
            },
            {
                "title": "Family Members in Welsh",
                "description": "Learn to talk about your family members and relationships in Welsh.",
                "category": "Family",
                "difficulty": "Beginner",
                "requiredProficiency": "Beginner",
                "pointsReward": 35,
                "estimatedDuration": 30,
                "published": True,
                "createdBy": ADMIN_USER_ID,
                "tags": ["family", "relationships", "personal", "conversation"],
                "content": [
                    {
                        "type": "vocabulary",
                        "title": "Immediate Family",
                        "content": "Learn the Welsh words for close family members.",
                        "examples": [
                            {"welsh": "mam", "english": "mother", "pronunciation": "mam"},
                            {"welsh": "tad", "english": "father", "pronunciation": "tad"},
                            {"welsh": "brawd", "english": "brother", "pronunciation": "browd"},
                            {"welsh": "chwaer", "english": "sister", "pronunciation": "khwy-er"},
                            {"welsh": "mab", "english": "son", "pronunciation": "mab"},
                            {"welsh": "merch", "english": "daughter", "pronunciation": "merkh"},
                            {"welsh": "gŵr", "english": "husband", "pronunciation": "goor"},
                            {"welsh": "gwraig", "english": "wife", "pronunciation": "gwryg"}
                        ]
                    },
                    {
                        "type": "vocabulary",
                        "title": "Extended Family",
                        "content": "Learn about grandparents, aunts, uncles, and cousins.",
                        "examples": [
                            {"welsh": "taid", "english": "grandfather", "pronunciation": "tyde"},
                            {"welsh": "nain", "english": "grandmother", "pronunciation": "nine"},
                            {"welsh": "ewythr", "english": "uncle", "pronunciation": "eh-with-er"},
                            {"welsh": "modryb", "english": "aunt", "pronunciation": "MOD-rib"},
                            {"welsh": "cefnder", "english": "male cousin", "pronunciation": "KEV-nder"},
                            {"welsh": "cyfnither", "english": "female cousin", "pronunciation": "kuv-NITH-er"},
                            {"welsh": "ŵyr", "english": "grandson", "pronunciation": "oo-ir"},
                            {"welsh": "wyres", "english": "granddaughter", "pronunciation": "oo-i-res"}
                        ]
                    },
                    {
                        "type": "conversation",
                        "title": "Talking About Your Family",
                        "content": "Practice describing your family in Welsh.",
                        "examples": [
                            {"welsh": "Mae gen i frawd a chwaer", "english": "I have a brother and sister"},
                            {"welsh": "Fy mam yw...", "english": "My mother is..."},
                            {"welsh": "Mae fy nhad yn gweithio", "english": "My father works"},
                            {"welsh": "Teulu mawr sydd gen i", "english": "I have a big family"},
                            {"welsh": "Dim ond fi sydd", "english": "It's just me"}
                        ]
                    },
                    {
                        "type": "exercise",
                        "title": "Family Vocabulary Quiz",
                        "content": "Test your knowledge of family terms in Welsh.",
                        "exercises": [
                            {
                                "question": "What does 'chwaer' mean?",
                                "options": ["brother", "sister", "mother"],
                                "correctAnswer": "sister",
                                "explanation": "Chwaer means sister in Welsh."
                            },
                            {
                                "question": "How do you say 'grandfather' in Welsh?",
                                "options": ["taid", "nain", "ewythr"],
                                "correctAnswer": "taid",
                                "explanation": "Taid is the Welsh word for grandfather."
                            }
                        ]
                    }
                ]
            },
            {
                "title": "Colors and Descriptions",
                "description": "Learn Welsh color names and how to use them to describe objects and people.",
                "category": "Colors",
                "difficulty": "Beginner",
                "requiredProficiency": "Beginner",
                "pointsReward": 40,
                "estimatedDuration": 35,
                "published": True,
                "createdBy": ADMIN_USER_ID,
                "tags": ["colors", "descriptions", "adjectives", "vocabulary"],
                "content": [
                    {
                        "type": "vocabulary",
                        "title": "Basic Colors",
                        "content": "Learn the most common colors in Welsh.",
                        "examples": [
                            {"welsh": "coch", "english": "red", "pronunciation": "kokh"},
                            {"welsh": "glas", "english": "blue", "pronunciation": "glas"},
                            {"welsh": "gwyrdd", "english": "green", "pronunciation": "goo-irth"},
                            {"welsh": "melyn", "english": "yellow", "pronunciation": "MEL-in"},
                            {"welsh": "du", "english": "black", "pronunciation": "dee"},
                            {"welsh": "gwyn", "english": "white", "pronunciation": "gwin"},
                            {"welsh": "brown", "english": "brown", "pronunciation": "brown"},
                            {"welsh": "pinc", "english": "pink", "pronunciation": "pink"}
                        ]
                    },
                    {
                        "type": "vocabulary",
                        "title": "More Colors and Shades",
                        "content": "Expand your color vocabulary with additional shades.",
                        "examples": [
                            {"welsh": "porffor", "english": "purple", "pronunciation": "POR-for"},
                            {"welsh": "oren", "english": "orange", "pronunciation": "OH-ren"},
                            {"welsh": "llwyd", "english": "grey", "pronunciation": "llooid"},
                            {"welsh": "golau", "english": "light", "pronunciation": "GOH-lye"},
                            {"welsh": "tywyll", "english": "dark", "pronunciation": "TUH-will"},
                            {"welsh": "llachar", "english": "bright", "pronunciation": "LLAKH-ar"}
                        ]
                    },
                    {
                        "type": "grammar",
                        "title": "Using Colors with Nouns",
                        "content": "Learn how colors change form when describing different objects.",
                        "examples": [
                            {"welsh": "car coch", "english": "red car"},
                            {"welsh": "tŷ gwyn", "english": "white house"},
                            {"welsh": "cath ddu", "english": "black cat"},
                            {"welsh": "blodyn melyn", "english": "yellow flower"},
                            {"welsh": "awyr las", "english": "blue sky"}
                        ]
                    },
                    {
                        "type": "exercise",
                        "title": "Color Recognition",
                        "content": "Practice identifying and using Welsh colors.",
                        "exercises": [
                            {
                                "question": "What color is 'gwyrdd'?",
                                "options": ["red", "green", "blue"],
                                "correctAnswer": "green",
                                "explanation": "Gwyrdd means green in Welsh."
                            },
                            {
                                "question": "How do you say 'yellow flower' in Welsh?",
                                "options": ["blodyn melyn", "blodyn coch", "blodyn glas"],
                                "correctAnswer": "blodyn melyn",
                                "explanation": "Blodyn melyn means yellow flower."
                            }
                        ]
                    }
                ]
            },
            {
                "title": "Days, Months, and Time",
                "description": "Master time expressions in Welsh including days of the week, months, and telling time.",
                "category": "Time",
                "difficulty": "Intermediate",
                "requiredProficiency": "Beginner",
                "pointsReward": 45,
                "estimatedDuration": 40,
                "published": True,
                "createdBy": ADMIN_USER_ID,
                "tags": ["time", "calendar", "schedule", "intermediate"],
                "content": [
                    {
                        "type": "vocabulary",
                        "title": "Days of the Week",
                        "content": "Learn all seven days of the week in Welsh.",
                        "examples": [
                            {"welsh": "Dydd Llun", "english": "Monday", "pronunciation": "deethe LLEEN"},
                            {"welsh": "Dydd Mawrth", "english": "Tuesday", "pronunciation": "deethe MOWRTH"},
                            {"welsh": "Dydd Mercher", "english": "Wednesday", "pronunciation": "deethe MER-kher"},
                            {"welsh": "Dydd Iau", "english": "Thursday", "pronunciation": "deethe YAH-ee"},
                            {"welsh": "Dydd Gwener", "english": "Friday", "pronunciation": "deethe GWEN-er"},
                            {"welsh": "Dydd Sadwrn", "english": "Saturday", "pronunciation": "deethe SAD-oorn"},
                            {"welsh": "Dydd Sul", "english": "Sunday", "pronunciation": "deethe SEEL"}
                        ]
                    },
                    {
                        "type": "vocabulary",
                        "title": "Months of the Year",
                        "content": "Learn the twelve months in Welsh.",
                        "examples": [
                            {"welsh": "Ionawr", "english": "January", "pronunciation": "yon-OW-er"},
                            {"welsh": "Chwefror", "english": "February", "pronunciation": "KHWEV-ror"},
                            {"welsh": "Mawrth", "english": "March", "pronunciation": "MOWRTH"},
                            {"welsh": "Ebrill", "english": "April", "pronunciation": "EB-rill"},
                            {"welsh": "Mai", "english": "May", "pronunciation": "my"},
                            {"welsh": "Mehefin", "english": "June", "pronunciation": "meh-HEV-in"},
                            {"welsh": "Gorffennaf", "english": "July", "pronunciation": "gor-THEN-av"},
                            {"welsh": "Awst", "english": "August", "pronunciation": "owst"},
                            {"welsh": "Medi", "english": "September", "pronunciation": "MED-ee"},
                            {"welsh": "Hydref", "english": "October", "pronunciation": "HUD-rev"},
                            {"welsh": "Tachwedd", "english": "November", "pronunciation": "TAKH-weth"},
                            {"welsh": "Rhagfyr", "english": "December", "pronunciation": "RHAG-vir"}
                        ]
                    },
                    {
                        "type": "vocabulary",
                        "title": "Telling Time",
                        "content": "Learn how to tell time in Welsh.",
                        "examples": [
                            {"welsh": "Beth yw'r amser?", "english": "What time is it?"},
                            {"welsh": "Mae hi'n un o'r gloch", "english": "It's one o'clock"},
                            {"welsh": "Mae hi'n ddau o'r gloch", "english": "It's two o'clock"},
                            {"welsh": "Hanner awr wedi un", "english": "Half past one"},
                            {"welsh": "Chwarter wedi dau", "english": "Quarter past two"},
                            {"welsh": "Chwarter i dri", "english": "Quarter to three"}
                        ]
                    },
                    {
                        "type": "exercise",
                        "title": "Time and Date Practice",
                        "content": "Practice using time expressions in Welsh.",
                        "exercises": [
                            {
                                "question": "What day is 'Dydd Gwener'?",
                                "options": ["Thursday", "Friday", "Saturday"],
                                "correctAnswer": "Friday",
                                "explanation": "Dydd Gwener means Friday in Welsh."
                            },
                            {
                                "question": "How do you ask 'What time is it?' in Welsh?",
                                "options": ["Beth yw'r amser?", "Sut mae?", "Ble mae?"],
                                "correctAnswer": "Beth yw'r amser?",
                                "explanation": "Beth yw'r amser? means 'What time is it?' in Welsh."
                            }
                        ]
                    }
                ]
            },
            {
                "title": "Weather and Seasons",
                "description": "Learn to describe weather conditions and seasons in Welsh.",
                "category": "Weather",
                "difficulty": "Intermediate",
                "requiredProficiency": "Beginner",
                "pointsReward": 50,
                "estimatedDuration": 45,
                "published": True,
                "createdBy": ADMIN_USER_ID,
                "tags": ["weather", "seasons", "nature", "conversation"],
                "content": [
                    {
                        "type": "vocabulary",
                        "title": "Weather Conditions",
                        "content": "Learn common weather expressions in Welsh.",
                        "examples": [
                            {"welsh": "Mae hi'n braf", "english": "It's fine/nice", "pronunciation": "my heen brav"},
                            {"welsh": "Mae hi'n bwrw glaw", "english": "It's raining", "pronunciation": "my heen BOO-roo glow"},
                            {"welsh": "Mae hi'n oer", "english": "It's cold", "pronunciation": "my heen oh-er"},
                            {"welsh": "Mae hi'n boeth", "english": "It's hot", "pronunciation": "my heen boy-eth"},
                            {"welsh": "Mae hi'n wyntog", "english": "It's windy", "pronunciation": "my heen WIN-tog"},
                            {"welsh": "Mae hi'n gymylog", "english": "It's cloudy", "pronunciation": "my heen gum-UH-log"},
                            {"welsh": "Mae hi'n rhewi", "english": "It's freezing", "pronunciation": "my heen RHEH-wee"}
                        ]
                    },
                    {
                        "type": "vocabulary",
                        "title": "Four Seasons",
                        "content": "Learn the names of the four seasons in Welsh.",
                        "examples": [
                            {"welsh": "gwanwyn", "english": "spring", "pronunciation": "GWAN-win"},
                            {"welsh": "haf", "english": "summer", "pronunciation": "hav"},
                            {"welsh": "hydref", "english": "autumn", "pronunciation": "HUD-rev"},
                            {"welsh": "gaeaf", "english": "winter", "pronunciation": "GYE-av"}
                        ]
                    },
                    {
                        "type": "conversation",
                        "title": "Weather Small Talk",
                        "content": "Practice talking about the weather in everyday conversations.",
                        "examples": [
                            {"welsh": "Sut mae'r tywydd heddiw?", "english": "How's the weather today?"},
                            {"welsh": "Mae'n ddiwrnod braf", "english": "It's a nice day"},
                            {"welsh": "Gobeithio bydd hi'n braf yfory", "english": "I hope it will be nice tomorrow"},
                            {"welsh": "Mae'r glaw yn drwm", "english": "The rain is heavy"},
                            {"welsh": "Dw i'n hoffi'r haul", "english": "I like the sun"}
                        ]
                    },
                    {
                        "type": "exercise",
                        "title": "Weather Description",
                        "content": "Practice describing weather conditions in Welsh.",
                        "exercises": [
                            {
                                "question": "How do you say 'It's raining' in Welsh?",
                                "options": ["Mae hi'n bwrw glaw", "Mae hi'n oer", "Mae hi'n boeth"],
                                "correctAnswer": "Mae hi'n bwrw glaw",
                                "explanation": "Mae hi'n bwrw glaw means 'It's raining' in Welsh."
                            },
                            {
                                "question": "What season is 'gwanwyn'?",
                                "options": ["winter", "spring", "summer"],
                                "correctAnswer": "spring",
                                "explanation": "Gwanwyn means spring in Welsh."
                            }
                        ]
                    }
                ]
            },
            {
                "title": "Food and Drink Vocabulary",
                "description": "Learn essential Welsh vocabulary for food, drinks, and dining experiences.",
                "category": "Food",
                "difficulty": "Intermediate",
                "requiredProficiency": "Intermediate",
                "pointsReward": 55,
                "estimatedDuration": 50,
                "published": True,
                "createdBy": ADMIN_USER_ID,
                "tags": ["food", "drink", "restaurant", "cooking", "intermediate"],
                "content": [
                    {
                        "type": "vocabulary",
                        "title": "Basic Foods",
                        "content": "Learn common food items in Welsh.",
                        "examples": [
                            {"welsh": "bara", "english": "bread", "pronunciation": "BAH-ra"},
                            {"welsh": "caws", "english": "cheese", "pronunciation": "kows"},
                            {"welsh": "cig", "english": "meat", "pronunciation": "keeg"},
                            {"welsh": "pysgod", "english": "fish", "pronunciation": "PUS-god"},
                            {"welsh": "llaeth", "english": "milk", "pronunciation": "llye-eth"},
                            {"welsh": "wyau", "english": "eggs", "pronunciation": "WUH-ye"},
                            {"welsh": "ffrwythau", "english": "fruits", "pronunciation": "FROO-i-thye"},
                            {"welsh": "llysiau", "english": "vegetables", "pronunciation": "LLUSH-ye"}
                        ]
                    },
                    {
                        "type": "vocabulary",
                        "title": "Drinks and Beverages",
                        "content": "Learn names of common drinks in Welsh.",
                        "examples": [
                            {"welsh": "dŵr", "english": "water", "pronunciation": "door"},
                            {"welsh": "te", "english": "tea", "pronunciation": "teh"},
                            {"welsh": "coffi", "english": "coffee", "pronunciation": "KOF-fee"},
                            {"welsh": "sudd", "english": "juice", "pronunciation": "seethe"},
                            {"welsh": "cwrw", "english": "beer", "pronunciation": "KOO-roo"},
                            {"welsh": "gwin", "english": "wine", "pronunciation": "gween"}
                        ]
                    },
                    {
                        "type": "conversation",
                        "title": "At the Restaurant",
                        "content": "Practice ordering food and drinks in Welsh.",
                        "examples": [
                            {"welsh": "Ga i'r fwydlen, os gwelwch yn dda?", "english": "May I have the menu, please?"},
                            {"welsh": "Beth hoffech chi?", "english": "What would you like?"},
                            {"welsh": "Hoffwn i gael...", "english": "I would like to have..."},
                            {"welsh": "Dw i eisiau...", "english": "I want..."},
                            {"welsh": "Y bil, os gwelwch yn dda", "english": "The bill, please"}
                        ]
                    },
                    {
                        "type": "exercise",
                        "title": "Food and Drink Quiz",
                        "content": "Test your knowledge of Welsh food vocabulary.",
                        "exercises": [
                            {
                                "question": "What does 'bara' mean?",
                                "options": ["butter", "bread", "beer"],
                                "correctAnswer": "bread",
                                "explanation": "Bara means bread in Welsh."
                            },
                            {
                                "question": "How do you say 'I would like coffee' in Welsh?",
                                "options": ["Hoffwn i gael coffi", "Dw i'n hoffi coffi", "Mae coffi gen i"],
                                "correctAnswer": "Hoffwn i gael coffi",
                                "explanation": "Hoffwn i gael coffi means 'I would like to have coffee'."
                            }
                        ]
                    }
                ]
            }
        ]
        
        # Add lessons to Firestore
        lessons_collection = db.collection('lessons')
        
        print(f"Adding {len(lessons_data)} lessons to Firestore...")
        
        added_count = 0
        for lesson_data in lessons_data:
            try:
                # Add timestamps
                lesson_data['createdAt'] = datetime.now()
                lesson_data['updatedAt'] = datetime.now()
                
                # Add the lesson
                doc_ref = lessons_collection.add(lesson_data)
                added_count += 1
                print(f"✓ Added lesson: {lesson_data['title']}")
                
            except Exception as e:
                print(f"✗ Failed to add lesson '{lesson_data['title']}': {str(e)}")
                continue
        
        print(f"\n🎉 Successfully added {added_count} lessons to Firestore!")
        print(f"📚 Total points available: {sum(lesson['pointsReward'] for lesson in lessons_data)} points")
        print(f"📊 Categories: {', '.join(set(lesson['category'] for lesson in lessons_data))}")
        print(f"⏱️  Total estimated duration: {sum(lesson['estimatedDuration'] for lesson in lessons_data)} minutes")
        
        print("\n✅ Lesson population completed successfully!")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
