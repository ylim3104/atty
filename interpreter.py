import json
import re
import argparse
import traceback
import os

def load_dict(filename):
    # Get the absolute path of the directory containing this Python script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Construct the path to the 'dicts' folder located next to this script
    filepath = os.path.join(script_dir, 'dicts', filename)
    
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
    lang_dicts = {
        "Korean": load_dict("kr_en.json"),
        "Spanish": load_dict("es_en.json"),
        "Farsi": load_dict("fa_en.json")
    }

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

    try:
        # Execute the translated code
        exec(translated, {"__name__": "__main__"})
    except Exception as e:
        print("Error encountered! (Pass this to your LLM for translation)",e)
   
if __name__ == "__main__":
    main()