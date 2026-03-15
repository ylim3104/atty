import json
import re
import argparse
import traceback
import sys
import os
import urllib.request
import urllib.error

def load_dict(filename):
    # Method 1: Check if dicts is next to the script (Local / VS Code extension mode)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    local_path = os.path.join(script_dir, 'dicts', filename)

    # Method 2: Check sys.prefix (where pip installs data_files)
    system_path = os.path.join(sys.prefix, 'dicts', filename)

    if os.path.exists(local_path):
        filepath = local_path
    elif os.path.exists(system_path):
        filepath = system_path
    else:
        # Fallback to current working directory
        filepath = os.path.join('dicts', filename)

    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def detect_language(source_code, dicts):
    scores = {}
    for lang, mapping in dicts.items():
        score = 0
        for foreign_word in mapping.keys():
            # Find all instances of the keyword
            matches = re.findall(r'\b' + re.escape(foreign_word) + r'\b', source_code, flags=re.UNICODE)
            
            # FIX: Weight the score by the length of the word!
            # A 1-letter match like "y" gives 1 point.
            # A 3-letter match like "چاپ" gives 3 points.
            score += len(matches) * len(foreign_word)
            
        scores[lang] = score
    
    if all(score == 0 for score in scores.values()):
        return "Unknown/English", dicts["Korean"] # Default fallback
        
    # Pick the language with the highest weighted score
    best_lang = max(scores, key=scores.get)
    return best_lang, dicts[best_lang]

def translate_code(source_code, mapping):
    sorted_keys = sorted(mapping.keys(), key=len, reverse=True)
    translated = source_code
    for foreign_word in sorted_keys:
        py_word = mapping[foreign_word]
        pattern = r'\b' + re.escape(foreign_word) + r'\b'
        translated = re.sub(pattern, py_word, translated, flags=re.UNICODE)
    return translated

def translate_error_with_llm(error_msg, target_language):
    print(f"\n[Atty] Fetching beginner-friendly explanation in {target_language} (via Gemini)...")

    # Find the directory where the script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    env_path = os.path.join(script_dir, '.env')
    
    # Replace this string with your actual Gemini API key from Google AI Studio
    GEMINI_API_KEY = None

    # 1. Try to read from the .env file manually (No pip install required!)
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line.startswith('GEMINI_API_KEY='):
                    GEMINI_API_KEY = line.split('=', 1)[1].strip(' "\'')
                    break
                    
    # 2. Fallback to system environment variables (useful if deployed later)
    if not GEMINI_API_KEY:
        GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
        
    # 3. If still no key, return an error
    if not GEMINI_API_KEY:
        return "AI Translation failed: No GEMINI_API_KEY found in the .env file."
    
    # We use Gemini 2.5 Flash, which is extremely fast and available on the free tier
    API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
    
    headers = {
        "Content-Type": "application/json"
    }
    
    if target_language == "Farsi":
        prompt = f"You are a helpful programming teacher. A student got this Python error. Explain the error simply in {target_language}. Keep it to 1 or 2 short sentences max. Do not write in English. Error:\n{error_msg}\n\nCRITICAL INSTRUCTION: Because this will be printed in a Left-to-Right terminal, you MUST reverse the entire string character-by-character so it reads right-to-left correctly in the console."
    else:
        prompt = f"You are a helpful programming teacher. A student got this Python error. Explain the error simply in {target_language}. Keep it to 1 or 2 short sentences max. Do not write in English. Error:\n{error_msg}"    
    
    # Gemini requires a very specific JSON structure for REST calls
    data = json.dumps({
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "temperature": 0.5,
            "maxOutputTokens": 2048
        }
    }).encode('utf-8')
    
    req = urllib.request.Request(API_URL, data=data, headers=headers)
    
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            
            # Navigate through Gemini's JSON response structure to find the text
            try:
                explanation = result['candidates'][0]['content']['parts'][0]['text']
                return explanation.strip()
            except (KeyError, IndexError):
                return f"Could not parse Gemini's response. Raw output: {result}"
                
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        return f"AI Translation failed: HTTP {e.code}. Details: {error_body}"
    except Exception as e:
        return f"AI Translation failed: Make sure you are connected to the internet. ({e})"

def main():
    parser = argparse.ArgumentParser(description="Multilingual Python Interpreter")
    parser.add_argument("file", help="The source file to run")
    parser.add_argument("--output-py", action="store_true", help="Output translated English .py file")
    args = parser.parse_args()

    # Load dictionaries
    try:
        lang_dicts = {
            "Korean": load_dict("kr_en.json"),
            "Spanish": load_dict("es_en.json"),
            "Farsi": load_dict("fa_en.json")
        }
    except Exception as e:
        print(f"Error loading dictionary files: {e}")
        return

    with open(args.file, 'r', encoding='utf-8') as f:
        source_code = f.read()

    detected_lang, selected_dict = detect_language(source_code, lang_dicts)
    print(f"--- Detected Language: {detected_lang} ---")

    translated = translate_code(source_code, selected_dict)

    if args.output_py:
        out_file = args.file + ".py"
        with open(out_file, 'w', encoding='utf-8') as f:
            f.write(translated)
        print(f"--- Translated code saved to {out_file} ---")
        return
    try:
        # Execute the translated code
        exec(translated, {"__name__": "__main__"})
    except Exception as e:

        error_traceback = traceback.format_exc()
        print(error_traceback) 
        
        # Now calls the Cloud LLM instead of Local Ollama
        ai_translation = translate_error_with_llm(error_traceback, detected_lang)
        
        print(f"\n=== 🤖 AI Error Explanation ({detected_lang}) ===")
        print(ai_translation)
        print("===================================\n")
   
if __name__ == "__main__":
    main()