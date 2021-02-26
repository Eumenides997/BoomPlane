//玩家飞机摆放信息
export interface PlayerPlaneData {
    id: string,
    PlaneData: PlaneData
}

//飞机信息
export interface PlaneData {
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

//弹坑信息
export interface CraterData {
    id: string,
    x: number,
    y: number,
    type: string//(普通弹坑，飞机机身弹坑，飞机机头弹坑)
}

//游戏全部信息
export interface GameState {
    playerPlanes: PlayerPlaneData[],//飞机信息
    craters_self: CraterData[],//玩家弹坑信息
    craters_enemy: CraterData[],//敌人弹坑信息
}