import { createClient } from '@/lib/supabase/server'

type MatchResult = {
  item_id: string
  user_id: string
  title: string
  score: number
}

/**
 * Extracts meaningful keywords from text by removing common stop-words and
 * returning lowercase tokens of 3+ characters.
 */
function extractKeywords(text: string | undefined | null): string[] {
  if (!text) return []

  const stopWords = new Set([
    'the', 'and', 'for', 'was', 'are', 'but', 'not', 'you', 'all',
    'can', 'had', 'her', 'one', 'our', 'out', 'has', 'have', 'from',
    'been', 'some', 'them', 'than', 'its', 'over', 'into', 'just',
    'about', 'that', 'this', 'with', 'also', 'back', 'after', 'would',
    'what', 'where', 'when', 'which', 'there', 'their', 'will', 'each',
    'make', 'like', 'near', 'found', 'lost', 'item', 'think', 'left',
  ])

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length >= 3 && !stopWords.has(word))
}

/**
 * Counts how many keywords from set A appear in set B.
 */
function keywordOverlap(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0
  const setB = new Set(b)
  return a.filter(word => setB.has(word)).length
}

/**
 * Compares a newly posted found item against all active lost items and
 * returns the top matches (up to 5) that score above the threshold.
 *
 * Scoring:
 *  - Same category:            40 points
 *  - Title keyword overlap:    10 points per shared keyword (max 30)
 *  - Description keyword overlap: 5 points per shared keyword (max 20)
 *  - Location keyword overlap: 10 points per shared keyword (max 10)
 *
 * Minimum score to qualify: 40 (at least a category match)
 */
export async function findMatchingLostItems(foundItem: {
  title: string
  description?: string
  category_id?: number
  location: string
}): Promise<MatchResult[]> {
  const supabase = await createClient()

  // Fetch all active lost items
  const { data: lostItems, error } = await supabase
    .from('items')
    .select('id, user_id, title, description, category_id, location')
    .eq('type', 'lost')
    .eq('status', 'active')

  if (error || !lostItems || lostItems.length === 0) return []

  const foundTitleKw = extractKeywords(foundItem.title)
  const foundDescKw = extractKeywords(foundItem.description)
  const foundLocKw = extractKeywords(foundItem.location)

  const scored: MatchResult[] = []

  for (const lost of lostItems) {
    let score = 0

    // 1. Category match (40 points)
    if (
      foundItem.category_id &&
      lost.category_id &&
      foundItem.category_id === lost.category_id
    ) {
      score += 40
    }

    // 2. Title keyword overlap (10 per keyword, max 30)
    const lostTitleKw = extractKeywords(lost.title)
    const titleOverlap = keywordOverlap(foundTitleKw, lostTitleKw)
    score += Math.min(titleOverlap * 10, 30)

    // 3. Description keyword overlap (5 per keyword, max 20)
    const lostDescKw = extractKeywords(lost.description)
    const descOverlap = keywordOverlap(foundDescKw, lostDescKw)
    score += Math.min(descOverlap * 5, 20)

    // 4. Location keyword overlap (10 per keyword, max 10)
    const lostLocKw = extractKeywords(lost.location)
    const locOverlap = keywordOverlap(foundLocKw, lostLocKw)
    score += Math.min(locOverlap * 10, 10)

    if (score >= 40) {
      scored.push({
        item_id: lost.id,
        user_id: lost.user_id,
        title: lost.title,
        score,
      })
    }
  }

  // Sort by score descending and return top 5
  return scored.sort((a, b) => b.score - a.score).slice(0, 5)
}
