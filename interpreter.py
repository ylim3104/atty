import json
import re
import argparse
import traceback
import sys
import os

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
    # dicts is a dict of { "lang_name": lang_dict }
    scores = {}
    for lang, mapping in dicts.items():
        score = 0
        for foreign_word in mapping.keys():
            # Count occurrences of the keyword in the source code
            score += len(re.findall(r'\b' + re.escape(foreign_word) + r'\b', source_code, flags=re.UNICODE))
        scores[lang] = score

    # If no keywords found, default to English/Python
    if all(score == 0 for score in scores.values()):
        return "Unknown/English", dicts["Korean"] # default fallback

    # Return the language with the highest keyword match score
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
        print("\n--- Native Error Detected ---")
        # Here is where we will hook up Ollama!
        traceback.print_exc()
   
if __name__ == "__main__":
    main()