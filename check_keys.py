import os, json

def get_keys(obj, prefix=""):
    keys = []
    if isinstance(obj, dict):
        for k, v in obj.items():
            keys.extend(get_keys(v, prefix + k + "."))
    else:
        keys.append(prefix[:-1])
    return set(keys)

locales_dir = 'locales'
base_lang = 'en-US'
base_dir = os.path.join(locales_dir, base_lang)

base_keys = {}
for filename in os.listdir(base_dir):
    if filename.endswith('.json'):
        with open(os.path.join(base_dir, filename), 'r', encoding='utf-8') as f:
            base_keys[filename] = get_keys(json.load(f))

missing_report = {}
for lang in os.listdir(locales_dir):
    if lang == base_lang: continue
    lang_dir = os.path.join(locales_dir, lang)
    if not os.path.isdir(lang_dir): continue
    
    missing_report[lang] = {}
    for filename in base_keys:
        filepath = os.path.join(lang_dir, filename)
        if not os.path.exists(filepath):
            missing_report[lang][filename] = ["FILE_MISSING"]
            continue
            
        with open(filepath, 'r', encoding='utf-8') as f:
            lang_keys = get_keys(json.load(f))
            
        missing = base_keys[filename] - lang_keys
        if missing:
            missing_report[lang][filename] = list(missing)

total_missing = 0
for lang, files in missing_report.items():
    for filename, missing in files.items():
        if missing:
            total_missing += len(missing)
            print(f"[{lang}] {filename}: {len(missing)} missing keys")
            if len(missing) < 5:
                print(f"  -> {missing}")

print(f"Total missing keys across all languages: {total_missing}")
