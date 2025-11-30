from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
import re
import json

app = Flask(__name__)
CORS(app)

# --- AI Configuration ---
try:
    genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
except KeyError:
    print("WARNING: GOOGLE_API_KEY env var not found. Using hardcoded key for local testing.")
    GOOGLE_API_KEY = "AIzaSyAbDRav7Kj6yRVBEJMFaUPz_SbKDe6weoM" # Your provided API key
    genai.configure(api_key=GOOGLE_API_KEY)

model = genai.GenerativeModel('gemini-1.5-flash')

# --- Helper Functions ---
def parse_quiz_response(text_response):
    questions = []
    # Robust regex to find questions
    question_blocks = re.findall(r'##\s*(?:Question|प्रश्न)\s*\d+:\s*(.*?)(?=##\s*(?:Question|प्रश्न)|$)', text_response, re.DOTALL | re.IGNORECASE)
    
    for block in question_blocks:
        # Regex to extract parts
        parts = {
            'question': re.search(r'^(.*?)(?:Options:|विकल्प:)', block, re.DOTALL | re.IGNORECASE),
            'options': re.search(r'(?:Options:|विकल्प:)(.*?)(?:Correct Answer:|सही उत्तर:)', block, re.DOTALL | re.IGNORECASE),
            'correctAnswer': re.search(r'(?:Correct Answer:|सही उत्तर:)(.*?)(?:Solution:|समाधान:)', block, re.DOTALL | re.IGNORECASE),
            'solution': re.search(r'(?:Solution:|समाधान:)(.*)', block, re.DOTALL | re.IGNORECASE)
        }
        
        if all(parts.values()):
            options_raw = parts['options'].group(1).strip().split('\n')
            options_list = [opt.strip() for opt in options_raw if opt.strip()]
            
            # Cleaning options (removing A. B. etc)
            cleaned_options = [re.sub(r'^[A-D]\.\s*', '', opt, flags=re.IGNORECASE).strip() for opt in options_list]
            cleaned_correct = re.sub(r'^[A-D]\.\s*', '', parts['correctAnswer'].group(1).strip(), flags=re.IGNORECASE).strip()
            
            # Ensure we have 4 options
            if len(cleaned_options) >= 4:
                questions.append({
                    "question": parts['question'].group(1).strip(),
                    "options": cleaned_options[:4],
                    "correctAnswer": cleaned_correct,
                    "solution": parts['solution'].group(1).strip()
                })
    return questions

# --- API Endpoints ---

@app.route('/generate_quiz', methods=['POST'])
def generate_quiz():
    data = request.json
    subject = data.get('subject')
    chapters = data.get('chapter')
    limit = data.get('limit', 10)
    style_prompt = data.get('style_prompt', '')
    language = data.get('language', 'english')
    
    style_instructions = f"Additional Style Requirements: {style_prompt}" if style_prompt else ""
    
    lang_instruction = ""
    if language == 'hindi':
        lang_instruction = "Generate the entire response in HINDI language (Devanagari script). Use Hindi terms for Question, Options, Correct Answer, and Solution."
        tags = {"q": "प्रश्न", "o": "विकल्प", "a": "सही उत्तर", "s": "समाधान"}
    else:
        tags = {"q": "Question", "o": "Options", "a": "Correct Answer", "s": "Solution"}

    prompt = f"""
    Act as an expert NEET exam setter. Generate {limit} multiple-choice questions.
    Subject: {subject}
    Chapters: {chapters}
    {lang_instruction}
    {style_instructions}
    
    IMPORTANT: Use standard LaTeX formatting for formulas (e.g., $H_2O$, $x^2$).
    
    Format each question EXACTLY like this:
    ## {tags['q']} 1: [Question Text]
    {tags['o']}:
    A. [Option A]
    B. [Option B]
    C. [Option C]
    D. [Option D]
    {tags['a']}: [Correct Option Text Only]
    {tags['s']}: [Short NCERT-based explanation]
    """

    try:
        response = model.generate_content(prompt)
        questions = parse_quiz_response(response.text)
        if not questions:
            return jsonify({"error": "AI failed to generate parseable questions.", "raw": response.text}), 500
        return jsonify({"questions": questions})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/chat_with_vipai', methods=['POST'])
def chat_with_vipai():
    data = request.json
    user_message = data.get('message')
    language = data.get('language', 'english')

    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    lang_context = "Reply in Hindi." if language == 'hindi' else "Reply in English."
    
    prompt = f"""
    You are 'vipAI', a friendly and expert AI tutor for NEET aspirants. 
    User Question: {user_message}
    
    Instructions:
    1. Provide a clear, concise answer based on NCERT concepts.
    2. Be encouraging.
    3. {lang_context}
    4. If there are formulas, use simple LaTeX (e.g., $x^2$).
    """

    try:
        response = model.generate_content(prompt)
        return jsonify({"reply": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/analyze_results', methods=['POST'])
def analyze_results():
    # Simplified endpoint just to return score, as frontend handles detailed view
    data = request.json
    quiz = data.get('quiz', [])
    user_answers = data.get('userAnswers', [])
    
    score = 0
    for i, ans in enumerate(user_answers):
        if ans and ans.get('selectedAnswer') == quiz[i]['correctAnswer']:
            score += 1
            
    return jsonify({"score": score})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
