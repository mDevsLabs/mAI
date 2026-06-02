interface QuizConfig {
  apiKey: string;
  count: number;
  level: string;
  topic: string;
}

export const generateQuiz = async (config: QuizConfig): Promise<any[]> => {
  if (!config.apiKey) {
    // Mock if no API key is provided
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(Array.from({ length: config.count }).map((_, i) => ({
          question: `Quelle est la capitale de la France ? (Mock ${i+1}, ${config.level}, ${config.topic})`,
          options: ['Londres', 'Berlin', 'Paris', 'Madrid'],
          answer: 2,
        })));
      }, 1000);
    });
  }

  const prompt = `Génère ${config.count} question(s) de quiz à choix multiples pour un niveau scolaire "${config.level}" sur le sujet "${config.topic}".
Réponds UNIQUEMENT avec un tableau JSON valide au format suivant (pas de markdown, juste du json) :
[
  {
    "question": "Texte de la question",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "answer": index_de_la_bonne_reponse_entre_0_et_3
  }
]`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      })
    });

    if (!res.ok) throw new Error('Erreur API');
    
    const data = await res.json();
    const content = data.choices[0].message.content;
    const jsonStr = content.replaceAll('```json', '').replaceAll('```', '').trim();
    
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('Quiz generation error:', e);
    throw e;
  }
};
