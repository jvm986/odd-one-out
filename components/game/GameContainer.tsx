'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Game, GamePhase, Player } from '@/lib/types/database'
import { CluePhase } from './CluePhase'
import { FinishedPhase } from './FinishedPhase'
import { LobbyPhase } from './LobbyPhase'
import { RevealPhase } from './RevealPhase'
import { VotingPhase } from './VotingPhase'

interface GameContainerProps {
  gameId: string
}

export function GameContainer({ gameId }: GameContainerProps) {
  const [game, setGame] = useState<Game | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Initial fetch
    const fetchData = async () => {
      const [gameData, playersData, userData] = await Promise.all([
        supabase.from('games').select('*').eq('id', gameId).single(),
        supabase
          .from('players')
          .select('*')
          .eq('game_id', gameId)
          .order('score', { ascending: false }),
        supabase.auth.getUser(),
      ])

      if (gameData.data) setGame(gameData.data as Game)
      if (playersData.data) setPlayers(playersData.data as Player[])

      if (userData.data.user) {
        const currentPlayerData = playersData.data?.find(
          (p: Player) => p.user_id === userData.data.user?.id
        )
        if (currentPlayerData) setCurrentPlayer(currentPlayerData as Player)
      }

      setLoading(false)
    }

    fetchData()

    // Subscribe to game changes
    const gameChannel = supabase
      .channel(`game:${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          if (payload.new) {
            setGame(payload.new as Game)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `game_id=eq.${gameId}`,
        },
        async () => {
          // Refetch all players when any player changes
          const { data } = await supabase
            .from('players')
            .select('*')
            .eq('game_id', gameId)
            .order('score', { ascending: false })

          if (data) {
            setPlayers(data as Player[])
            // Update current player if needed
            const user = await supabase.auth.getUser()
            if (user.data.user) {
              const updatedCurrentPlayer = data.find(
                (p: Player) => p.user_id === user.data.user?.id
              )
              if (updatedCurrentPlayer) {
                setCurrentPlayer(updatedCurrentPlayer as Player)
              }
            }
          }
        }
      )
      .subscribe()

    return () => {
      gameChannel.unsubscribe()
    }
  }, [gameId])

  if (loading || !game || !currentPlayer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading game...</p>
        </div>
      </div>
    )
  }

  const renderPhase = () => {
    switch (game.phase as GamePhase) {
      case 'lobby':
        return <LobbyPhase game={game} players={players} currentPlayer={currentPlayer} />
      case 'clue':
        return <CluePhase game={game} players={players} currentPlayer={currentPlayer} />
      case 'voting':
        return <VotingPhase game={game} players={players} currentPlayer={currentPlayer} />
      case 'reveal':
        return <RevealPhase game={game} players={players} currentPlayer={currentPlayer} />
      case 'finished':
        return <FinishedPhase game={game} players={players} currentPlayer={currentPlayer} />
      default:
        return <div>Unknown game phase</div>
    }
  }

  return <div className="min-h-screen">{renderPhase()}</div>
}
