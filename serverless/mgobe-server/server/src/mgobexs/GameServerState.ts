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

//玩家状态
export interface PlayerData {
    id: string,
    ifPlanes: boolean,//是否准备->提交飞机摆放信息
    ifBomb: boolean,//是否该回合放炸弹
    ifWin: boolean,//是否获胜
    ifAgain: boolean,//是否点击再来一局
}

//游戏全部信息
export interface GameData {
    // syncType: SyncType,
    timer: any,
    planes: PlaneData[],
    players: PlayerData[],
    data: any,
    craters: Crater[],
    state: string,//游戏目前所处状态
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

export function setData(actionData: any, gameData: GameData) {
    gameData.data = actionData
}

// 设置玩家状态
export function setPlayer(id: string, actionData: any, gameData: GameData) {
    // if (!gameData.players.find(p => p.id === id)) {
    //     // 添加一个玩家
    //     initPlayer(id, gameData);
    // }

    //test
    setData(actionData, gameData)

    //当接收客户端信息 类型为->state
    if (actionData.type === "state") {
        gameData.state = actionData.data
    }

    //当接收客户端信息类型为->再来一局
    if (actionData.type === "again") {
        var flag = true
        gameData.players.forEach(p => {
            if (p.id === id) {
                p.ifAgain = true
            }
            if (!p.ifAgain) {
                flag = false
            }
        })
        if (flag) {
            gameData.state = "开始准备"
            clearGameState(gameData as GameData)
        }
    }

    //当接收客户端信息类型为->玩家状态信息
    if (actionData.type === "user") {
        const userID = actionData.data
        gameData.players.push({
            id: userID,
            ifPlanes: false,//是否准备->提交飞机摆放信息
            ifBomb: false,//是否该回合放炸弹
            ifWin: false,//是否获胜
            ifAgain: false,//是否点击再来一局
        })
    }

    //当接收客户端信息类型为->投放炸弹
    if (actionData.type === "bomb") {
        if (gameData.state === "游戏中") {//准备就绪才可以开始对战
            gameData.players.find(p => {
                if (p.id === id) {
                    if (p.ifBomb) {//是否轮到该玩家投放炸弹
                        const crater = actionData.data
                        var x = crater.x
                        var y = crater.y
                        var type = "block"//默认砸中位置是空地
                        //判断炸弹投放位置炸到哪了
                        gameData.planes.find(plane => {
                            if (plane.userId != id) {//筛选地方飞机
                                if (plane.head.x === x && plane.head.y === y) {//炸中的是飞机头
                                    type = "head"
                                }
                                //砸中的是机身
                                var Pos = getPlaneBodyPos(plane)
                                Pos.find(p => {
                                    if (p.x === x && p.y === y) {
                                        type = "body"
                                    }
                                })
                            }
                        })
                        gameData.craters.push({
                            userId: id,
                            x: x,
                            y: crater.y,
                            type: type
                        })
                        //投放完炸弹判断是否炸中对方三架飞机机头
                        var count = 0//砸中机头的数量
                        gameData.craters.forEach(p => {
                            if (p.userId === id) {
                                if (p.type === "head") {
                                    count++
                                }
                            }
                        })
                        if (count === 3) {//砸中三个机头
                            gameData.players.find(p => {
                                if (p.id === id) {//找到获胜玩家
                                    p.ifWin = true
                                    gameData.state = "游戏结束"
                                }
                            })
                        }
                        //回合转换->改变能扔炸弹的人
                        gameData.players.forEach(p => {
                            p.ifBomb = p.ifBomb ? false : true
                        })
                    }
                }
            })
        }
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
                //判断是否有该玩家的数据,没有则添加
                var flag2 = true
                gameData.players.forEach(p => {
                    if (p.id === id) {
                        flag2 = false
                    }
                })
                if (flag2) {
                    gameData.players.push({
                        id: id,
                        ifAgain: false,
                        ifBomb: false,
                        ifPlanes: false,
                        ifWin: false
                    })
                }
                //提交完三架飞机后将玩家准备状态改为true
                gameData.players.find(player => {
                    if (player.id === id) {
                        player.ifPlanes = true
                        //判断是否是第一位准备好的玩家,如果是则先放炸弹
                        var flag = true
                        gameData.players.forEach(p => {
                            if (p.ifBomb) {
                                flag = false
                            }
                        })
                        player.ifBomb = flag
                        if (!flag) {//第二位玩家加入,设置对战状态为true
                            gameData.state = "准备就绪"
                        }
                    }
                })
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
    gameData.state = gameData.state;
    gameData.players = [];
    // args.room && args.room.playerList && args.room.playerList.forEach((p, i) => initPlayer(p.id, gameData, 0, i));
    // 初始化后，开始定时向客户端推送游戏状态
    gameData.timer = setInterval(() => {
        args.SDK.sendData({ playerIdList: [], data: { recvGameData: gameData } });
    }, 1000 / 15);
}

//游戏结束后清楚上局游戏数据
export function clearGameState(gameData: GameData) {
    // gameData.syncType = SyncType.msg;
    // clearInterval(gameData.timer);
    // gameData.timer = undefined;
    // gameData.players = [];
    // gameData.data = [];//清空缓存数据
    gameData.planes = [];//清空摆放飞机信息
    gameData.craters = []//清空弹坑信息
    gameData.players = []
}

//获取所有机身位置
export function getPlaneBodyPos(PlaneData: any) {

    var plane_head = PlaneData.head
    var plane_tail = PlaneData.tail

    var PlaneBodyPos = []//用于存储飞机坐标

    PlaneBodyPos.push({ x: plane_tail.x, y: plane_tail.y })//机尾不用分类讨论直接存储

    if (plane_head.x === plane_tail.x) {
        if (plane_head.y > plane_tail.y) {//机头朝上
            PlaneBodyPos.push(
                { x: plane_head.x, y: plane_head.y - 1 },
                { x: plane_head.x - 1, y: plane_head.y - 1 },
                { x: plane_head.x - 2, y: plane_head.y - 1 },
                { x: plane_head.x + 1, y: plane_head.y - 1 },
                { x: plane_head.x + 2, y: plane_head.y - 1 },
                { x: plane_head.x, y: plane_head.y - 2 },
                { x: plane_head.x - 1, y: plane_head.y - 3 },
                { x: plane_head.x + 1, y: plane_head.y - 3 }
            )
        } else {//机头朝下
            PlaneBodyPos.push(
                { x: plane_head.x, y: plane_head.y + 1 },
                { x: plane_head.x - 1, y: plane_head.y + 1 },
                { x: plane_head.x - 2, y: plane_head.y + 1 },
                { x: plane_head.x + 1, y: plane_head.y + 1 },
                { x: plane_head.x + 2, y: plane_head.y + 1 },
                { x: plane_head.x, y: plane_head.y + 2 },
                { x: plane_head.x - 1, y: plane_head.y + 3 },
                { x: plane_head.x + 1, y: plane_head.y + 3 }
            )
        }
    } else if (plane_head.x < plane_tail.x) {//机头朝左
        PlaneBodyPos.push(
            { x: plane_head.x + 1, y: plane_head.y },
            { x: plane_head.x + 1, y: plane_head.y + 1 },
            { x: plane_head.x + 1, y: plane_head.y + 2 },
            { x: plane_head.x + 1, y: plane_head.y - 1 },
            { x: plane_head.x + 1, y: plane_head.y - 2 },
            { x: plane_head.x + 2, y: plane_head.y },
            { x: plane_head.x + 3, y: plane_head.y + 1 },
            { x: plane_head.x + 3, y: plane_head.y - 1 }
        )
    } else {//机头朝右
        PlaneBodyPos.push(
            { x: plane_head.x - 1, y: plane_head.y },
            { x: plane_head.x - 1, y: plane_head.y + 1 },
            { x: plane_head.x - 1, y: plane_head.y + 2 },
            { x: plane_head.x - 1, y: plane_head.y - 1 },
            { x: plane_head.x - 1, y: plane_head.y - 2 },
            { x: plane_head.x - 2, y: plane_head.y },
            { x: plane_head.x - 3, y: plane_head.y + 1 },
            { x: plane_head.x - 3, y: plane_head.y - 1 }
        )
    }
    return PlaneBodyPos

}
