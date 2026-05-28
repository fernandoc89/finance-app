import type { AxiosError } from 'axios';

interface NestErrorBody {
  message?: string | string[];
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Erro inesperado. Tente novamente.',
): string {
  const axiosError = error as AxiosError<NestErrorBody>;
  const message = axiosError.response?.data?.message;

  if (Array.isArray(message)) {
    return message.join(', ');
  }

  if (typeof message === 'string' && message.length > 0) {
    return message;
  }

  return fallback;
}
