export default {
    'users-permissions': {
        config: {
            jwt: {
                expiresIn: '7d',
            },
            jwtSecret: 'your-secret-key',
        },
    },
    'rest-cache': {
        config: {
            provider: {
                name: 'memory',
                options: {
                    max: 32767,
                    maxAge: 3600,
                },
            },
            strategy: {
                contentTypes: ['api::game.game', 'api::genre.genre'],
            },
        },
    },
}
