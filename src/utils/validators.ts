/** Validação de força da senha */
export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Fraca', color: 'text-red-500' };
  if (score <= 3) return { score, label: 'Média', color: 'text-amber-500' };
  return { score, label: 'Forte', color: 'text-emerald-500' };
}

const PAISES = { br: '55', py: '595' } as const;
export type PaisCodigo = keyof typeof PAISES;

/** Máscara WhatsApp Brasil: (00) 00000-0000 | Paraguay: 000 000 000 */
export function formatWhatsApp(value: string, pais: PaisCodigo = 'br'): string {
  const digits = value.replace(/\D/g, '');
  if (pais === 'py') {
    const d = digits.slice(0, 9);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
    return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
  }
  const d = digits.slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Retorna número completo com código do país para wa.me (sem +) */
export function whatsappToWaMe(whatsapp: string, pais: PaisCodigo): string {
  const digits = whatsapp.replace(/\D/g, '');
  const code = PAISES[pais];
  if (digits.startsWith('55') || digits.startsWith('595')) return digits;
  return code + digits;
}

/** Normaliza slug: minúsculo, apenas a-z0-9 e hífens */
export function normalizeSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
