/**
 * src/core/ai/types.ts
 *
 * TypeScript declarations and contracts for Chrome's built-in Prompt API (Gemini Nano)
 * and smart grouping interfaces. Zero JSX, zero UI dependencies.
 */

import type { TabRecord } from '../db';
import type { TabViewModel } from '../behavior';
import type { TopicCluster } from '../topicUtils';

export type AIAvailabilityStatus =
  | 'available'       // Ready for immediate inference
  | 'downloadable'    // Model needs to be downloaded first
  | 'downloading'     // Currently downloading model
  | 'unavailable';    // Device/browser does not support Gemini Nano

export interface AILanguageModelSession {
  prompt(input: string | any[], options?: { signal?: AbortSignal; responseConstraint?: any }): Promise<string>;
  promptStreaming?(input: string | any[], options?: { signal?: AbortSignal }): ReadableStream;
  clone?(options?: { signal?: AbortSignal }): Promise<AILanguageModelSession>;
  destroy(): void;
  contextUsage?: number;
  contextWindow?: number;
}

export interface AISessionCreationOptions {
  systemPrompt?: string;
  temperature?: number;
  topK?: number;
  signal?: AbortSignal;
  monitor?: (monitor: EventTarget) => void;
}

export interface SmartSessionTitleResult {
  title: string;
  isAiGenerated: boolean;
}

export interface SmartArchetypeInsight {
  archetypeId: string;
  insight: string;
  isAiGenerated: boolean;
}

export interface SmartTopicClusteringResult {
  topics: TopicCluster[];
  isAiGenerated: boolean;
}
