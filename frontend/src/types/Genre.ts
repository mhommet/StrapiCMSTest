export interface GenreAttributes {
    name: string
}

export interface Genre extends GenreAttributes {
    id?: number
}

export interface StrapiGenreResponse {
    data: {
        id: number
        attributes: {
            name: string
        }
    }[]
}
