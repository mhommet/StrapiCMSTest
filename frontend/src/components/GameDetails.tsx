import React, { useEffect, useState } from 'react'
import { Game } from '../types/Game'
import { ApiService } from '../services/api.service'

interface GameDetailsProps {
    gameId: number
    onBack: () => void
}

const GameDetails: React.FC<GameDetailsProps> = ({ gameId, onBack }) => {
    const [game, setGame] = useState<Game | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchGameDetails = async () => {
            setLoading(true)
            try {
                // Utiliser le service API pour récupérer les détails du jeu
                const gameData = await ApiService.getGameById(gameId)
                console.log('Game details:', gameData)
                setGame(gameData)
            } catch (err: unknown) {
                if (err instanceof Error) {
                    console.error('Error fetching game details:', err)
                    setError(err.message)
                } else {
                    setError('An unexpected error occurred')
                }
            } finally {
                setLoading(false)
            }
        }

        if (gameId) {
            fetchGameDetails()
        }
    }, [gameId])

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-black text-white p-6">
                <div className="animate-pulse w-full max-w-3xl mx-auto space-y-6">
                    <div className="h-6 bg-gray-800 rounded w-1/4"></div>
                    <div className="h-10 bg-gray-800 rounded w-3/4"></div>
                    <div className="h-32 bg-gray-800 rounded"></div>
                    <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                </div>
            </div>
        )
    }

    if (error || !game) {
        return (
            <div className="bg-black text-white min-h-screen p-6">
                <div className="bg-[#1c1c1e] border-l-4 border-red-600 p-4 rounded-lg">
                    <h2 className="text-xl font-bold text-white mb-2">Erreur</h2>
                    <p className="text-gray-400">{error || "Le jeu n'a pas pu être chargé"}</p>
                    <button
                        onClick={onBack}
                        className="mt-4 inline-flex items-center px-4 py-2 rounded-full text-xs font-medium bg-[#0071e3] text-white hover:bg-[#0077ed] transition-colors"
                    >
                        Retour
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-black text-white min-h-screen p-6">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={onBack}
                    className="inline-flex items-center mb-6 px-4 py-2 rounded-full text-xs font-medium bg-[#1c1c1e] text-[#0071e3] border border-[#0071e3] hover:bg-[#0071e3] hover:text-white transition-colors"
                >
                    <svg
                        className="mr-1 w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                    </svg>
                    Retour
                </button>

                <div className="bg-[#1c1c1e] rounded-2xl overflow-hidden p-8 border border-[#2c2c2e]">
                    <h1 className="text-3xl font-bold text-white mb-6">{game.title}</h1>

                    {game.description && (
                        <div className="mb-6">
                            <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-2">
                                Description
                            </h2>
                            <p className="text-gray-300 leading-relaxed">{game.description}</p>
                        </div>
                    )}

                    {game.release_date && (
                        <div className="mb-6">
                            <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-2">
                                Date de sortie
                            </h2>
                            <p className="text-gray-300 font-semibold">
                                {new Date(game.release_date).toLocaleDateString('fr-FR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>
                        </div>
                    )}

                    {game.genres && game.genres.length > 0 && (
                        <div>
                            <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-2">
                                Genres
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {game.genres.map((genre, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#2c2c2e] text-gray-300"
                                    >
                                        {genre?.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default GameDetails
