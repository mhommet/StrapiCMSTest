export default ({ env }) => ({
    host: env('HOST', '0.0.0.0'),
    port: env.int('PORT', 1338),
    app: {
        keys: env.array('APP_KEYS', ['myKeyA', 'myKeyB', 'myKeyC', 'myKeyD']),
    },
    url: env('PUBLIC_URL', 'http://localhost:1338'),
    webhooks: {
        populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
    },
})
