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
