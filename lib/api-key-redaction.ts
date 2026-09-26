import 'server-only';

/** Utilitaires serveur pour empêcher la réflexion d'un secret API dans une réponse. */
export function redactApiSecretText(value: string, secret: string | null): string {
  if (!secret) return value;
  return value.split(secret).join('[REDACTED]');
}

export function redactApiSecretJson<T>(value: T, secret: string | null): T {
  if (!secret) return value;

  const visit = (nested: unknown): unknown => {
    if (typeof nested === 'string') return redactApiSecretText(nested, secret);
    if (Array.isArray(nested)) return nested.map(visit);
    if (!nested || typeof nested !== 'object') return nested;

    const output: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(nested as Record<string, unknown>)) {
      output[key] = /^(api[_-]?key|authorization)$/i.test(key)
        ? '[REDACTED]'
        : visit(child);
    }
    return output;
  };

  return visit(value) as T;
}
