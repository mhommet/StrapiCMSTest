export default {
    settings: {
        cors: {
            enabled: true,
            origin: [
                'http://localhost:5173',
                'http://localhost:1338',
                'http://127.0.0.1:5173',
                'http://127.0.0.1:1338',
            ],
            headers: [
                'Content-Type',
                'Authorization',
                'Origin',
                'Accept',
                'X-Requested-With',
                'Access-Control-Allow-Headers',
                'Access-Control-Request-Method',
                'Access-Control-Request-Headers',
                'Cache-Control',
                'Pragma',
                'Expires',
            ],
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
            keepHeaderOnError: true,
            credentials: true,
        },
    },
    routes: {
        'api::game.game': {
            routes: [
                {
                    method: 'GET',
                    path: '/games',
                    handler: 'game.find',
                    config: {
                        policies: [],
                        auth: false,
                    },
                },
                {
                    method: 'GET',
                    path: '/games/:id',
                    handler: 'game.findOne',
                    config: {
                        policies: [],
                        auth: false,
                    },
                },
                {
                    method: 'POST',
                    path: '/games',
                    handler: 'game.create',
                    config: {
                        policies: [],
                        auth: false,
                    },
                },
                {
                    method: 'PUT',
                    path: '/games/:id',
                    handler: 'game.update',
                    config: {
                        policies: [],
                        auth: false,
                    },
                },
                {
                    method: 'DELETE',
                    path: '/games/:id',
                    handler: 'game.delete',
                    config: {
                        policies: [],
                        auth: false,
                    },
                },
            ],
        },
        'api::genre.genre': {
            routes: [
                {
                    method: 'GET',
                    path: '/genres',
                    handler: 'genre.find',
                    config: {
                        policies: [],
                        auth: false,
                    },
                },
                {
                    method: 'GET',
                    path: '/genres/:id',
                    handler: 'genre.findOne',
                    config: {
                        policies: [],
                        auth: false,
                    },
                },
                {
                    method: 'POST',
                    path: '/genres',
                    handler: 'genre.create',
                    config: {
                        policies: [],
                        auth: false,
                    },
                },
                {
                    method: 'PUT',
                    path: '/genres/:id',
                    handler: 'genre.update',
                    config: {
                        policies: [],
                        auth: false,
                    },
                },
                {
                    method: 'DELETE',
                    path: '/genres/:id',
                    handler: 'genre.delete',
                    config: {
                        policies: [],
                        auth: false,
                    },
                },
            ],
        },
    },
}
