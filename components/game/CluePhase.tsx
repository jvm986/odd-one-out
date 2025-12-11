'use client'

import { CheckCircle2, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { advanceToVoting, submitClue } from '@/lib/actions/game'
import { createClient } from '@/lib/supabase/client'
import type { Clue, Game, Player, Round } from '@/lib/types/database'

interface CluePhaseProps {
  game: Game
  players: Player[]
  currentPlayer: Player
}

export function CluePhase({ game, players, currentPlayer }: CluePhaseProps) {
  const [round, setRound] = useState<Round | null>(null)
  const [clueText, setClueText] = useState('')
  const [submittedClue, setSubmittedClue] = useState<Clue | null>(null)
  const [cluesCount, setCluesCount] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAdvancing, setIsAdvancing] = useState(false)
  const isHost = currentPlayer.is_host

  useEffect(() => {
    const supabase = createClient()

    const fetchRoundData = async () => {
      // Get current round
      const { data: roundData } = await supabase
        .from('rounds')
        .select('*')
        .eq('game_id', game.id)
        .eq('round_number', game.current_round)
        .single()

      if (roundData) {
        setRound(roundData as Round)

        // Get current player's clue
        const { data: clueData } = await supabase
          .from('clues')
          .select('*')
          .eq('round_id', roundData.id)
          .eq('player_id', currentPlayer.id)
          .single()

        if (clueData) {
          setSubmittedClue(clueData as Clue)
          setClueText(clueData.clue_text)
        }

        // Get clues count
        const { count } = await supabase
          .from('clues')
          .select('*', { count: 'exact', head: true })
          .eq('round_id', roundData.id)

        setCluesCount(count || 0)
      }
    }

    fetchRoundData()

    // Subscribe to clues changes
    const cluesChannel = supabase
      .channel(`clues:${game.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clues',
        },
        async () => {
          // Refetch clue count
          if (round) {
            const { count } = await supabase
              .from('clues')
              .select('*', { count: 'exact', head: true })
              .eq('round_id', round.id)

            setCluesCount(count || 0)

            // Refetch current player's clue
            const { data: clueData } = await supabase
              .from('clues')
              .select('*')
              .eq('round_id', round.id)
              .eq('player_id', currentPlayer.id)
              .single()

            if (clueData) {
              setSubmittedClue(clueData as Clue)
            }
          }
        }
      )
      .subscribe()

    return () => {
      cluesChannel.unsubscribe()
    }
  }, [game.id, game.current_round, currentPlayer.id, round])

  const handleSubmitClue = async () => {
    if (!clueText.trim()) return

    setIsSubmitting(true)
    const result = await submitClue(game.id, clueText)

    if (result.error) {
      alert(result.error)
    }

    setIsSubmitting(false)
  }

  const handleAdvanceToVoting = async () => {
    setIsAdvancing(true)
    const result = await advanceToVoting(game.id)

    if (result.error) {
      alert(result.error)
      setIsAdvancing(false)
    }
  }

  if (!round) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading round...</p>
        </div>
      </div>
    )
  }

  const isOddOneOut = round.odd_player_id === currentPlayer.id
  const playerWord = isOddOneOut ? round.odd_word : round.group_word
  const showRole = game.mode === 'classic'

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <Badge variant="outline">
            Round {game.current_round} of {game.total_rounds}
          </Badge>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Submit Your Clue
          </h1>
        </div>

        <Card
          className={
            isOddOneOut && showRole ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'
          }
        >
          <CardHeader>
            <CardTitle className="text-center">
              {showRole && isOddOneOut && (
                <Badge variant="destructive" className="mb-2">
                  You are the Odd One Out
                </Badge>
              )}
              {showRole && !isOddOneOut && (
                <Badge className="mb-2 bg-green-600">You are a Regular Player</Badge>
              )}
            </CardTitle>
            <CardDescription className="text-center text-lg pb-0">Your word:</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-center pb-2">{playerWord}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submit a Clue</CardTitle>
            <CardDescription>
              Give a clue related to your word. Be clever - not too obvious, not too vague!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Type your clue here..."
                value={clueText}
                onChange={(e) => setClueText(e.target.value)}
                maxLength={200}
                disabled={!!submittedClue}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{clueText.length}/200 characters</span>
              </div>
            </div>

            {!submittedClue ? (
              <Button
                onClick={handleSubmitClue}
                disabled={!clueText.trim() || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Clue'}
              </Button>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Clue submitted!</span>
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
                  {cluesCount} of {players.length} clues submitted
                </span>
              </div>
              <div className="flex gap-1">
                {players.map((player, index) => (
                  <div
                    key={player.id}
                    className={`w-2 h-2 rounded-full ${
                      index < cluesCount ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {isHost && (
              <Button
                onClick={handleAdvanceToVoting}
                disabled={isAdvancing || cluesCount === 0}
                className="w-full mt-4"
              >
                {isAdvancing ? 'Advancing...' : 'Go to Voting'}
              </Button>
            )}

            {!isHost && cluesCount === players.length && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-base text-center text-blue-700">
                All clues submitted! Waiting for host to advance...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
