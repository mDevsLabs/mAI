import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, checkAndTrackUserUsage, recordApiLog } from '@/lib/api-key-manager';

export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  id?: string;
  role: Role;
  content: string;
  images?: string[];
  timestamp?: number;
}

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const startTime = performance.now();
  try {
    const rawUserId = req.headers.get('x-user-id');
    let userId: string | null = null;
    if (rawUserId) {
      try { userId = decodeURIComponent(rawUserId); } catch { userId = null; }
      if (userId === 'dev_user') userId = null;
    }
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization') || '';

    const body = await req.json();
    const { model, messages, temperature, maxTokens, systemPrompt, apiKey: bodyApiKey } = body as {
      model: string;
      messages: Message[];
      temperature: number;
      maxTokens: number;
      systemPrompt?: string;
      apiKey?: string;
    };

    if (!model) {
      return NextResponse.json({ error: 'Le modèle est requis.' }, { status: 400 });
    }

    const customKey = (authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : '') || (bodyApiKey ? String(bodyApiKey).trim() : '');
    let effectiveKey = '';

    if (customKey) {
      const validation = await validateApiKey(customKey);
      if (!validation.valid) {
        const isQuota = validation.error?.toLowerCase().includes('limit') || validation.error?.toLowerCase().includes('quota');
        return NextResponse.json(
          { error: validation.error || 'Clé API invalide ou quota atteint.' },
          { status: isQuota ? 429 : 403 }
        );
      }
      effectiveKey = customKey;
    } else if (userId) {
      // Auth via x-user-id requiert trace, mais on limite l'auto-création : checkAndTrack fait déjà quota
      const usageCheck = await checkAndTrackUserUsage({
        userId,
        endpoint: '/api/ollama/chat',
        method: 'POST',
      });

      if (!usageCheck.allowed) {
        return NextResponse.json(
          { error: usageCheck.error || 'Limite de requêtes API atteinte pour votre compte.' },
          { status: 429 }
        );
      }
      effectiveKey = usageCheck.apiKey || '';
    } else {
      return NextResponse.json({ error: 'Auth requise : fournissez une clé API (Bearer) ou un identifiant utilisateur.' }, { status: 401 });
    }

    const ollamaHost = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

    // Préparer l'historique complet avec le prompt système éventuel
    const formattedMessages: { role: string; content: string }[] = [];
    
    if (systemPrompt && systemPrompt.trim().length > 0) {
      formattedMessages.push({
        role: 'system',
        content: systemPrompt.trim(),
      });
    }

    if (Array.isArray(messages)) {
      messages.forEach((msg) => {
        if (msg.role && (msg.content || (msg.images && msg.images.length > 0))) {
          const formattedMsg: { role: string; content: string; images?: string[] } = {
            role: msg.role,
            content: msg.content || '',
          };

          if (msg.images && msg.images.length > 0) {
            // Strip data:image/...;base64, prefix if present for Ollama API
            formattedMsg.images = msg.images.map((img) =>
              img.includes(';base64,') ? img.split(';base64,')[1] : img
            );
          }

          formattedMessages.push(formattedMsg);
        }
      });
    }

    const ollamaPayload = {
      model,
      messages: formattedMessages,
      options: {
        temperature: typeof temperature === 'number' ? temperature : 0.7,
        num_predict: typeof maxTokens === 'number' ? maxTokens : 2048,
      },
      stream: true,
    };

    let response: Response;
    try {
      response = await fetch(`${ollamaHost}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ollamaPayload),
      });
    } catch (err: any) {
      console.error('Erreur de connexion à Ollama:', err);
      return NextResponse.json(
        {
          error:
            `Ollama n'est pas démarré ou n'est pas accessible sur ${ollamaHost}.\n` +
            `Veuillez démarrer Ollama localement avec la commande "ollama serve" puis réessayer.`,
        },
        { status: 503 }
      );
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Erreur inconnue');
      return NextResponse.json(
        { error: `Ollama a répondu avec une erreur (${response.status}) : ${errorText}` },
        { status: response.status }
      );
    }

    if (!response.body) {
      return NextResponse.json({ error: 'Aucun flux de réponse reçu d\'Ollama.' }, { status: 500 });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const reader = response.body.getReader();

    const stream = new ReadableStream({
      async start(controller) {
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
              if (!trimmed) continue;

              try {
                const parsed = JSON.parse(trimmed);
                if (parsed.message?.content) {
                  controller.enqueue(encoder.encode(parsed.message.content));
                }
              } catch {
                // Erreur de parsage de ligne NDJSON ignorable
              }
            }
          }

          // Process remaining buffer
          if (buffer.trim()) {
            try {
              const parsed = JSON.parse(buffer.trim());
              if (parsed.message?.content) {
                controller.enqueue(encoder.encode(parsed.message.content));
              }
            } catch {
              // Ignore final line parse error
            }
          }

          controller.close();
          if (customKey && effectiveKey) {
            recordApiLog({
              apiKey: effectiveKey,
              endpoint: '/api/ollama/chat',
              method: 'POST',
              statusCode: 200,
              latencyMs: Math.round(performance.now() - startTime),
            }).catch(() => {});
          }
        } catch {
          console.error('Streaming error');
          controller.error('Streaming error');
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (err: any) {
    console.error('Erreur dans route Ollama:', err);
    return NextResponse.json({ error: err.message || 'Erreur interne du serveur' }, { status: 500 });
  }
}
