// Settings types
export type Theme = 'light' | 'dark' | 'sepia';

export interface Settings {
  theme: Theme;
  viewMode: 'grid' | 'list';
  fontSize: number;
  readerTheme: Theme;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  viewMode: 'grid',
  fontSize: 16,
  readerTheme: 'light',
};
