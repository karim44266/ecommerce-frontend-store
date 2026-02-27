type ApiErrorPayload = { message?: string | string[] };

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

const buildErrorMessage = async (response: Response) => {
  try {
    const data = (await response.json()) as ApiErrorPayload | undefined;
    const message = data?.message;
    if (Array.isArray(message)) {
      return message.join(', ');
    }
    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }
  } catch {
    // ignore JSON parsing errors
  }
  return `Request failed with status ${response.status}`;
};

export const apiPost = async <TResponse>(path: string, body: unknown, token?: string): Promise<TResponse> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await buildErrorMessage(response));
  }

  return (await response.json()) as TResponse;
};
