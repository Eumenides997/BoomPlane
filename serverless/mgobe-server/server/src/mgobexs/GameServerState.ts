import { mgobexsInterface } from './mgobexsInterface';

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
    time: number,//回合时间
}

//缓存数据
export function setData(actionData: any, gameData: GameData) {
    gameData.data = actionData
}

//当监听事件为有玩家离开房间
export function listenLeaveRoom(id: string, gameData: GameData) {
    gameData.state = "游戏结束"
    gameData.players.forEach(p => {
        p.ifWin = true
    })
    gameData.planes = [];//清空摆放飞机信息
    gameData.players.find((p, key) => {
        if (p.id === id) {
            gameData.players.splice(key, 1)
        }
    })
}

// 设置玩家状态
export function setGameData(id: string, actionData: any, gameData: GameData) {

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
        setCrater(id, actionData, gameData)
    }

    //当接收客户端信息类型为->提交飞机放置信息
    if (actionData.type === "submmit_plane") {
        setPlane(id, actionData, gameData)
    }

}

//投放炸弹放置炸弹信息
export function setCrater(id: string, actionData: any, gameData: GameData) {
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
                    //倒计时初始化
                    gameData.time = 10000
                }
            }
        })
    }
}

//提交飞机放置信息
export function setPlane(id: string, actionData: any, gameData: GameData) {

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

//超时后回合方判负,游戏结束
export function outTime(gameData: GameData) {
    gameData.players.forEach(p => {
        if (p.ifBomb) {
            p.ifWin = false
        } else {
            p.ifWin = true
        }
    })
    gameData.state = "游戏结束"
    clearGameState
}

export function initGameState(gameData: GameData, args: mgobexsInterface.ActionArgs<any>) {
    gameData.planes = [];
    gameData.data = [];
    gameData.craters = [];
    gameData.state = gameData.state;
    gameData.players = [];
    gameData.time = 10000
    // 初始化后，开始定时向客户端推送游戏状态
    gameData.timer = setInterval(() => {
        if (gameData.state === "游戏中") {//游戏中开始回合倒计时
            gameData.time -= 15
            if (gameData.time < 0) {
                //回合方判负,游戏结束
                outTime(gameData)
            }
        }
        args.SDK.sendData({ playerIdList: [], data: { recvGameData: gameData } });
    }, 1000 / 15);
}

//游戏结束后清楚上局游戏数据
export function clearGameState(gameData: GameData) {
    gameData.planes = [];//清空摆放飞机信息
    gameData.craters = []//清空弹坑信息
    gameData.players = []
    gameData.time = 10000
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
