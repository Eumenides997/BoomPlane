import configs from "./config";
import global from "./global";

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
    global.room.leaveRoom({}, event => {
        if (event.code === MGOBE.ErrCode.EC_OK) {
            console.log(`退出房间成功`);
        } else {
            console.log(`退出房间失败，错误码：${event.code}`);
        }
    });
}
