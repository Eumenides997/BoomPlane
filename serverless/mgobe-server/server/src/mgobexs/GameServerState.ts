import { mgobexsInterface } from './mgobexsInterface';


//玩家信息
// export interface PlayerData {
//     x: number,
//     y: number,
//     id: string,
// }

//飞机信息
export interface PlaneData {
    userId: String,
    planeId: string,
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
export interface Crater {
    userId: String,
    x: number,
    y: number,
    type: string
}

//游戏全部信息
export interface GameData {
    // syncType: SyncType,
    timer: any,
    // players: PlayerData[],
    planes: PlaneData[],
    data: any,
    craters: Crater[]
}

export enum SyncType {
    msg = "房间内发消息",
    state = "实时服务器状态同步",
    frame = "帧同步",
}

// export enum StateSyncCmd {
//     up = 1,
//     down = 2,
//     left = 3,
//     right = 4,
// }

// const MAX_Y = 5;
// const MIN_Y = 0;

// const MAX_X = 12;
// const MIN_X = 0;

// export function random(from: number, to: number, fixed: number) {
//     return Math.round(Math.random() * (to - from) * 10 ** fixed) / (10 ** fixed);
// }

// export function initPlayer(id: string, gameData: GameData, x?: number, y?: number) {
//     if (gameData.players.find(p => p.id === id)) {
//         // 已存在则不需要初始化
//         return;
//     }

//     gameData.players.push({
//         x: typeof x === "undefined" ? random(MIN_X, MAX_X, 0) : x,
//         y: typeof y === "undefined" ? random(MIN_Y, MAX_Y, 0) : y,
//         id,
//     });
// }

// 移除玩家。玩家退房时调用
// export function removePlayer(id: string, gameData: GameData) {
//     const index = gameData.players.findIndex(p => p.id === id);

//     if (index >= 0) {
//         gameData.players.splice(index, 1);
//     }
// }

// 设置玩家状态
export function setPlayer(id: string, actionData: any, gameData: GameData) {
    // if (!gameData.players.find(p => p.id === id)) {
    //     // 添加一个玩家
    //     initPlayer(id, gameData);
    // }

    //test
    gameData.data = actionData

    //当接收客户端信息类型为->投放炸弹
    if (actionData.type === "bomb") {
        const crater = actionData.data
        var x = crater.x
        var y = crater.y
        var type = "block"//默认砸中位置是空地
        //判断炸弹投放位置炸到哪了
        gameData.planes.forEach(plane => {
            if (plane.userId != id) {//筛选地方飞机
                if (plane.head.x === x && plane.head.y === y) {//炸中的是飞机头
                    type = "head"
                }
                //砸中的是机身(待完成)
            }
        })
        gameData.craters.push({
            userId: id,
            x: x,
            y: crater.y,
            type: type
        })
    }

    //当接收客户端信息类型为->提交飞机放置信息
    if (actionData.type === "submmit_plane") {
        if (!gameData.planes.find(p => p.userId === id)) {
            //不存在该玩家的飞机时放置三架飞机
            const planes = actionData.data
            if (planes.length === 3) {
                //判断提交的信息是否有三架飞机(后期添加飞机摆放位置是否符合规范)
                for (var i = 0; i < planes.length; i++) {
                    const plane = planes[i].PlaneData
                    gameData.planes.push({//添加飞机
                        userId: id,
                        planeId: plane.id,
                        head: {
                            x: plane.head.x,
                            y: plane.head.y
                        },
                        tail: {
                            x: plane.tail.x,
                            y: plane.tail.y
                        }
                    })
                }
            }
        }
    }


    // const player = gameData.players.find(p => p.id === id);

    // player.id = type

}

export function initGameState(gameData: GameData, args: mgobexsInterface.ActionArgs<any>) {
    // gameData.syncType = SyncType.state;
    // gameData.players = [];
    gameData.planes = [];
    gameData.data = [];
    gameData.craters = [];
    // args.room && args.room.playerList && args.room.playerList.forEach((p, i) => initPlayer(p.id, gameData, 0, i));
    // 初始化后，开始定时向客户端推送游戏状态
    gameData.timer = setInterval(() => {
        args.SDK.sendData({ playerIdList: [], data: { recvGameData: gameData } });
    }, 1000 / 15);
}

export function clearGameState(gameData: GameData) {
    // gameData.syncType = SyncType.msg;
    clearInterval(gameData.timer);
    gameData.timer = undefined;
    // gameData.players = [];
    gameData.data = [];
    gameData.planes = [];
}