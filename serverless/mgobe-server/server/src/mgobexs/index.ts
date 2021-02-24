import { mgobexsInterface } from './mgobexsInterface';
import { SyncType, clearGameState, GameData, removePlayer, initPlayer, StateSyncCmd, initGameState, setPlayer } from './GameServerState';

const gameServer: mgobexsInterface.GameServer.IGameServer = {
	mode: 'async',
	onInitGameData: function (): mgobexsInterface.GameData {
		return {
			syncType: SyncType.msg,
			timer: undefined,
			players: [],
		};
	},
	onRecvFromClient: function ({ actionData, sender, gameData, SDK, room, exports }: mgobexsInterface.ActionArgs<mgobexsInterface.UserDefinedData>) {
		const text = actionData.text;
		// 更新玩家状态
		setPlayer(sender, text, gameData as GameData);
	},
	onJoinRoom: function ({ actionData, gameData, SDK, room, exports }) {
		// 初始化玩家到游戏数据中
		initPlayer(actionData.joinPlayerId, gameData as GameData, 0, room.playerList.findIndex(p => p.id === actionData.joinPlayerId));
	},
	onLeaveRoom: function ({ actionData, gameData, SDK, room, exports }) {
		if (!room || !room.playerList || room.playerList.length === 0) {
			// 房间无人，清理游戏数据
			return clearGameState(gameData as GameData);
		}

		// 移除
		removePlayer(actionData.leavePlayerId, gameData as GameData);
	},
	onDestroyRoom: function ({ actionData, gameData, SDK, room, exports }) {
		// 房间销毁，清理游戏数据
		clearGameState(gameData as GameData);
	},
	onChangeRoom: function (args) {
		if ((args.gameData as GameData).timer && args.room && args.room.customProperties === SyncType.state) {
			return;
		}

		if (!args.room || args.room.customProperties !== SyncType.state) {
			// 不处于状态同步模式，清理游戏数据
			clearGameState(args.gameData as GameData);
		}

		if (args.room && args.room.customProperties === SyncType.state) {
			// 当前处于状态同步模式，初始化游戏数据
			initGameState(args.gameData as GameData, args)
		}
	},
};
// 服务器初始化时调用
function onInitGameServer(tcb: any) {
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

export const mgobexsCode: mgobexsInterface.mgobexsCode = {
	logLevel: 'debug+',
	logLevelSDK: 'debug+',
	gameInfo: {
		gameId: "obg-2qurdv17",
		serverKey: "d613ec2c0ab152e9921f634e277a59e7859fb313",
	},
	// onInitGameServer,
	gameServer
}
