import { NextRequest, NextResponse } from 'next/server';
import { Message } from '@/lib/playground-types';
import { validateApiKey, checkAndTrackUserUsage, recordApiLog } from '@/lib/api-key-manager';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const startTime = performance.now();
  try {
    const rawUserId = req.headers.get('x-user-id');
    const userId = rawUserId ? decodeURIComponent(rawUserId) : null;
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié. Veuillez vous connecter.' }, { status: 401 });
    }

    const body = await req.json();
    const { model, messages, temperature, maxTokens, systemPrompt, apiKey: bodyApiKey } = body;

    if (!model) {
      return NextResponse.json({ error: 'Le modèle est requis.' }, { status: 400 });
    }

    // Déterminer la clé API à utiliser (custom key ou clé automatique du compte)
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization') || '';
    const customKey = (authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : '') || (bodyApiKey ? String(bodyApiKey).trim() : '');

    let effectiveApiKey = '';

    if (customKey) {
      const validation = await validateApiKey(customKey);
      if (!validation.valid) {
        const isQuota = validation.error?.toLowerCase().includes('limit') || validation.error?.toLowerCase().includes('quota');
        return NextResponse.json(
          { error: validation.error || 'Clé API invalide ou limite atteinte.' },
          { status: isQuota ? 429 : 403 }
        );
      }
      effectiveApiKey = customKey;
    } else {
      // Vérifier et incrémenter le quota global pour l'utilisateur
      const usageCheck = await checkAndTrackUserUsage({
        userId,
        endpoint: '/api/playground/chat',
        method: 'POST',
      });

      if (!usageCheck.allowed) {
        return NextResponse.json(
          { error: usageCheck.error || 'Limite de requêtes API atteinte pour votre forfait.' },
          { status: 429 }
        );
      }
      effectiveApiKey = usageCheck.apiKey || '';
    }

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
    const response = await fetch('https://mai.val.run/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${effectiveApiKey}`,
        'x-user-id': encodeURIComponent(userId)
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
          if (customKey && effectiveApiKey) {
            recordApiLog({
              apiKey: effectiveApiKey,
              endpoint: '/api/playground/chat',
              method: 'POST',
              statusCode: 200,
              latencyMs: Math.round(performance.now() - startTime),
            }).catch(() => {});
          }
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
