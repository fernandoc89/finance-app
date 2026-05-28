/** Converte valor decimal (reais) da API para centavos usados nos formulários. */
export function reaisToCents(reais: number): number {
  return Math.round(Number(reais) * 100);
}

/** Converte centavos do formulário para decimal (reais) enviado à API. */
export function centsToReais(cents: number): number {
  return cents / 100;
}

export function formatReais(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value));
}

export function formatCents(cents: number): string {
  return formatReais(centsToReais(cents));
}
