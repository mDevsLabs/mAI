import { NextRequest, NextResponse } from 'next/server';
import { Message } from '@/lib/playground-types';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { model, messages, temperature, maxTokens, systemPrompt } = body as {
      model: string;
      messages: Message[];
      temperature: number;
      maxTokens: number;
      systemPrompt?: string;
    };

    if (!model) {
      return NextResponse.json({ error: 'Le modèle est requis.' }, { status: 400 });
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
