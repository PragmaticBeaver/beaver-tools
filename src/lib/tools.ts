export type ToolStatus = 'available' | 'planned';

export interface Tool {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  href: string;
  status: ToolStatus;
  number: string;
}

export const tools = [
  {
    slug: 'lebenslauf',
    name: 'Lebenslauf-Generator',
    tagline: 'Ordentlich, lokal, druckfertig.',
    description:
      'Strukturierten Lebenslauf schreiben, im Browser speichern und als saubere A4-Seite drucken. Ohne Konto, ohne Upload.',
    href: '/lebenslauf',
    status: 'available',
    number: '01',
  },
] as const satisfies readonly Tool[];

export const availableTools = tools.filter(
  (tool) => tool.status === 'available',
);
