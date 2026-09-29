/**
 * src/core/topicUtils.ts
 *
 * Phase 8: Graveyard Topics & Local Statistics.
 * Pure data layer. Zero JSX. Zero UI imports.
 *
 * Analyzes buried tabs' Titles, URLs, and Domains to extract keyword frequencies,
 * cluster related tabs into automatic topic folders ("Forgotten Interests"),
 * and compute local browsing/graveyard statistics.
 */

import { TabRecord } from './db';
import { TabViewModel } from './behavior';

export interface TopicCluster {
  id: string;
  name: string;
  icon: string;
  keywords: string[];
  tabs: (TabRecord | TabViewModel)[];
  count: number;
  totalActiveTime: number;
}

export interface GraveyardLocalStats {
  totalBuried: number;
  totalActiveTime: number;
  topDomain: string | null;
  topTopic: string | null;
  avgDormancyDays: number;
}

// ── Stopwords dictionary ───────────────────────────────────────────────────

const STOP_WORDS = new Set([
  // Common English grammatical stop words
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
  'any', 'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below',
  'between', 'both', 'but', 'by', 'can', 'could', 'did', 'do', 'does', 'doing',
  'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have',
  'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how',
  'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more',
  'most', 'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once',
  'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same',
  'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through',
  'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when',
  'where', 'which', 'while', 'who', 'whom', 'why', 'will', 'with', 'would', 'you',
  'your', 'yours', 'yourself', 'yourselves',

  // Web, browser & site boilerplate stop words
  'http', 'https', 'www', 'com', 'org', 'net', 'io', 'co', 'dev', 'ai', 'app',
  'html', 'htm', 'php', 'aspx', 'jsp', 'index', 'page', 'post', 'article', 'edit',
  'user', 'users', 'login', 'logout', 'signin', 'signup', 'register', 'home',
  'official', 'website', 'site', 'view', 'overview', 'guide', 'tutorial', 'docs',
  'documentation', 'doc', 'api', 'reference', 'learn', 'getting', 'started',
  'readme', 'blog', 'release', 'releases', 'search', 'query', 'google', 'youtube',
  'twitter', 'x', 'github', 'reddit', 'wikipedia', 'medium', 'stackoverflow',
  'free', 'best', 'new', 'online', 'untitled', 'encounter', 'chrome', 'extension',
  'undefined', 'null', 'tab', 'tabs',
]);

// Thematic domain to topic mappings
const DOMAIN_HINTS: Record<string, { name: string; icon: string; keywords: string[] }> = {
  'github.com':         { name: 'Code & Repositories', icon: '💻', keywords: ['github', 'repo', 'code', 'commit'] },
  'stackoverflow.com':  { name: 'Engineering Q&A',    icon: '🛠️', keywords: ['stackoverflow', 'solution', 'bug', 'debug'] },
  'arxiv.org':          { name: 'Research Papers',    icon: '📜', keywords: ['arxiv', 'paper', 'research', 'study'] },
  'figma.com':          { name: 'Design & UI/UX',     icon: '🎨', keywords: ['figma', 'design', 'ui', 'prototype'] },
  'youtube.com':        { name: 'Video & Media',       icon: '🎬', keywords: ['youtube', 'video', 'watch', 'media'] },
  'reddit.com':         { name: 'Community & Forums', icon: '💬', keywords: ['reddit', 'discussion', 'forum', 'thread'] },
  'news.ycombinator.com': { name: 'Hacker News',      icon: '⚡', keywords: ['hackernews', 'tech', 'startups'] },
  'wikipedia.org':      { name: 'Encyclopedia',       icon: '📖', keywords: ['wikipedia', 'wiki', 'reference'] },
  'developer.mozilla.org': { name: 'Web Standards (MDN)', icon: '🌐', keywords: ['mdn', 'web', 'javascript', 'css'] },
};

/**
 * Tokenize a title, url, or domain into clean alphanumeric keywords
 */
export function extractKeywords(text: string): string[] {
  if (!text) return [];

  // Replace punctuation, slashes, dashes with spaces, split camelCase
  const clean = text
    .replace(/([a-z])([A-Z])/g, '$1 $2') // split camelCase
    .replace(/[_\-/.?:#&=+%,;!|()[\]{}'"<>]/g, ' ')
    .toLowerCase();

  const rawTokens = clean.split(/\s+/);
  const keywords: string[] = [];

  for (const token of rawTokens) {
    const trimmed = token.trim();
    // Keep words with at least 3 letters, non-numeric, not a stop word
    if (trimmed.length >= 3 && !/^\d+$/.test(trimmed) && !STOP_WORDS.has(trimmed)) {
      keywords.push(trimmed);
    }
  }

  return keywords;
}

/**
 * Extracts bigrams (2-word phrases) from tokens
 */
export function extractBigrams(tokens: string[]): string[] {
  const bigrams: string[] = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    const pair = `${tokens[i]} ${tokens[i + 1]}`;
    bigrams.push(pair);
  }
  return bigrams;
}

/**
 * Capitalizes string nicely for topic names
 */
function formatTopicName(raw: string): string {
  return raw
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Pick an emoji icon based on topic keyword signals
 */
function pickTopicIcon(keywords: string[]): string {
  const joined = keywords.join(' ');
  if (/code|git|dev|react|vue|node|rust|go|python|api|sql|database|wasm/i.test(joined)) return '💻';
  if (/ai|model|llm|neural|gpt|ml|learning|data|tensor|agent/i.test(joined)) return '🧠';
  if (/design|ui|ux|css|font|color|figma|canvas|svg/i.test(joined)) return '🎨';
  if (/crypto|btc|eth|sol|token|blockchain|wallet|coin/i.test(joined)) return '🪙';
  if (/music|audio|song|sound|spotify|album/i.test(joined)) return '🎵';
  if (/game|gaming|steam|rpg|quest|play/i.test(joined)) return '🎮';
  if (/book|read|paper|arxiv|doc|wiki|history|philosophy/i.test(joined)) return '📜';
  if (/shop|price|buy|amazon|cart|store/i.test(joined)) return '🛒';
  if (/travel|flight|hotel|map|trip/i.test(joined)) return '✈️';
  if (/health|fit|workout|food|recipe|diet/i.test(joined)) return '🥗';
  if (/chat|forum|discuss|reddit|social|community/i.test(joined)) return '💬';
  return '📁';
}

/**
 * Clusters a list of tabs into automatic Topic Folders ("Forgotten Interests")
 * based on keyword frequency across title, domain, and URL.
 */
export function clusterTabsByTopics(
  tabs: (TabRecord | TabViewModel)[],
  minClusterSize: number = 2
): TopicCluster[] {
  if (!tabs || tabs.length === 0) return [];

  // 1. Extract keyword bag for each tab
  const tabKeywords = tabs.map((t) => {
    const titleTokens = extractKeywords(t.title);
    const domainTokens = extractKeywords(t.domain);
    const urlTokens = extractKeywords(t.url);

    // Combine unique tokens
    const allTokens = Array.from(new Set([...titleTokens, ...domainTokens, ...urlTokens]));
    const bigrams = extractBigrams(titleTokens);

    return {
      tab: t,
      tokens: allTokens,
      bigrams,
    };
  });

  // 2. Count frequency of bigrams and unigrams across distinct tabs
  const phraseDocCount: Record<string, number> = {};
  const unigramDocCount: Record<string, number> = {};

  for (const item of tabKeywords) {
    const seenPhrases = new Set<string>();
    for (const bg of item.bigrams) {
      if (!seenPhrases.has(bg)) {
        seenPhrases.add(bg);
        phraseDocCount[bg] = (phraseDocCount[bg] || 0) + 1;
      }
    }

    const seenUnigrams = new Set<string>();
    for (const ug of item.tokens) {
      if (!seenUnigrams.has(ug)) {
        seenUnigrams.add(ug);
        unigramDocCount[ug] = (unigramDocCount[ug] || 0) + 1;
      }
    }
  }

  // 3. Select candidate topic seeds (bigrams with count >= minClusterSize, or top unigrams)
  interface TopicCandidate {
    phrase: string;
    isBigram: boolean;
    count: number;
  }

  const candidates: TopicCandidate[] = [];

  for (const [phrase, count] of Object.entries(phraseDocCount)) {
    if (count >= minClusterSize) {
      candidates.push({ phrase, isBigram: true, count });
    }
  }

  for (const [word, count] of Object.entries(unigramDocCount)) {
    if (count >= minClusterSize) {
      candidates.push({ phrase: word, isBigram: false, count });
    }
  }

  // Sort candidates by count desc, then prefer bigrams
  candidates.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    if (a.isBigram && !b.isBigram) return -1;
    if (!a.isBigram && b.isBigram) return 1;
    return a.phrase.localeCompare(b.phrase);
  });

  // 4. Form clusters without duplicate overlapping words
  const clusters: TopicCluster[] = [];
  const assignedTabUrls = new Set<string>();
  const usedKeyTokens = new Set<string>();

  for (const candidate of candidates) {
    const candTokens = candidate.phrase.split(' ');
    // If all tokens of this candidate are already heavily used in earlier clusters, skip
    if (candTokens.every((t) => usedKeyTokens.has(t))) continue;

    // Collect tabs that match this topic candidate
    const matchingTabs: (TabRecord | TabViewModel)[] = [];

    for (const item of tabKeywords) {
      const match = candidate.isBigram
        ? item.bigrams.includes(candidate.phrase)
        : item.tokens.includes(candidate.phrase);

      if (match) {
        matchingTabs.push(item.tab);
      }
    }

    if (matchingTabs.length >= minClusterSize) {
      candTokens.forEach((t) => usedKeyTokens.add(t));
      matchingTabs.forEach((t) => assignedTabUrls.add(t.cleanUrl));

      const totalActiveTime = matchingTabs.reduce((acc, t) => acc + (t.totalActiveTime || 0), 0);
      const icon = pickTopicIcon(candTokens);
      const id = 'topic_' + candidate.phrase.replace(/\s+/g, '_');

      clusters.push({
        id,
        name: formatTopicName(candidate.phrase),
        icon,
        keywords: candTokens,
        tabs: matchingTabs,
        count: matchingTabs.length,
        totalActiveTime,
      });
    }

    // Limit to top 8 distinct topic clusters for clean UI presentation
    if (clusters.length >= 8) break;
  }

  // 5. Check if domain hints can cluster remaining unassigned tabs
  for (const [dom, hint] of Object.entries(DOMAIN_HINTS)) {
    const unassignedMatching = tabs.filter(
      (t) => !assignedTabUrls.has(t.cleanUrl) && t.domain.toLowerCase().includes(dom)
    );

    if (unassignedMatching.length >= minClusterSize) {
      unassignedMatching.forEach((t) => assignedTabUrls.add(t.cleanUrl));
      const totalActiveTime = unassignedMatching.reduce((acc, t) => acc + (t.totalActiveTime || 0), 0);

      clusters.push({
        id: 'topic_domain_' + dom.replace(/[^a-z0-9]/g, '_'),
        name: hint.name,
        icon: hint.icon,
        keywords: hint.keywords,
        tabs: unassignedMatching,
        count: unassignedMatching.length,
        totalActiveTime,
      });
    }
  }

  // Sort final clusters by tab count descending
  clusters.sort((a, b) => b.count - a.count);

  return clusters;
}

/**
 * Calculates aggregate local statistics for buried tabs
 */
export function computeGraveyardStats(
  buriedTabs: (TabRecord | TabViewModel)[],
  clusters: TopicCluster[]
): GraveyardLocalStats {
  const totalBuried = buriedTabs.length;
  if (totalBuried === 0) {
    return {
      totalBuried: 0,
      totalActiveTime: 0,
      topDomain: null,
      topTopic: null,
      avgDormancyDays: 0,
    };
  }

  const totalActiveTime = buriedTabs.reduce((acc, t) => acc + (t.totalActiveTime || 0), 0);

  // Top domain
  const domainCounts: Record<string, number> = {};
  for (const t of buriedTabs) {
    if (t.domain) {
      domainCounts[t.domain] = (domainCounts[t.domain] || 0) + 1;
    }
  }

  let topDomain: string | null = null;
  let maxDomainCount = 0;
  for (const [d, count] of Object.entries(domainCounts)) {
    if (count > maxDomainCount) {
      maxDomainCount = count;
      topDomain = d;
    }
  }

  // Top topic
  const topTopic = clusters.length > 0 ? `${clusters[0].icon} ${clusters[0].name}` : null;

  // Average dormancy days before death
  const now = Date.now();
  const totalDormancyMs = buriedTabs.reduce((acc, t) => acc + Math.max(0, now - t.lastActivatedAt), 0);
  const avgDormancyDays = Math.round(totalDormancyMs / (totalBuried * 24 * 60 * 60 * 1000));

  return {
    totalBuried,
    totalActiveTime,
    topDomain,
    topTopic,
    avgDormancyDays,
  };
}
