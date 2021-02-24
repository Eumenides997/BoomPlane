"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mgobexsCode = void 0;
const GameServerState_1 = require("./GameServerState");
const gameServer = {
    mode: 'async',
    onInitGameData: function () {
        return {
            syncType: GameServerState_1.SyncType.msg,
            timer: undefined,
            players: [],
        };
    },
    onRecvFromClient: function ({ actionData, sender, gameData, SDK, room, exports }) {
        const text = actionData.text;
        // 更新玩家状态
        GameServerState_1.setPlayer(sender, text, gameData);
    },
    onJoinRoom: function ({ actionData, gameData, SDK, room, exports }) {
        // 初始化玩家到游戏数据中
        GameServerState_1.initPlayer(actionData.joinPlayerId, gameData, 0, room.playerList.findIndex(p => p.id === actionData.joinPlayerId));
    },
    onLeaveRoom: function ({ actionData, gameData, SDK, room, exports }) {
        if (!room || !room.playerList || room.playerList.length === 0) {
            // 房间无人，清理游戏数据
            return GameServerState_1.clearGameState(gameData);
        }
        // 移除
        GameServerState_1.removePlayer(actionData.leavePlayerId, gameData);
    },
    onDestroyRoom: function ({ actionData, gameData, SDK, room, exports }) {
        // 房间销毁，清理游戏数据
        GameServerState_1.clearGameState(gameData);
    },
    onChangeRoom: function (args) {
        if (args.gameData.timer && args.room && args.room.customProperties === GameServerState_1.SyncType.state) {
            return;
        }
        if (!args.room || args.room.customProperties !== GameServerState_1.SyncType.state) {
            // 不处于状态同步模式，清理游戏数据
            GameServerState_1.clearGameState(args.gameData);
        }
        if (args.room && args.room.customProperties === GameServerState_1.SyncType.state) {
            // 当前处于状态同步模式，初始化游戏数据
            GameServerState_1.initGameState(args.gameData, args);
        }
    },
};
// 服务器初始化时调用
function onInitGameServer(tcb) {
    // 如需要，可以在此初始化 TCB
    const tcbApp = tcb.init({
        secretId: "请填写腾讯云API密钥ID",
        secretKey: "请填写腾讯云API密钥KEY",
        env: "请填写云开发环境ID",
        serviceUrl: 'http://tcb-admin.tencentyun.com/admin',
        timeout: 5000,
    });
    // ...
}
exports.mgobexsCode = {
    logLevel: 'debug+',
    logLevelSDK: 'debug+',
    gameInfo: {
        gameId: "obg-2qurdv17",
        serverKey: "d613ec2c0ab152e9921f634e277a59e7859fb313",
    },
    // onInitGameServer,
    gameServer
};
