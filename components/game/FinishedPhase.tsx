'use client'

import { Crown, Medal, Trophy } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Game, Player } from '@/lib/types/database'

interface FinishedPhaseProps {
  game: Game
  players: Player[]
  currentPlayer: Player
}

export function FinishedPhase({ game, players, currentPlayer }: FinishedPhaseProps) {
  const router = useRouter()
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)
  const winner = sortedPlayers[0]
  const isWinner = winner?.id === currentPlayer.id

  const getMedalIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="h-8 w-8 text-yellow-500" />
      case 1:
        return <Medal className="h-8 w-8 text-gray-400" />
      case 2:
        return <Medal className="h-8 w-8 text-orange-600" />
      default:
        return null
    }
  }

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0:
        return 'from-yellow-400 to-yellow-600'
      case 1:
        return 'from-gray-300 to-gray-500'
      case 2:
        return 'from-orange-400 to-orange-600'
      default:
        return 'from-purple-400 to-blue-400'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Game Over!
          </h1>
          <Badge variant="outline" className="text-lg px-4 py-1">
            {game.mode === 'classic' ? 'Classic Mode' : 'Blind Mode'}
          </Badge>
        </div>

        {isWinner && (
          <Card className="border-4 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardContent className="pt-6 text-center">
              <Crown className="h-16 w-16 text-yellow-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-yellow-700 mb-2">Congratulations!</div>
              <div className="text-lg text-gray-700">You won with {winner.score} points!</div>
            </CardContent>
          </Card>
        )}

        {!isWinner && winner && (
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="pt-6 text-center">
              <Trophy className="h-12 w-12 text-purple-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-purple-700 mb-2">
                Winner: {winner.display_name}
              </div>
              <div className="text-lg text-gray-700">with {winner.score} points</div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Trophy className="h-6 w-6 text-yellow-500" />
              Final Scoreboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sortedPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                    player.id === currentPlayer.id
                      ? 'bg-purple-100 border-2 border-purple-300 scale-105'
                      : index === 0
                        ? 'bg-yellow-50 border-2 border-yellow-300'
                        : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12">
                      {getMedalIcon(index) || (
                        <div className="text-3xl font-bold text-gray-400">{index + 1}</div>
                      )}
                    </div>
                    <div
                      className={`w-14 h-14 rounded-full bg-gradient-to-br ${getMedalColor(index)} flex items-center justify-center text-white font-bold text-xl`}
                    >
                      {player.display_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-xl">{player.display_name}</div>
                      <div className="flex gap-2">
                        {player.id === currentPlayer.id && <Badge variant="secondary">You</Badge>}
                        {player.is_host && <Badge variant="outline">Host</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-purple-600">{player.score}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Game Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Rounds:</span>
              <span className="font-medium">{game.total_rounds}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mode:</span>
              <span className="font-medium">{game.mode === 'classic' ? 'Classic' : 'Blind'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Players:</span>
              <span className="font-medium">{players.length}</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button onClick={() => router.push('/')} className="flex-1" size="lg">
            Back to Home
          </Button>
        </div>

        <div className="text-center text-sm text-gray-500">Thanks for playing Odd One Out!</div>
      </div>
    </div>
  )
}
