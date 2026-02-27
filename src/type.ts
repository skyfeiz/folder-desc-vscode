export type DescData = {
  [key: string]: {
    description: string
    tooltip?: string
  }
} | Record<string, never>;
