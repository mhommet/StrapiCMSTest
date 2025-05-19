/**
 * genre controller
 */

import { factories } from '@strapi/strapi'

const transformGenreResponse = (genre: any) => ({
    id: genre.id,
    attributes: {
        name: genre.name,
    },
})

export default factories.createCoreController('api::genre.genre', ({ strapi }) => ({
    async create(ctx) {
        const response = await super.create(ctx)
        if (response.data) {
            response.data = transformGenreResponse(response.data)
        }
        return response
    },
}))
