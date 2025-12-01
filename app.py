from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
import json
import re

app = Flask(__name__)
CORS(app)

try:
    genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
except KeyError:
    print("WARNING: GOOGLE_API_KEY environment variable not found.")
    GOOGLE_API_KEY = "your_google_api_key_here" # Fallback
    genai.configure(api_key=GOOGLE_API_KEY)

model = genai.GenerativeModel('gemini-flash-latest')
vision_model = genai.GenerativeModel('gemini-pro-vision') # For doubts

# (The parse_quiz_response function is the same, no changes needed)
def parse_quiz_response(text_response):
    questions = []
    question_blocks = re.findall(r'(^##\s*(?:Question|प्रश्न)\s*\d+:\s*.*?)(?=\n^##\s*(?:Question|प्रश्न)|\Z)', text_response, re.DOTALL | re.MULTILINE | re.IGNORECASE)
    if not question_blocks:
        question_blocks = re.findall(r'((?:Question|प्रश्न)\s*\d+:.*?)(?=(?:Question|प्रश्न)\s*\d+:|\Z)', text_response, re.DOTALL | re.IGNORECASE)
    for block in question_blocks:
        block_clean = block.strip()
        block_clean = re.sub(r'^##\s*(?:Question|प्रश्न)\s*\d+:\s*', '', block_clean, flags=re.IGNORECASE | re.MULTILINE)
        question_match = re.search(r'^(.*?)(?=\n\s*(?:Options|विकल्प):)', block_clean, re.DOTALL | re.IGNORECASE)
        options_match = re.search(r'(?:Options|विकल्प):\n(.*?)(?=\n\s*(?:Correct Answer|सही उत्तर):)', block_clean, re.DOTALL | re.IGNORECASE)
        correct_answer_match = re.search(r'(?:Correct Answer|सही उत्तर):\s*(.*?)(?=\n\s*(?:Solution|समाधान):|\Z)', block_clean, re.DOTALL | re.IGNORECASE)
        solution_match = re.search(r'(?:Solution|समाधान):\s*(.*)', block_clean, re.DOTALL | re.IGNORECASE)
        if question_match and options_match and correct_answer_match and solution_match:
            question_text, options_text, correct_answer, solution = (m.group(1).strip() for m in [question_match, options_match, correct_answer_match, solution_match])
            options_list = [re.sub(r'^[A-Dअ-द]\.\s*', '', opt, flags=re.IGNORECASE).strip() for opt in options_text.split('\n') if opt.strip()]
            cleaned_correct_answer = re.sub(r'^[A-Dअ-द]\.\s*', '', correct_answer, flags=re.IGNORECASE).strip()
            questions.append({"id": len(questions) + 1, "question": question_text, "options": options_list, "correctAnswer": cleaned_correct_answer, "solution": solution})
    return questions

@app.route('/generate_quiz', methods=['POST'])
def generate_quiz():
    data = request.json
    # ... (This function remains largely the same)
    subject = data.get('subject')
    chapter = data.get('chapter')
    limit = data.get('limit', 10)
    language = data.get('language', 'english')
    style_prompt = data.get('style_prompt', '')
    
    style_instructions = f"Apply this style: '{style_prompt}'." if style_prompt else ""
    lang_instructions = "Generate in HINDI." if language == 'hindi' else ""
    
    prompt = f"Generate {limit} NEET level MCQs for {subject} on '{chapter}'. {lang_instructions} {style_instructions}. Format: ## Question 1: [Text] Options: A. [Text]... Correct Answer: [Text] Solution: [Text]"
    
    try:
        response = model.generate_content(prompt)
        questions = parse_quiz_response(response.text)
        return jsonify({"questions": questions})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- NEW ENDPOINT FOR VIP DOUBTS ---
@app.route('/resolve_doubt', methods=['POST'])
def resolve_doubt():
    data = request.json
    user_query = data.get('prompt')
    if not user_query:
        return jsonify({"error": "No prompt provided"}), 400
    
    prompt = f"You are a top-tier NEET tutor. A student has asked the following question. Provide a clear, step-by-step explanation suitable for a medical aspirant. Question: '{user_query}'"

    try:
        # Using the text-only model for now for simplicity
        response = model.generate_content(prompt)
        return jsonify({"response": response.text})
    except Exception as e:
        print(f"Error resolving doubt: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/analyze_results', methods=['POST'])
def analyze_results():
    # ... (This function remains the same)
    data = request.json
    quiz = data.get('quiz', [])
    user_answers = data.get('userAnswers', [])
    correct_count = sum(1 for i, ans in enumerate(user_answers) if ans and ans.get('selectedAnswer') == quiz[i]['correctAnswer'])
    # Simplified analysis for stability
    return jsonify({"score": correct_count, "overallFeedback": "Keep practicing to improve your score!"})


if __name__ == '__main__':
    app.run(debug=True, port=5000)
