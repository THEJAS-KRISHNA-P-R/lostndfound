import { createClient } from '@/lib/supabase/server'

export type MatchResult = {
  item_id: string
  user_id: string
  title: string
  score: number
}

/**
 * Common stop-words — hoisted outside functions so the Set is created once
 * per module load, not on every function call.
 */
const STOP_WORDS = new Set([
  'the', 'and', 'for', 'was', 'are', 'but', 'not', 'you', 'all',
  'can', 'had', 'her', 'one', 'our', 'out', 'has', 'have', 'from',
  'been', 'some', 'them', 'than', 'its', 'over', 'into', 'just',
  'about', 'that', 'this', 'with', 'also', 'back', 'after', 'would',
  'what', 'where', 'when', 'which', 'there', 'their', 'will', 'each',
  'make', 'like', 'near', 'found', 'lost', 'item', 'think', 'left',
  'color', 'colour', 'black', 'white', 'brown', 'blue', 'red', 'green',
])

/**
 * Extracts meaningful keywords from text by removing common stop-words and
 * returning lowercase tokens of 3+ characters.
 */
function extractKeywords(text: string | undefined | null): string[] {
  if (!text) return []

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length >= 3 && !STOP_WORDS.has(word))
}

/**
 * Counts how many keywords from set A appear in set B.
 */
function keywordOverlap(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0
  const setB = new Set(b)
  return a.filter(word => setB.has(word)).length
}

type ItemInput = {
  title: string
  description?: string
  category_id?: number
  location: string
}

/**
 * Scores a posted item against a candidate item using a weighted system.
 *
 * Scoring:
 *  - Same category:               40 points
 *  - Title keyword overlap:       10 points per keyword (max 30)
 *  - Description keyword overlap:  5 points per keyword (max 20)
 *  - Location keyword overlap:    10 points per keyword (max 10)
 *
 * Maximum possible: 100 points
 * Minimum to qualify: 40 (at least a category match)
 */
function scoreMatch(
  postedItem: { titleKw: string[]; descKw: string[]; locKw: string[]; category_id?: number },
  candidate: { title: string; description: string | null; category_id: number | null; location: string }
): number {
  let score = 0

  // 1. Category match (40 points)
  if (postedItem.category_id && candidate.category_id && postedItem.category_id === candidate.category_id) {
    score += 40
  }

  // 2. Title keyword overlap (10 per keyword, max 30)
  score += Math.min(keywordOverlap(postedItem.titleKw, extractKeywords(candidate.title)) * 10, 30)

  // 3. Description keyword overlap (5 per keyword, max 20)
  score += Math.min(keywordOverlap(postedItem.descKw, extractKeywords(candidate.description)) * 5, 20)

  // 4. Location keyword overlap (10 per keyword, max 10)
  score += Math.min(keywordOverlap(postedItem.locKw, extractKeywords(candidate.location)) * 10, 10)

  return score
}

/**
 * Core matching function — finds items of the opposite type that are similar
 * to the posted item. Excludes items owned by the same user (self-match prevention).
 *
 * @param postedItem  - The item that was just posted
 * @param oppositeType - 'lost' when a found item is posted, 'found' when a lost item is posted
 * @param posterId    - The user who posted the item (to exclude self-matches)
 */
export async function findMatchingItems(
  postedItem: ItemInput,
  oppositeType: 'lost' | 'found',
  posterId: string
): Promise<MatchResult[]> {
  const supabase = await createClient()

  const { data: candidates, error } = await supabase
    .from('items')
    .select('id, user_id, title, description, category_id, location')
    .eq('type', oppositeType)
    .eq('status', 'active')
    .neq('user_id', posterId) // Never match against your own items

  if (error || !candidates || candidates.length === 0) return []

  // Pre-compute posted item keywords once
  const postedKw = {
    titleKw: extractKeywords(postedItem.title),
    descKw: extractKeywords(postedItem.description),
    locKw: extractKeywords(postedItem.location),
    category_id: postedItem.category_id,
  }

  const scored: MatchResult[] = []

  for (const candidate of candidates) {
    const score = scoreMatch(postedKw, candidate)

    if (score >= 40) {
      scored.push({
        item_id: candidate.id,
        user_id: candidate.user_id,
        title: candidate.title,
        score,
      })
    }
  }

  // Sort by score descending and return top 5
  return scored.sort((a, b) => b.score - a.score).slice(0, 5)
}

// ── Convenience aliases (backward-compatible) ──────────────────────────

export async function findMatchingLostItems(item: ItemInput, posterId: string): Promise<MatchResult[]> {
  return findMatchingItems(item, 'lost', posterId)
}

export async function findMatchingFoundItems(item: ItemInput, posterId: string): Promise<MatchResult[]> {
  return findMatchingItems(item, 'found', posterId)
}
