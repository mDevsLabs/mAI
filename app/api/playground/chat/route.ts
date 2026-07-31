import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { Message } from '@/lib/playground-types';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const rawUserId = req.headers.get('x-user-id');
    const userId = rawUserId ? decodeURIComponent(rawUserId) : null;
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié. Veuillez vous connecter.' }, { status: 401 });
    }

    const body = await req.json();
    const { model, messages, temperature, maxTokens, systemPrompt } = body;

    if (!model) {
      return NextResponse.json({ error: 'Le modèle est requis.' }, { status: 400 });
    }

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return NextResponse.json({ error: 'Erreur de configuration serveur (DB).' }, { status: 500 });
    }
    const sql = neon(databaseUrl);

    // Trouver une clé API valide pour l'utilisateur
    const keys = await sql`
      SELECT api_key, request_count, max_limit, is_active
      FROM mprojects_api_keys
      WHERE user_id = ${userId} AND is_active = true
    `;

    // Filtre des clés dont la limite max n'est pas atteinte (si max_limit est défini)
    const validKeys = keys.filter(k => k.max_limit === null || k.request_count < k.max_limit);

    if (validKeys.length === 0) {
      return NextResponse.json({ error: 'Aucune clé API valide trouvée ou quota atteint. Veuillez vérifier vos clés dans la section Compte.' }, { status: 403 });
    }

    const apiKey = validKeys[0].api_key;

    // Préparer les messages au format OpenAI
    const formattedMessages: any[] = [];
    if (systemPrompt && systemPrompt.trim().length > 0) {
      formattedMessages.push({
        role: 'system',
        content: systemPrompt.trim(),
      });
    }
    
    if (Array.isArray(messages)) {
      messages.forEach((msg: Message) => {
        if (msg.role && (msg.content || (msg.images && msg.images.length > 0))) {
          // Si on gérait la vision, on devrait parser l'image en base64 pour OpenAI
          formattedMessages.push({
            role: msg.role,
            content: msg.content || '',
          });
        }
      });
    }

    const payload = {
      model,
      messages: formattedMessages,
      temperature: typeof temperature === 'number' ? temperature : 0.7,
      max_tokens: typeof maxTokens === 'number' ? maxTokens : 2048,
      stream: true
    };

    // Appel à la route Val Town
    const response = await fetch('https://mprojects.val.run/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Erreur OpenRouter/Val Town');
      return NextResponse.json({ error: errText }, { status: response.status });
    }

    // Le backend Val Town retourne un flux SSE (Server-Sent Events)
    // Le client (PlaygroundClient) s'attend à un JSON au format Ollama (ou SSE selon la logique client).
    // On va convertir le SSE OpenAI en un flux Ollama pour la compatibilité du PlaygroundClient,
    // ou simplement renvoyer les deltas au client pour qu'il le traite.
    // Le plus simple pour ne pas réécrire le PlaygroundClient, c'est de générer des lignes JSON "{"message":{"content":"..."}}"
    
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith('data: ')) {
                const data = trimmed.substring(6);
                if (data === '[DONE]') continue;
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    const ollamaFormat = JSON.stringify({ message: { content } });
                    controller.enqueue(encoder.encode(ollamaFormat + '\n'));
                  }
                } catch {
                // Erreur ignorable
                }
              }
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });
  } catch (err: any) {
    console.error('Erreur Playground proxy:', err);
    return NextResponse.json({ error: 'Erreur interne.' }, { status: 500 });
  }
}
