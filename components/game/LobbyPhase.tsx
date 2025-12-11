'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { startGame } from '@/lib/actions/game'
import type { Game, Player } from '@/lib/types/database'

interface LobbyPhaseProps {
  game: Game
  players: Player[]
  currentPlayer: Player
}

export function LobbyPhase({ game, players, currentPlayer }: LobbyPhaseProps) {
  const [isStarting, setIsStarting] = useState(false)
  const [copied, setCopied] = useState(false)
  const isHost = currentPlayer.is_host

  const handleStartGame = async () => {
    setIsStarting(true)
    const result = await startGame(game.id)
    if (result.error) {
      alert(result.error)
      setIsStarting(false)
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(game.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Game Lobby
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className="text-gray-600">Game Code:</span>
            <code className="text-3xl font-bold tracking-wider text-purple-600 bg-purple-50 px-4 py-1 rounded">
              {game.code}
            </code>
            <Button variant="ghost" size="sm" onClick={copyCode} className="ml-2">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <Badge variant={game.mode === 'classic' ? 'default' : 'secondary'}>
            {game.mode === 'classic' ? 'Classic Mode' : 'Blind Mode'}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Players ({players.length})</CardTitle>
            <CardDescription>Waiting for at least 3 players to start</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold">
                      {player.display_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{player.display_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {player.is_host && <Badge variant="outline">Host</Badge>}
                    {player.id === currentPlayer.id && <Badge variant="secondary">You</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Game Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Mode:</span>
              <span className="font-medium">{game.mode === 'classic' ? 'Classic' : 'Blind'}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-gray-600">Total Rounds:</span>
              <span className="font-medium">{game.total_rounds}</span>
            </div>
            <Separator />
            <div className="text-xs text-gray-500 pt-2">
              {game.mode === 'classic'
                ? 'The Odd One Out will know they are odd'
                : 'No one will know who the Odd One Out is'}
            </div>
          </CardContent>
        </Card>

        {isHost && (
          <Button
            onClick={handleStartGame}
            disabled={isStarting || players.length < 3}
            className="w-full"
            size="lg"
          >
            {isStarting
              ? 'Starting...'
              : players.length < 3
                ? `Need ${3 - players.length} more player${3 - players.length > 1 ? 's' : ''}`
                : 'Start Game'}
          </Button>
        )}

        {!isHost && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="py-6 text-center text-base text-gray-700">
              Waiting for the host to start the game...
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
