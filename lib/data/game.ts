import { createClient } from '@/lib/supabase/server'
import type { Clue, Game, Player, Round, Vote } from '@/lib/types/database'

export async function getGame(gameId: string): Promise<Game | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.from('games').select('*').eq('id', gameId).single()

  if (error) return null
  return data
}

export async function getGameByCode(code: string): Promise<Game | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('code', code.toUpperCase())
    .single()

  if (error) return null
  return data
}

export async function getPlayers(gameId: string): Promise<Player[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('game_id', gameId)
    .order('score', { ascending: false })

  if (error) return []
  return data
}

export async function getCurrentPlayer(gameId: string): Promise<Player | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('game_id', gameId)
    .eq('user_id', user.id)
    .single()

  if (error) return null
  return data
}

export async function getCurrentRound(gameId: string): Promise<Round | null> {
  const supabase = await createClient()

  // Get current round number from game
  const { data: game } = await supabase
    .from('games')
    .select('current_round')
    .eq('id', gameId)
    .single()

  if (!game || game.current_round === 0) return null

  const { data, error } = await supabase
    .from('rounds')
    .select('*')
    .eq('game_id', gameId)
    .eq('round_number', game.current_round)
    .single()

  if (error) return null
  return data
}

export async function getCluesForRound(roundId: string): Promise<(Clue & { player: Player })[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('clues')
    .select(`
      *,
      player:players(*)
    `)
    .eq('round_id', roundId)

  if (error) return []
  return data as (Clue & { player: Player })[]
}

export async function getVotesForRound(roundId: string): Promise<Vote[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.from('votes').select('*').eq('round_id', roundId)

  if (error) return []
  return data
}

export async function getCurrentPlayerClue(
  roundId: string,
  playerId: string
): Promise<Clue | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('clues')
    .select('*')
    .eq('round_id', roundId)
    .eq('player_id', playerId)
    .single()

  if (error) return null
  return data
}

export async function getCurrentPlayerVote(
  roundId: string,
  playerId: string
): Promise<Vote | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('votes')
    .select('*')
    .eq('round_id', roundId)
    .eq('voter_id', playerId)
    .single()

  if (error) return null
  return data
}

export async function isUserHost(gameId: string): Promise<boolean> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { data: game } = await supabase.from('games').select('host_id').eq('id', gameId).single()

  return game?.host_id === user.id
}
