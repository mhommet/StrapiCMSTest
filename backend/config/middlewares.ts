export default [
    'strapi::errors',
    {
        name: 'strapi::security',
        config: {
            contentSecurityPolicy: {
                useDefaults: true,
                directives: {
                    'connect-src': ["'self'", 'https:', 'http://localhost:*', 'http://127.0.0.1:*'],
                    'img-src': ["'self'", 'data:', 'blob:', 'http://localhost:*'],
                    'media-src': ["'self'", 'data:', 'blob:', 'http://localhost:*'],
                    'script-src': ["'self'", 'http://localhost:*'],
                    upgradeInsecureRequests: null,
                },
            },
        },
    },
    {
        name: 'strapi::cors',
        config: {
            origin: [
                'http://localhost:5173',
                'http://localhost:1338',
                'http://127.0.0.1:5173',
                'http://127.0.0.1:1338',
            ],
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
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
            keepHeaderOnError: true,
            credentials: true,
            maxAge: 86400,
        },
    },
    'strapi::poweredBy',
    'strapi::logger',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
]
