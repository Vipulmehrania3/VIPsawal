from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
import re
import json
import base64
import io
from PIL import Image

app = Flask(__name__)
CORS(app)

# --- AI Configuration ---
try:
    genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
except KeyError:
    print("WARNING: GOOGLE_API_KEY env var not found. Using hardcoded key for local testing.")
    GOOGLE_API_KEY = "AIzaSyAbDRav7Kj6yRVBEJMFaUPz_SbKDe6weoM" # Your provided API key
    genai.configure(api_key=GOOGLE_API_KEY)

# Use a multimodal model that can handle both text and images
vision_model = genai.GenerativeModel('gemini-1.5-flash-latest') 

# --- (The parse_quiz_response function is the same, no changes needed) ---
def parse_quiz_response(text_response):
    questions = []
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
    chapters = data.get('chapter')
    limit = data.get('limit', 10)
    style_prompt = data.get('style_prompt', '')
    
    style_instructions = f"IMPORTANT STYLE REQUIREMENT: {style_prompt}" if style_prompt else ""
    math_format_instructions = "For math, use simple formats: M_1 for subscripts, x^2 for superscripts, and \\text{kg} for units. Do not use '$' symbols."

    prompt = f"""
    Generate {limit} high-quality, NEET-level multiple-choice questions on "{chapters}" in {subject}.
    {math_format_instructions}
    {style_instructions}
    Format each question strictly like this:
    ## Question 1: [Question text]
    Options:
    A. [Option A]
    B. [Option B]
    C. [Option C]
    D. [Option D]
    Correct Answer: [Full text of the correct option]
    Solution: [NCERT-based explanation]
    """

    try:
        # Use the same model for consistency, as flash is multimodal
        response = vision_model.generate_content(prompt)
        questions = parse_quiz_response(response.text)
        if not questions:
            return jsonify({"error": "AI failed to generate valid questions. Please refine your prompt."}), 500
        return jsonify({"questions": questions})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/solve_doubt', methods=['POST'])
def solve_doubt():
    data = request.json
    text_prompt = data.get('prompt')
    image_base64 = data.get('image_base64')

    if not text_prompt and not image_base64:
        return jsonify({"error": "Please provide a question or an image."}), 400
    
    # Construct the prompt for the AI
    prompt_parts = ["As an expert NEET tutor, solve the following doubt based on NCERT concepts. Explain the solution clearly and concisely. If there is an image, analyze it as part of the question."]
    
    if text_prompt:
        prompt_parts.append(f"\nUser's question: {text_prompt}")

    try:
        if image_base64:
            # Decode the image and prepare it for the AI
            image_data = base64.b64decode(image_base64)
            img = Image.open(io.BytesIO(image_data))
            
            # Gemini needs the mime type
            image_format = img.format or 'JPEG' # Default to JPEG if format is not detected
            mime_type = f'image/{image_format.lower()}'
            
            image_part = {
                "mime_type": mime_type,
                "data": image_data
            }
            prompt_parts.append(image_part)

        # Send the request to the multimodal AI
        response = vision_model.generate_content(prompt_parts)
        return jsonify({"solution": response.text})

    except Exception as e:
        print(f"Error solving doubt: {e}")
        return jsonify({"error": f"Failed to get solution from AI: {str(e)}"}), 500


# --- (The /analyze_results endpoint is the same, no changes needed) ---
@app.route('/analyze_results', methods=['POST'])
def analyze_results():
    data = request.json
    quiz = data.get('quiz', [])
    user_answers = data.get('userAnswers', [])
    score = sum(1 for i, answer in enumerate(user_answers) if answer and answer.get('selectedAnswer') == quiz[i]['correctAnswer'])
    return jsonify({"score": score})


if __name__ == '__main__':
    app.run(debug=True, port=5000)
