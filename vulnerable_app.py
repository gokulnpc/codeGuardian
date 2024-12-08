from flask import Flask, request
import sqlite3
import os

app = Flask(__name__)

def get_db():
    return sqlite3.connect('users.db')

@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']
    query = f"SELECT * FROM users WHERE username='{username}' AND password='{password}'"
    
    db = get_db()
    result = db.execute(query).fetchone()
    
    if result:
        return "Login successful"
    return "Login failed"

@app.route('/upload', methods=['POST'])
def upload_file():
    filename = request.files['file'].filename
    file_path = f"uploads/{filename}"
    
    os.system(f"mv {request.files['file'].filename} {file_path}")
    
    return "File uploaded successfully"

@app.route('/profile')
def profile():
    name = request.args.get('name', '')
    return f"<h1>Welcome, {name}!</h1>"

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')