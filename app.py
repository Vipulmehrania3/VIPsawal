from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
import json

app = Flask(__name__)
CORS(app)

# --- Configure Google AI ---
try:
    genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
except KeyError:
    print("WARNING: Using hardcoded API key for local testing.")
    GOOGLE_API_KEY = "AIzaSy...Your_Key_Here" # Replace with your key
    genai.configure(api_key=GOOGLE_API_KEY)

# Use a fast and reliable model
model = genai.GenerativeModel('gemini-1.5-flash-latest')

# --- Main API Endpoint ---
@app.route('/generate_quiz', methods=['POST'])
def generate_quiz():
    data = request.json
    subject = data.get('subject')
    chapter = data.get('chapter') # This is now a comma-separated string of chapters
    limit = data.get('limit', 10)
    language = data.get('language', 'english')
    style_prompt = data.get('style_prompt', '')

    if not all([subject, chapter, limit]):
        return jsonify({"error": "Missing required fields"}), 400

    # --- Construct the AI Prompt ---
    lang_instruction = "All output MUST be in HINDI." if language == 'hindi' else "All output MUST be in ENGLISH."
    style_instruction = f"Apply this style constraint: '{style_prompt}'." if style_prompt else ""

    prompt = f"""
    You are an expert NEET exam creator. Generate {limit} MCQs for the subject '{subject}' focusing on these chapters: '{chapter}'.
    {lang_instruction}
    {style_instruction}
    Questions must be high-quality, conceptual, and strictly based on the NCERT syllabus.
    Provide a short, NCERT-based explanation for the correct answer.
    """

    # --- Define the JSON Schema for the AI ---
    json_schema = {
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
                "id": {"type": "string"},
                "text": {"type": "string", "description": "The question text."},
                "options": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "An array of exactly 4 option strings."
                },
                "correctAnswerIndex": {
                    "type": "integer",
                    "description": "The 0-based index (0, 1, 2, or 3) of the correct option in the options array."
                },
                "explanation": {"type": "string", "description": "A brief explanation."}
            },
            "required": ["text", "options", "correctAnswerIndex", "explanation"]
        }
    }

    try:
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json", "response_schema": json_schema}
        )
        
        # The AI now returns structured JSON directly, no parsing needed!
        questions = json.loads(response.text)
        
        # Assign unique IDs if AI doesn't provide them
        for i, q in enumerate(questions):
            q['id'] = f"q_{i+1}_{hash(q['text'])}"

        return jsonify({"questions": questions})

    except Exception as e:
        print(f"Error during AI content generation: {e}")
        # Log the full error for debugging
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Failed to generate quiz from AI.", "details": str(e)}), 500

# This part is for local testing only. Render uses Gunicorn.
if __name__ == '__main__':
    app.run(debug=True, port=5000)
