import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  checkAIAvailability,
  promptText,
  promptWithJsonSchema,
  extractJsonFromText,
} from '../core/ai/promptApi';
import {
  inferSmartSessionTitle,
  inferSmartTopics,
  inferSmartArchetypeAnalysis,
} from '../core/ai/smartGroupings';
import type { TabRecord } from '../core/db';

describe('Phase 9: AI Prompt API & Smart Groupings', () => {
  const originalLanguageModel = (globalThis as any).LanguageModel;
  const originalAi = (globalThis as any).ai;

  beforeEach(() => {
    delete (globalThis as any).LanguageModel;
    delete (globalThis as any).ai;
  });

  afterEach(() => {
    (globalThis as any).LanguageModel = originalLanguageModel;
    (globalThis as any).ai = originalAi;
    vi.restoreAllMocks();
  });

  describe('AI Availability Checks', () => {
    it('returns "unavailable" when neither LanguageModel nor window.ai exists', async () => {
      const status = await checkAIAvailability();
      expect(status).toBe('unavailable');
    });

    it('returns "available" when LanguageModel.availability returns "readily"', async () => {
      (globalThis as any).LanguageModel = {
        availability: vi.fn().mockResolvedValue('readily'),
      };
      const status = await checkAIAvailability();
      expect(status).toBe('available');
    });

    it('returns "downloadable" when LanguageModel.availability returns "after-download"', async () => {
      (globalThis as any).LanguageModel = {
        availability: vi.fn().mockResolvedValue('after-download'),
      };
      const status = await checkAIAvailability();
      expect(status).toBe('downloadable');
    });

    it('safely handles exceptions by returning "unavailable"', async () => {
      (globalThis as any).LanguageModel = {
        availability: vi.fn().mockRejectedValue(new Error('GPU context lost')),
      };
      const status = await checkAIAvailability();
      expect(status).toBe('unavailable');
    });
  });

  describe('Prompt Execution & JSON Extraction', () => {
    it('extracts JSON correctly from raw, code fences, and wrapped text', () => {
      expect(extractJsonFromText('{"key":"value"}')).toEqual({ key: 'value' });
      expect(
        extractJsonFromText('Here is the json:\n```json\n{"number":42}\n```\nHope that helps!'),
      ).toEqual({ number: 42 });
      expect(
        extractJsonFromText('Leading words [{"id":1}] trailing words'),
      ).toEqual([{ id: 1 }]);
      expect(extractJsonFromText('Not valid json at all')).toBeNull();
    });

    it('executes promptText successfully with session destroy cleanup', async () => {
      const mockDestroy = vi.fn();
      const mockPrompt = vi.fn().mockResolvedValue('React Architecture Deep Dive');

      (globalThis as any).LanguageModel = {
        availability: vi.fn().mockResolvedValue('readily'),
        create: vi.fn().mockResolvedValue({
          prompt: mockPrompt,
          destroy: mockDestroy,
        }),
      };

      const result = await promptText('Summarize these tabs');
      expect(result).toBe('React Architecture Deep Dive');
      expect(mockPrompt).toHaveBeenCalled();
      expect(mockDestroy).toHaveBeenCalled();
    });

    it('executes promptWithJsonSchema and extracts structured data', async () => {
      const mockDestroy = vi.fn();
      const mockPrompt = vi.fn().mockResolvedValue('```json\n[{"name":"Vite Setup"}]\n```');

      (globalThis as any).LanguageModel = {
        availability: vi.fn().mockResolvedValue('readily'),
        create: vi.fn().mockResolvedValue({
          prompt: mockPrompt,
          destroy: mockDestroy,
        }),
      };

      const result = await promptWithJsonSchema<{ name: string }[]>(
        'Cluster tabs',
        { type: 'array' },
      );
      expect(result).toEqual([{ name: 'Vite Setup' }]);
      expect(mockDestroy).toHaveBeenCalled();
    });
  });

  describe('Smart Groupings with Graceful Fallbacks', () => {
    const mockTabs: TabRecord[] = [
      {
        tabId: 101,
        url: 'https://react.dev/reference/react/useEffect',
        cleanUrl: 'react.dev/reference/react/useEffect',
        title: 'useEffect Reference – React',
        domain: 'react.dev',
        status: 'dead',
        openedAt: Date.now() - 100000,
        lastActivatedAt: Date.now() - 50000,
        totalActiveTime: 120,
        activationCount: 4,
      },
      {
        tabId: 102,
        url: 'https://github.com/facebook/react/issues/1234',
        cleanUrl: 'github.com/facebook/react/issues/1234',
        title: 'Issue with useEffect cleanup – GitHub',
        domain: 'github.com',
        status: 'dead',
        openedAt: Date.now() - 90000,
        lastActivatedAt: Date.now() - 40000,
        totalActiveTime: 85,
        activationCount: 2,
      },
    ];

    it('inferSmartSessionTitle falls back to domain heuristic when AI unavailable', async () => {
      const result = await inferSmartSessionTitle(mockTabs);
      expect(result.isAiGenerated).toBe(false);
      expect(result.title).toContain('react.dev & github.com');
    });

    it('inferSmartSessionTitle returns AI generated summary when available', async () => {
      (globalThis as any).LanguageModel = {
        availability: vi.fn().mockResolvedValue('readily'),
        create: vi.fn().mockResolvedValue({
          prompt: vi.fn().mockResolvedValue('React Hooks Debugging'),
          destroy: vi.fn(),
        }),
      };

      const result = await inferSmartSessionTitle(mockTabs);
      expect(result.isAiGenerated).toBe(true);
      expect(result.title).toBe('React Hooks Debugging');
    });

    it('inferSmartTopics falls back to keyword TF-IDF when AI fails', async () => {
      const result = await inferSmartTopics(mockTabs);
      expect(result.isAiGenerated).toBe(false);
      expect(result.topics.length).toBeGreaterThan(0);
      expect(result.topics[0].keywords).toBeDefined();
    });

    it('inferSmartTopics clusters tabs into semantic categories with AI', async () => {
      (globalThis as any).LanguageModel = {
        availability: vi.fn().mockResolvedValue('readily'),
        create: vi.fn().mockResolvedValue({
          prompt: vi.fn().mockResolvedValue('⚛️ - React & useEffect'),
          destroy: vi.fn(),
        }),
      };

      const result = await inferSmartTopics(mockTabs);
      expect(result.isAiGenerated).toBe(true);
      expect(result.topics.length).toBe(1);
      expect(result.topics[0].name).toBe('React & useEffect');
      expect(result.topics[0].icon).toBe('⚛️');
      expect(result.topics[0].count).toBe(2);
    });

    it('inferSmartArchetypeAnalysis returns witty AI quote or falls back', async () => {
      // 1. Fallback when AI unavailable
      const fallbackResult = await inferSmartArchetypeAnalysis('zombie', mockTabs);
      expect(fallbackResult.isAiGenerated).toBe(false);
      expect(fallbackResult.insight).toContain('*');

      // 2. AI insight when available
      (globalThis as any).LanguageModel = {
        availability: vi.fn().mockResolvedValue('readily'),
        create: vi.fn().mockResolvedValue({
          prompt: vi.fn().mockResolvedValue('* You check useEffect docs daily hoping the hooks will fix themselves.'),
          destroy: vi.fn(),
        }),
      };

      const aiResult = await inferSmartArchetypeAnalysis('zombie', mockTabs);
      expect(aiResult.isAiGenerated).toBe(true);
      expect(aiResult.insight).toBe('* You check useEffect docs daily hoping the hooks will fix themselves.');
    });
  });
});
