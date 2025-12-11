'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { GameMode, GamePhase } from '@/lib/types/database'

// Helper to generate a unique 6-character game code
async function generateGameCode(): Promise<string> {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed ambiguous chars
  let code = ''
  let isUnique = false

  const supabase = await createClient()

  while (!isUnique) {
    code = ''
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length))
    }

    // Check if code exists
    const { data } = await supabase.from('games').select('id').eq('code', code).single()

    if (!data) {
      isUnique = true
    }
  }

  return code
}

// Helper to get random word pair
async function getRandomWordPair() {
  const supabase = await createClient()

  const { data: wordPairs, error } = await supabase.from('word_pairs').select('*')

  if (error || !wordPairs || wordPairs.length === 0) {
    throw new Error('Failed to fetch word pairs')
  }

  const randomPair = wordPairs[Math.floor(Math.random() * wordPairs.length)]
  return randomPair
}

// Helper to get random odd player
function getRandomOddPlayer(playerIds: string[]): string {
  return playerIds[Math.floor(Math.random() * playerIds.length)]
}

export async function createGame(displayName: string, mode: GameMode = 'classic') {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Not authenticated' }
    }

    // Generate unique code
    const code = await generateGameCode()

    // Create game
    const { data: game, error: gameError } = await supabase
      .from('games')
      .insert({
        code,
        host_id: user.id,
        mode,
        phase: 'lobby' as GamePhase,
        current_round: 0,
        total_rounds: 5,
      })
      .select()
      .single()

    if (gameError) {
      return { error: 'Failed to create game' }
    }

    // Create player entry for host
    const { error: playerError } = await supabase.from('players').insert({
      game_id: game.id,
      user_id: user.id,
      display_name: displayName,
      score: 0,
      is_host: true,
    })

    if (playerError) {
      return { error: 'Failed to create player' }
    }

    revalidatePath(`/game/${game.id}`)
    return { success: true, gameId: game.id, code: game.code }
  } catch (error) {
    console.error('Error creating game:', error)
    return { error: 'Failed to create game' }
  }
}

export async function joinGame(code: string, displayName: string) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Not authenticated' }
    }

    // Find game by code
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('code', code.toUpperCase())
      .single()

    if (gameError || !game) {
      return { error: 'Game not found' }
    }

    // Check if game is finished
    if (game.phase === 'finished') {
      return { error: 'Game has ended' }
    }

    // Check if player already exists in this game
    const { data: existingPlayer } = await supabase
      .from('players')
      .select('*')
      .eq('game_id', game.id)
      .eq('user_id', user.id)
      .single()

    if (existingPlayer) {
      // Player is rejoining
      return { success: true, gameId: game.id }
    }

    // Create player entry
    const { error: playerError } = await supabase.from('players').insert({
      game_id: game.id,
      user_id: user.id,
      display_name: displayName,
      score: 0,
      is_host: false,
    })

    if (playerError) {
      return { error: 'Failed to join game' }
    }

    revalidatePath(`/game/${game.id}`)
    return { success: true, gameId: game.id }
  } catch (error) {
    console.error('Error joining game:', error)
    return { error: 'Failed to join game' }
  }
}

export async function startGame(gameId: string) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Not authenticated' }
    }

    // Verify user is host
    const { data: game } = await supabase.from('games').select('*').eq('id', gameId).single()

    if (!game || game.host_id !== user.id) {
      return { error: 'Only the host can start the game' }
    }

    // Check minimum players
    const { data: players } = await supabase.from('players').select('id').eq('game_id', gameId)

    if (!players || players.length < 3) {
      return { error: 'Need at least 3 players to start' }
    }

    // Create first round
    const wordPair = await getRandomWordPair()
    const oddPlayerId = getRandomOddPlayer(players.map((p) => p.id))

    const { error: roundError } = await supabase.from('rounds').insert({
      game_id: gameId,
      round_number: 1,
      group_word: wordPair.group_word,
      odd_word: wordPair.odd_word,
      odd_player_id: oddPlayerId,
    })

    if (roundError) {
      return { error: 'Failed to create round' }
    }

    // Update game phase
    const { error: updateError } = await supabase
      .from('games')
      .update({
        phase: 'clue' as GamePhase,
        current_round: 1,
      })
      .eq('id', gameId)

    if (updateError) {
      return { error: 'Failed to start game' }
    }

    revalidatePath(`/game/${gameId}`)
    return { success: true }
  } catch (error) {
    console.error('Error starting game:', error)
    return { error: 'Failed to start game' }
  }
}

export async function submitClue(gameId: string, clueText: string) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Not authenticated' }
    }

    // Get player
    const { data: player } = await supabase
      .from('players')
      .select('id')
      .eq('game_id', gameId)
      .eq('user_id', user.id)
      .single()

    if (!player) {
      return { error: 'Player not found' }
    }

    // Get current round
    const { data: game } = await supabase
      .from('games')
      .select('current_round')
      .eq('id', gameId)
      .single()

    if (!game) {
      return { error: 'Game not found' }
    }

    const { data: round } = await supabase
      .from('rounds')
      .select('id')
      .eq('game_id', gameId)
      .eq('round_number', game.current_round)
      .single()

    if (!round) {
      return { error: 'Round not found' }
    }

    // Upsert clue (allows updating)
    const { error: clueError } = await supabase.from('clues').upsert(
      {
        round_id: round.id,
        player_id: player.id,
        clue_text: clueText.trim(),
      },
      {
        onConflict: 'round_id,player_id',
      }
    )

    if (clueError) {
      return { error: 'Failed to submit clue' }
    }

    revalidatePath(`/game/${gameId}`)
    return { success: true }
  } catch (error) {
    console.error('Error submitting clue:', error)
    return { error: 'Failed to submit clue' }
  }
}

export async function advanceToVoting(gameId: string) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Not authenticated' }
    }

    // Verify user is host
    const { data: game } = await supabase.from('games').select('*').eq('id', gameId).single()

    if (!game || game.host_id !== user.id) {
      return { error: 'Only the host can advance the game' }
    }

    // Update game phase
    const { error: updateError } = await supabase
      .from('games')
      .update({
        phase: 'voting' as GamePhase,
      })
      .eq('id', gameId)

    if (updateError) {
      return { error: 'Failed to advance to voting' }
    }

    revalidatePath(`/game/${gameId}`)
    return { success: true }
  } catch (error) {
    console.error('Error advancing to voting:', error)
    return { error: 'Failed to advance to voting' }
  }
}

export async function submitVote(gameId: string, suspectId: string) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Not authenticated' }
    }

    // Get player
    const { data: player } = await supabase
      .from('players')
      .select('id')
      .eq('game_id', gameId)
      .eq('user_id', user.id)
      .single()

    if (!player) {
      return { error: 'Player not found' }
    }

    // Can't vote for yourself
    if (player.id === suspectId) {
      return { error: 'Cannot vote for yourself' }
    }

    // Get current round
    const { data: game } = await supabase
      .from('games')
      .select('current_round')
      .eq('id', gameId)
      .single()

    if (!game) {
      return { error: 'Game not found' }
    }

    const { data: round } = await supabase
      .from('rounds')
      .select('id')
      .eq('game_id', gameId)
      .eq('round_number', game.current_round)
      .single()

    if (!round) {
      return { error: 'Round not found' }
    }

    // Upsert vote (allows changing vote)
    const { error: voteError } = await supabase.from('votes').upsert(
      {
        round_id: round.id,
        voter_id: player.id,
        suspect_id: suspectId,
      },
      {
        onConflict: 'round_id,voter_id',
      }
    )

    if (voteError) {
      return { error: 'Failed to submit vote' }
    }

    revalidatePath(`/game/${gameId}`)
    return { success: true }
  } catch (error) {
    console.error('Error submitting vote:', error)
    return { error: 'Failed to submit vote' }
  }
}

export async function revealAndScore(gameId: string) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Not authenticated' }
    }

    // Verify user is host
    const { data: game } = await supabase.from('games').select('*').eq('id', gameId).single()

    if (!game || game.host_id !== user.id) {
      return { error: 'Only the host can reveal results' }
    }

    // Get current round with votes
    const { data: round } = await supabase
      .from('rounds')
      .select('*')
      .eq('game_id', gameId)
      .eq('round_number', game.current_round)
      .single()

    if (!round) {
      return { error: 'Round not found' }
    }

    // Get all votes for this round
    const { data: votes } = await supabase.from('votes').select('*').eq('round_id', round.id)

    // Get all players
    const { data: players } = await supabase.from('players').select('*').eq('game_id', gameId)

    if (!players || !votes) {
      return { error: 'Failed to load game data' }
    }

    // Calculate scores
    const correctVotes = votes.filter((v) => v.suspect_id === round.odd_player_id).length
    const totalVotes = votes.length

    // Award points to players who guessed correctly
    const correctVoterIds = votes
      .filter((v) => v.suspect_id === round.odd_player_id)
      .map((v) => v.voter_id)

    for (const voterId of correctVoterIds) {
      const player = players.find((p) => p.id === voterId)
      if (player) {
        await supabase
          .from('players')
          .update({ score: player.score + 1 })
          .eq('id', voterId)
      }
    }

    // Award points to odd one out if less than half guessed them
    if (correctVotes < totalVotes / 2) {
      const oddPlayer = players.find((p) => p.id === round.odd_player_id)
      if (oddPlayer) {
        await supabase
          .from('players')
          .update({ score: oddPlayer.score + 2 })
          .eq('id', round.odd_player_id)
      }
    }

    // Update game phase to reveal
    const { error: updateError } = await supabase
      .from('games')
      .update({
        phase: 'reveal' as GamePhase,
      })
      .eq('id', gameId)

    if (updateError) {
      return { error: 'Failed to update game phase' }
    }

    revalidatePath(`/game/${gameId}`)
    return { success: true }
  } catch (error) {
    console.error('Error revealing and scoring:', error)
    return { error: 'Failed to reveal and score' }
  }
}

export async function startNextRound(gameId: string) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Not authenticated' }
    }

    // Verify user is host
    const { data: game } = await supabase.from('games').select('*').eq('id', gameId).single()

    if (!game || game.host_id !== user.id) {
      return { error: 'Only the host can start next round' }
    }

    const nextRound = game.current_round + 1

    // Check if game should end
    if (nextRound > game.total_rounds) {
      const { error: updateError } = await supabase
        .from('games')
        .update({
          phase: 'finished' as GamePhase,
        })
        .eq('id', gameId)

      if (updateError) {
        return { error: 'Failed to end game' }
      }

      revalidatePath(`/game/${gameId}`)
      return { success: true, finished: true }
    }

    // Get players
    const { data: players } = await supabase.from('players').select('id').eq('game_id', gameId)

    if (!players) {
      return { error: 'Failed to load players' }
    }

    // Create next round
    const wordPair = await getRandomWordPair()
    const oddPlayerId = getRandomOddPlayer(players.map((p) => p.id))

    const { error: roundError } = await supabase.from('rounds').insert({
      game_id: gameId,
      round_number: nextRound,
      group_word: wordPair.group_word,
      odd_word: wordPair.odd_word,
      odd_player_id: oddPlayerId,
    })

    if (roundError) {
      return { error: 'Failed to create round' }
    }

    // Update game
    const { error: updateError } = await supabase
      .from('games')
      .update({
        phase: 'clue' as GamePhase,
        current_round: nextRound,
      })
      .eq('id', gameId)

    if (updateError) {
      return { error: 'Failed to start next round' }
    }

    revalidatePath(`/game/${gameId}`)
    return { success: true, finished: false }
  } catch (error) {
    console.error('Error starting next round:', error)
    return { error: 'Failed to start next round' }
  }
}

export async function endGame(gameId: string) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Not authenticated' }
    }

    // Verify user is host
    const { data: game } = await supabase.from('games').select('*').eq('id', gameId).single()

    if (!game || game.host_id !== user.id) {
      return { error: 'Only the host can end the game' }
    }

    // Update game phase
    const { error: updateError } = await supabase
      .from('games')
      .update({
        phase: 'finished' as GamePhase,
      })
      .eq('id', gameId)

    if (updateError) {
      return { error: 'Failed to end game' }
    }

    revalidatePath(`/game/${gameId}`)
    return { success: true }
  } catch (error) {
    console.error('Error ending game:', error)
    return { error: 'Failed to end game' }
  }
}
