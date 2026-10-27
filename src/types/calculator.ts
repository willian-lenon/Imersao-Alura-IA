export interface CalculationResult {
  success: boolean;
  result?: string;
  raw_result?: string;
  expression: string;
  sanitized?: string;
  steps?: string[];
  token_count?: number;
  rpn_tokens?: string[];
  execution_time_ms?: number;
  engine?: string;
  rules_applied?: string[];
  error?: string;
}

export interface CalculationHistoryItem {
  id: string;
  expression: string;
  result: string;
  steps?: string[];
  executionTimeMs?: number;
  timestamp: number;
  engine?: string;
}

export type KeyType = 'number' | 'operator' | 'action' | 'paren';

export interface KeyConfig {
  label: string;
  displayLabel?: string;
  value: string;
  type: KeyType;
  accent?: 'primary' | 'operator' | 'action' | 'neutral';
  shortcut?: string;
  ariaLabel: string;
}
