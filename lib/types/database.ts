export type GameMode = 'classic' | 'blind'
export type GamePhase = 'lobby' | 'clue' | 'voting' | 'reveal' | 'finished'

export interface Game {
  id: string
  code: string
  host_id: string
  mode: GameMode
  phase: GamePhase
  current_round: number
  total_rounds: number
  created_at: string
  updated_at: string
}

export interface Player {
  id: string
  game_id: string
  user_id: string
  display_name: string
  score: number
  is_host: boolean
  joined_at: string
}

export interface Round {
  id: string
  game_id: string
  round_number: number
  group_word: string
  odd_word: string
  odd_player_id: string
  created_at: string
}

export interface Clue {
  id: string
  round_id: string
  player_id: string
  clue_text: string
  submitted_at: string
}

export interface Vote {
  id: string
  round_id: string
  voter_id: string
  suspect_id: string
  submitted_at: string
}

export interface WordPair {
  id: string
  group_word: string
  odd_word: string
  category: string | null
  created_at: string
}

// Extended types with joined data
export interface PlayerWithClue extends Player {
  clue?: Clue
}

export interface PlayerWithVote extends Player {
  voted_for?: string
}

export interface RoundWithDetails extends Round {
  clues: (Clue & { player: Player })[]
  votes: (Vote & { voter: Player; suspect: Player })[]
}
