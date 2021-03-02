import configs from "./config";
import global from "./global";
import { stateSyncState, setPlayerPlanesState, setWarmBlock, init } from "./logic/StateSyncLogic";

/**
 * 初始化 MGOBE SDK
 * @param gameInfo 
 * @param config 
 * @param callback 
 */
export function initSDK(gameId: string, secretKey: string, url: string, cacertNativeUrl: string, callback?: (event: { code: MGOBE.ErrCode }) => any): void {

    // 如果已经初始化，直接回调成功
    if (isInited()) {
        return callback && callback({ code: MGOBE.ErrCode.EC_OK });
    }

    const defaultGameInfo: MGOBE.types.GameInfoPara = {
        gameId: configs.gameId,
        openId: configs.openId,
        secretKey: configs.secretKey,
    };

    const defaultConfig: MGOBE.types.ConfigPara = {
        url: configs.url,
        isAutoRequestFrame: true,
        cacertNativeUrl: "",
    };

    Object.assign(defaultGameInfo, { gameId, secretKey });
    Object.assign(defaultConfig, { url, cacertNativeUrl });

    MGOBE.DebuggerLog.enable = true;

    if (cc.sys.isNative) {
        MGOBE.DebuggerLog.enable = false;
    }

    // 初始化
    MGOBE.Listener.init(defaultGameInfo, defaultConfig, event => {
        if (event.code === MGOBE.ErrCode.EC_OK) {
            global.room = new MGOBE.Room();
            global.gameId = defaultGameInfo.gameId;

            MGOBE.Listener.add(global.room);
            // 设置默认广播
            setBroadcastCallbacks(global.room, null, {});
        }

        callback && callback({ code: event.code });
    });
}

/**
 * 判断 MGOBE SDK 是否初始化完成
 */
export function isInited(): boolean {
    // 初始化成功后才有玩家ID
    return !!MGOBE.Player && !!MGOBE.Player.id;
}

/**
 * 设置房间广播回调函数
 * @param broadcastCallbacks 
 */
export function setBroadcastCallbacks(room: MGOBE.Room, context: any, broadcastCallbacks?: BroadcastCallbacks) {

    if (!room) {
        return;
    }

    // 默认回调函数
    const generateDefaultCallback = (tag: string) => (event) => null;

    const defaultCallbacks: BroadcastCallbacks = {
        onJoinRoom: () => generateDefaultCallback("onJoinRoom"),
        onLeaveRoom: () => generateDefaultCallback("onLeaveRoom"),
        onChangeRoom: () => generateDefaultCallback("onChangeRoom"),
        onChangeCustomPlayerStatus: () => generateDefaultCallback("onChangeCustomPlayerStatus"),
        onRemovePlayer: () => generateDefaultCallback("onRemovePlayer"),
        onRecvFromClient: () => generateDefaultCallback("onRecvFromClient"),
        onRecvFromGameSvr: () => generateDefaultCallback("onRecvFromGameSvr"),
        onAutoRequestFrameError: () => generateDefaultCallback("onAutoRequestFrameError"),
    };

    // 给 room 实例设置广播回调函数
    Object.keys(defaultCallbacks).forEach((key: keyof BroadcastCallbacks) => {
        const callback = broadcastCallbacks[key] ? broadcastCallbacks[key].bind(context) : defaultCallbacks[key];
        room[key] = callback;
    });
}

// SDK 发送实时服务器消息
export function sendToGameSvr(type: string, data: any) {
    console.log(`正在发送房间消息`, type, data);
    const sendToGameSvrPara: MGOBE.types.SendToGameSvrPara = {
        data: {
            type: type,
            data: data
        },
    };
    global.room.sendToGameSvr(sendToGameSvrPara, event => {
        if (event.code === MGOBE.ErrCode.EC_OK) {
            console.log(`发送实时服务器消息成功:`, data);
        } else {
            console.log(`发送实时服务器消息失败，错误码：${event.code}`);
        }
    });
}

//判断飞机是否重叠
export function judge_plane(playerPlanes: any): boolean {
    var flag = false
    var position = []
    for (var i = 0; i < playerPlanes.length; i++) {
        for (var j = i + 1; j < playerPlanes.length; j++) {
            var pos = getPlanePos(playerPlanes[i].PlaneData)//第i飞机的全部坐标
            var pos2 = getPlanePos(playerPlanes[j].PlaneData)//第i+1+n飞机的全部坐标
            pos.forEach(p => {
                pos2.forEach(p2 => {
                    if (p.x === p2.x && p.y === p2.y) {//重叠
                        // console.log("重叠", p.x, "=", p.y)
                        position.push({
                            x: p.x,
                            y: p.y
                        })
                        flag = true
                    }
                })
            })
        }
    }
    // console.log("不重叠")
    setWarmBlock(position)
    return flag
}

//矫正飞机位置
export function correct_plane() {
    //超过边界时自动将飞机移到地图中
    var playerPlanes = stateSyncState.playerPlanes
    var playerPlanes2 = []
    playerPlanes.forEach(p => {
        var PlaneData = p.PlaneData
        var plane_head = PlaneData.head
        var plane_tail = PlaneData.tail
        var head_x = plane_head.x
        var head_y = plane_head.y
        var tail_x = plane_tail.x
        var tail_y = plane_tail.y
        //根据机头方向分类讨论
        if (plane_head.x === plane_tail.x) {
            if (plane_head.y > plane_tail.y) {//机头朝上
                if (head_x < 3) {//超出左边界
                    head_x = 3
                    tail_x = 3
                }
                if (head_x > 18) {//超出右边界
                    head_x = 18
                    tail_x = 18
                }
                if (tail_y < 1) {//超出下边界
                    head_y = 4
                    tail_y = 1
                }
                if (head_y > 28) {//超出上边界
                    head_y = 28
                    tail_y = 25
                }
            } else {//机头朝下
                if (head_x < 3) {//超出左边界
                    head_x = 3
                    tail_x = 3
                }
                if (head_x > 18) {//超出右边界
                    head_x = 18
                    tail_x = 18
                }
                if (head_y < 1) {//超出下边界
                    head_y = 1
                    tail_y = 4
                }
                if (tail_y > 28) {//超出上边界
                    head_y = 25
                    tail_y = 28
                }
            }
        } else if (plane_head.x < plane_tail.x) {//机头朝左
            if (head_x < 1) {//超出左边界
                head_x = 1
                tail_x = 4
            }
            if (tail_x > 20) {//超出右边界
                head_x = 17
                tail_x = 20
            }
            if (head_y < 3) {//超出下边界
                head_y = 3
                tail_y = 3
            }
            if (head_y > 26) {//超出上边界
                head_y = 26
                tail_y = 26
            }
        } else {//机头朝右
            if (tail_x < 1) {//超出左边界
                head_x = 4
                tail_x = 1
            }
            if (head_x > 20) {//超出右边界
                head_x = 20
                tail_x = 17
            }
            if (head_y < 3) {//超出下边界
                head_y = 3
                tail_y = 3
            }
            if (head_y > 26) {//超出上边界
                head_y = 26
                tail_y = 26
            }
        }
        playerPlanes2.push({
            id: p.id,
            PlaneData: {
                id: PlaneData.id,
                head: {
                    x: head_x,
                    y: head_y
                },
                tail: {
                    x: tail_x,
                    y: tail_y
                }
            }
        })
    })
    setPlayerPlanesState(playerPlanes2)
}

//计算并返回飞机的全部坐标
export function getPlanePos(PlaneData: any) {

    var plane_head = PlaneData.head
    var plane_tail = PlaneData.tail

    var PlanePos = []//用于存储飞机坐标

    PlanePos.push({ x: plane_head.x, y: plane_head.y, head: true })
    PlanePos.push({ x: plane_tail.x, y: plane_tail.y })//机头机尾不用分类讨论直接存储

    if (plane_head.x === plane_tail.x) {
        if (plane_head.y > plane_tail.y) {//机头朝上
            PlanePos.push(
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
            PlanePos.push(
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
        PlanePos.push(
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
        PlanePos.push(
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
    return PlanePos

}

// SDK 退出房间
export function leaveRoom() {
    console.log(`正在退出房间`);
    cc.director.loadScene("Home");
    init()
    global.room.leaveRoom({}, event => {
        if (event.code === MGOBE.ErrCode.EC_OK) {
            init()
            console.log(`退出房间成功`);
        } else {
            console.log(`退出房间失败，错误码：${event.code}`);
        }
    });
}

