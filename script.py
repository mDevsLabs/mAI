# -*- coding: utf-8 -*-
import json
import re

# 1. Update common translations
prefixes_fr = [
    "Commencez à créer une", "Donnez vie à une", "Imaginez et concevez une", 
    "Laissez-vous inspirer par une", "Générez instantanément une", "Créez de la magie avec une", 
    "Visualisez vos idées grâce à une", "Explorez de nouveaux horizons avec une", "Exprimez votre créativité via une", 
    "Racontez une histoire avec une", "Donnez forme à votre vision avec une", "Sublimez votre projet avec une", 
    "Réalisez l'impossible avec une", "Plongez dans l'art de générer une", "Faites sensation avec une", 
    "Transformez vos mots en une", "Créez l'inattendu avec une", "Éveillez votre imagination avec une", 
    "Façonnez la réalité avec une", "Inventez un monde avec une"
]

prefixes_en = [
    "Start creating an", "Bring to life an", "Imagine and design an", 
    "Be inspired by an", "Instantly generate an", "Create magic with an", 
    "Visualize your ideas with an", "Explore new horizons with an", "Express your creativity via an", 
    "Tell a story with an", "Shape your vision with an", "Enhance your project with an", 
    "Achieve the impossible with an", "Dive into the art of generating an", "Make a splash with an", 
    "Turn your words into an", "Create the unexpected with an", "Awaken your imagination with an", 
    "Shape reality with an", "Invent a new world with an"
]

prefixes_zh = [
    "开始创建", "赋予生命", "想象并设计", 
    "灵感来源于", "立即生成", "创造魔法", 
    "可视化您的想法", "探索新视野", "表达您的创造力", 
    "讲述一个故事", "塑造您的愿景", "增强您的项目", 
    "实现不可能", "潜入生成艺术", "引起轰动", 
    "将您的文字变成", "创造意想不到的", "唤醒您的想象力", 
    "塑造现实", "发明一个新世界"
]

def update_json(path, key_to_delete, new_keys_values):
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    if key_to_delete in data:
        del data[key_to_delete]
    data.update(new_keys_values)
    # Sort keys alphabetically as per typical i18n
    sorted_data = {k: data[k] for k in sorted(data.keys())}
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(sorted_data, f, ensure_ascii=False, indent=2)

update_json('locales/fr-FR/common.json', 'generation.hero.taglinePrefix', {f'generation.hero.taglinePrefix_{i}': p for i, p in enumerate(prefixes_fr)})
update_json('locales/en-US/common.json', 'generation.hero.taglinePrefix', {f'generation.hero.taglinePrefix_{i}': p for i, p in enumerate(prefixes_en)})
update_json('locales/zh-CN/common.json', 'generation.hero.taglinePrefix', {f'generation.hero.taglinePrefix_{i}': p for i, p in enumerate(prefixes_zh)})

with open('packages/locales/src/default/common.ts', 'r', encoding='utf-8') as f:
    ts_content = f.read()

new_ts_lines = []
for i, p in enumerate(prefixes_en):
    new_ts_lines.append(f"  'generation.hero.taglinePrefix_{i}': '{p}',")

ts_content = re.sub(r"  'generation\.hero\.taglinePrefix': '.*',\n", '\n'.join(new_ts_lines) + '\n', ts_content)

with open('packages/locales/src/default/common.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)
print("Updated common translations")

# 2. Update chat translations
greetings_fr = [
    "Que devons-nous aborder aujourd'hui ?", "Prêt à accomplir de grandes choses ?", "Qu'allons-nous créer aujourd'hui ?", 
    "Comment puis-je vous aider aujourd'hui ?", "Une nouvelle idée à explorer ?", "Quel est le programme aujourd'hui ?", 
    "Prêt à donner vie à vos projets ?", "En quoi puis-je vous être utile ?", "Un nouveau défi à relever ?", 
    "Que souhaitez-vous accomplir aujourd'hui ?"
]

greetings_en = [
    "What should we cover today?", "Ready to achieve great things?", "What shall we create today?", 
    "How can I help you today?", "A new idea to explore?", "What's the plan today?", 
    "Ready to bring your projects to life?", "How can I be of service?", "A new challenge to tackle?", 
    "What do you want to achieve today?"
]

greetings_zh = [
    "今天我们要讨论什么？", "准备好成就一番事业了吗？", "今天我们要创造什么？", 
    "今天我能帮您什么？", "有新想法要探索吗？", "今天的计划是什么？", 
    "准备好让您的项目焕发生机了吗？", "我能为您效劳吗？", "有新挑战要应对吗？", 
    "您今天想完成什么？"
]

tasks_fr = [
    "Ex : Rédiger un email professionnel...", "Ex : Organiser mes réunions de la semaine...", "Ex : Créer un plan de régime...", 
    "Ex : Résumer ce long document...", "Ex : Traduire ce texte en anglais...", "Ex : Générer une image de paysage...", 
    "Ex : Écrire un article de blog...", "Ex : Préparer une présentation...", "Ex : Analyser ces données de vente...", 
    "Ex : Corriger les fautes d'orthographe...", "Ex : Trouver des idées de cadeaux...", "Ex : Planifier mes prochaines vacances...", 
    "Ex : Rédiger une lettre de motivation...", "Ex : Créer un logo minimaliste...", "Ex : Développer un script Python...", 
    "Ex : Optimiser mon profil LinkedIn...", "Ex : Synthétiser cette vidéo YouTube...", "Ex : Rédiger un post pour les réseaux sociaux...", 
    "Ex : Écrire un poème sur la mer...", "Ex : Créer une to-do list..."
]

tasks_en = [
    "e.g., Write a professional email...", "e.g., Organize my weekly meetings...", "e.g., Create a diet plan...", 
    "e.g., Summarize this long document...", "e.g., Translate this text to French...", "e.g., Generate a landscape image...", 
    "e.g., Write a blog post...", "e.g., Prepare a presentation...", "e.g., Analyze this sales data...", 
    "e.g., Check for spelling mistakes...", "e.g., Find gift ideas...", "e.g., Plan my next vacation...", 
    "e.g., Write a cover letter...", "e.g., Create a minimalist logo...", "e.g., Develop a Python script...", 
    "e.g., Optimize my LinkedIn profile...", "e.g., Summarize this YouTube video...", "e.g., Write a social media post...", 
    "e.g., Write a poem about the sea...", "e.g., Create a to-do list..."
]

tasks_zh = [
    "例如：撰写一封专业邮件...", "例如：安排我本周的会议...", "例如：制定一个饮食计划...", 
    "例如：总结这份长文档...", "例如：将这段文本翻译成英文...", "例如：生成一张风景图...", 
    "例如：写一篇博客文章...", "例如：准备一份演示文稿...", "例如：分析这些销售数据...", 
    "例如：检查拼写错误...", "例如：寻找礼物创意...", "例如：计划我的下一个假期...", 
    "例如：写一封求职信...", "例如：设计一个极简Logo...", "例如：开发一个Python脚本...", 
    "例如：优化我的LinkedIn个人资料...", "例如：总结这个YouTube视频...", "例如：写一篇社交媒体帖子...", 
    "例如：写一首关于海的诗...", "例如：创建一个待办事项列表..."
]

def update_chat_json(path, del_greet, del_task, greets, tasks):
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    if del_greet in data:
        del data[del_greet]
    if del_task in data:
        del data[del_task]
    data.update({f'taskList.emptyHero.greeting_{i}': g for i, g in enumerate(greets)})
    data.update({f'createTask.instructionPlaceholder_{i}': t for i, t in enumerate(tasks)})
    sorted_data = {k: data[k] for k in sorted(data.keys())}
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(sorted_data, f, ensure_ascii=False, indent=2)

update_chat_json('locales/fr-FR/chat.json', 'taskList.emptyHero.greeting', 'createTask.instructionPlaceholder', greetings_fr, tasks_fr)
update_chat_json('locales/en-US/chat.json', 'taskList.emptyHero.greeting', 'createTask.instructionPlaceholder', greetings_en, tasks_en)
update_chat_json('locales/zh-CN/chat.json', 'taskList.emptyHero.greeting', 'createTask.instructionPlaceholder', greetings_zh, tasks_zh)

with open('packages/locales/src/default/chat.ts', 'r', encoding='utf-8') as f:
    chat_ts = f.read()

new_chat_lines = []
for i, g in enumerate(greetings_en):
    new_chat_lines.append(f"  'taskList.emptyHero.greeting_{i}': '{g}',")
chat_ts = re.sub(r"  'taskList\.emptyHero\.greeting': '.*',\n", '\n'.join(new_chat_lines) + '\n', chat_ts)

new_task_lines = []
for i, t in enumerate(tasks_en):
    new_task_lines.append(f"  'createTask.instructionPlaceholder_{i}': '{t}',")
chat_ts = re.sub(r"  'createTask\.instructionPlaceholder': '.*',\n", '\n'.join(new_task_lines) + '\n', chat_ts)

with open('packages/locales/src/default/chat.ts', 'w', encoding='utf-8') as f:
    f.write(chat_ts)

print("Updated chat translations")
