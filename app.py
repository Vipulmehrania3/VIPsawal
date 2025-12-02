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
    print("WARNING: GOOGLE_API_KEY environment variable not found. Using hardcoded key for local testing.")
    # Replace with your actual key
    GOOGLE_API_KEY = "AIzaSyAbDRav7Kj6yRVBEJMFaUPz_SbKDe6weoM" 
    genai.configure(api_key=GOOGLE_API_KEY)

model = genai.GenerativeModel('gemini-flash-latest')

def parse_quiz_response(text_response):
    questions = []
    # Regex to catch questions
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
            question_text = question_match.group(1).strip()
            options_text = options_match.group(1).strip()
            correct_answer = correct_answer_match.group(1).strip()
            solution = solution_match.group(1).strip()

            options_list = [opt.strip() for opt in options_text.split('\n') if opt.strip()]
            options_cleaned = []
            for opt in options_list:
                cleaned_opt = re.sub(r'^[A-Dअ-द]\.\s*', '', opt, flags=re.IGNORECASE).strip()
                if cleaned_opt:
                    options_cleaned.append(cleaned_opt)

            cleaned_correct_answer = re.sub(r'^[A-Dअ-द]\.\s*', '', correct_answer, flags=re.IGNORECASE).strip()

            questions.append({
                "id": len(questions) + 1,
                "question": question_text,
                "options": options_cleaned,
                "correctAnswer": cleaned_correct_answer,
                "solution": solution
            })
    return questions

@app.route('/generate_quiz', methods=['POST'])
def generate_quiz():
    data = request.json
    subject = data.get('subject')
    chapter = data.get('chapter')
    limit = data.get('limit', 10)
    language = data.get('language', 'english')
    style_prompt = data.get('style_prompt', '')

    if not all([subject, chapter, limit]):
        return jsonify({"error": "Missing subject, chapter, or limit"}), 400

    style_instructions = f"Constraint: {style_prompt}." if style_prompt else ""
    
    if language == 'hindi':
        lang_instructions = f"""Generate EVERYTHING in HINDI language. The topic is "{chapter}". Use Hindi tags (प्रश्न, विकल्प, सही उत्तर, समाधान)."""
        question_tag, options_tag, correct_answer_tag, solution_tag = "प्रश्न", "विकल्प", "सही उत्तर", "समाधान"
    else:
        lang_instructions = "Generate in English."
        question_tag, options_tag, correct_answer_tag, solution_tag = "Question", "Options", "Correct Answer", "Solution"

    prompt = f"""
    Act as a strict NEET Exam setter. Generate {limit} multiple-choice questions on "{chapter}" ({subject}).
    CRITICAL INSTRUCTIONS:
    1. **NO LATEX**: Write formulas in plain text (e.g., H2O, x^2).
    2. **NCERT BASED**: The solution MUST be a short, direct explanation based strictly on NCERT concepts.
    3. **FORMAT**: Follow the format below exactly.
    4. {style_instructions}
    5. {lang_instructions}

    Format Structure:
    ## {question_tag} 1: [The Question Text Here]
    {options_tag}:
    A. [Option 1]
    B. [Option 2]
    C. [Option 3]
    D. [Option 4]
    {correct_answer_tag}: [Correct Option Text Only]
    {solution_tag}: [Short NCERT explanation]

    ## {question_tag} 2: [Next Question...]
    ...
    """

    try:
        response = model.generate_content(prompt)
        questions = parse_quiz_response(response.text)
        
        if not questions:
            return jsonify({"error": "AI generation failed parsing.", "raw": response.text}), 500

        # Post-processing to match correct answer string
        for q in questions:
            for opt in q['options']:
                if opt.lower().strip() == q['correctAnswer'].lower().strip():
                    q['correctAnswer'] = opt
                    break
        
        return jsonify({"questions": questions})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/analyze_results', methods=['POST'])
def analyze_results():
    return jsonify({"success": True})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
