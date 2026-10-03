/**
 * src/core/ai/smartGroupings.ts
 *
 * Phase 9: AI-Powered Smart Groupings (Temporal Sessions, Forgotten Interests, Behavioral Mirror).
 * Pure TypeScript. Zero React. Zero UI styling.
 *
 * Provides semantic analysis via Chrome's Prompt API (Gemini Nano) with
 * instantaneous, bulletproof fallback to Phase 1-8 deterministic heuristics.
 */

import type { TabRecord, TombstoneTabItem } from '../db';
import type { TabViewModel, TabArchetype } from '../behavior';
import { ARCHETYPE_META } from '../behavior';
import { generateTombstoneTitle } from '../tombstoneUtils';
import { clusterTabsByTopics, type TopicCluster } from '../topicUtils';
import { promptText, promptWithJsonSchema } from './promptApi';
import type {
  SmartSessionTitleResult,
  SmartArchetypeInsight,
  SmartTopicClusteringResult,
} from './types';

/**
 * Strips title and domain to clean, compact representation for prompt token efficiency.
 */
function summarizeTabForPrompt(tab: TabRecord | TombstoneTabItem | TabViewModel): string {
  const domain = tab.domain || 'web';
  const cleanTitle = (tab.title || '')
    .replace(/[^\w\s-.,!?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60);
  return cleanTitle ? `[${domain}] ${cleanTitle}` : `[${domain}]`;
}

/**
 * Generates an AI semantic title for a temporal session or tombstone bundle.
 * Falls back to `generateTombstoneTitle(tabs)` if Prompt API is unavailable or times out.
 *
 * Example AI output: "React Performance & Vite Bundling" instead of "github.com & stackoverflow.com (5 tabs)"
 */
export async function inferSmartSessionTitle(
  tabs: (TabRecord | TombstoneTabItem)[],
): Promise<SmartSessionTitleResult> {
  const fallbackTitle = generateTombstoneTitle(tabs);
  if (!tabs || tabs.length === 0) {
    return { title: fallbackTitle, isAiGenerated: false };
  }

  // Squeeze top 8 most informative tabs to keep context tokens minimal and inference fast
  const sample = tabs.slice(0, 8).map(summarizeTabForPrompt).join('\n');

  const systemPrompt =
    'You are a browser task summarizer. Return ONLY a concise, high-level task title (3 to 6 words) describing the common activity or topic of the provided browser tabs. Do not include quotes, markdown, prefixes, or conversational filler.';

  const userPrompt = `Summarize the browsing session represented by these open tabs into a short descriptive title:\n${sample}`;

  try {
    const aiTitle = await promptText(userPrompt, {
      systemPrompt,
      timeoutMs: 25000,
      temperature: 0.2,
      topK: 1,
    });

    if (aiTitle) {
      // Extract first meaningful line
      const firstLine = aiTitle
        .split('\n')
        .map((l) => l.trim().replace(/^["'`*#:\s-]+|["'`*#:\s-]+$/g, ''))
        .find((l) => l.length >= 2);

      if (firstLine && firstLine.length >= 2 && firstLine.length <= 80) {
        const cleanTitle = firstLine.replace(/\s*\(\d+\s*tabs?\)\s*$/i, '').trim();
        return {
          title: cleanTitle,
          isAiGenerated: true,
        };
      }
    }
  } catch (err) {
    console.warn('[TabGraveyard AI] inferSmartSessionTitle failed, falling back:', err);
  }

  return { title: fallbackTitle, isAiGenerated: false };
}

interface RawAiTopicCluster {
  name: string;
  icon?: string;
  keywords?: string[];
  tabUrls?: string[];
}

/**
 * Semantically clusters buried tabs into high-level interest topics using Gemini Nano.
 * Falls back to frequency-based `clusterTabsByTopics` if Prompt API fails or times out.
 */
export async function inferSmartTopics(
  tabs: TabRecord[],
): Promise<SmartTopicClusteringResult> {
  const fallbackTopics = clusterTabsByTopics(tabs);
  if (!tabs || tabs.length < 2) {
    return { topics: fallbackTopics, isAiGenerated: false };
  }

  // Squeeze 8 to 12 most active tabs to keep prompt tiny and lightning fast
  const sample = tabs.slice(0, 12);
  const titlesList = sample.map((t) => summarizeTabForPrompt(t)).join('\n');

  const systemPrompt =
    'You are a semantic topic classifier. Group the provided browser tabs into 2 to 4 concise topic categories. Output exactly one line per category in the format: Emoji - Category Name. Example:\n⚛️ - Frontend & React\n☁️ - Cloud & DevOps\nDo not output any introductory or conversational text.';

  const userPrompt = `Classify these browser tabs into 2 to 4 categories:\n${titlesList}`;

  try {
    const aiOutput = await promptText(userPrompt, {
      systemPrompt,
      timeoutMs: 20000,
      temperature: 0.2,
      topK: 1,
    });

    if (aiOutput) {
      const lines = aiOutput
        .split('\n')
        .map((l) => l.trim().replace(/^[-*#\s]+/, ''))
        .filter((l) => l.length >= 3);

      const parsedCategories: { icon: string; name: string }[] = [];

      for (const line of lines) {
        // Match emoji and name: e.g. "⚛️ - React Frontend" or "⚛️ React Frontend"
        const emojiMatch = line.match(/^([\p{Emoji}\u200d\uFE0F]+|\S+)\s*[-:]?\s*(.+)$/u);
        if (emojiMatch && emojiMatch[2]) {
          const icon = emojiMatch[1].length <= 4 ? emojiMatch[1] : '🧠';
          const name = emojiMatch[2].trim().slice(0, 32);
          if (name.length >= 2) {
            parsedCategories.push({ icon, name });
          }
        } else {
          parsedCategories.push({ icon: '🧠', name: line.slice(0, 32) });
        }
      }

      if (parsedCategories.length > 0) {
        const smartTopics: TopicCluster[] = [];
        const assignedUrls = new Set<string>();

        parsedCategories.forEach((cat, idx) => {
          // Find matching tabs based on keywords in category name
          const catKeywords = cat.name
            .toLowerCase()
            .split(/[\s,&/-]+/)
            .filter((w) => w.length >= 3 && !['and', 'for', 'the', 'with'].includes(w));

          const matchedTabs: TabRecord[] = [];
          for (const tab of tabs) {
            if (assignedUrls.has(tab.cleanUrl)) continue;
            const tabText = `${tab.title} ${tab.domain}`.toLowerCase();
            const matches = catKeywords.some((kw) => tabText.includes(kw));
            if (matches) {
              assignedUrls.add(tab.cleanUrl);
              matchedTabs.push(tab);
            }
          }

          if (matchedTabs.length > 0) {
            const totalActiveTime = matchedTabs.reduce(
              (sum, t) => sum + (t.totalActiveTime || 0),
              0,
            );
            smartTopics.push({
              id: `ai-topic-${idx + 1}-${cat.name.toLowerCase().replace(/[^\w]/g, '-')}`,
              name: cat.name,
              icon: cat.icon,
              keywords: catKeywords.length > 0 ? catKeywords : [cat.name.toLowerCase()],
              tabs: matchedTabs,
              count: matchedTabs.length,
              totalActiveTime,
            });
          }
        });

        if (smartTopics.length > 0) {
          smartTopics.sort((a, b) => b.count - a.count);
          console.log('[TabGraveyard AI] Smart topics generated successfully:', smartTopics.length);
          return { topics: smartTopics, isAiGenerated: true };
        }
      }
    }
  } catch (err) {
    console.warn('[TabGraveyard AI] inferSmartTopics failed, falling back:', err);
  }

  return { topics: fallbackTopics, isAiGenerated: false };
}

/**
 * Generates an insightful, witty AI behavioral observation for an archetype.
 * Falls back to the pre-configured quote in `ARCHETYPE_META[archetypeId].quote`.
 */
export async function inferSmartArchetypeAnalysis(
  archetypeId: TabArchetype | string,
  tabs: (TabRecord | TabViewModel)[],
  themeTagline?: string,
): Promise<SmartArchetypeInsight> {
  const fallbackQuote =
    (ARCHETYPE_META as any)[archetypeId]?.quote ||
    '* Tabs hoarded and left to the passage of time.';

  if (!tabs || tabs.length === 0) {
    return { archetypeId, insight: fallbackQuote, isAiGenerated: false };
  }

  const sample = tabs.slice(0, 5).map(summarizeTabForPrompt).join('; ');
  const archName = (ARCHETYPE_META as any)[archetypeId]?.name || archetypeId;

  const systemPrompt =
    'You are a witty, observational browser psychologist. In exactly 1 sentence (under 25 words), give a personalized, humorous, and empathetic diagnosis of the user\'s tab-hoarding habit based on their tabs. Start with an asterisk "* ".';

  const userPrompt = `User behavior archetype: ${archName} (${archetypeId}).\nTheme context: ${themeTagline || 'RPG digital afterlife'}.\nSamples of hoarded tabs: ${sample}\nProvide a 1-sentence observational diagnosis:`;

  try {
    const aiInsight = await promptText(userPrompt, {
      systemPrompt,
      timeoutMs: 25000,
      temperature: 0.7, // slightly creative for witty quotes
      topK: 40,
    });

    if (aiInsight) {
      const firstLine = aiInsight
        .split('\n')
        .map((l) => l.trim().replace(/^["'`#\s-]+|["'`#\s-]+$/g, ''))
        .find((l) => l.length >= 5);

      if (firstLine && firstLine.length >= 5 && firstLine.length <= 250) {
        let cleaned = firstLine;
        if (!cleaned.startsWith('*')) {
          cleaned = `* ${cleaned}`;
        }
        console.log('[TabGraveyard AI] Smart archetype insight generated:', cleaned);
        return { archetypeId, insight: cleaned, isAiGenerated: true };
      }
    }
  } catch (err) {
    console.warn('[TabGraveyard AI] inferSmartArchetypeAnalysis failed, falling back:', err);
  }

  return { archetypeId, insight: fallbackQuote, isAiGenerated: false };
}
