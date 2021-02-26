import { GameState, PlayerPlaneData, CraterData } from "./GameState";
import VS_map_self from "../ui/VS_map_self"
import VS_map_enemy from "../ui/VS_map_enemy"

// 状态同步逻辑状态
export const stateSyncState: GameState = {
    playerPlanes: [],
    craters_self: [],//玩家弹坑信息
    craters_enemy: [],//敌人弹坑信息
};

// 设置默认的状态同步逻辑状态
// export function setDefauleSyncState(room: MGOBE.Room) {

//     const roomInfo = room.roomInfo || { playerList: [] } as MGOBE.types.RoomInfo;

//     setState(roomInfo.playerList.map((p, i) => (
//         { id: p.id, PlaneData: { id: 1, head: { x: 5, y: 5 }, tail: { x: 8, y: 5 } } }
//     )));
// }

//设置玩家弹坑摆放状态,入参由gameSvr广播提供craters: { id: string, x: number, y: number, type: string }
export function setCratersState(data: any) {
    const craters = data.recvGameData.craters
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