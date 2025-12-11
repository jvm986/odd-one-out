import { describe, expect, it } from 'vitest'
import {
  applyScoring,
  calculateScoring,
  isVoteValid,
  type Player,
  type Vote,
} from '@/lib/game-logic'

describe('calculateScoring', () => {
  it('awards +2 points to odd player when they escape (< half votes correct)', () => {
    const votes: Vote[] = [
      { voter_id: 'p1', suspect_id: 'odd' },
      { voter_id: 'p2', suspect_id: 'p1' },
      { voter_id: 'p3', suspect_id: 'p2' },
      { voter_id: 'p4', suspect_id: 'p3' },
    ]

    const result = calculateScoring(votes, 'odd')

    // 1 correct vote out of 4 total = 1 < 4/2 (1 < 2), so odd player escapes
    expect(result.oddPlayerEscaped).toBe(true)
    expect(result.pointsForOddPlayer).toBe(2)
  })

  it('awards NO points to odd player when caught (>= half votes correct)', () => {
    const votes: Vote[] = [
      { voter_id: 'p1', suspect_id: 'odd' },
      { voter_id: 'p2', suspect_id: 'odd' },
      { voter_id: 'p3', suspect_id: 'odd' },
      { voter_id: 'p4', suspect_id: 'p2' },
    ]

    const result = calculateScoring(votes, 'odd')

    // 3 correct votes out of 4 total = 3 >= 4/2 (3 >= 2), so odd player is caught
    expect(result.oddPlayerEscaped).toBe(false)
    expect(result.pointsForOddPlayer).toBe(0)
  })

  it('awards +1 point to each correct voter', () => {
    const votes: Vote[] = [
      { voter_id: 'p1', suspect_id: 'odd' },
      { voter_id: 'p2', suspect_id: 'odd' },
      { voter_id: 'p3', suspect_id: 'p1' },
    ]

    const result = calculateScoring(votes, 'odd')

    expect(result.pointsForCorrectVoters).toBe(1)
    expect(result.correctVoterIds).toEqual(['p1', 'p2'])
  })

  it('handles edge case: exactly half votes correct', () => {
    const votes: Vote[] = [
      { voter_id: 'p1', suspect_id: 'odd' },
      { voter_id: 'p2', suspect_id: 'p1' },
    ]

    const result = calculateScoring(votes, 'odd')

    // 1 correct vote out of 2 total = 1 >= 2/2 (1 >= 1), so odd player is caught
    expect(result.oddPlayerEscaped).toBe(false)
    expect(result.pointsForOddPlayer).toBe(0)
  })

  it('handles edge case: zero votes cast', () => {
    const votes: Vote[] = []

    const result = calculateScoring(votes, 'odd')

    // With 0 votes, 0 < 0/2 is false, so by default odd player escapes
    expect(result.oddPlayerEscaped).toBe(true)
    expect(result.pointsForOddPlayer).toBe(2)
    expect(result.correctVoterIds).toEqual([])
  })
})

describe('isVoteValid', () => {
  it('returns false when voting for yourself', () => {
    expect(isVoteValid('player1', 'player1')).toBe(false)
  })

  it('returns true when voting for someone else', () => {
    expect(isVoteValid('player1', 'player2')).toBe(true)
  })
})

describe('applyScoring', () => {
  it('correctly updates scores when odd player escapes', () => {
    const players: Player[] = [
      { id: 'odd', score: 0 },
      { id: 'p1', score: 0 },
      { id: 'p2', score: 0 },
    ]

    const scoringResult = {
      oddPlayerEscaped: true,
      pointsForOddPlayer: 2,
      pointsForCorrectVoters: 1,
      correctVoterIds: ['p1'],
    }

    const updatedPlayers = applyScoring(players, scoringResult, 'odd')

    expect(updatedPlayers).toEqual([
      { id: 'odd', score: 2 }, // Odd player gets +2
      { id: 'p1', score: 1 }, // Correct voter gets +1
      { id: 'p2', score: 0 }, // No change
    ])
  })

  it('correctly updates scores when odd player is caught', () => {
    const players: Player[] = [
      { id: 'odd', score: 5 },
      { id: 'p1', score: 3 },
      { id: 'p2', score: 2 },
    ]

    const scoringResult = {
      oddPlayerEscaped: false,
      pointsForOddPlayer: 0,
      pointsForCorrectVoters: 1,
      correctVoterIds: ['p1', 'p2'],
    }

    const updatedPlayers = applyScoring(players, scoringResult, 'odd')

    expect(updatedPlayers).toEqual([
      { id: 'odd', score: 5 }, // No change
      { id: 'p1', score: 4 }, // 3 + 1
      { id: 'p2', score: 3 }, // 2 + 1
    ])
  })
})

describe('integration: full round scoring', () => {
  it('correctly processes a complete round from votes to final scores', () => {
    const players: Player[] = [
      { id: 'odd', score: 0 },
      { id: 'p1', score: 0 },
      { id: 'p2', score: 0 },
      { id: 'p3', score: 0 },
    ]

    const votes: Vote[] = [
      { voter_id: 'p1', suspect_id: 'odd' },
      { voter_id: 'p2', suspect_id: 'p1' },
      { voter_id: 'p3', suspect_id: 'p2' },
    ]

    // Calculate and apply scoring
    const scoringResult = calculateScoring(votes, 'odd')
    const updatedPlayers = applyScoring(players, scoringResult, 'odd')

    // Verify: 1 correct out of 3 votes, so odd player escapes
    expect(scoringResult.oddPlayerEscaped).toBe(true)
    expect(updatedPlayers).toEqual([
      { id: 'odd', score: 2 }, // Escaped
      { id: 'p1', score: 1 }, // Guessed correctly
      { id: 'p2', score: 0 }, // Guessed wrong
      { id: 'p3', score: 0 }, // Guessed wrong
    ])
  })
})
