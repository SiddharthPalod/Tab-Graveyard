/**
 * src/ui/tokens.ts
 *
 * Theme-aware tokens and backwards-compatible exports.
 * Legacy imports like `import { cls, QUOTES, STATUS_LABELS } from '../tokens'`
 * remain fully supported, while modern components can consume `useTheme()` for
 * dynamic theme personality switching.
 */
import { undertaleTheme } from './themes/undertale';

export * from './themes/types';
export * from './themes/index';
export * from './themes/useTheme';

export const cls = undertaleTheme.cls;
export const STATUS_LABELS = undertaleTheme.statusLabels;
export const QUOTES = undertaleTheme.quotes;
