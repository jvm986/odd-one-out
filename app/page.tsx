'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { createGame, joinGame } from '@/lib/actions/game'

const SAVED_NAME_KEY = 'odd-one-out-player-name'

export default function Home() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [gameCode, setGameCode] = useState('')
  const [gameMode, setGameMode] = useState<'classic' | 'blind'>('classic')
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState('')

  // Load saved name on mount
  useEffect(() => {
    const savedName = localStorage.getItem(SAVED_NAME_KEY)
    if (savedName) {
      setDisplayName(savedName)
    }
  }, [])

  const handleCreateGame = async () => {
    if (!displayName.trim()) {
      setError('Please enter your name')
      return
    }

    setIsCreating(true)
    setError('')

    // Save name to localStorage
    localStorage.setItem(SAVED_NAME_KEY, displayName.trim())

    const result = await createGame(displayName.trim(), gameMode)

    if (result.error) {
      setError(result.error)
      setIsCreating(false)
    } else if (result.gameId) {
      router.push(`/game/${result.gameId}`)
    }
  }

  const handleJoinGame = async () => {
    if (!displayName.trim()) {
      setError('Please enter your name')
      return
    }

    if (!gameCode.trim()) {
      setError('Please enter a game code')
      return
    }

    setIsJoining(true)
    setError('')

    // Save name to localStorage
    localStorage.setItem(SAVED_NAME_KEY, displayName.trim())

    const result = await joinGame(gameCode.trim(), displayName.trim())

    if (result.error) {
      setError(result.error)
      setIsJoining(false)
    } else if (result.gameId) {
      router.push(`/game/${result.gameId}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Odd One Out
          </h1>
          <p className="text-gray-600">A multiplayer guessing game for remote teams</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>Enter your name to create or join a game</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="Enter your display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={50}
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Game Mode</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={gameMode === 'classic' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setGameMode('classic')}
                  >
                    Classic
                  </Button>
                  <Button
                    type="button"
                    variant={gameMode === 'blind' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setGameMode('blind')}
                  >
                    Blind
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  {gameMode === 'classic'
                    ? 'The Odd One Out knows they are odd'
                    : 'No one knows who the Odd One Out is'}
                </p>
              </div>

              <Button
                onClick={handleCreateGame}
                disabled={isCreating || isJoining}
                className="w-full"
                size="lg"
              >
                {isCreating ? 'Creating...' : 'Create New Game'}
              </Button>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="code">Game Code</Label>
                <Input
                  id="code"
                  placeholder="Enter 6-character code"
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                  maxLength={6}
                />
              </div>

              <Button
                onClick={handleJoinGame}
                disabled={isCreating || isJoining}
                variant="secondary"
                className="w-full"
                size="lg"
              >
                {isJoining ? 'Joining...' : 'Join Game'}
              </Button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">How to Play</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-2">
            <p>
              <strong>Classic Mode:</strong> Most players get the same word, but one player (the Odd
              One Out) gets a related but different word. The Odd One Out knows their role.
            </p>
            <p>
              <strong>Blind Mode:</strong> Same as Classic, but the Odd One Out doesn&apos;t know
              they&apos;re odd. Everyone is paranoid!
            </p>
            <p>
              Submit clues, vote for who you think is odd, and score points by guessing correctly or
              evading detection.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
