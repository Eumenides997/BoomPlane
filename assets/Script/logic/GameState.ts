export interface PlayerData<T> {
    id: string,
    PlaneData: PlaneData<null>
}

export interface PlaneData<T> {
    id: string,
    head: {
        x: number,
        y: number
    },
    tail: {
        x: number,
        y: number
    }
}

export interface GameState<T> {
    players: PlayerData<T>[]
}