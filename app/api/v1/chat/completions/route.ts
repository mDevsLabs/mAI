import { NextRequest, NextResponse } from 'next/server';
import { authenticateOpenAIRequest } from '@/lib/openai-auth';
import { resolveOllamaModel } from '@/lib/openai-model-mapper';
import { recordApiLog } from '@/lib/api-key-manager';
import {
  OpenAIChatCompletionRequest,
  OpenAIChatCompletionResponse,
  OpenAIChatCompletionChunk,
  OpenAIErrorResponse,
} from '@/lib/openai-types';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const startTime = performance.now();
  // 1. Authentification & Rate limiting
  const auth = await authenticateOpenAIRequest(req);
  if (!auth.valid) {
    return auth.response;
  }

  try {
    const body = (await req.json()) as OpenAIChatCompletionRequest;

    if (!body.model) {
      return NextResponse.json<OpenAIErrorResponse>(
        {
          error: {
            message: "Missing required parameter: 'model'.",
            type: 'invalid_request_error',
            param: 'model',
            code: 'missing_required_parameter',
          },
        },
        { status: 400 }
      );
    }

    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json<OpenAIErrorResponse>(
        {
          error: {
            message: "Missing required parameter: 'messages' must be a non-empty array.",
            type: 'invalid_request_error',
            param: 'messages',
            code: 'missing_required_parameter',
          },
        },
        { status: 400 }
      );
    }

    const planStr = (auth.plan || 'Free').toLowerCase().trim();
    const isPaidPlan = ['plus', 'pro', 'max'].includes(planStr);
    const isFreePlan = !isPaidPlan;
    const modelName = (body.model || '').toLowerCase();

    if (isFreePlan && !modelName.includes('free')) {
      return NextResponse.json<OpenAIErrorResponse>(
        {
          error: {
            message: `Le modèle '${body.model}' nécessite un forfait payant (Plus, Pro ou Max). Votre forfait actuel (${auth.plan}) autorise uniquement les modèles contenant 'free'.`,
            type: 'permission_error',
            param: 'model',
            code: 'model_access_denied',
          },
        },
        { status: 403 }
      );
    }

    // 2. Vérifier si le modèle est local (mAI / Ollama) ou Cloud (OpenRouter / Val Town)
    const isLocalModel = body.model.startsWith('mDevsLabs/') || body.model.startsWith('mai-') || body.model.includes('mAI');
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization') || '';

    // Si c'est un modèle cloud (ou si l'utilisateur demande directement un modèle cloud), on délègue au proxy Val Town
    if (!isLocalModel) {
      const valTownRes = await fetch('https://mai.val.run/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify(body),
      });

      return new Response(valTownRes.body, {
        status: valTownRes.status,
        headers: {
          'Content-Type': valTownRes.headers.get('Content-Type') || 'application/json',
        },
      });
    }

    const ollamaModel = resolveOllamaModel(body.model);
    const ollamaHost = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

    // Formater les messages pour l'API Ollama
    const formattedMessages = body.messages.map((m) => {
      let contentStr = '';
      let imagesStrArray: string[] | undefined = undefined;

      if (typeof m.content === 'string') {
        contentStr = m.content;
      } else if (Array.isArray(m.content)) {
        m.content.forEach((part) => {
          if (part.type === 'text' && part.text) {
            contentStr += part.text;
          } else if (part.type === 'image_url' && part.image_url?.url) {
            const url = part.image_url.url;
            const b64Data = url.includes(';base64,') ? url.split(';base64,')[1] : url;
            if (!imagesStrArray) imagesStrArray = [];
            imagesStrArray.push(b64Data);
          }
        });
      }

      if (m.images && m.images.length > 0) {
        if (!imagesStrArray) imagesStrArray = [];
        m.images.forEach((img) => {
          const cleanB64 = img.includes(';base64,') ? img.split(';base64,')[1] : img;
          imagesStrArray!.push(cleanB64);
        });
      }

      return {
        role: m.role,
        content: contentStr,
        ...(imagesStrArray ? { images: imagesStrArray } : {}),
      };
    });

    const isStream = Boolean(body.stream);
    const options: Record<string, any> = {};
    if (typeof body.temperature === 'number') options.temperature = body.temperature;
    if (typeof body.max_tokens === 'number') options.num_predict = body.max_tokens;
    if (typeof body.top_p === 'number') options.top_p = body.top_p;
    if (typeof body.frequency_penalty === 'number') options.frequency_penalty = body.frequency_penalty;
    if (typeof body.presence_penalty === 'number') options.presence_penalty = body.presence_penalty;

    const ollamaPayload = {
      model: ollamaModel,
      messages: formattedMessages,
      options,
      stream: isStream,
    };

    let ollamaRes: Response;
    try {
      ollamaRes = await fetch(`${ollamaHost}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ollamaPayload),
      });
    } catch (err: any) {
      console.error('Ollama connection error:', err);
      return NextResponse.json<OpenAIErrorResponse>(
        {
          error: {
            message: `Ollama engine unavailable at ${ollamaHost}. Please ensure Ollama is running.`,
            type: 'service_unavailable',
            param: null,
            code: 'ollama_offline',
          },
        },
        { status: 503 }
      );
    }

    if (!ollamaRes.ok) {
      const errText = await ollamaRes.text().catch(() => '');
      return NextResponse.json<OpenAIErrorResponse>(
        {
          error: {
            message: `Ollama error: ${errText || ollamaRes.statusText}`,
            type: 'api_error',
            param: null,
            code: `ollama_http_${ollamaRes.status}`,
          },
        },
        { status: ollamaRes.status }
      );
    }

    const completionId = `chatcmpl-${Math.random().toString(36).substring(2, 11)}`;
    const createdTimestamp = Math.floor(Date.now() / 1000);

    // ─── MODE STREAMING SSE (Server-Sent Events) ────────────────────────────
    if (isStream) {
      const encoder = new TextEncoder();
      const reader = ollamaRes.body?.getReader();

      if (!reader) {
        return NextResponse.json<OpenAIErrorResponse>(
          {
            error: {
              message: 'Failed to read response stream.',
              type: 'api_error',
              param: null,
              code: 'stream_error',
            },
          },
          { status: 500 }
        );
      }

      const stream = new ReadableStream({
        async start(controller) {
          // Premier chunk indicatif avec le rôle assistant
          const initialChunk: OpenAIChatCompletionChunk = {
            id: completionId,
            object: 'chat.completion.chunk',
            created: createdTimestamp,
            model: body.model,
            choices: [
              {
                index: 0,
                delta: { role: 'assistant' },
                finish_reason: null,
              },
            ],
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialChunk)}\n\n`));

          const decoder = new TextDecoder();
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
                  const tokenContent = parsed.message?.content || '';
                  const isDone = Boolean(parsed.done);

                  if (tokenContent) {
                    const chunk: OpenAIChatCompletionChunk = {
                      id: completionId,
                      object: 'chat.completion.chunk',
                      created: createdTimestamp,
                      model: body.model,
                      choices: [
                        {
                          index: 0,
                          delta: { content: tokenContent },
                          finish_reason: null,
                        },
                      ],
                    };
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
                  }

                  if (isDone) {
                    const finalChunk: OpenAIChatCompletionChunk = {
                      id: completionId,
                      object: 'chat.completion.chunk',
                      created: createdTimestamp,
                      model: body.model,
                      choices: [
                        {
                          index: 0,
                          delta: {},
                          finish_reason: 'stop',
                        },
                      ],
                    };
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalChunk)}\n\n`));
                  }
                } catch {
                  // Erreur de parsage de ligne NDJSON ignorable
                }
              }
            }
          } catch (streamErr) {
            console.error('Streaming error:', streamErr);
          } finally {
            // Signal de fin SSE standard OpenAI
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
            // Logging dans mprojects_api_logs
            recordApiLog({
              apiKey: auth.apiKeyToken,
              endpoint: '/v1/chat/completions',
              method: 'POST',
              statusCode: 200,
              latencyMs: Math.round(performance.now() - startTime),
            }).catch(() => {});
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    // ─── MODE NON-STREAMING ──────────────────────────────────────────────────
    const ollamaData = await ollamaRes.json();
    const assistantContent = ollamaData.message?.content || '';
    const promptTokens = ollamaData.prompt_eval_count || Math.round(JSON.stringify(body.messages).length / 4);
    const completionTokens = ollamaData.eval_count || Math.round(assistantContent.length / 4);

    const response: OpenAIChatCompletionResponse = {
      id: completionId,
      object: 'chat.completion',
      created: createdTimestamp,
      model: body.model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: assistantContent,
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: promptTokens + completionTokens,
      },
    };

    // Logging dans mprojects_api_logs
    await recordApiLog({
      apiKey: auth.apiKeyToken,
      endpoint: '/v1/chat/completions',
      method: 'POST',
      statusCode: 200,
      latencyMs: Math.round(performance.now() - startTime),
    });

    return NextResponse.json(response);
  } catch (err: any) {
    console.error('OpenAI Chat Completion API Error:', err);
    return NextResponse.json<OpenAIErrorResponse>(
      {
        error: {
          message: err.message || 'An internal server error occurred.',
          type: 'api_error',
          param: null,
          code: 'internal_error',
        },
      },
      { status: 500 }
    );
  }
}
