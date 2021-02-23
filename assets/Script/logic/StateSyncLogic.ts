import { GameState, PlayerData } from "./GameState";

// 状态同步逻辑状态
export const stateSyncState: GameState<null> = {
    players: []
};

// 设置默认的状态同步逻辑状态
export function setDefauleSyncState(room: MGOBE.Room) {

    const roomInfo = room.roomInfo || { playerList: [] } as MGOBE.types.RoomInfo;

    setState(roomInfo.playerList.map((p, i) => (
        { id: p.id, PlaneData: { id: 1, head: { x: 5, y: 5 }, tail: { x: 8, y: 5 } } }
    )));
}

// 设置全部玩家状态，入参由gameSvr广播提供
export function setState(players: { id: string, PlaneData: { id, head: { x, y }, tail: { x, y } } }[]) {

    if (!Array.isArray(players)) {
        return;
    }

    stateSyncState.players = [];

    players.forEach(p => {
        const player: PlayerData<null> = {
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

        stateSyncState.players.push(player);
    });
}