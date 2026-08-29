import os, re, sys
sys.stdout.reconfigure(encoding='utf-8')

emoji_pattern = re.compile(
    r'[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF\U0001F1E0-\U0001F1FF\U00002702-\U000027B0\U00002600-\U000026FF\U00002700-\U000027BF\U0001F900-\U0001F9FF\U0001FA00-\U0001FA6F\U0001FA70-\U0001FAFF]'
)

# JSX replacements (component tags)
jsx_map = {
    '\U0001F680': '<Rocket className="inline w-4 h-4 align-middle" />',
    '\U00002728': '<Sparkles className="inline w-4 h-4 align-middle" />',
    '\U0001F389': '<PartyPopper className="inline w-4 h-4 align-middle" />',
    '\U000026A0': '<AlertTriangle className="inline w-4 h-4 align-middle" />',
    '\U0001F4CB': '<Clipboard className="inline w-4 h-4 align-middle" />',
    '\U0001F4C1': '<Folder className="inline w-4 h-4 align-middle" />',
    '\U0001F916': '<Bot className="inline w-4 h-4 align-middle" />',
    '\U0001F3A8': '<Palette className="inline w-4 h-4 align-middle" />',
    '\U0001F50A': '<Volume2 className="inline w-4 h-4 align-middle" />',
    '\U0001F52E': '<Sparkles className="inline w-4 h-4 align-middle" />',
    '\U0001F511': '<Key className="inline w-4 h-4 align-middle" />',
    '\U0001F512': '<Lock className="inline w-4 h-4 align-middle" />',
    '\U0001F6E1': '<Shield className="inline w-4 h-4 align-middle" />',
    '\U0001F4A1': '<Lightbulb className="inline w-4 h-4 align-middle" />',
    '\U0001F4DC': '<ScrollText className="inline w-4 h-4 align-middle" />',
    '\U0001F4CD': '<MapPin className="inline w-4 h-4 align-middle" />',
    '\U0001F539': '<CircleDot className="inline w-4 h-4 align-middle" />',
    '\U0001F48E': '<Gem className="inline w-4 h-4 align-middle" />',
    '\U00002726': '<Star className="inline w-4 h-4 align-middle" />',
    '\U0001F449': '<Hand className="inline w-4 h-4 align-middle" />',
}

# Text replacements (plain / unicode)
text_map = {
    '\U0001F449': '→',
    '\U0001F680': 'Lancement',
    '\U00002728': '*',
    '\U0001F389': 'Félicitations',
    '\U000026A0': 'Attention',
    '\U0001F4CB': 'Copier',
    '\U0001F1EA': 'UE',
    '\U0001F511': 'Clé',
    '\U0001F512': 'Verrou',
    '\U000026A1': 'Flash',
    '\U00002726': '*',
    '\U0001F48E': 'Premium',
    '\U0001F4A1': 'Idée',
    '\U0001F4DC': 'Doc',
    '\U0001F4CD': 'Lieu',
    '\U0001F539': '•',
    '\U0001F6E1': 'Protection',
    '\U0001F4C1': 'Dossier',
    '\U0001F916': 'IA',
    '\U0001F3A8': 'Design',
    '\U0001F50A': 'Audio',
    '\U0001F52E': 'Magie',
    '\U0001F1FA': 'USA',
}

# For models page, prefer ShieldAlert if already imported
alternative_jsx = {
    '\U000026A0': '<ShieldAlert className="inline w-4 h-4 align-middle" />',
}

files = []
with open('emoji_filtered.txt','r',encoding='utf-8') as f:
    for line in f:
        path = line.split(':')[0]
        if path.endswith('.tsx'):
            files.append(path)

files = sorted(set(files))

def extract_components(tag_str):
    # tag like '<Rocket className="..." />'
    comp = tag_str.split()[0][1:]
    return comp

def process_file(filepath):
    with open(filepath,'r',encoding='utf-8') as f:
        content = f.read()
    lines = content.splitlines(True)
    new_lines = []
    used_components = set()
    # check existing imports to decide alternative for ⚠
    existing_imports = []
    for line in lines:
        m = re.search(r"from\s+['\"]lucide-react['\"]\s*;", line)
        if m:
            # extract names before this line? Actually names are in previous lines.
            pass
    # Better: extract all names from import block
    import_block = []
    in_import = False
    import_names = []
    for line in lines:
        if 'from "lucide-react"' in line or "from 'lucide-react'" in line:
            # check previous lines for names (simplified: just scan all lines for names inside braces before this line?)
            pass
    # Simpler: scan whole content for names inside lucide-react import
    import_match = re.search(r"\{([^}]+)\}\s+from\s+['\"]lucide-react['\"]", content, re.DOTALL)
    if import_match:
        import_names = [s.strip() for s in import_match.group(1).split(',') if s.strip()]
    else:
        import_names = []
    for line in lines:
        stripped = line.lstrip()
        # Context detection
        if stripped.startswith('//'):
            context = 'text'
        elif 'toast.' in line or 'console.' in line or 'console.log' in line or 'alert(' in line:
            context = 'text'
        else:
            context = 'jsx'
        # Process emojis
        # Find all emoji occurrences with positions to handle replacements correctly
        # We'll just replace globally with chosen map
        for emoji, repl_tag in jsx_map.items():
            if emoji not in line:
                continue
            if context == 'jsx':
                # For ⚠ choose alternative if ShieldAlert imported and AlertTriangle not
                if emoji == '\U000026A0':
                    if 'ShieldAlert' in import_names and 'AlertTriangle' not in import_names:
                        repl_tag = alternative_jsx['\U000026A0']
                    # else keep AlertTriangle (will add import if needed)
                line = line.replace(emoji, repl_tag)
                comp = extract_components(repl_tag)
                used_components.add(comp)
            else:
                line = line.replace(emoji, text_map.get(emoji, '•'))
        new_lines.append(line)
    new_content = ''.join(new_lines)
    # Update imports
    import_match = re.search(r"(\{[^}]+\})\s+from\s+([\"'])lucide-react\2", new_content, re.DOTALL)
    if import_match:
        names_str = import_match.group(1)[1:-1]  # inside braces
        names = [s.strip() for s in names_str.split(',') if s.strip()]
        # Add used components that are missing
        for comp in sorted(used_components):
            if comp not in names:
                names.append(comp)
        names.sort(key=lambda s: s.lower())
        new_names_str = ', '.join(names)
        # Rebuild block: keep same formatting roughly
        old_block = import_match.group(0)
        new_block = '{ ' + new_names_str + ' } from "lucide-react"' if '"lucide-react"' in old_block else '{ ' + new_names_str + ' } from \'lucide-react\''
        # Actually old_block includes braces and from; replace whole block
        new_content = new_content.replace(old_block, new_block)
    else:
        # No import block exists; insert after first import line
        # Find first line with "import"
        for idx, line in enumerate(new_lines):
            if line.strip().startswith('import'):
                # Insert after this line (or after next if multi-line?)
                # Just insert new import line after this line
                comp_list = sorted(used_components)
                if comp_list:
                    import_line = 'import { ' + ', '.join(comp_list) + ' } from "lucide-react";\n'
                    new_lines.insert(idx+1, import_line)
                break
    # Write back
    with open(filepath,'w',encoding='utf-8') as f:
        f.write(''.join(new_lines))
    return used_components

for fp in files:
    comps = process_file(fp)
    print(fp, '-> added', comps)
