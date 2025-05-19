/**
 * game controller
 */

import { factories } from '@strapi/strapi'

const transformGameResponse = (game: any) => ({
    id: game.id,
    attributes: {
        title: game.title,
        description: game.description,
        release_date: game.release_date,
        genres: {
            data:
                game.genres?.map((genre: any) => ({
                    id: genre.id,
                    attributes: {
                        name: genre.name,
                    },
                })) || [],
        },
    },
})

export default factories.createCoreController('api::game.game', ({ strapi }) => ({
    // On garde les méthodes par défaut
    ...factories.createCoreController('api::game.game'),

    // Surcharge de la méthode find pour logger les jeux
    async find(ctx) {
        try {
            const games = await strapi.db.query('api::game.game').findMany({
                populate: ['genres'],
            })

            console.log('Raw games data:', games)
            const transformedGames = games.map(transformGameResponse)
            console.log('Transformed games data:', transformedGames)

            return {
                data: transformedGames,
                meta: {},
            }
        } catch (error) {
            console.error('Error in find controller:', error)
            throw error
        }
    },

    // Surcharge de la méthode findOne pour logger le jeu
    async findOne(ctx) {
        try {
            const { id } = ctx.params
            const game = await strapi.db.query('api::game.game').findOne({
                where: { id },
                populate: ['genres'],
            })

            if (!game) {
                return ctx.notFound('Game not found')
            }

            console.log('Raw game data:', game)
            const transformedGame = transformGameResponse(game)
            console.log('Transformed game data:', transformedGame)

            return { data: transformedGame }
        } catch (error) {
            console.error('Error in findOne controller:', error)
            throw error
        }
    },

    // On surcharge la méthode update pour utiliser l'API Query Engine
    async update(ctx) {
        try {
            const { id } = ctx.params
            const { data } = ctx.request.body || {}

            if (!id) return ctx.badRequest('ID is required')
            if (!data) return ctx.badRequest('Update data is required')

            console.log(`Controller: Attempting to update game with ID ${id}`)
            console.log('Update data:', data)

            const updatedGame = await strapi.db.query('api::game.game').update({
                where: { id },
                data: {
                    title: data.title,
                    description: data.description,
                    release_date: data.release_date,
                    genres: data.genres,
                },
                populate: ['genres'],
            })

            if (!updatedGame) {
                return ctx.notFound(`Game with ID ${id} not found`)
            }

            return { data: transformGameResponse(updatedGame) }
        } catch (error) {
            console.error('Controller: Error updating game:', error)
            return ctx.badRequest('Failed to update game', { error: error.message })
        }
    },

    // On surcharge la méthode delete pour utiliser l'API Query Engine via le service
    async delete(ctx) {
        try {
            const { id } = ctx.params

            if (!id) {
                return ctx.badRequest('ID is required')
            }

            console.log(`Controller: Attempting to delete game with ID ${id}`)

            const deletedEntry = await strapi.db.query('api::game.game').delete({
                where: { id },
            })

            if (!deletedEntry) {
                return ctx.notFound(`Game with ID ${id} not found or could not be deleted`)
            }

            console.log(`Controller: Game with ID ${id} successfully deleted`)

            // Renvoyer une réponse de succès
            return ctx.send(
                {
                    data: null,
                    meta: {},
                    message: 'Game deleted successfully',
                },
                200
            )
        } catch (error) {
            console.error('Controller: Error deleting game:', error)
            return ctx.badRequest('Failed to delete game', { error: error.message })
        }
    },

    async create(ctx) {
        try {
            const { data } = ctx.request.body || {}

            if (!data) {
                return ctx.badRequest('Data is required')
            }

            console.log('Creating game with data:', data)

            // Créer le jeu avec les relations
            const game = await strapi.db.query('api::game.game').create({
                data: {
                    title: data.title,
                    description: data.description,
                    release_date: data.release_date,
                    genres: data.genres,
                },
                populate: ['genres'],
            })

            return { data: transformGameResponse(game) }
        } catch (error) {
            console.error('Error creating game:', error)
            return ctx.badRequest('Failed to create game', { error: error.message })
        }
    },
}))
