'use client'

import { Check, Trophy, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { endGame, startNextRound } from '@/lib/actions/game'
import { createClient } from '@/lib/supabase/client'
import type { Game, Player, Round, Vote } from '@/lib/types/database'

interface RevealPhaseProps {
  game: Game
  players: Player[]
  currentPlayer: Player
}

export function RevealPhase({ game, players, currentPlayer }: RevealPhaseProps) {
  const [round, setRound] = useState<Round | null>(null)
  const [votes, setVotes] = useState<Vote[]>([])
  const [isStartingNext, setIsStartingNext] = useState(false)
  const [isEnding, setIsEnding] = useState(false)
  const isHost = currentPlayer.is_host

  useEffect(() => {
    const supabase = createClient()

    const fetchData = async () => {
      const { data: roundData } = await supabase
        .from('rounds')
        .select('*')
        .eq('game_id', game.id)
        .eq('round_number', game.current_round)
        .single()

      if (roundData) {
        setRound(roundData as Round)

        const { data: votesData } = await supabase
          .from('votes')
          .select('*')
          .eq('round_id', roundData.id)

        if (votesData) {
          setVotes(votesData as Vote[])
        }
      }
    }

    fetchData()
  }, [game.id, game.current_round])

  const handleNextRound = async () => {
    setIsStartingNext(true)
    const result = await startNextRound(game.id)

    if (result.error) {
      alert(result.error)
      setIsStartingNext(false)
    }
  }

  const handleEndGame = async () => {
    setIsEnding(true)
    const result = await endGame(game.id)

    if (result.error) {
      alert(result.error)
      setIsEnding(false)
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

  const oddPlayer = players.find((p) => p.id === round.odd_player_id)
  const correctVotes = votes.filter((v) => v.suspect_id === round.odd_player_id).length
  const totalVotes = votes.length
  const oddPlayerEscaped = correctVotes < totalVotes / 2

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)
  const isLastRound = game.current_round >= game.total_rounds

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center space-y-2">
          <Badge variant="outline">
            Round {game.current_round} of {game.total_rounds}
          </Badge>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Round Results
          </h1>
        </div>

        <Card className="border-2 border-purple-300 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-center text-2xl">The Odd One Out Was...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-2xl">
                  {oddPlayer?.display_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-3xl font-bold">{oddPlayer?.display_name}</div>
                  {oddPlayer?.id === currentPlayer.id && (
                    <Badge variant="secondary">That&apos;s you!</Badge>
                  )}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Group Word</div>
                  <div className="text-2xl font-bold text-green-700">{round.group_word}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Odd Word</div>
                  <div className="text-2xl font-bold text-red-700">{round.odd_word}</div>
                </div>
              </div>

              <Separator />

              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">Votes Against Odd One Out</div>
                <div className="text-3xl font-bold">
                  {correctVotes} / {totalVotes}
                </div>
                {oddPlayerEscaped ? (
                  <Badge variant="destructive" className="mt-2">
                    Odd One Out Escaped! (+2 points)
                  </Badge>
                ) : (
                  <Badge className="mt-2 bg-green-600">Odd One Out Caught!</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Voting Results</CardTitle>
            <CardDescription>See who voted for whom</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {players.map((voter) => {
                const vote = votes.find((v) => v.voter_id === voter.id)
                const suspect = vote ? players.find((p) => p.id === vote.suspect_id) : null
                const wasCorrect = vote?.suspect_id === round.odd_player_id

                return (
                  <div
                    key={voter.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-sm font-bold">
                        {voter.display_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{voter.display_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        voted for <strong>{suspect?.display_name || 'nobody'}</strong>
                      </span>
                      {vote && (
                        <div
                          className={`flex items-center gap-1 ${wasCorrect ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {wasCorrect ? (
                            <>
                              <Check className="h-4 w-4" />
                              <span className="text-xs font-medium">+1</span>
                            </>
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Scoreboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sortedPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    player.id === currentPlayer.id
                      ? 'bg-purple-100 border-2 border-purple-300'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold text-gray-400 w-6">{index + 1}</div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold">
                      {player.display_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{player.display_name}</div>
                      {player.id === currentPlayer.id && (
                        <Badge variant="secondary" className="text-xs">
                          You
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{player.score}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {isHost && (
          <div className="flex gap-3">
            {!isLastRound && (
              <Button
                onClick={handleNextRound}
                disabled={isStartingNext || isEnding}
                className="flex-1"
                size="lg"
              >
                {isStartingNext ? 'Starting...' : 'Next Round'}
              </Button>
            )}
            <Button
              onClick={handleEndGame}
              disabled={isStartingNext || isEnding}
              variant="secondary"
              className="flex-1"
              size="lg"
            >
              {isEnding ? 'Ending...' : 'End Game'}
            </Button>
          </div>
        )}

        {!isHost && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="py-6 text-center text-base text-gray-700">
              Waiting for host to {isLastRound ? 'end the game' : 'start next round'}...
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
