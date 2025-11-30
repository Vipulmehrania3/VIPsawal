from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os

app = Flask(__name__)
CORS(app)

# --- AI Configuration ---
try:
    genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
except KeyError:
    print("WARNING: GOOGLE_API_KEY env var not found. Using hardcoded key for local testing.")
    # Fallback for local development - DO NOT USE IN PRODUCTION GITHUB
    GOOGLE_API_KEY = "AIzaSyAbDRav7Kj6yRVBEJMFaUPz_SbKDe6weoM"
    genai.configure(api_key=GOOGLE_API_KEY)

model = genai.GenerativeModel('gemini-flash-latest')
# For image doubts, you'd use a vision model
# vision_model = genai.GenerativeModel('gemini-pro-vision') 

# --- (The parse_quiz_response function is the same, no changes needed) ---
import re
def parse_quiz_response(text_response):
    questions = []
    # This regex is designed to be robust against minor formatting changes
    question_blocks = re.findall(r'##\s*(?:Question|प्रश्न)\s*\d+:\s*(.*?)(?=##\s*(?:Question|प्रश्न)|$)', text_response, re.DOTALL | re.IGNORECASE)
    for block in question_blocks:
        parts = {
            'question': re.search(r'^(.*?)(?:Options:|विकल्प:)', block, re.DOTALL | re.IGNORECASE),
            'options': re.search(r'(?:Options:|विकल्प:)(.*?)(?:Correct Answer:|सही उत्तर:)', block, re.DOTALL | re.IGNORECASE),
            'correctAnswer': re.search(r'(?:Correct Answer:|सही उत्तर:)(.*?)(?:Solution:|समाधान:)', block, re.DOTALL | re.IGNORECASE),
            'solution': re.search(r'(?:Solution:|समाधान:)(.*)', block, re.DOTALL | re.IGNORECASE)
        }
        if all(parts.values()):
            options_list = [opt.strip() for opt in parts['options'].group(1).strip().split('\n') if opt.strip()]
            cleaned_options = [re.sub(r'^[A-D]\.\s*', '', opt, flags=re.IGNORECASE).strip() for opt in options_list]
            cleaned_correct = re.sub(r'^[A-D]\.\s*', '', parts['correctAnswer'].group(1).strip(), flags=re.IGNORECASE).strip()
            
            # Match the cleaned correct answer back to one of the cleaned options
            final_correct = next((opt for opt in cleaned_options if opt == cleaned_correct), cleaned_correct)

            questions.append({
                "question": parts['question'].group(1).strip(),
                "options": cleaned_options,
                "correctAnswer": final_correct,
                "solution": parts['solution'].group(1).strip()
            })
    return questions


# --- API Endpoints ---
@app.route('/generate_quiz', methods=['POST'])
def generate_quiz():
    data = request.json
    subject = data.get('subject')
    chapters = data.get('chapter') # Now receives a string of chapters
    limit = data.get('limit', 10)
    style_prompt = data.get('style_prompt', '')
    
    style_instructions = f"IMPORTANT STYLE REQUIREMENT: {style_prompt}" if style_prompt else ""

    prompt = f"""
    Generate {limit} high-quality, NEET-level multiple-choice questions.
    The subject is {subject}. The specific chapters are: {chapters}.
    {style_instructions}
    For each question, provide 4 options (A, B, C, D), the correct answer, and a short, concise explanation based on NCERT concepts.
    Format each question strictly like this, with no extra text before or after:
    ## Question 1: [The question text, using simple LaTeX for formulas like H_2O or x^2]
    Options:
    A. [Option A]
    B. [Option B]
    C. [Option C]
    D. [Option D]
    Correct Answer: [The full text of the correct option]
    Solution: [The NCERT-based explanation]
    """

    try:
        response = model.generate_content(prompt)
        questions = parse_quiz_response(response.text)
        if not questions:
            return jsonify({"error": "AI failed to generate valid questions. Please refine your prompt."}), 500
        return jsonify({"questions": questions})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/solve_doubt', methods=['POST'])
def solve_doubt():
    # This is a conceptual endpoint. A real implementation would handle file uploads.
    data = request.json
    text_prompt = data.get('prompt')
    # image_base64 = data.get('image') # You would receive image data here

    if not text_prompt: # and not image_base64:
        return jsonify({"error": "Please provide a question."}), 400
    
    # --- This part is conceptual ---
    # if image_base64:
    #     # You would use a vision model here
    #     image_part = {"mime_type": "image/jpeg", "data": base64.b64decode(image_base64)}
    #     prompt_parts = [text_prompt, image_part]
    #     response = vision_model.generate_content(prompt_parts)
    # else:
    
    doubt_prompt = f"As an expert NEET tutor, solve the following doubt based on NCERT concepts. Explain the solution clearly and concisely. Doubt: '{text_prompt}'"
    
    try:
        response = model.generate_content(doubt_prompt)
        return jsonify({"solution": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- (The /analyze_results endpoint is the same, no changes needed) ---
@app.route('/analyze_results', methods=['POST'])
def analyze_results():
    # This function is now simplified as detailed results are built on the frontend
    data = request.json
    quiz = data.get('quiz', [])
    user_answers = data.get('userAnswers', [])
    score = sum(1 for i, answer in enumerate(user_answers) if answer and answer.get('selectedAnswer') == quiz[i]['correctAnswer'])
    return jsonify({"score": score})


if __name__ == '__main__':
    app.run(debug=True, port=5000)
