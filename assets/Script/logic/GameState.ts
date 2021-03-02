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

//玩家状态
export interface PlayerData {
    id: string,
    ifPlanes: boolean,//是否准备->提交飞机摆放信息
    ifBomb: boolean,//是否该回合放炸弹
    ifWin: boolean,//是否获胜
    ifAgain: boolean,//是否点击再来一局
}

//弹坑信息
export interface CraterData {
    id: string,
    x: number,
    y: number,
    type: string//(普通弹坑，飞机机身弹坑，飞机机头弹坑)
}

//飞机重叠部分
export interface WarmBlock {
    x: number,
    y: number
}

//游戏全部信息
export interface GameState {
    playerPlanes: PlayerPlaneData[],//飞机信息
    craters_self: CraterData[],//玩家弹坑信息
    craters_enemy: CraterData[],//敌人弹坑信息
    players: PlayerData[],//玩家状态
    state: string,//游戏状态
    warmBlock: WarmBlock[],//飞机重叠部分
}