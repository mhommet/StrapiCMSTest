import path from 'path'

export default ({ env }) => ({
    connection: {
        client: 'sqlite',
        connection: {
            filename: path.join(__dirname, '..', '..', '.tmp/data.db'),
        },
        useNullAsDefault: true,
    },
})
