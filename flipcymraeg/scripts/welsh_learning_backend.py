from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import sqlite3
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# Initialize database
def init_db():
    conn = sqlite3.connect('welsh_learning.db')
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS vocabulary (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            welsh TEXT NOT NULL,
            english TEXT NOT NULL,
            pronunciation TEXT NOT NULL,
            difficulty TEXT DEFAULT 'Beginner',
            category TEXT DEFAULT 'General',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS lessons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            difficulty TEXT NOT NULL,
            duration TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            lesson_id INTEGER NOT NULL,
            completed BOOLEAN DEFAULT FALSE,
            score INTEGER DEFAULT 0,
            completed_at TIMESTAMP,
            FOREIGN KEY (lesson_id) REFERENCES lessons (id)
        )
    ''')
    
    # Insert sample vocabulary
    sample_vocab = [
        ('Bore da', 'Good morning', 'BOH-reh dah', 'Beginner', 'Greetings'),
        ('Nos da', 'Good night', 'nohs dah', 'Beginner', 'Greetings'),
        ('Diolch', 'Thank you', 'DEE-olkh', 'Beginner', 'Politeness'),
        ('Croeso', 'Welcome', 'KROY-so', 'Beginner', 'Politeness'),
        ('Sut mae?', 'How are you?', 'seet my', 'Beginner', 'Greetings'),
        ('Cymru', 'Wales', 'KUM-ree', 'Beginner', 'Places'),
        ('Cariad', 'Love/Darling', 'KAH-ree-ad', 'Intermediate', 'Relationships'),
        ('Ysgol', 'School', 'UH-sgol', 'Beginner', 'Places')
    ]
    
    cursor.executemany('''
        INSERT OR IGNORE INTO vocabulary (welsh, english, pronunciation, difficulty, category)
        VALUES (?, ?, ?, ?, ?)
    ''', sample_vocab)
    
    # Insert sample lessons
    sample_lessons = [
        (
            'Basic Greetings',
            'Learn essential Welsh greetings and polite expressions',
            'Beginner',
            '10 min',
            json.dumps({
                'phrases': [
                    {'welsh': 'Bore da', 'english': 'Good morning', 'pronunciation': 'BOH-reh dah'},
                    {'welsh': 'Prynhawn da', 'english': 'Good afternoon', 'pronunciation': 'PRIN-hown dah'},
                    {'welsh': 'Nos da', 'english': 'Good night', 'pronunciation': 'nohs dah'}
                ],
                'grammar': 'Welsh greetings change based on the time of day. "Da" means "good" and is used in most greetings.'
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
                    {'welsh': 'Sut mae?', 'english': 'How are you?', 'pronunciation': 'seet my'}
                ],
                'grammar': 'In Welsh, "Dw i" means "I am" and is used frequently in introductions.'
            })
        )
    ]
    
    cursor.executemany('''
        INSERT OR IGNORE INTO lessons (title, description, difficulty, duration, content)
        VALUES (?, ?, ?, ?, ?)
    ''', sample_lessons)
    
    conn.commit()
    conn.close()

# API Routes
@app.route('/api/vocabulary', methods=['GET'])
def get_vocabulary():
    conn = sqlite3.connect('welsh_learning.db')
    cursor = conn.cursor()
    
    category = request.args.get('category')
    difficulty = request.args.get('difficulty')
    
    query = 'SELECT * FROM vocabulary WHERE 1=1'
    params = []
    
    if category:
        query += ' AND category = ?'
        params.append(category)
    
    if difficulty:
        query += ' AND difficulty = ?'
        params.append(difficulty)
    
    cursor.execute(query, params)
    vocab = cursor.fetchall()
    conn.close()
    
    vocab_list = []
    for item in vocab:
        vocab_list.append({
            'id': item[0],
            'welsh': item[1],
            'english': item[2],
            'pronunciation': item[3],
            'difficulty': item[4],
            'category': item[5],
            'created_at': item[6]
        })
    
    return jsonify(vocab_list)

@app.route('/api/vocabulary', methods=['POST'])
def add_vocabulary():
    data = request.json
    
    conn = sqlite3.connect('welsh_learning.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO vocabulary (welsh, english, pronunciation, difficulty, category)
        VALUES (?, ?, ?, ?, ?)
    ''', (
        data['welsh'],
        data['english'],
        data['pronunciation'],
        data.get('difficulty', 'Beginner'),
        data.get('category', 'General')
    ))
    
    conn.commit()
    vocab_id = cursor.lastrowid
    conn.close()
    
    return jsonify({'id': vocab_id, 'message': 'Vocabulary added successfully'})

@app.route('/api/lessons', methods=['GET'])
def get_lessons():
    conn = sqlite3.connect('welsh_learning.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM lessons ORDER BY id')
    lessons = cursor.fetchall()
    conn.close()
    
    lessons_list = []
    for lesson in lessons:
        lessons_list.append({
            'id': lesson[0],
            'title': lesson[1],
            'description': lesson[2],
            'difficulty': lesson[3],
            'duration': lesson[4],
            'content': json.loads(lesson[5]),
            'created_at': lesson[6]
        })
    
    return jsonify(lessons_list)

@app.route('/api/progress', methods=['POST'])
def update_progress():
    data = request.json
    
    conn = sqlite3.connect('welsh_learning.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT OR REPLACE INTO user_progress (user_id, lesson_id, completed, score, completed_at)
        VALUES (?, ?, ?, ?, ?)
    ''', (
        data['user_id'],
        data['lesson_id'],
        data['completed'],
        data.get('score', 0),
        datetime.now() if data['completed'] else None
    ))
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Progress updated successfully'})

@app.route('/api/progress/<user_id>', methods=['GET'])
def get_user_progress(user_id):
    conn = sqlite3.connect('welsh_learning.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT lesson_id, completed, score, completed_at
        FROM user_progress
        WHERE user_id = ?
    ''', (user_id,))
    
    progress = cursor.fetchall()
    conn.close()
    
    progress_list = []
    for item in progress:
        progress_list.append({
            'lesson_id': item[0],
            'completed': bool(item[1]),
            'score': item[2],
            'completed_at': item[3]
        })
    
    return jsonify(progress_list)

if __name__ == '__main__':
    init_db()
    print("Welsh Learning Backend Server Starting...")
    print("Database initialized with sample data")
    print("Server running on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
