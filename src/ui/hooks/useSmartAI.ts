/**
 * src/ui/hooks/useSmartAI.ts
 *
 * React Hook providing access to Phase 9 Chrome Prompt API (Gemini Nano) smart groupings.
 * Decouples async AI inference from UI rendering.
 *
 * Features:
 * - Detects AI availability on mount
 * - Provides non-blocking smart session titling, topic clustering, and archetype analysis
 * - Maintains loading and error states with bulletproof fallback
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { TabRecord } from '../../core/db';
import { db } from '../../core/db';
import type { TabViewModel, TabArchetype } from '../../core/behavior';
import { type TemporalSession, getSessionHash } from '../../core/sessionUtils';
import type { TopicCluster } from '../../core/topicUtils';
import {
  checkAIAvailability,
  inferSmartSessionTitle,
  inferSmartTopics,
  inferSmartArchetypeAnalysis,
  type AIAvailabilityStatus,
} from '../../core/ai';

export interface UseSmartAIReturn {
  aiStatus: AIAvailabilityStatus;
  isAiAvailable: boolean;

  // Temporal Sessions
  sessionTitles: Record<string, { title: string; isAi: boolean }>;
  loadingSessions: Record<string, boolean>;
  enhanceSessionTitle: (session: TemporalSession) => Promise<void>;
  manuallyRenameSession: (session: TemporalSession, newTitle: string) => Promise<void>;

  // Forgotten Interests (Topics)
  smartTopics: TopicCluster[] | null;
  isLoadingTopics: boolean;
  enhanceTopics: (tabs: TabRecord[]) => Promise<void>;
  removeSmartTopic: (topicId: string) => Promise<void>;

  // Behavioral Mirror
  archetypeInsights: Record<string, { quote: string; isAi: boolean }>;
  loadingArchetypes: Record<string, boolean>;
  enhanceArchetype: (
    archetypeId: TabArchetype | string,
    tabs: (TabRecord | TabViewModel)[],
    themeTagline?: string,
  ) => Promise<void>;
}

export function useSmartAI(): UseSmartAIReturn {
  const [aiStatus, setAiStatus] = useState<AIAvailabilityStatus>('unavailable');

  // Track session titles by session ID
  const [sessionTitles, setSessionTitles] = useState<
    Record<string, { title: string; isAi: boolean }>
  >({});
  const [loadingSessions, setLoadingSessions] = useState<Record<string, boolean>>({});

  // Track smart topics
  const [smartTopics, setSmartTopics] = useState<TopicCluster[] | null>(null);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);

  // Track archetype insights
  const [archetypeInsights, setArchetypeInsights] = useState<
    Record<string, { quote: string; isAi: boolean }>
  >({});
  const [loadingArchetypes, setLoadingArchetypes] = useState<Record<string, boolean>>({});

  // Deduplication refs
  const enhancedSessionIds = useRef(new Set<string>());
  const enhancedArchetypeIds = useRef(new Set<string>());

  // Check availability and preload cached AI responses from DB on mount
  useEffect(() => {
    let mounted = true;

    checkAIAvailability().then((status) => {
      if (mounted) setAiStatus(status);
    });

    // Restore cached session titles and smart topics from IndexedDB
    db.aiCache
      .toArray()
      .then((records) => {
        if (!mounted) return;
        const loadedTitles: Record<string, { title: string; isAi: boolean }> = {};
        let loadedTopics: TopicCluster[] | null = null;

        for (const r of records) {
          if (r.key.startsWith('session:')) {
            const sessId = r.key.slice('session:'.length);
            const cleanTitle = typeof r.value === 'string' ? r.value.replace(/\s*\(\d+\s*tabs?\)\s*$/i, '').trim() : r.value;
            loadedTitles[sessId] = { title: cleanTitle, isAi: true };
            enhancedSessionIds.current.add(sessId);
          } else if (r.key.startsWith('session_hash:')) {
            const sessHash = r.key.slice('session_hash:'.length);
            const cleanTitle = typeof r.value === 'string' ? r.value.replace(/\s*\(\d+\s*tabs?\)\s*$/i, '').trim() : r.value;
            loadedTitles[sessHash] = { title: cleanTitle, isAi: true };
            enhancedSessionIds.current.add(sessHash);
          } else if (r.key === 'clusters:latest' && Array.isArray(r.value)) {
            loadedTopics = r.value;
          }
        }

        if (Object.keys(loadedTitles).length > 0) {
          setSessionTitles((prev) => ({ ...loadedTitles, ...prev }));
        }
        if (loadedTopics) {
          setSmartTopics(loadedTopics);
        }
      })
      .catch(() => {
        // Ignored
      });

    return () => {
      mounted = false;
    };
  }, []);

  const isAiAvailable = aiStatus === 'available' || aiStatus === 'downloadable';

  // Enhance a temporal session's title (checks DB cache first)
  const enhanceSessionTitle = useCallback(
    async (session: TemporalSession) => {
      const sessHash = getSessionHash(session.tabs);
      if (
        enhancedSessionIds.current.has(session.id) ||
        enhancedSessionIds.current.has(sessHash)
      ) {
        return;
      }
      enhancedSessionIds.current.add(session.id);
      enhancedSessionIds.current.add(sessHash);

      // 1. Check DB cache
      try {
        const cached =
          (await db.getAICache<string>('session:' + session.id)) ||
          (await db.getAICache<string>('session_hash:' + sessHash));

        if (cached) {
          const cleanCached = typeof cached === 'string' ? cached.replace(/\s*\(\d+\s*tabs?\)\s*$/i, '').trim() : cached;
          setSessionTitles((prev) => ({
            ...prev,
            [session.id]: { title: cleanCached, isAi: true },
            [sessHash]: { title: cleanCached, isAi: true },
          }));
          return;
        }
      } catch {
        // Continue to AI inference
      }

      // 2. Run AI inference
      setLoadingSessions((prev) => ({ ...prev, [session.id]: true }));
      try {
        const result = await inferSmartSessionTitle(session.tabs);
        setSessionTitles((prev) => ({
          ...prev,
          [session.id]: { title: result.title, isAi: result.isAiGenerated },
          [sessHash]: { title: result.title, isAi: result.isAiGenerated },
        }));
        // 3. Persist to DB if AI generated
        if (result.isAiGenerated) {
          await db.setAICache('session:' + session.id, result.title);
          await db.setAICache('session_hash:' + sessHash, result.title);
        }
      } catch {
        // Ignored
      } finally {
        setLoadingSessions((prev) => ({ ...prev, [session.id]: false }));
      }
    },
    [],
  );

  // Manually rename a temporal session
  const manuallyRenameSession = useCallback(
    async (session: TemporalSession, newTitle: string) => {
      const trimmed = newTitle.trim();
      if (!trimmed) return;
      const sessHash = getSessionHash(session.tabs);
      setSessionTitles((prev) => ({
        ...prev,
        [session.id]: { title: trimmed, isAi: false },
        [sessHash]: { title: trimmed, isAi: false },
      }));
      await db.setAICache('session:' + session.id, trimmed);
      await db.setAICache('session_hash:' + sessHash, trimmed);
    },
    [],
  );

  // Enhance graveyard topics (and persist to DB)
  const enhanceTopics = useCallback(async (tabs: TabRecord[]) => {
    if (!tabs || tabs.length < 2) return;
    setIsLoadingTopics(true);
    try {
      const result = await inferSmartTopics(tabs);
      if (result.isAiGenerated && result.topics.length > 0) {
        setSmartTopics(result.topics);
        await db.setAICache('clusters:latest', result.topics);
      }
    } catch {
      // Ignored
    } finally {
      setIsLoadingTopics(false);
    }
  }, []);

  // Enhance an archetype's analysis quote
  const enhanceArchetype = useCallback(
    async (
      archetypeId: TabArchetype | string,
      tabs: (TabRecord | TabViewModel)[],
      themeTagline?: string,
    ) => {
      if (enhancedArchetypeIds.current.has(archetypeId)) return;
      enhancedArchetypeIds.current.add(archetypeId);

      setLoadingArchetypes((prev) => ({ ...prev, [archetypeId]: true }));
      try {
        const result = await inferSmartArchetypeAnalysis(archetypeId, tabs, themeTagline);
        setArchetypeInsights((prev) => ({
          ...prev,
          [archetypeId]: { quote: result.insight, isAi: result.isAiGenerated },
        }));
      } catch {
        // Ignored
      } finally {
        setLoadingArchetypes((prev) => ({ ...prev, [archetypeId]: false }));
      }
    },
    [],
  );

  const removeSmartTopic = useCallback(async (topicId: string) => {
    setSmartTopics((prev) => {
      if (!prev) return null;
      const updated = prev.filter((t) => t.id !== topicId);
      db.setAICache('clusters:latest', updated.length > 0 ? updated : []);
      return updated.length > 0 ? updated : null;
    });
  }, []);

  return {
    aiStatus,
    isAiAvailable,
    sessionTitles,
    loadingSessions,
    enhanceSessionTitle,
    manuallyRenameSession,
    smartTopics,
    isLoadingTopics,
    enhanceTopics,
    removeSmartTopic,
    archetypeInsights,
    loadingArchetypes,
    enhanceArchetype,
  };
}
