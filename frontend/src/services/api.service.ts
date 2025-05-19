import { Game, StrapiGameResponse, StrapiGameData } from '../types/Game'
import { Genre } from '../types/Genre'

// URL de base de l'API
const API_URL = 'http://localhost:1338/api'

// Configuration par défaut pour les requêtes
const DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
}

const handleResponse = async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
        const error = await response.text()
        throw new Error(`API error (${response.status}): ${error}`)
    }
    const json = await response.json()
    console.log('API Response:', json)
    return json
}

const transformGame = (game: StrapiGameData): Game => {
    console.log('Transforming game:', game)
    if (!game?.attributes) {
        console.error('Invalid game data:', game)
        throw new Error('Invalid game data structure')
    }

    return {
        id: game.id,
        title: game.attributes.title,
        description: game.attributes.description,
        release_date: game.attributes.release_date,
        genres:
            game.attributes.genres?.data?.map((genre) => ({
                id: genre.id,
                name: genre.attributes.name,
            })) || [],
    }
}

/**
 * Service pour gérer toutes les interactions avec l'API Strapi
 */
export class ApiService {
    /**
     * Récupère la liste des jeux depuis l'API
     * @returns Promise<Game[]> Liste des jeux
     */
    static async getGames(): Promise<Game[]> {
        try {
            const response = await fetch(`${API_URL}/games?populate=genres`, {
                method: 'GET',
                headers: DEFAULT_HEADERS,
                credentials: 'include',
            })

            const { data } = await handleResponse<StrapiGameResponse>(response)
            console.log('Games data before transform:', data)
            return data.map(transformGame)
        } catch (error) {
            console.error('Error fetching games:', error)
            throw error
        }
    }

    /**
     * Récupère les détails d'un jeu spécifique
     * @param id ID du jeu à récupérer
     * @returns Promise<Game> Détails du jeu
     */
    static async getGameById(id: number): Promise<Game> {
        try {
            console.log(`Fetching game with ID ${id}`)
            const response = await fetch(`${API_URL}/games/${id}?populate=genres`, {
                method: 'GET',
                headers: DEFAULT_HEADERS,
                credentials: 'include',
            })

            const responseData = await handleResponse<{ data: StrapiGameData }>(response)
            console.log('Raw game data:', responseData)

            const transformedGame = transformGame(responseData.data)
            console.log('Transformed game:', transformedGame)

            return transformedGame
        } catch (error) {
            console.error('Error fetching game:', error)
            throw error
        }
    }

    /**
     * Crée un nouveau jeu
     * @param game Données du jeu à créer
     * @returns Promise<Game> Jeu créé
     */
    static async createGame(game: Omit<Game, 'id'>): Promise<Game> {
        try {
            const genreIds = game.genres
                ?.map((g) => g.id)
                .filter((id): id is number => id !== undefined)

            const requestData = {
                data: {
                    title: game.title,
                    description: game.description,
                    release_date: game.release_date,
                    genres: genreIds?.length ? { connect: genreIds } : undefined,
                },
            }

            console.log('Creating game with data:', requestData)

            const response = await fetch(`${API_URL}/games`, {
                method: 'POST',
                headers: DEFAULT_HEADERS,
                credentials: 'include',
                body: JSON.stringify(requestData),
            })

            const { data } = await handleResponse<{ data: StrapiGameData }>(response)
            return transformGame(data)
        } catch (error) {
            console.error('Error creating game:', error)
            throw error
        }
    }

    /**
     * Met à jour un jeu existant
     * @param id ID du jeu à mettre à jour
     * @param game Nouvelles données du jeu
     * @returns Promise<Game> Jeu mis à jour
     */
    static async updateGame(id: number, game: Partial<Game>): Promise<Game> {
        try {
            const genreIds = game.genres
                ?.map((g) => g.id)
                .filter((id): id is number => id !== undefined)

            console.log('Updating game with data:', {
                title: game.title,
                description: game.description,
                release_date: game.release_date,
                genres: genreIds && genreIds.length > 0 ? { connect: genreIds } : undefined,
            })

            const response = await fetch(`${API_URL}/games/${id}`, {
                method: 'PUT',
                headers: DEFAULT_HEADERS,
                credentials: 'include',
                body: JSON.stringify({
                    data: {
                        title: game.title,
                        description: game.description,
                        release_date: game.release_date,
                        genres: genreIds && genreIds.length > 0 ? { connect: genreIds } : undefined,
                    },
                }),
            })

            const { data } = await handleResponse<{ data: StrapiGameData }>(response)
            return transformGame(data)
        } catch (error) {
            console.error('Error updating game:', error)
            throw error
        }
    }

    /**
     * Supprime un jeu
     * @param id ID du jeu à supprimer
     * @returns Promise<void>
     */
    static async deleteGame(id: number): Promise<void> {
        try {
            const response = await fetch(`${API_URL}/games/${id}`, {
                method: 'DELETE',
                headers: DEFAULT_HEADERS,
                credentials: 'include',
            })

            await handleResponse<void>(response)
        } catch (error) {
            console.error('Error deleting game:', error)
            throw error
        }
    }

    /**
     * Recherche des genres par terme de recherche
     * @param query Terme de recherche
     * @returns Promise<Genre[]> Liste des genres correspondants
     */
    static async searchGenres(query: string): Promise<Genre[]> {
        try {
            const response = await fetch(
                `${API_URL}/genres?filters[name][$containsi]=${encodeURIComponent(query)}`,
                {
                    method: 'GET',
                    headers: DEFAULT_HEADERS,
                    credentials: 'include',
                }
            )

            const { data } = await handleResponse<{
                data: Array<{ id: number; attributes: { name: string } }>
            }>(response)

            console.log('Genre search results:', data)

            const genres = data.map((genre) => ({
                id: genre.id,
                name: genre.attributes.name,
            }))

            console.log('Transformed genres:', genres)
            return genres
        } catch (error) {
            console.error('Error searching genres:', error)
            throw error
        }
    }

    /**
     * Crée un nouveau genre
     * @param name Nom du genre (sera mappé à l'attribut 'name' dans Strapi)
     * @returns Promise<Genre> Genre créé
     */
    static async createGenre(name: string): Promise<Genre> {
        try {
            console.log('Creating genre with name:', name)
            const response = await fetch(`${API_URL}/genres`, {
                method: 'POST',
                headers: DEFAULT_HEADERS,
                credentials: 'include',
                body: JSON.stringify({
                    data: { name },
                }),
            })

            const responseData = await handleResponse<{
                data: { id: number; attributes: { name: string } }
            }>(response)
            console.log('Genre creation response:', responseData)

            if (!responseData.data || !responseData.data.attributes) {
                throw new Error('Invalid response format from server')
            }

            return {
                id: responseData.data.id,
                name: responseData.data.attributes.name,
            }
        } catch (error) {
            console.error('Error creating genre:', error)
            throw error
        }
    }
}

export default ApiService
