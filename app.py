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
    
    # Handle both new (list) and old (string) formats for robustness
    chapters = data.get('chapters')
    if not chapters:
        # Fallback for old frontend sending 'chapter' string
        chapters = [data.get('chapter', 'General')]
    elif isinstance(chapters, str):
        chapters = [chapters]
        
    topics = data.get('topics', [])
    limit = data.get('limit', 10)
    lang = data.get('language', 'en')
    prompt_custom = data.get('custom_prompt', '')

    lang_txt = "HINDI (Devanagari script)" if lang == 'hi' else "ENGLISH"
    
    # Create strings for prompt
    chapter_str = ", ".join(chapters)
    topic_str = ", ".join(topics) if topics else "General Topics"
    
    prompt = f"""
    Act as a strict NEET Exam Examiner. Create {limit} multiple-choice questions (MCQs).
    Subject: {subject}
    Chapters Involved: {chapter_str}
    Specific Focus Topics: {topic_str}
    Language: {lang_txt}
    Extra Instructions: {prompt_custom}
    
    Requirements:
    1. Strictly follow NCERT syllabus.
    2. Difficulty should match NEET UG level.
    3. Return ONLY a raw JSON array. No markdown formatting.
    
    JSON Schema:
    [
      {{
        "text": "Question stem",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswerIndex": 0, (Integer 0-3)
        "explanation": "Short reasoning based on NCERT."
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
        print(f"Error generating quiz: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/resolve_doubt', methods=['POST'])
def resolve_doubt():
    data = request.json
    query = data.get('query')
    lang = data.get('language', 'en')
    
    if not query:
        return jsonify({"answer": "Please ask a question."})

    lang_instruction = "Answer in Hindi." if lang == 'hi' else "Answer in English."
    
    prompt = f"""
    You are an expert NEET Tutor (Physics, Chemistry, Biology). 
    A student has asked: "{query}"
    
    Provide a clear, concise explanation based on NCERT concepts. 
    Use formulas if physics/chemistry. 
    {lang_instruction}
    """
    
    try:
        response = model.generate_content(prompt)
        return jsonify({"answer": response.text})
    except Exception as e:
        print(f"Error resolving doubt: {e}")
        return jsonify({"answer": "Sorry, I am unable to connect right now."}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
