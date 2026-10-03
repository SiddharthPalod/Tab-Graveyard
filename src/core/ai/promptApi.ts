/**
 * src/core/ai/promptApi.ts
 *
 * Core service layer wrapping Chrome's built-in Prompt API (Gemini Nano).
 * Pure TypeScript. Zero React. Zero UI imports.
 *
 * Provides:
 * - Safe detection of global `LanguageModel` or `ai.languageModel`
 * - Availability checks with normalized statuses
 * - Structured JSON prompting with schema constraints & regex fallback
 * - Automatic timeout handling via AbortController
 * - Session resource cleanup (destroy on finish)
 */

import type { AIAvailabilityStatus, AILanguageModelSession, AISessionCreationOptions } from './types';

/** Helper to retrieve the global LanguageModel factory safely */
function getLanguageModelFactory(): any {
  if (typeof globalThis === 'undefined') return null;
  const anyGlobal = globalThis as any;
  if (anyGlobal.LanguageModel) return anyGlobal.LanguageModel;
  if (anyGlobal.ai?.languageModel) return anyGlobal.ai.languageModel;
  return null;
}

/**
 * Checks whether Chrome's Gemini Nano model is available, needs download, or unavailable.
 */
export async function checkAIAvailability(): Promise<AIAvailabilityStatus> {
  try {
    const factory = getLanguageModelFactory();
    if (!factory) return 'unavailable';

    if (typeof factory.availability === 'function') {
      const result = await factory.availability({
        expectedInputs: [{ type: 'text', languages: ['en'] }],
        expectedOutputs: [{ type: 'text', languages: ['en'] }],
      });
      // Handle various spec versions ('readily', 'available', 'after-download', 'downloadable', etc.)
      if (result === 'readily' || result === 'available') {
        return 'available';
      }
      if (result === 'after-download' || result === 'downloadable') {
        return 'downloadable';
      }
      if (result === 'downloading') {
        return 'downloading';
      }
      if (result === 'no' || result === 'unavailable') {
        return 'unavailable';
      }
    }

    // Fallback: check capabilities() if availability is absent
    if (typeof factory.capabilities === 'function') {
      const caps = await factory.capabilities();
      if (caps?.available === 'readily') return 'available';
      if (caps?.available === 'after-download') return 'downloadable';
      if (caps?.available === 'no') return 'unavailable';
    }

    return 'available';
  } catch {
    return 'unavailable';
  }
}

/**
 * Creates a language model session with optional timeout, parameters, and download monitor.
 */
export async function createLanguageModelSession(
  options: AISessionCreationOptions = {},
): Promise<AILanguageModelSession | null> {
  const factory = getLanguageModelFactory();
  if (!factory || typeof factory.create !== 'function') {
    console.warn('[TabGraveyard AI] No LanguageModel factory available');
    return null;
  }

  // Attempt 1: Standard options with language specification
  try {
    const sessionOpts: any = {
      expectedInputs: [{ type: 'text', languages: ['en'] }],
      expectedOutputs: [{ type: 'text', languages: ['en'] }],
    };

    if (options.signal) {
      sessionOpts.signal = options.signal;
    }

    if (options.monitor) {
      sessionOpts.monitor = options.monitor;
    }

    if (options.systemPrompt) {
      sessionOpts.initialPrompts = [
        { role: 'system', content: options.systemPrompt },
      ];
      sessionOpts.systemPrompt = options.systemPrompt;
    }

    if (typeof options.temperature === 'number' && typeof options.topK === 'number') {
      sessionOpts.temperature = options.temperature;
      sessionOpts.topK = options.topK;
    }

    const session = await factory.create(sessionOpts);
    return session as AILanguageModelSession;
  } catch (err1) {
    console.warn('[TabGraveyard AI] factory.create with options failed, retrying minimal create():', err1);
  }

  // Attempt 2: Minimal create with only signal (for broader Chrome version compatibility)
  try {
    const minimalOpts: any = {};
    if (options.signal) minimalOpts.signal = options.signal;
    const session = await factory.create(minimalOpts);
    return session as AILanguageModelSession;
  } catch (err2) {
    console.error('[TabGraveyard AI] factory.create minimal failed:', err2);
    return null;
  }
}

/** Sequential queue so multiple concurrent prompts don't collide or time out on device */
let currentPromptChain: Promise<any> = Promise.resolve();

async function runExclusiveTask<T>(task: () => Promise<T>): Promise<T> {
  const previous = currentPromptChain;
  let resolveCurrent: () => void;
  currentPromptChain = new Promise<void>((resolve) => {
    resolveCurrent = resolve;
  });

  try {
    await previous.catch(() => {});
    return await task();
  } finally {
    resolveCurrent!();
  }
}

/**
 * Executes a prompt against Gemini Nano with timeout and returns string output.
 */
export async function promptText(
  prompt: string,
  options: {
    systemPrompt?: string;
    timeoutMs?: number;
    temperature?: number;
    topK?: number;
  } = {},
): Promise<string | null> {
  return runExclusiveTask(async () => {
    const timeoutMs = options.timeoutMs ?? 25000; // 25s for local GPU/CPU inference
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn('[TabGraveyard AI] promptText timed out after', timeoutMs, 'ms');
      controller.abort();
    }, timeoutMs);

    let session: AILanguageModelSession | null = null;
    try {
      session = await createLanguageModelSession({
        systemPrompt: options.systemPrompt,
        temperature: options.temperature,
        topK: options.topK,
        signal: controller.signal,
      });

      if (!session) {
        console.warn('[TabGraveyard AI] Could not create session for prompt');
        return null;
      }

      // Prepend system prompt if session didn't support initialPrompts
      let fullPrompt = prompt;
      if (options.systemPrompt) {
        fullPrompt = `${options.systemPrompt}\n\nTask:\n${prompt}`;
      }

      console.log('[TabGraveyard AI] Prompting Gemini Nano...');
      const response = await session.prompt(fullPrompt, {
        signal: controller.signal,
      });

      console.log('[TabGraveyard AI] Prompt succeeded:', response);
      return (response || '').trim();
    } catch (err) {
      console.error('[TabGraveyard AI] promptText error:', err);
      return null;
    } finally {
      clearTimeout(timeoutId);
      if (session && typeof session.destroy === 'function') {
        try {
          session.destroy();
        } catch {
          // Ignored
        }
      }
    }
  });
}

/**
 * Extracts JSON from model output string, handling markdown fences or leading/trailing text.
 */
export function extractJsonFromText<T>(rawText: string): T | null {
  if (!rawText) return null;

  // 1. Direct parse attempt
  try {
    return JSON.parse(rawText.trim()) as T;
  } catch {
    // Continue to markdown extraction
  }

  // 2. Extract from markdown code fences: ```json ... ```
  const codeBlockMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1].trim()) as T;
    } catch {
      // Continue
    }
  }

  // 3. Extract outermost [ ... ] or { ... }
  const arrayMatch = rawText.match(/(\[[\s\S]*\])/);
  if (arrayMatch && arrayMatch[1]) {
    try {
      return JSON.parse(arrayMatch[1].trim()) as T;
    } catch {
      // Continue
    }
  }

  const objectMatch = rawText.match(/(\{[\s\S]*\})/);
  if (objectMatch && objectMatch[1]) {
    try {
      return JSON.parse(objectMatch[1].trim()) as T;
    } catch {
      // Continue
    }
  }

  return null;
}

/**
 * Prompts Gemini Nano requesting structured JSON output conforming to a schema.
 */
export async function promptWithJsonSchema<T>(
  prompt: string,
  schema: any,
  options: {
    systemPrompt?: string;
    timeoutMs?: number;
    temperature?: number;
    topK?: number;
  } = {},
): Promise<T | null> {
  return runExclusiveTask(async () => {
    const timeoutMs = options.timeoutMs ?? 30000; // 30s timeout for clustering
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn('[TabGraveyard AI] promptWithJsonSchema timed out after', timeoutMs, 'ms');
      controller.abort();
    }, timeoutMs);

    let session: AILanguageModelSession | null = null;
    try {
      session = await createLanguageModelSession({
        systemPrompt: options.systemPrompt,
        temperature: options.temperature ?? 0.2, // Low temperature for deterministic JSON output
        topK: options.topK ?? 1,
        signal: controller.signal,
      });

      if (!session) {
        console.warn('[TabGraveyard AI] Could not create session for JSON schema prompt');
        return null;
      }

      let fullPrompt = prompt;
      if (options.systemPrompt) {
        fullPrompt = `${options.systemPrompt}\n\nTask:\n${prompt}`;
      }

      console.log('[TabGraveyard AI] Prompting for JSON schema...');
      let rawResponse: string = '';

      if (schema) {
        try {
          rawResponse = await session.prompt(fullPrompt, {
            signal: controller.signal,
            responseConstraint: schema,
          });
        } catch (schemaErr) {
          console.warn('[TabGraveyard AI] responseConstraint failed, retrying standard prompt:', schemaErr);
          rawResponse = await session.prompt(fullPrompt, {
            signal: controller.signal,
          });
        }
      } else {
        rawResponse = await session.prompt(fullPrompt, {
          signal: controller.signal,
        });
      }

      console.log('[TabGraveyard AI] Raw response for schema:', rawResponse);
      const parsed = extractJsonFromText<T>(rawResponse);
      if (!parsed) {
        console.warn('[TabGraveyard AI] Failed to parse JSON from response:', rawResponse);
      }
      return parsed;
    } catch (err) {
      console.error('[TabGraveyard AI] promptWithJsonSchema error:', err);
      return null;
    } finally {
      clearTimeout(timeoutId);
      if (session && typeof session.destroy === 'function') {
        try {
          session.destroy();
        } catch {
          // Ignored
        }
      }
    }
  });
}
