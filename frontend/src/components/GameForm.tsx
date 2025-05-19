import React, { useState, useEffect } from 'react'
import { Game } from '../types/Game'
import { Genre } from '../types/Genre'
import { ApiService } from '../services/api.service'

interface GameFormProps {
    game?: Game
    onSave: (game: Game) => void
    onCancel?: () => void
}

const GameForm: React.FC<GameFormProps> = ({ game, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Game>(
        game || { id: 0, title: '', description: '', release_date: '', genres: [] }
    )

    const [genreSearch, setGenreSearch] = useState('')
    const [searchResults, setSearchResults] = useState<Genre[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [selectedGenres, setSelectedGenres] = useState<Genre[]>(formData.genres || [])
    const [showCreateGenre, setShowCreateGenre] = useState(false)
    const [newGenreTitle, setNewGenreTitle] = useState('')
    const [isCreatingGenre, setIsCreatingGenre] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Initialiser les genres sélectionnés si le jeu en possède déjà
    useEffect(() => {
        if (game?.genres) {
            setSelectedGenres(game.genres)
        }
    }, [game])

    // Effectuer une recherche de genres quand la valeur de recherche change
    useEffect(() => {
        const searchGenres = async () => {
            if (genreSearch.trim().length < 2) {
                setSearchResults([])
                return
            }

            setIsSearching(true)
            try {
                const results = await ApiService.searchGenres(genreSearch)
                console.log('Search results:', results)

                // Filtrer les résultats pour exclure les genres déjà sélectionnés
                const filteredResults = results.filter(
                    (result) => !selectedGenres.some((selected) => selected.id === result.id)
                )

                console.log('Filtered results (excluding already selected):', filteredResults)
                setSearchResults(filteredResults)
            } catch (error) {
                console.error('Error searching genres:', error)
            } finally {
                setIsSearching(false)
            }
        }

        // Utiliser un délai pour éviter de faire trop de requêtes pendant que l'utilisateur tape
        const timeoutId = setTimeout(() => {
            searchGenres()
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [genreSearch, selectedGenres])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })

        // Effacer l'erreur pour ce champ si elle existe
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' })
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Validation simple
        const newErrors: Record<string, string> = {}
        if (!formData.title.trim()) {
            newErrors.title = 'Le titre est requis'
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        // Ajouter les genres sélectionnés au jeu avant de sauvegarder
        const gameWithGenres = {
            ...formData,
            genres: selectedGenres,
        }

        onSave(gameWithGenres)
    }

    const handleGenreSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGenreSearch(e.target.value)
        setShowCreateGenre(false)
    }

    const selectGenre = (genre: Genre) => {
        // Vérifier si le genre est déjà sélectionné
        if (!selectedGenres.some((g) => g.id === genre.id)) {
            setSelectedGenres([...selectedGenres, genre])
        }
        setGenreSearch('')
        setSearchResults([])
    }

    const removeGenre = (genreId: number | undefined) => {
        setSelectedGenres(selectedGenres.filter((g) => g.id !== genreId))
    }

    const handleCreateGenre = () => {
        setShowCreateGenre(true)
        setNewGenreTitle(genreSearch)
    }

    const submitNewGenre = async () => {
        if (!newGenreTitle.trim()) return

        setIsCreatingGenre(true)
        try {
            const newGenre = await ApiService.createGenre(newGenreTitle)
            selectGenre(newGenre)
            setShowCreateGenre(false)
            setNewGenreTitle('')
        } catch (error) {
            console.error('Error creating genre:', error)
            if (error instanceof Error) {
                alert(`Erreur lors de la création du genre: ${error.message}`)
            } else {
                alert('Erreur lors de la création du genre')
            }
        } finally {
            setIsCreatingGenre(false)
        }
    }

    return (
        <div className="bg-black text-white min-h-screen p-6">
            <div className="max-w-xl mx-auto">
                <form
                    onSubmit={handleSubmit}
                    className="bg-[#1c1c1e] rounded-2xl p-8 border border-[#2c2c2e]"
                >
                    <h1 className="text-2xl font-bold mb-6 text-white">
                        {game ? 'Modifier le Jeu' : 'Ajouter un Jeu'}
                    </h1>

                    <div className="mb-6">
                        <label className="block text-sm uppercase tracking-wider text-gray-500 mb-2">
                            Titre
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className={`w-full p-3 bg-[#2c2c2e] border ${
                                errors.title ? 'border-red-500' : 'border-[#3c3c3e]'
                            } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:border-transparent`}
                            required
                            placeholder="Titre du jeu"
                        />
                        {errors.title && (
                            <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                        )}
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm uppercase tracking-wider text-gray-500 mb-2">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full p-3 bg-[#2c2c2e] border border-[#3c3c3e] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:border-transparent h-32 resize-none"
                            placeholder="Description du jeu"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm uppercase tracking-wider text-gray-500 mb-2">
                            Date de Sortie
                        </label>
                        <input
                            type="date"
                            name="release_date"
                            value={formData.release_date}
                            onChange={handleChange}
                            className="w-full p-3 bg-[#2c2c2e] border border-[#3c3c3e] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:border-transparent"
                        />
                    </div>

                    <div className="mb-8">
                        <label className="block text-sm uppercase tracking-wider text-gray-500 mb-2">
                            Genres
                        </label>

                        {/* Liste des genres sélectionnés */}
                        {selectedGenres.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {selectedGenres.map((genre, index) => (
                                    <div
                                        key={genre.id || index}
                                        className="flex items-center bg-[#2c2c2e] px-3 py-1 rounded-full text-white"
                                    >
                                        <span>{genre.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeGenre(genre.id)}
                                            className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Barre de recherche de genres */}
                        <div className="relative">
                            <input
                                type="text"
                                value={genreSearch}
                                onChange={handleGenreSearch}
                                className="w-full p-3 bg-[#2c2c2e] border border-[#3c3c3e] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:border-transparent"
                                placeholder="Rechercher un genre..."
                            />

                            {/* Résultats de recherche */}
                            {genreSearch.trim().length >= 2 && !showCreateGenre && (
                                <div className="absolute z-10 w-full mt-1 bg-[#2c2c2e] border border-[#3c3c3e] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {isSearching ? (
                                        <div className="p-3 text-gray-400 text-center">
                                            Recherche en cours...
                                        </div>
                                    ) : searchResults.length > 0 ? (
                                        <>
                                            {searchResults.map((genre) => (
                                                <div
                                                    key={genre.id}
                                                    onClick={() => selectGenre(genre)}
                                                    className="p-3 hover:bg-[#3c3c3e] cursor-pointer transition-colors"
                                                >
                                                    {genre.name}
                                                </div>
                                            ))}
                                        </>
                                    ) : (
                                        <div className="p-3">
                                            <p className="text-gray-400 mb-2">
                                                Aucun genre trouvé pour "{genreSearch}"
                                            </p>
                                            <button
                                                type="button"
                                                onClick={handleCreateGenre}
                                                className="text-[#0071e3] hover:text-[#0077ed] transition-colors"
                                            >
                                                + Créer "{genreSearch}"
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Formulaire de création de genre */}
                            {showCreateGenre && (
                                <div className="absolute z-10 w-full mt-1 bg-[#2c2c2e] border border-[#3c3c3e] rounded-lg shadow-lg p-3">
                                    <h4 className="text-white mb-2">Créer un nouveau genre</h4>
                                    <div className="flex">
                                        <input
                                            type="text"
                                            value={newGenreTitle}
                                            onChange={(e) => setNewGenreTitle(e.target.value)}
                                            className="flex-grow p-2 bg-[#3c3c3e] border border-[#4c4c4e] rounded-l-lg text-white focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:border-transparent"
                                            placeholder="Nom du genre"
                                        />
                                        <button
                                            type="button"
                                            onClick={submitNewGenre}
                                            disabled={isCreatingGenre || !newGenreTitle.trim()}
                                            className="px-4 py-2 bg-[#0071e3] text-white rounded-r-lg hover:bg-[#0077ed] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isCreatingGenre ? '...' : 'Créer'}
                                        </button>
                                    </div>
                                    <div className="flex justify-end mt-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowCreateGenre(false)}
                                            className="text-sm text-gray-400 hover:text-white transition-colors"
                                        >
                                            Annuler
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex space-x-4">
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-[#0071e3] text-white text-sm font-medium rounded-full hover:bg-[#0077ed] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0071e3] focus:ring-offset-[#1c1c1e]"
                        >
                            Enregistrer
                        </button>

                        {onCancel && (
                            <button
                                type="button"
                                onClick={onCancel}
                                className="flex-1 px-6 py-3 bg-[#1c1c1e] text-white text-sm font-medium rounded-full border border-[#3c3c3e] hover:bg-[#2c2c2e] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3c3c3e] focus:ring-offset-[#1c1c1e]"
                            >
                                Annuler
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}

export default GameForm
