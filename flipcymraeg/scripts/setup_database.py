import sqlite3
import json
from datetime import datetime

def setup_welsh_learning_database():
    """Set up the Welsh learning database with sample data"""
    
    print("Setting up Welsh Learning Database...")
    
    # Connect to database
    conn = sqlite3.connect('welsh_learning.db')
    cursor = conn.cursor()
    
    # Drop existing tables if they exist
    cursor.execute('DROP TABLE IF EXISTS user_progress')
    cursor.execute('DROP TABLE IF EXISTS lessons')
    cursor.execute('DROP TABLE IF EXISTS vocabulary')
    
    # Create vocabulary table
    cursor.execute('''
        CREATE TABLE vocabulary (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            welsh TEXT NOT NULL,
            english TEXT NOT NULL,
            pronunciation TEXT NOT NULL,
            difficulty TEXT DEFAULT 'Beginner',
            category TEXT DEFAULT 'General',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create lessons table
    cursor.execute('''
        CREATE TABLE lessons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            difficulty TEXT NOT NULL,
            duration TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create user progress table
    cursor.execute('''
        CREATE TABLE user_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            lesson_id INTEGER NOT NULL,
            completed BOOLEAN DEFAULT FALSE,
            score INTEGER DEFAULT 0,
            completed_at TIMESTAMP,
            FOREIGN KEY (lesson_id) REFERENCES lessons (id)
        )
    ''')
    
    # Insert comprehensive vocabulary data
    vocabulary_data = [
        # Greetings
        ('Bore da', 'Good morning', 'BOH-reh dah', 'Beginner', 'Greetings'),
        ('Prynhawn da', 'Good afternoon', 'PRIN-hown dah', 'Beginner', 'Greetings'),
        ('Nos da', 'Good night', 'nohs dah', 'Beginner', 'Greetings'),
        ('Helo', 'Hello', 'HEH-lo', 'Beginner', 'Greetings'),
        ('Sut mae?', 'How are you?', 'seet my', 'Beginner', 'Greetings'),
        ('Hwyl fawr', 'Goodbye', 'HOO-il vowr', 'Beginner', 'Greetings'),
        
        # Politeness
        ('Diolch', 'Thank you', 'DEE-olkh', 'Beginner', 'Politeness'),
        ('Diolch yn fawr', 'Thank you very much', 'DEE-olkh un vowr', 'Beginner', 'Politeness'),
        ('Croeso', 'Welcome/You\'re welcome', 'KROY-so', 'Beginner', 'Politeness'),
        ('Mae\'n ddrwg gen i', 'I\'m sorry', 'mine throg gen ee', 'Intermediate', 'Politeness'),
        ('Esgusodwch fi', 'Excuse me', 'es-GEE-soh-dooch vee', 'Intermediate', 'Politeness'),
        
        # Numbers
        ('Un', 'One', 'een', 'Beginner', 'Numbers'),
        ('Dau', 'Two', 'die', 'Beginner', 'Numbers'),
        ('Tri', 'Three', 'tree', 'Beginner', 'Numbers'),
        ('Pedwar', 'Four', 'PED-war', 'Beginner', 'Numbers'),
        ('Pump', 'Five', 'pimp', 'Beginner', 'Numbers'),
        ('Chwech', 'Six', 'khoo-ekh', 'Beginner', 'Numbers'),
        ('Saith', 'Seven', 'sythe', 'Beginner', 'Numbers'),
        ('Wyth', 'Eight', 'ooith', 'Beginner', 'Numbers'),
        ('Naw', 'Nine', 'now', 'Beginner', 'Numbers'),
        ('Deg', 'Ten', 'deeg', 'Beginner', 'Numbers'),
        
        # Family
        ('Teulu', 'Family', 'TIE-lee', 'Beginner', 'Family'),
        ('Mam', 'Mother', 'mam', 'Beginner', 'Family'),
        ('Tad', 'Father', 'tad', 'Beginner', 'Family'),
        ('Brawd', 'Brother', 'browd', 'Beginner', 'Family'),
        ('Chwaer', 'Sister', 'khwy-er', 'Beginner', 'Family'),
        ('Plant', 'Children', 'plant', 'Beginner', 'Family'),
        ('Cariad', 'Love/Darling', 'KAH-ree-ad', 'Intermediate', 'Family'),
        
        # Places
        ('Cymru', 'Wales', 'KUM-ree', 'Beginner', 'Places'),
        ('Lloegr', 'England', 'HLOY-gr', 'Beginner', 'Places'),
        ('Ysgol', 'School', 'UH-sgol', 'Beginner', 'Places'),
        ('Tŷ', 'House', 'tee', 'Beginner', 'Places'),
        ('Dref', 'Town', 'drev', 'Beginner', 'Places'),
        ('Parc', 'Park', 'park', 'Beginner', 'Places'),
        ('Siop', 'Shop', 'shop', 'Beginner', 'Places'),
        
        # Colors
        ('Coch', 'Red', 'kokh', 'Beginner', 'Colors'),
        ('Glas', 'Blue', 'glas', 'Beginner', 'Colors'),
        ('Gwyrdd', 'Green', 'goo-eerth', 'Beginner', 'Colors'),
        ('Melyn', 'Yellow', 'MEH-lin', 'Beginner', 'Colors'),
        ('Du', 'Black', 'dee', 'Beginner', 'Colors'),
        ('Gwyn', 'White', 'gwin', 'Beginner', 'Colors'),
    ]
    
    cursor.executemany('''
        INSERT INTO vocabulary (welsh, english, pronunciation, difficulty, category)
        VALUES (?, ?, ?, ?, ?)
    ''', vocabulary_data)
    
    # Insert lesson data
    lessons_data = [
        (
            'Basic Greetings',
            'Learn essential Welsh greetings and polite expressions',
            'Beginner',
            '10 min',
            json.dumps({
                'phrases': [
                    {'welsh': 'Bore da', 'english': 'Good morning', 'pronunciation': 'BOH-reh dah'},
                    {'welsh': 'Prynhawn da', 'english': 'Good afternoon', 'pronunciation': 'PRIN-hown dah'},
                    {'welsh': 'Nos da', 'english': 'Good night', 'pronunciation': 'nohs dah'},
                    {'welsh': 'Helo', 'english': 'Hello', 'pronunciation': 'HEH-lo'},
                    {'welsh': 'Hwyl fawr', 'english': 'Goodbye', 'pronunciation': 'HOO-il vowr'}
                ],
                'grammar': 'Welsh greetings change based on the time of day. "Da" means "good" and is used in most greetings. "Hwyl" literally means "fun" but is used as goodbye.'
            })
        ),
        (
            'Introducing Yourself',
            'Learn how to say your name and where you\'re from',
            'Beginner',
            '15 min',
            json.dumps({
                'phrases': [
                    {'welsh': 'Fy enw i yw...', 'english': 'My name is...', 'pronunciation': 'vuh EN-oo ee yoo'},
                    {'welsh': 'Dw i\'n dod o...', 'english': 'I come from...', 'pronunciation': 'doo een dohd oh'},
                    {'welsh': 'Dw i\'n byw yn...', 'english': 'I live in...', 'pronunciation': 'doo een bioo un'},
                    {'welsh': 'Sut mae?', 'english': 'How are you?', 'pronunciation': 'seet my'},
                    {'welsh': 'Iawn, diolch', 'english': 'Fine, thank you', 'pronunciation': 'yown, DEE-olkh'}
                ],
                'grammar': 'In Welsh, "Dw i" means "I am" and is used frequently. The word order is often different from English - the verb usually comes first.'
            })
        ),
        (
            'Numbers 1-10',
            'Master the first ten numbers in Welsh',
            'Beginner',
            '12 min',
            json.dumps({
                'phrases': [
                    {'welsh': 'Un', 'english': 'One', 'pronunciation': 'een'},
                    {'welsh': 'Dau', 'english': 'Two', 'pronunciation': 'die'},
                    {'welsh': 'Tri', 'english': 'Three', 'pronunciation': 'tree'},
                    {'welsh': 'Pedwar', 'english': 'Four', 'pronunciation': 'PED-war'},
                    {'welsh': 'Pump', 'english': 'Five', 'pronunciation': 'pimp'},
                    {'welsh': 'Chwech', 'english': 'Six', 'pronunciation': 'khoo-ekh'},
                    {'welsh': 'Saith', 'english': 'Seven', 'pronunciation': 'sythe'},
                    {'welsh': 'Wyth', 'english': 'Eight', 'pronunciation': 'ooith'},
                    {'welsh': 'Naw', 'english': 'Nine', 'pronunciation': 'now'},
                    {'welsh': 'Deg', 'english': 'Ten', 'pronunciation': 'deeg'}
                ],
                'grammar': 'Welsh numbers have different forms depending on what they\'re counting. These are the basic cardinal numbers. "Dau" becomes "dwy" when counting feminine nouns.'
            })
        ),
        (
            'Family Members',
            'Learn words for family relationships',
            'Intermediate',
            '18 min',
            json.dumps({
                'phrases': [
                    {'welsh': 'Teulu', 'english': 'Family', 'pronunciation': 'TIE-lee'},
                    {'welsh': 'Mam', 'english': 'Mother', 'pronunciation': 'mam'},
                    {'welsh': 'Tad', 'english': 'Father', 'pronunciation': 'tad'},
                    {'welsh': 'Brawd', 'english': 'Brother', 'pronunciation': 'browd'},
                    {'welsh': 'Chwaer', 'english': 'Sister', 'pronunciation': 'khwy-er'},
                    {'welsh': 'Plant', 'english': 'Children', 'pronunciation': 'plant'}
                ],
                'grammar': 'Family terms in Welsh often undergo mutations. "Brawd" (brother) becomes "frawd" after "fy" (my). The "ch" sound is like the Scottish "loch".'
            })
        ),
        (
            'Colors and Descriptions',
            'Learn basic colors and how to describe things',
            'Intermediate',
            '20 min',
            json.dumps({
                'phrases': [
                    {'welsh': 'Coch', 'english': 'Red', 'pronunciation': 'kokh'},
                    {'welsh': 'Glas', 'english': 'Blue', 'pronunciation': 'glas'},
                    {'welsh': 'Gwyrdd', 'english': 'Green', 'pronunciation': 'goo-eerth'},
                    {'welsh': 'Melyn', 'english': 'Yellow', 'pronunciation': 'MEH-lin'},
                    {'welsh': 'Du', 'english': 'Black', 'pronunciation': 'dee'},
                    {'welsh': 'Gwyn', 'english': 'White', 'pronunciation': 'gwin'}
                ],
                'grammar': 'Adjectives in Welsh usually come after the noun they describe. Colors can change form through mutation: "car coch" (red car) but "y gar goch" (the red car).'
            })
        )
    ]
    
    cursor.executemany('''
        INSERT INTO lessons (title, description, difficulty, duration, content)
        VALUES (?, ?, ?, ?, ?)
    ''', lessons_data)
    
    # Commit changes and close connection
    conn.commit()
    conn.close()
    
    print("✅ Database setup complete!")
    print(f"✅ Added {len(vocabulary_data)} vocabulary items")
    print(f"✅ Added {len(lessons_data)} lessons")
    print("✅ Database ready for use")

if __name__ == '__main__':
    setup_welsh_learning_database()
