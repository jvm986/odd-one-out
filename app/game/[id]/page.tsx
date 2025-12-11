import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { GameContainer } from '@/components/game/GameContainer'
import { getCurrentPlayer, getGame } from '@/lib/data/game'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const game = await getGame(id)

  if (!game) {
    return {
      title: 'Game Not Found',
    }
  }

  return {
    title: `Game ${game.code}`,
    description: `Join the Odd One Out game with code ${game.code}`,
  }
}

export default async function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const game = await getGame(id)
  const currentPlayer = await getCurrentPlayer(id)

  if (!game) {
    notFound()
  }

  // If player hasn't joined yet, redirect to home
  if (!currentPlayer) {
    redirect('/')
  }

  return <GameContainer gameId={id} />
}
