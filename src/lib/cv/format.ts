const MONTH_PATTERN = /^(\d{4})-(\d{2})$/;
const YEAR_PATTERN = /^(\d{4})$/;

export function normalizeMonth(value: unknown): string {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  const year = YEAR_PATTERN.exec(trimmed);
  if (year?.[1]) {
    const parsed = Number(year[1]);
    if (parsed >= 1900 && parsed <= 2100) return year[1];
    return '';
  }
  const month = MONTH_PATTERN.exec(trimmed);
  if (!month?.[1] || !month[2]) return '';
  const parsedYear = Number(month[1]);
  const parsedMonth = Number(month[2]);
  if (parsedYear < 1900 || parsedYear > 2100) return '';
  if (parsedMonth < 1 || parsedMonth > 12) return '';
  return `${month[1]}-${month[2]}`;
}

export function formatMonth(value: string): string {
  const normalized = normalizeMonth(value);
  if (!normalized) return '';
  const month = MONTH_PATTERN.exec(normalized);
  if (month?.[1] && month[2]) return `${month[2]}/${month[1]}`;
  return normalized;
}

export function formatRange(
  start: string,
  end: string,
  current: boolean,
): string {
  const from = formatMonth(start);
  const to = current ? 'heute' : formatMonth(end);
  if (from && to) return `${from} – ${to}`;
  if (from) return `seit ${from}`;
  if (to) return `bis ${to}`;
  return '';
}

export function normalizeIsoDate(value: unknown): string {
  if (typeof value !== 'string') return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match?.[1] || !match[2] || !match[3]) return '';
  const date = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
  );
  if (
    date.getUTCFullYear() !== Number(match[1]) ||
    date.getUTCMonth() !== Number(match[2]) - 1 ||
    date.getUTCDate() !== Number(match[3])
  ) {
    return '';
  }
  return `${match[1]}-${match[2]}-${match[3]}`;
}

export function formatDate(value: string): string {
  const normalized = normalizeIsoDate(value);
  if (!normalized) return '';
  const [year, month, day] = normalized.split('-');
  return `${day}.${month}.${year}`;
}

export function splitLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function joinLines(values: readonly string[]): string {
  return values.join('\n');
}

export function splitTags(value: string): string[] {
  return value
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function joinTags(values: readonly string[]): string {
  return values.join(', ');
}

export function displayUrl(value: string): string {
  return value
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '');
}

export function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function safeUrl(value: string): string {
  const normalized = normalizeUrl(value);
  if (!normalized) return '';
  try {
    const url = new URL(normalized);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return url.toString();
    }
  } catch {
    return '';
  }
  return '';
}

export function mailtoHref(value: string): string {
  const email = value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return '';
  return `mailto:${encodeURIComponent(email)}`;
}

export function phoneHref(value: string): string {
  const phone = value.replace(/[^\d+]/g, '');
  return phone ? `tel:${phone}` : '';
}

export function cvFileName(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'lebenslauf';
}
