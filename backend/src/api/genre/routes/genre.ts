/**
 * genre router
 */

import { factories } from '@strapi/strapi'

const defaultConfig = {
    find: {
        policies: [],
        auth: false as const,
    },
    findOne: {
        policies: [],
        auth: false as const,
    },
    create: {
        policies: [],
        auth: false as const,
    },
    update: {
        policies: [],
        auth: false as const,
    },
    delete: {
        policies: [],
        auth: false as const,
    },
}

export default factories.createCoreRouter('api::genre.genre', {
    config: defaultConfig,
})
