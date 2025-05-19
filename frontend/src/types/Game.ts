import { Genre } from './Genre'

export interface GenreRelation {
    connect: number[]
}

export interface GameAttributes {
    title: string
    description?: string
    release_date?: string
    genres?: Genre[]
}

export interface Game extends GameAttributes {
    id?: number
}

export interface StrapiGameData {
    id: number
    attributes: {
        title: string
        description?: string
        release_date?: string
        genres: {
            data: Array<{
                id: number
                attributes: {
                    name: string
                }
            }>
        }
    }
}

export interface StrapiGameResponse {
    data: StrapiGameData[]
}
