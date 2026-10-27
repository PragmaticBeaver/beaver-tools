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

// Register tools only when their implementation is explicitly requested.
export const tools: readonly Tool[] = [];

export const availableTools = tools.filter(
  (tool) => tool.status === 'available',
);
