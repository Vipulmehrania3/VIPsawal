from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
import json

app = Flask(__name__)
CORS(app)

try:
    genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
except KeyError:
    print("Warning: API Key not found in env.")

model = genai.GenerativeModel('gemini-1.5-flash-latest')

@app.route('/generate_quiz', methods=['POST'])
def generate_quiz():
    data = request.json
    subject = data.get('subject')
    chapters = data.get('chapters', []) # List of strings
    topics = data.get('topics', [])     # List of strings
    limit = data.get('limit', 10)
    lang = data.get('language', 'en')
    prompt_custom = data.get('custom_prompt', '')

    lang_txt = "HINDI (Devanagari)" if lang == 'hi' else "ENGLISH"
    
    prompt = f"""
    Act as a NEET Exam expert. Create {limit} MCQs for Subject: {subject}.
    Chapters: {', '.join(chapters)}.
    Specific Topics (Focus here): {', '.join(topics)}.
    Language: {lang_txt}.
    User Instruction: {prompt_custom}
    
    Output JSON format:
    [
      {{
        "text": "Question stem",
        "options": ["A", "B", "C", "D"],
        "correctAnswerIndex": 0,
        "explanation": "Short NCERT explanation"
      }}
    ]
    """

    try:
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        return jsonify({"questions": json.loads(response.text)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/resolve_doubt', methods=['POST'])
def resolve_doubt():
    data = request.json
    query = data.get('query')
    lang = data.get('language', 'en')
    
    lang_instruction = "Answer in Hindi." if lang == 'hi' else "Answer in English."
    
    prompt = f"""
    You are a NEET Tutor. Explain this doubt simply and clearly based on NCERT:
    "{query}"
    {lang_instruction}
    """
    
    try:
        response = model.generate_content(prompt)
        return jsonify({"answer": response.text})
    except Exception as e:
        return jsonify({"answer": "Sorry, I could not process that."}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
