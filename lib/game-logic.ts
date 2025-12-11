/**
 * Pure game logic functions for the Odd One Out game.
 * These functions have NO database dependencies and can be tested in isolation.
 */

export interface Vote {
  voter_id: string
  suspect_id: string
}

export interface Player {
  id: string
  score: number
}

export interface ScoringResult {
  oddPlayerEscaped: boolean
  pointsForOddPlayer: number
  pointsForCorrectVoters: number
  correctVoterIds: string[]
}

/**
 * Validates if a vote is allowed.
 * Players cannot vote for themselves.
 *
 * @param voterId - The ID of the player voting
 * @param suspectId - The ID of the player being voted for
 * @returns true if vote is valid, false otherwise
 */
export function isVoteValid(voterId: string, suspectId: string): boolean {
  return voterId !== suspectId
}

/**
 * Calculates scoring based on voting results.
 *
 * Game rules:
 * - Odd player escapes if correctVotes < totalVotes / 2 (strictly less than half)
 * - Each correct voter gets +1 point
 * - Odd player gets +2 points if they escape
 *
 * @param votes - Array of all votes cast in the round
 * @param oddPlayerId - The ID of the odd player
 * @returns Scoring result with points and voter information
 */
export function calculateScoring(votes: Vote[], oddPlayerId: string): ScoringResult {
  const totalVotes = votes.length

  // Handle edge case of zero votes
  if (totalVotes === 0) {
    return {
      oddPlayerEscaped: true,
      pointsForOddPlayer: 2,
      pointsForCorrectVoters: 1,
      correctVoterIds: [],
    }
  }

  // Count correct votes (votes for the odd player)
  const correctVoterIds = votes.filter((v) => v.suspect_id === oddPlayerId).map((v) => v.voter_id)

  const correctVotes = correctVoterIds.length

  // Odd player escapes if less than half voted correctly
  const oddPlayerEscaped = correctVotes < totalVotes / 2

  return {
    oddPlayerEscaped,
    pointsForOddPlayer: oddPlayerEscaped ? 2 : 0,
    pointsForCorrectVoters: 1,
    correctVoterIds,
  }
}

/**
 * Applies scoring to player objects based on the scoring result.
 * Returns a new array of players with updated scores.
 *
 * @param players - Array of all players in the game
 * @param scoringResult - Result from calculateScoring
 * @param oddPlayerId - The ID of the odd player
 * @returns New array of players with updated scores
 */
export function applyScoring(
  players: Player[],
  scoringResult: ScoringResult,
  oddPlayerId: string
): Player[] {
  return players.map((player) => {
    let pointsToAdd = 0

    // Award points to odd player if they escaped (takes precedence)
    if (player.id === oddPlayerId && scoringResult.oddPlayerEscaped) {
      pointsToAdd = scoringResult.pointsForOddPlayer
    }
    // Award points to correct voters (only if not the odd player who escaped)
    else if (scoringResult.correctVoterIds.includes(player.id)) {
      pointsToAdd = scoringResult.pointsForCorrectVoters
    }

    return {
      ...player,
      score: player.score + pointsToAdd,
    }
  })
}
