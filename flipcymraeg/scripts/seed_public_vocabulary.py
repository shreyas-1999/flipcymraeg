import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
import json

# Initialize Firebase Admin SDK
# You'll need to download your service account key from Firebase Console
# Go to Project Settings > Service Accounts > Generate new private key
cred = credentials.Certificate('path/to/your/serviceAccountKey.json')  # Update this path
firebase_admin.initialize_app(cred)

db = firestore.client()

def seed_public_vocabulary():
    """Seed the Firestore database with comprehensive Welsh vocabulary"""
    
    print("🏴󠁧󠁢󠁷󠁬󠁳󠁿 Starting to seed public vocabulary database...")
    
    # Admin user ID - replace with your actual admin user ID
    ADMIN_USER_ID = "your_admin_user_id_here"  # Update this with your actual admin user ID
    
    vocabulary_data = [
        # GREETINGS (15 cards)
        {
            "welsh": "Bore da",
            "english": "Good morning",
            "pronunciation": "BOH-reh dah",
            "difficulty": "Beginner",
            "category": "Greetings",
            "examples": [
                {"welsh": "Bore da, sut mae?", "english": "Good morning, how are you?"},
                {"welsh": "Bore da i chi gyd", "english": "Good morning to you all"},
                {"welsh": "Bore da, gobeithio bod chi'n iawn", "english": "Good morning, I hope you're well"}
            ]
        },
        {
            "welsh": "Prynhawn da",
            "english": "Good afternoon",
            "pronunciation": "PRIN-hown dah",
            "difficulty": "Beginner",
            "category": "Greetings",
            "examples": [
                {"welsh": "Prynhawn da, hyfryd eich gweld", "english": "Good afternoon, lovely to see you"},
                {"welsh": "Prynhawn da pawb", "english": "Good afternoon everyone"},
                {"welsh": "Prynhawn da, sut mae'r diwrnod?", "english": "Good afternoon, how's the day?"}
            ]
        },
        {
            "welsh": "Nos da",
            "english": "Good night",
            "pronunciation": "nohs dah",
            "difficulty": "Beginner",
            "category": "Greetings",
            "examples": [
                {"welsh": "Nos da, cysgu'n dda", "english": "Good night, sleep well"},
                {"welsh": "Nos da i chi", "english": "Good night to you"},
                {"welsh": "Nos da, gwela i chi yfory", "english": "Good night, I'll see you tomorrow"}
            ]
        },
        {
            "welsh": "Helo",
            "english": "Hello",
            "pronunciation": "HEH-lo",
            "difficulty": "Beginner",
            "category": "Greetings",
            "examples": [
                {"welsh": "Helo, pwy ydych chi?", "english": "Hello, who are you?"},
                {"welsh": "Helo, mae'n braf eich cyfarfod", "english": "Hello, it's nice to meet you"},
                {"welsh": "Helo, sut ydych chi heddiw?", "english": "Hello, how are you today?"}
            ]
        },
        {
            "welsh": "Hwyl fawr",
            "english": "Goodbye",
            "pronunciation": "HOO-il vowr",
            "difficulty": "Beginner",
            "category": "Greetings",
            "examples": [
                {"welsh": "Hwyl fawr, gwela i chi eto", "english": "Goodbye, I'll see you again"},
                {"welsh": "Hwyl fawr am nawr", "english": "Goodbye for now"},
                {"welsh": "Hwyl fawr, pob lwc", "english": "Goodbye, good luck"}
            ]
        },
        {
            "welsh": "Sut mae?",
            "english": "How are you?",
            "pronunciation": "seet my",
            "difficulty": "Beginner",
            "category": "Greetings",
            "examples": [
                {"welsh": "Sut mae pethau?", "english": "How are things?"},
                {"welsh": "Sut mae'r teulu?", "english": "How's the family?"},
                {"welsh": "Sut mae'r gwaith?", "english": "How's work?"}
            ]
        },
        {
            "welsh": "Iawn, diolch",
            "english": "Fine, thank you",
            "pronunciation": "yown, DEE-olkh",
            "difficulty": "Beginner",
            "category": "Greetings",
            "examples": [
                {"welsh": "Iawn, diolch yn fawr", "english": "Fine, thank you very much"},
                {"welsh": "Iawn, diolch, a chi?", "english": "Fine, thank you, and you?"},
                {"welsh": "Iawn, diolch am ofyn", "english": "Fine, thank you for asking"}
            ]
        },
        {
            "welsh": "Shwmae",
            "english": "Hello (South Wales)",
            "pronunciation": "SHOO-my",
            "difficulty": "Beginner",
            "category": "Greetings",
            "examples": [
                {"welsh": "Shwmae, ti'n iawn?", "english": "Hello, are you alright?"},
                {"welsh": "Shwmae bois", "english": "Hello boys"},
                {"welsh": "Shwmae, beth sy'n digwydd?", "english": "Hello, what's happening?"}
            ]
        },
        {
            "welsh": "Croeso",
            "english": "Welcome",
            "pronunciation": "KROY-so",
            "difficulty": "Beginner",
            "category": "Greetings",
            "examples": [
                {"welsh": "Croeso i Gymru", "english": "Welcome to Wales"},
                {"welsh": "Croeso cynnes", "english": "Warm welcome"},
                {"welsh": "Croeso adref", "english": "Welcome home"}
            ]
        },
        {
            "welsh": "Pnawn da",
            "english": "Good afternoon (informal)",
            "pronunciation": "pnown dah",
            "difficulty": "Beginner",
            "category": "Greetings",
            "examples": [
                {"welsh": "Pnawn da, ffrind", "english": "Good afternoon, friend"},
                {"welsh": "Pnawn da i chi", "english": "Good afternoon to you"},
                {"welsh": "Pnawn da, sut mae hi?", "english": "Good afternoon, how is she?"}
            ]
        },

        # POLITENESS (12 cards)
        {
            "welsh": "Diolch",
            "english": "Thank you",
            "pronunciation": "DEE-olkh",
            "difficulty": "Beginner",
            "category": "Politeness",
            "examples": [
                {"welsh": "Diolch am eich help", "english": "Thank you for your help"},
                {"welsh": "Diolch o galon", "english": "Thank you from the heart"},
                {"welsh": "Diolch yn fawr iawn", "english": "Thank you very much indeed"}
            ]
        },
        {
            "welsh": "Diolch yn fawr",
            "english": "Thank you very much",
            "pronunciation": "DEE-olkh un vowr",
            "difficulty": "Beginner",
            "category": "Politeness",
            "examples": [
                {"welsh": "Diolch yn fawr am y rhodd", "english": "Thank you very much for the gift"},
                {"welsh": "Diolch yn fawr i chi gyd", "english": "Thank you very much to you all"},
                {"welsh": "Diolch yn fawr am ddod", "english": "Thank you very much for coming"}
            ]
        },
        {
            "welsh": "Mae'n ddrwg gen i",
            "english": "I'm sorry",
            "pronunciation": "mine throg gen ee",
            "difficulty": "Intermediate",
            "category": "Politeness",
            "examples": [
                {"welsh": "Mae'n ddrwg gen i am fod yn hwyr", "english": "I'm sorry for being late"},
                {"welsh": "Mae'n ddrwg gen i, wnes i ddim deall", "english": "I'm sorry, I didn't understand"},
                {"welsh": "Mae'n ddrwg gen i am y camgymeriad", "english": "I'm sorry for the mistake"}
            ]
        },
        {
            "welsh": "Esgusodwch fi",
            "english": "Excuse me",
            "pronunciation": "es-GEE-soh-dooch vee",
            "difficulty": "Intermediate",
            "category": "Politeness",
            "examples": [
                {"welsh": "Esgusodwch fi, ble mae'r toiled?", "english": "Excuse me, where is the toilet?"},
                {"welsh": "Esgusodwch fi am dorri ar draws", "english": "Excuse me for interrupting"},
                {"welsh": "Esgusodwch fi, allwch chi helpu?", "english": "Excuse me, can you help?"}
            ]
        },
        {
            "welsh": "Os gwelwch yn dda",
            "english": "Please",
            "pronunciation": "ohs GWEL-ooch un thah",
            "difficulty": "Intermediate",
            "category": "Politeness",
            "examples": [
                {"welsh": "Dewch yma os gwelwch yn dda", "english": "Come here please"},
                {"welsh": "Arhoswch os gwelwch yn dda", "english": "Wait please"},
                {"welsh": "Helpwch fi os gwelwch yn dda", "english": "Help me please"}
            ]
        },
        {
            "welsh": "Dim problem",
            "english": "No problem",
            "pronunciation": "deem PROB-lem",
            "difficulty": "Beginner",
            "category": "Politeness",
            "examples": [
                {"welsh": "Dim problem o gwbl", "english": "No problem at all"},
                {"welsh": "Dim problem, cariad", "english": "No problem, love"},
                {"welsh": "Dim problem, unrhyw bryd", "english": "No problem, any time"}
            ]
        },

        # NUMBERS (20 cards)
        {
            "welsh": "Un",
            "english": "One",
            "pronunciation": "een",
            "difficulty": "Beginner",
            "category": "Numbers",
            "examples": [
                {"welsh": "Un person", "english": "One person"},
                {"welsh": "Un funud", "english": "One minute"},
                {"welsh": "Un tro", "english": "One time"}
            ]
        },
        {
            "welsh": "Dau",
            "english": "Two",
            "pronunciation": "die",
            "difficulty": "Beginner",
            "category": "Numbers",
            "examples": [
                {"welsh": "Dau ddyn", "english": "Two men"},
                {"welsh": "Dau gath", "english": "Two cats"},
                {"welsh": "Dau ddiwrnod", "english": "Two days"}
            ]
        },
        {
            "welsh": "Tri",
            "english": "Three",
            "pronunciation": "tree",
            "difficulty": "Beginner",
            "category": "Numbers",
            "examples": [
                {"welsh": "Tri bachgen", "english": "Three boys"},
                {"welsh": "Tri mis", "english": "Three months"},
                {"welsh": "Tri llyfr", "english": "Three books"}
            ]
        },
        {
            "welsh": "Pedwar",
            "english": "Four",
            "pronunciation": "PED-war",
            "difficulty": "Beginner",
            "category": "Numbers",
            "examples": [
                {"welsh": "Pedwar ceffyl", "english": "Four horses"},
                {"welsh": "Pedwar awr", "english": "Four hours"},
                {"welsh": "Pedwar ty", "english": "Four houses"}
            ]
        },
        {
            "welsh": "Pump",
            "english": "Five",
            "pronunciation": "pimp",
            "difficulty": "Beginner",
            "category": "Numbers",
            "examples": [
                {"welsh": "Pump plentyn", "english": "Five children"},
                {"welsh": "Pump munud", "english": "Five minutes"},
                {"welsh": "Pump punt", "english": "Five pounds"}
            ]
        },
        {
            "welsh": "Chwech",
            "english": "Six",
            "pronunciation": "khoo-ekh",
            "difficulty": "Beginner",
            "category": "Numbers",
            "examples": [
                {"welsh": "Chwech car", "english": "Six cars"},
                {"welsh": "Chwech wythnos", "english": "Six weeks"},
                {"welsh": "Chwech o'r gloch", "english": "Six o'clock"}
            ]
        },
        {
            "welsh": "Saith",
            "english": "Seven",
            "pronunciation": "sythe",
            "difficulty": "Beginner",
            "category": "Numbers",
            "examples": [
                {"welsh": "Saith diwrnod", "english": "Seven days"},
                {"welsh": "Saith mlynedd", "english": "Seven years"},
                {"welsh": "Saith deg", "english": "Seventy"}
            ]
        },
        {
            "welsh": "Wyth",
            "english": "Eight",
            "pronunciation": "ooith",
            "difficulty": "Beginner",
            "category": "Numbers",
            "examples": [
                {"welsh": "Wyth awr", "english": "Eight hours"},
                {"welsh": "Wyth deg", "english": "Eighty"},
                {"welsh": "Wyth mlwydd oed", "english": "Eight years old"}
            ]
        },
        {
            "welsh": "Naw",
            "english": "Nine",
            "pronunciation": "now",
            "difficulty": "Beginner",
            "category": "Numbers",
            "examples": [
                {"welsh": "Naw mis", "english": "Nine months"},
                {"welsh": "Naw deg", "english": "Ninety"},
                {"welsh": "Naw o'r gloch", "english": "Nine o'clock"}
            ]
        },
        {
            "welsh": "Deg",
            "english": "Ten",
            "pronunciation": "deeg",
            "difficulty": "Beginner",
            "category": "Numbers",
            "examples": [
                {"welsh": "Deg punt", "english": "Ten pounds"},
                {"welsh": "Deg munud", "english": "Ten minutes"},
                {"welsh": "Deg mlynedd", "english": "Ten years"}
            ]
        },
        {
            "welsh": "Ugain",
            "english": "Twenty",
            "pronunciation": "EE-gine",
            "difficulty": "Intermediate",
            "category": "Numbers",
            "examples": [
                {"welsh": "Ugain mlynedd", "english": "Twenty years"},
                {"welsh": "Ugain punt", "english": "Twenty pounds"},
                {"welsh": "Ugain munud", "english": "Twenty minutes"}
            ]
        },
        {
            "welsh": "Can",
            "english": "Hundred",
            "pronunciation": "kan",
            "difficulty": "Intermediate",
            "category": "Numbers",
            "examples": [
                {"welsh": "Can punt", "english": "One hundred pounds"},
                {"welsh": "Can mlynedd", "english": "One hundred years"},
                {"welsh": "Can person", "english": "One hundred people"}
            ]
        },

        # FAMILY (15 cards)
        {
            "welsh": "Teulu",
            "english": "Family",
            "pronunciation": "TIE-lee",
            "difficulty": "Beginner",
            "category": "Family",
            "examples": [
                {"welsh": "Fy nheulu i", "english": "My family"},
                {"welsh": "Teulu mawr", "english": "Big family"},
                {"welsh": "Teulu hapus", "english": "Happy family"}
            ]
        },
        {
            "welsh": "Mam",
            "english": "Mother",
            "pronunciation": "mam",
            "difficulty": "Beginner",
            "category": "Family",
            "examples": [
                {"welsh": "Fy mam i", "english": "My mother"},
                {"welsh": "Mam annwyl", "english": "Dear mother"},
                {"welsh": "Mam-gu", "english": "Grandmother"}
            ]
        },
        {
            "welsh": "Tad",
            "english": "Father",
            "pronunciation": "tad",
            "difficulty": "Beginner",
            "category": "Family",
            "examples": [
                {"welsh": "Fy nhad i", "english": "My father"},
                {"welsh": "Tad caredig", "english": "Kind father"},
                {"welsh": "Tad-cu", "english": "Grandfather"}
            ]
        },
        {
            "welsh": "Brawd",
            "english": "Brother",
            "pronunciation": "browd",
            "difficulty": "Beginner",
            "category": "Family",
            "examples": [
                {"welsh": "Fy mrawd i", "english": "My brother"},
                {"welsh": "Brawd mawr", "english": "Big brother"},
                {"welsh": "Brawd bach", "english": "Little brother"}
            ]
        },
        {
            "welsh": "Chwaer",
            "english": "Sister",
            "pronunciation": "khwy-er",
            "difficulty": "Beginner",
            "category": "Family",
            "examples": [
                {"welsh": "Fy chwaer i", "english": "My sister"},
                {"welsh": "Chwaer fawr", "english": "Big sister"},
                {"welsh": "Chwaer fach", "english": "Little sister"}
            ]
        },
        {
            "welsh": "Plant",
            "english": "Children",
            "pronunciation": "plant",
            "difficulty": "Beginner",
            "category": "Family",
            "examples": [
                {"welsh": "Plant bach", "english": "Small children"},
                {"welsh": "Plant yr ysgol", "english": "School children"},
                {"welsh": "Plant hapus", "english": "Happy children"}
            ]
        },
        {
            "welsh": "Cariad",
            "english": "Love/Darling",
            "pronunciation": "KAH-ree-ad",
            "difficulty": "Intermediate",
            "category": "Family",
            "examples": [
                {"welsh": "Fy nghariad i", "english": "My love"},
                {"welsh": "Cariad annwyl", "english": "Dear love"},
                {"welsh": "Cariad cyntaf", "english": "First love"}
            ]
        },
        {
            "welsh": "Gŵr",
            "english": "Husband",
            "pronunciation": "goor",
            "difficulty": "Intermediate",
            "category": "Family",
            "examples": [
                {"welsh": "Fy ngŵr i", "english": "My husband"},
                {"welsh": "Gŵr da", "english": "Good husband"},
                {"welsh": "Gŵr caredig", "english": "Kind husband"}
            ]
        },
        {
            "welsh": "Gwraig",
            "english": "Wife",
            "pronunciation": "gwyg",
            "difficulty": "Intermediate",
            "category": "Family",
            "examples": [
                {"welsh": "Fy ngwraig i", "english": "My wife"},
                {"welsh": "Gwraig annwyl", "english": "Dear wife"},
                {"welsh": "Gwraig brydferth", "english": "Beautiful wife"}
            ]
        },
        {
            "welsh": "Mab",
            "english": "Son",
            "pronunciation": "mab",
            "difficulty": "Beginner",
            "category": "Family",
            "examples": [
                {"welsh": "Fy mab i", "english": "My son"},
                {"welsh": "Mab bach", "english": "Little son"},
                {"welsh": "Mab da", "english": "Good son"}
            ]
        },
        {
            "welsh": "Merch",
            "english": "Daughter",
            "pronunciation": "merkh",
            "difficulty": "Beginner",
            "category": "Family",
            "examples": [
                {"welsh": "Fy merch i", "english": "My daughter"},
                {"welsh": "Merch fach", "english": "Little daughter"},
                {"welsh": "Merch brydferth", "english": "Beautiful daughter"}
            ]
        },

        # COLORS (12 cards)
        {
            "welsh": "Coch",
            "english": "Red",
            "pronunciation": "kokh",
            "difficulty": "Beginner",
            "category": "Colors",
            "examples": [
                {"welsh": "Car coch", "english": "Red car"},
                {"welsh": "Draig goch", "english": "Red dragon"},
                {"welsh": "Blodau coch", "english": "Red flowers"}
            ]
        },
        {
            "welsh": "Glas",
            "english": "Blue",
            "pronunciation": "glas",
            "difficulty": "Beginner",
            "category": "Colors",
            "examples": [
                {"welsh": "Awyr las", "english": "Blue sky"},
                {"welsh": "Môr glas", "english": "Blue sea"},
                {"welsh": "Llygaid glas", "english": "Blue eyes"}
            ]
        },
        {
            "welsh": "Gwyrdd",
            "english": "Green",
            "pronunciation": "goo-eerth",
            "difficulty": "Beginner",
            "category": "Colors",
            "examples": [
                {"welsh": "Glaswellt gwyrdd", "english": "Green grass"},
                {"welsh": "Coed gwyrdd", "english": "Green trees"},
                {"welsh": "Golau gwyrdd", "english": "Green light"}
            ]
        },
        {
            "welsh": "Melyn",
            "english": "Yellow",
            "pronunciation": "MEH-lin",
            "difficulty": "Beginner",
            "category": "Colors",
            "examples": [
                {"welsh": "Haul melyn", "english": "Yellow sun"},
                {"welsh": "Blodau melyn", "english": "Yellow flowers"},
                {"welsh": "Bws melyn", "english": "Yellow bus"}
            ]
        },
        {
            "welsh": "Du",
            "english": "Black",
            "pronunciation": "dee",
            "difficulty": "Beginner",
            "category": "Colors",
            "examples": [
                {"welsh": "Cath ddu", "english": "Black cat"},
                {"welsh": "Nos ddu", "english": "Black night"},
                {"welsh": "Dillad du", "english": "Black clothes"}
            ]
        },
        {
            "welsh": "Gwyn",
            "english": "White",
            "pronunciation": "gwin",
            "difficulty": "Beginner",
            "category": "Colors",
            "examples": [
                {"welsh": "Eira gwyn", "english": "White snow"},
                {"welsh": "Tŷ gwyn", "english": "White house"},
                {"welsh": "Cwmwl gwyn", "english": "White cloud"}
            ]
        },
        {
            "welsh": "Brown",
            "english": "Brown",
            "pronunciation": "brown",
            "difficulty": "Beginner",
            "category": "Colors",
            "examples": [
                {"welsh": "Ci brown", "english": "Brown dog"},
                {"welsh": "Coed brown", "english": "Brown trees"},
                {"welsh": "Pridd brown", "english": "Brown soil"}
            ]
        },
        {
            "welsh": "Pinc",
            "english": "Pink",
            "pronunciation": "pink",
            "difficulty": "Beginner",
            "category": "Colors",
            "examples": [
                {"welsh": "Blodau pinc", "english": "Pink flowers"},
                {"welsh": "Dillad pinc", "english": "Pink clothes"},
                {"welsh": "Machlud pinc", "english": "Pink sunset"}
            ]
        },

        # PLACES (18 cards)
        {
            "welsh": "Cymru",
            "english": "Wales",
            "pronunciation": "KUM-ree",
            "difficulty": "Beginner",
            "category": "Places",
            "examples": [
                {"welsh": "Croeso i Gymru", "english": "Welcome to Wales"},
                {"welsh": "Cymru am byth", "english": "Wales forever"},
                {"welsh": "Pobl Cymru", "english": "People of Wales"}
            ]
        },
        {
            "welsh": "Lloegr",
            "english": "England",
            "pronunciation": "HLOY-gr",
            "difficulty": "Beginner",
            "category": "Places",
            "examples": [
                {"welsh": "Mynd i Loegr", "english": "Going to England"},
                {"welsh": "O Loegr", "english": "From England"},
                {"welsh": "Yn Lloegr", "english": "In England"}
            ]
        },
        {
            "welsh": "Ysgol",
            "english": "School",
            "pronunciation": "UH-sgol",
            "difficulty": "Beginner",
            "category": "Places",
            "examples": [
                {"welsh": "Mynd i'r ysgol", "english": "Going to school"},
                {"welsh": "Ysgol gynradd", "english": "Primary school"},
                {"welsh": "Ysgol uwchradd", "english": "Secondary school"}
            ]
        },
        {
            "welsh": "Tŷ",
            "english": "House",
            "pronunciation": "tee",
            "difficulty": "Beginner",
            "category": "Places",
            "examples": [
                {"welsh": "Tŷ mawr", "english": "Big house"},
                {"welsh": "Tŷ bach", "english": "Small house"},
                {"welsh": "Mynd adref i'r tŷ", "english": "Going home to the house"}
            ]
        },
        {
            "welsh": "Dref",
            "english": "Town",
            "pronunciation": "drev",
            "difficulty": "Beginner",
            "category": "Places",
            "examples": [
                {"welsh": "Canol y dref", "english": "Town center"},
                {"welsh": "Tref fach", "english": "Small town"},
                {"welsh": "Mynd i'r dref", "english": "Going to town"}
            ]
        },
        {
            "welsh": "Parc",
            "english": "Park",
            "pronunciation": "park",
            "difficulty": "Beginner",
            "category": "Places",
            "examples": [
                {"welsh": "Chwarae yn y parc", "english": "Playing in the park"},
                {"welsh": "Parc cenedlaethol", "english": "National park"},
                {"welsh": "Parc y dref", "english": "Town park"}
            ]
        },
        {
            "welsh": "Siop",
            "english": "Shop",
            "pronunciation": "shop",
            "difficulty": "Beginner",
            "category": "Places",
            "examples": [
                {"welsh": "Mynd i'r siop", "english": "Going to the shop"},
                {"welsh": "Siop fara", "english": "Bakery"},
                {"welsh": "Siop lyfrau", "english": "Bookshop"}
            ]
        },
        {
            "welsh": "Eglwys",
            "english": "Church",
            "pronunciation": "EG-loos",
            "difficulty": "Intermediate",
            "category": "Places",
            "examples": [
                {"welsh": "Mynd i'r eglwys", "english": "Going to church"},
                {"welsh": "Eglwys hen", "english": "Old church"},
                {"welsh": "Cloch yr eglwys", "english": "Church bell"}
            ]
        },
        {
            "welsh": "Ysbyty",
            "english": "Hospital",
            "pronunciation": "UH-sbit-ee",
            "difficulty": "Intermediate",
            "category": "Places",
            "examples": [
                {"welsh": "Mynd i'r ysbyty", "english": "Going to the hospital"},
                {"welsh": "Gweithio yn yr ysbyty", "english": "Working in the hospital"},
                {"welsh": "Ysbyty newydd", "english": "New hospital"}
            ]
        },
        {
            "welsh": "Swyddfa",
            "english": "Office",
            "pronunciation": "SOOTH-vah",
            "difficulty": "Intermediate",
            "category": "Places",
            "examples": [
                {"welsh": "Yn y swyddfa", "english": "In the office"},
                {"welsh": "Swyddfa'r post", "english": "Post office"},
                {"welsh": "Gweithio yn y swyddfa", "english": "Working in the office"}
            ]
        },

        # FOOD & DRINK (15 cards)
        {
            "welsh": "Bwyd",
            "english": "Food",
            "pronunciation": "boo-id",
            "difficulty": "Beginner",
            "category": "Food & Drink",
            "examples": [
                {"welsh": "Bwyd da", "english": "Good food"},
                {"welsh": "Bwyd Cymreig", "english": "Welsh food"},
                {"welsh": "Coginio bwyd", "english": "Cooking food"}
            ]
        },
        {
            "welsh": "Dŵr",
            "english": "Water",
            "pronunciation": "door",
            "difficulty": "Beginner",
            "category": "Food & Drink",
            "examples": [
                {"welsh": "Yfed dŵr", "english": "Drinking water"},
                {"welsh": "Dŵr oer", "english": "Cold water"},
                {"welsh": "Dŵr cynnes", "english": "Warm water"}
            ]
        },
        {
            "welsh": "Te",
            "english": "Tea",
            "pronunciation": "teh",
            "difficulty": "Beginner",
            "category": "Food & Drink",
            "examples": [
                {"welsh": "Cwpan o de", "english": "Cup of tea"},
                {"welsh": "Te poeth", "english": "Hot tea"},
                {"welsh": "Yfed te", "english": "Drinking tea"}
            ]
        },
        {
            "welsh": "Coffi",
            "english": "Coffee",
            "pronunciation": "KOF-fee",
            "difficulty": "Beginner",
            "category": "Food & Drink",
            "examples": [
                {"welsh": "Cwpan o goffi", "english": "Cup of coffee"},
                {"welsh": "Coffi du", "english": "Black coffee"},
                {"welsh": "Yfed coffi", "english": "Drinking coffee"}
            ]
        },
        {
            "welsh": "Bara",
            "english": "Bread",
            "pronunciation": "BAH-rah",
            "difficulty": "Beginner",
            "category": "Food & Drink",
            "examples": [
                {"welsh": "Bara ffres", "english": "Fresh bread"},
                {"welsh": "Torth o fara", "english": "Loaf of bread"},
                {"welsh": "Bwyta bara", "english": "Eating bread"}
            ]
        },
        {
            "welsh": "Llaeth",
            "english": "Milk",
            "pronunciation": "HLAH-eth",
            "difficulty": "Beginner",
            "category": "Food & Drink",
            "examples": [
                {"welsh": "Gwydr o laeth", "english": "Glass of milk"},
                {"welsh": "Llaeth ffres", "english": "Fresh milk"},
                {"welsh": "Yfed llaeth", "english": "Drinking milk"}
            ]
        },
        {
            "welsh": "Caws",
            "english": "Cheese",
            "pronunciation": "kows",
            "difficulty": "Beginner",
            "category": "Food & Drink",
            "examples": [
                {"welsh": "Caws Cymreig", "english": "Welsh cheese"},
                {"welsh": "Brechdan gaws", "english": "Cheese sandwich"},
                {"welsh": "Darn o gaws", "english": "Piece of cheese"}
            ]
        },
        {
            "welsh": "Cig",
            "english": "Meat",
            "pronunciation": "keeg",
            "difficulty": "Beginner",
            "category": "Food & Drink",
            "examples": [
                {"welsh": "Cig oen", "english": "Lamb meat"},
                {"welsh": "Cig eidion", "english": "Beef"},
                {"welsh": "Coginio cig", "english": "Cooking meat"}
            ]
        },

        # WEATHER (10 cards)
        {
            "welsh": "Tywydd",
            "english": "Weather",
            "pronunciation": "TUH-with",
            "difficulty": "Beginner",
            "category": "Weather",
            "examples": [
                {"welsh": "Tywydd braf", "english": "Nice weather"},
                {"welsh": "Tywydd gwael", "english": "Bad weather"},
                {"welsh": "Sut mae'r tywydd?", "english": "How's the weather?"}
            ]
        },
        {
            "welsh": "Haul",
            "english": "Sun",
            "pronunciation": "hile",
            "difficulty": "Beginner",
            "category": "Weather",
            "examples": [
                {"welsh": "Mae'r haul yn tywynnu", "english": "The sun is shining"},
                {"welsh": "Haul poeth", "english": "Hot sun"},
                {"welsh": "Golau'r haul", "english": "Sunlight"}
            ]
        },
        {
            "welsh": "Glaw",
            "english": "Rain",
            "pronunciation": "glow",
            "difficulty": "Beginner",
            "category": "Weather",
            "examples": [
                {"welsh": "Mae hi'n bwrw glaw", "english": "It's raining"},
                {"welsh": "Glaw trwm", "english": "Heavy rain"},
                {"welsh": "Diferion glaw", "english": "Raindrops"}
            ]
        },
        {
            "welsh": "Eira",
            "english": "Snow",
            "pronunciation": "AY-rah",
            "difficulty": "Beginner",
            "category": "Weather",
            "examples": [
                {"welsh": "Mae hi'n bwrw eira", "english": "It's snowing"},
                {"welsh": "Eira gwyn", "english": "White snow"},
                {"welsh": "Pelen eira", "english": "Snowball"}
            ]
        },
        {
            "welsh": "Gwynt",
            "english": "Wind",
            "pronunciation": "gwint",
            "difficulty": "Beginner",
            "category": "Weather",
            "examples": [
                {"welsh": "Gwynt cryf", "english": "Strong wind"},
                {"welsh": "Mae'r gwynt yn chwythu", "english": "The wind is blowing"},
                {"welsh": "Sŵn y gwynt", "english": "Sound of the wind"}
            ]
        },

        # ANIMALS (12 cards)
        {
            "welsh": "Ci",
            "english": "Dog",
            "pronunciation": "kee",
            "difficulty": "Beginner",
            "category": "Animals",
            "examples": [
                {"welsh": "Ci bach", "english": "Small dog"},
                {"welsh": "Ci da", "english": "Good dog"},
                {"welsh": "Mynd â'r ci am dro", "english": "Taking the dog for a walk"}
            ]
        },
        {
            "welsh": "Cath",
            "english": "Cat",
            "pronunciation": "kath",
            "difficulty": "Beginner",
            "category": "Animals",
            "examples": [
                {"welsh": "Cath ddu", "english": "Black cat"},
                {"welsh": "Cath fach", "english": "Small cat"},
                {"welsh": "Mae'r gath yn cysgu", "english": "The cat is sleeping"}
            ]
        },
        {
            "welsh": "Ceffyl",
            "english": "Horse",
            "pronunciation": "KEF-il",
            "difficulty": "Beginner",
            "category": "Animals",
            "examples": [
                {"welsh": "Ceffyl gwyn", "english": "White horse"},
                {"welsh": "Marchogaeth ceffyl", "english": "Riding a horse"},
                {"welsh": "Ceffyl cyflym", "english": "Fast horse"}
            ]
        },
        {
            "welsh": "Dafad",
            "english": "Sheep",
            "pronunciation": "DAH-vad",
            "difficulty": "Beginner",
            "category": "Animals",
            "examples": [
                {"welsh": "Dafad wen", "english": "White sheep"},
                {"welsh": "Praidd o ddefaid", "english": "Flock of sheep"},
                {"welsh": "Gwlân y ddafad", "english": "Sheep's wool"}
            ]
        },
        {
            "welsh": "Buwch",
            "english": "Cow",
            "pronunciation": "boo-okh",
            "difficulty": "Beginner",
            "category": "Animals",
            "examples": [
                {"welsh": "Buwch ddu a gwyn", "english": "Black and white cow"},
                {"welsh": "Llaeth y fuwch", "english": "Cow's milk"},
                {"welsh": "Buwch yn y cae", "english": "Cow in the field"}
            ]
        },
        {
            "welsh": "Aderyn",
            "english": "Bird",
            "pronunciation": "ah-DER-in",
            "difficulty": "Beginner",
            "category": "Animals",
            "examples": [
                {"welsh": "Aderyn bach", "english": "Small bird"},
                {"welsh": "Aderyn yn hedfan", "english": "Bird flying"},
                {"welsh": "Cân yr aderyn", "english": "Bird's song"}
            ]
        },

        # BODY PARTS (10 cards)
        {
            "welsh": "Pen",
            "english": "Head",
            "pronunciation": "pen",
            "difficulty": "Beginner",
            "category": "Body Parts",
            "examples": [
                {"welsh": "Pen mawr", "english": "Big head"},
                {"welsh": "Pen tost", "english": "Headache"},
                {"welsh": "Ar ben y mynydd", "english": "On top of the mountain"}
            ]
        },
        {
            "welsh": "Llygaid",
            "english": "Eyes",
            "pronunciation": "HLUH-gide",
            "difficulty": "Beginner",
            "category": "Body Parts",
            "examples": [
                {"welsh": "Llygaid glas", "english": "Blue eyes"},
                {"welsh": "Cau'r llygaid", "english": "Close the eyes"},
                {"welsh": "Llygaid prydferth", "english": "Beautiful eyes"}
            ]
        },
        {
            "welsh": "Trwyn",
            "english": "Nose",
            "pronunciation": "troo-in",
            "difficulty": "Beginner",
            "category": "Body Parts",
            "examples": [
                {"welsh": "Trwyn hir", "english": "Long nose"},
                {"welsh": "Arogli gyda'r trwyn", "english": "Smelling with the nose"},
                {"welsh": "Trwyn coch", "english": "Red nose"}
            ]
        },
        {
            "welsh": "Ceg",
            "english": "Mouth",
            "pronunciation": "keg",
            "difficulty": "Beginner",
            "category": "Body Parts",
            "examples": [
                {"welsh": "Agor y geg", "english": "Open the mouth"},
                {"welsh": "Bwyd yn y geg", "english": "Food in the mouth"},
                {"welsh": "Gwenu gyda'r geg", "english": "Smiling with the mouth"}
            ]
        },
        {
            "welsh": "Llaw",
            "english": "Hand",
            "pronunciation": "hlow",
            "difficulty": "Beginner",
            "category": "Body Parts",
            "examples": [
                {"welsh": "Llaw dde", "english": "Right hand"},
                {"welsh": "Llaw chwith", "english": "Left hand"},
                {"welsh": "Ysgwyd llaw", "english": "Shake hands"}
            ]
        },

        # TIME (8 cards)
        {
            "welsh": "Amser",
            "english": "Time",
            "pronunciation": "AM-ser",
            "difficulty": "Beginner",
            "category": "Time",
            "examples": [
                {"welsh": "Beth yw'r amser?", "english": "What time is it?"},
                {"welsh": "Amser cinio", "english": "Lunch time"},
                {"welsh": "Dim amser", "english": "No time"}
            ]
        },
        {
            "welsh": "Heddiw",
            "english": "Today",
            "pronunciation": "HETH-iw",
            "difficulty": "Beginner",
            "category": "Time",
            "examples": [
                {"welsh": "Heddiw mae hi'n braf", "english": "Today it's nice"},
                {"welsh": "Beth sy'n digwydd heddiw?", "english": "What's happening today?"},
                {"welsh": "Heddiw yw'r diwrnod", "english": "Today is the day"}
            ]
        },
        {
            "welsh": "Ddoe",
            "english": "Yesterday",
            "pronunciation": "THOY",
            "difficulty": "Beginner",
            "category": "Time",
            "examples": [
                {"welsh": "Ddoe roeddwn i'n gweithio", "english": "Yesterday I was working"},
                {"welsh": "Beth wnaethoch chi ddoe?", "english": "What did you do yesterday?"},
                {"welsh": "Ddoe oedd hi'n bwrw glaw", "english": "Yesterday it was raining"}
            ]
        },
        {
            "welsh": "Yfory",
            "english": "Tomorrow",
            "pronunciation": "UH-vor-ee",
            "difficulty": "Beginner",
            "category": "Time",
            "examples": [
                {"welsh": "Yfory bydda i'n mynd", "english": "Tomorrow I will go"},
                {"welsh": "Beth wnewch chi yfory?", "english": "What will you do tomorrow?"},
                {"welsh": "Gwela i chi yfory", "english": "I'll see you tomorrow"}
            ]
        }
    ]
    
    # Add vocabulary to Firestore
    collection_ref = db.collection('public_vocabulary')
    
    added_count = 0
    for vocab in vocabulary_data:
        try:
            # Add the admin user ID and creation timestamp
            vocab_doc = {
                **vocab,
                'createdAt': datetime.now(),
                'createdBy': ADMIN_USER_ID
            }
            
            # Add to Firestore
            doc_ref = collection_ref.add(vocab_doc)
            added_count += 1
            print(f"✅ Added: {vocab['welsh']} ({vocab['english']}) - {vocab['category']}")
            
        except Exception as e:
            print(f"❌ Error adding {vocab['welsh']}: {str(e)}")
    
    print(f"\n🎉 Successfully added {added_count} vocabulary cards to the database!")
    
    # Print summary by category
    categories = {}
    for vocab in vocabulary_data:
        category = vocab['category']
        if category not in categories:
            categories[category] = 0
        categories[category] += 1
    
    print("\n📊 Summary by category:")
    for category, count in sorted(categories.items()):
        print(f"   {category}: {count} cards")
    
    print(f"\n🏴󠁧󠁢󠁷󠁬󠁳󠁿 Database seeding complete! Total: {added_count} cards across {len(categories)} categories")

if __name__ == '__main__':
    seed_public_vocabulary()
