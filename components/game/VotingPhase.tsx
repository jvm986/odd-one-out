'use client'

import { CheckCircle2, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { revealAndScore, submitVote } from '@/lib/actions/game'
import { createClient } from '@/lib/supabase/client'
import type { Clue, Game, Player, Round, Vote } from '@/lib/types/database'

interface VotingPhaseProps {
  game: Game
  players: Player[]
  currentPlayer: Player
}

export function VotingPhase({ game, players, currentPlayer }: VotingPhaseProps) {
  const [round, setRound] = useState<Round | null>(null)
  const [clues, setClues] = useState<(Clue & { player: Player })[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<string>('')
  const [submittedVote, setSubmittedVote] = useState<Vote | null>(null)
  const [votesCount, setVotesCount] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRevealing, setIsRevealing] = useState(false)
  const isHost = currentPlayer.is_host

  useEffect(() => {
    const supabase = createClient()

    const fetchData = async () => {
      // Get current round
      const { data: roundData } = await supabase
        .from('rounds')
        .select('*')
        .eq('game_id', game.id)
        .eq('round_number', game.current_round)
        .single()

      if (roundData) {
        setRound(roundData as Round)

        // Get clues with player info
        const { data: cluesData } = await supabase
          .from('clues')
          .select(`
            *,
            player:players(*)
          `)
          .eq('round_id', roundData.id)

        if (cluesData) {
          setClues(cluesData as (Clue & { player: Player })[])
        }

        // Get current player's vote
        const { data: voteData } = await supabase
          .from('votes')
          .select('*')
          .eq('round_id', roundData.id)
          .eq('voter_id', currentPlayer.id)
          .single()

        if (voteData) {
          setSubmittedVote(voteData as Vote)
          setSelectedPlayer(voteData.suspect_id)
        }

        // Get votes count
        const { count } = await supabase
          .from('votes')
          .select('*', { count: 'exact', head: true })
          .eq('round_id', roundData.id)

        setVotesCount(count || 0)
      }
    }

    fetchData()

    // Subscribe to votes changes
    const votesChannel = supabase
      .channel(`votes:${game.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes',
        },
        async () => {
          if (round) {
            const { count } = await supabase
              .from('votes')
              .select('*', { count: 'exact', head: true })
              .eq('round_id', round.id)

            setVotesCount(count || 0)

            // Refetch current player's vote
            const { data: voteData } = await supabase
              .from('votes')
              .select('*')
              .eq('round_id', round.id)
              .eq('voter_id', currentPlayer.id)
              .single()

            if (voteData) {
              setSubmittedVote(voteData as Vote)
            }
          }
        }
      )
      .subscribe()

    return () => {
      votesChannel.unsubscribe()
    }
  }, [game.id, game.current_round, currentPlayer.id, round])

  const handleSubmitVote = async () => {
    if (!selectedPlayer) return

    setIsSubmitting(true)
    const result = await submitVote(game.id, selectedPlayer)

    if (result.error) {
      alert(result.error)
    }

    setIsSubmitting(false)
  }

  const handleReveal = async () => {
    setIsRevealing(true)
    const result = await revealAndScore(game.id)

    if (result.error) {
      alert(result.error)
      setIsRevealing(false)
    }
  }

  if (!round) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const otherPlayers = players.filter((p) => p.id !== currentPlayer.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center space-y-2">
          <Badge variant="outline">
            Round {game.current_round} of {game.total_rounds}
          </Badge>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Vote for the Odd One Out
          </h1>
          <p className="text-gray-600">
            Review the clues and vote for who you think is the odd one out
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Clues</CardTitle>
            <CardDescription>Each player submitted a clue. Who seems suspicious?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clues.map((clue) => (
                <div key={clue.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {clue.player.display_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium mb-1">
                      {clue.player.display_name}
                      {clue.player.id === currentPlayer.id && (
                        <Badge variant="secondary" className="ml-2">
                          You
                        </Badge>
                      )}
                    </div>
                    <div className="text-gray-700 text-lg">&ldquo;{clue.clue_text}&rdquo;</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cast Your Vote</CardTitle>
            <CardDescription>Select who you think is the Odd One Out</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup
              value={selectedPlayer}
              onValueChange={setSelectedPlayer}
              disabled={!!submittedVote}
            >
              <div className="space-y-2">
                {otherPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <RadioGroupItem value={player.id} id={player.id} />
                    <Label htmlFor={player.id} className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-sm font-bold">
                          {player.display_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{player.display_name}</span>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            {!submittedVote ? (
              <Button
                onClick={handleSubmitVote}
                disabled={!selectedPlayer || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Vote'}
              </Button>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">
                  Vote submitted for {players.find((p) => p.id === selectedPlayer)?.display_name}!
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {votesCount} of {players.length} votes submitted
                </span>
              </div>
              <div className="flex gap-1">
                {players.map((player, index) => (
                  <div
                    key={player.id}
                    className={`w-2 h-2 rounded-full ${
                      index < votesCount ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {isHost && (
              <Button
                onClick={handleReveal}
                disabled={isRevealing || votesCount === 0}
                className="w-full mt-4"
              >
                {isRevealing ? 'Revealing...' : 'Reveal & Score'}
              </Button>
            )}

            {!isHost && votesCount === players.length && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-base text-center text-blue-700">
                All votes in! Waiting for host to reveal results...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
