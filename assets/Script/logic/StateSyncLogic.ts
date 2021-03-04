import { GameState, PlayerPlaneData, CraterData, WarmBlock } from "./GameState";

// 状态同步逻辑状态
export const stateSyncState: GameState = {
    playerPlanes: [],//飞机 摆放信息
    craters_self: [],//玩家弹坑信息
    craters_enemy: [],//敌人弹坑信息
    players: [],//玩家情况
    state: "",//游戏状态
    warmBlock: [],//飞机重叠部分
    time: 10000,//回合倒计时
};

export function init() {//离开房间初始化数据
    stateSyncState.state = ""
    stateSyncState.players = []
    stateSyncState.craters_self = []
    stateSyncState.craters_enemy = []
}

// 设置默认的状态同步逻辑状态
// export function setDefauleSyncState(room: MGOBE.Room) {

//     const roomInfo = room.roomInfo || { playerList: [] } as MGOBE.types.RoomInfo;

//     setState(roomInfo.playerList.map((p, i) => (
//         { id: p.id, PlaneData: { id: 1, head: { x: 5, y: 5 }, tail: { x: 8, y: 5 } } }
//     )));
// }

//设置游戏状态,入参由gameSvr广播提供
export function setState(data: any) {
    const recvData = data.recvGameData
    setCratersState(recvData)
    setGameState(recvData)
    setPlayer(recvData)
    setTime(recvData)
}

//设置倒计时
export function setTime(data: any) {
    stateSyncState.time = data.time
}

//设置玩家状态
export function setPlayer(data: any) {
    stateSyncState.players = data.players
}

//设置游戏状态
export function setGameState(data: any) {
    stateSyncState.state = data.state
}

//设置玩家弹坑摆放状态
export function setCratersState(data: any) {
    const craters = data.craters
    if (!Array.isArray(craters)) {
        return;
    }
    stateSyncState.craters_self = [];
    stateSyncState.craters_enemy = [];
    craters.forEach(p => {
        const crater: CraterData = {
            id: p.userId,
            x: p.x,
            y: p.y,
            type: p.type
        }
        if (p.userId === MGOBE.Player.id) {//判断该炸弹是不是自己扔的
            stateSyncState.craters_enemy.push(crater);
        } else {
            stateSyncState.craters_self.push(crater);
        }
    })
}

//设置飞机重叠部分
export function setWarmBlock(pos) {
    stateSyncState.warmBlock = []
    pos.forEach(p => {
        const warmBlock: WarmBlock = {
            x: p.x,
            y: p.y
        }
        stateSyncState.warmBlock.push(warmBlock)
    })
}

// 设置玩家飞机摆放状态,入参由客户端提供
export function setPlayerPlanesState(playerPlanes: { id: string, PlaneData: { id, head: { x, y }, tail: { x, y } } }[]) {
    if (!Array.isArray(playerPlanes)) {
        return;
    }
    stateSyncState.playerPlanes = [];
    playerPlanes.forEach(p => {
        const playerPlane: PlayerPlaneData = {
            id: p.id,
            PlaneData: {
                id: p.PlaneData.id,
                head: {
                    x: p.PlaneData.head.x,
                    y: p.PlaneData.head.y
                },
                tail: {
                    x: p.PlaneData.tail.x,
                    y: p.PlaneData.tail.y
                }
            }
        }
        stateSyncState.playerPlanes.push(playerPlane);
    });
}