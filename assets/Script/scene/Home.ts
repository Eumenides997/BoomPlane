// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import * as Util from "../util";
import global from "../global";
import configs from "../config"

const { ccclass, property } = cc._decorator;

@ccclass
export default class Home extends cc.Component {

    @property(cc.Button)
    createRoomButton: cc.Button = null;

    @property(cc.Button)
    joinRoomButton: cc.Button = null;

    @property(cc.Button)
    matchPlaerButton: cc.Button = null;

    // 首页游戏ID
    public static gameId: string = "";
    // 首页游戏Key
    public static secretKey: string = "";
    // 首页域名
    public static url: string = "";
    /// CA 根证书（Cocos Native 环境下 wss 需要此参数）
    private static cacertNativeUrl = "";

    private timer = undefined;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        this.createRoomButton.node.on(cc.Node.EventType.TOUCH_START, () => this.createRoom());
        this.joinRoomButton.node.on(cc.Node.EventType.TOUCH_START, () => this.joinRoom("aZU55YVO"));
        this.matchPlaerButton.node.on(cc.Node.EventType.TOUCH_START, () => this.matchPlayers(configs.matchCode));
        console.log("this is home")
        this.initSDK()
    }

    loadRoomScene() {
        cc.director.loadScene("Room");
    }

    // update (dt) {}

    /////////////////////////////////// SDK 操作 ///////////////////////////////////
    // SDK 初始化
    initSDK() {

        if (cc.sys.isNative && !Home.cacertNativeUrl) {
            // CA 根证书（Cocos Native 环境下 wss 需要此参数）
            return cc.loader.loadRes("/cacert", cc.Asset, (err, asset: cc.Asset) => {

                console.log("加载证书结束 " + (!err));

                if (err) {
                    return;
                }

                Home.cacertNativeUrl = asset.nativeUrl;

                this.initSDK();
            });
        }

        Util.initSDK(configs.gameId, configs.secretKey, configs.url, Home.cacertNativeUrl, event => {
            if (event.code === MGOBE.ErrCode.EC_OK) {
                console.log("初始化 SDK 成功");
            } else {
                console.log(`初始化 SDK 失败，错误码：${event.code}`);
            }
        });

    }
    // SDK 创建房间
    createRoom() {
        console.log(`正在创建房间`);

        const playerInfo: MGOBE.types.PlayerInfoPara = {
            name: "测试玩家",
            customPlayerStatus: 0,
            customProfile: "",
        };

        const createRoomPara: MGOBE.types.CreateRoomPara = {
            roomName: "cocos_demo",
            roomType: "create",
            maxPlayers: 5,
            isPrivate: true,
            customProperties: "",
            playerInfo,
        };

        global.room.initRoom();
        global.room.createRoom(createRoomPara, event => {
            if (event.code === MGOBE.ErrCode.EC_OK) {
                console.log(`创建房间成功，房间ID：${event.data.roomInfo.id}`);
                this.loadRoomScene()
            } else {
                console.log(`创建房间失败，错误码：${event.code}`);
            }
        });
    }
    // SDK 加入房间
    joinRoom(roomId: string) {
        if (!roomId) {
            return console.log(`请输入正确的房间ID`);
        }

        console.log(`正在加入房间，房间ID：${roomId}`);

        const playerInfo: MGOBE.types.PlayerInfoPara = {
            name: "测试玩家",
            customPlayerStatus: 0,
            customProfile: "",
        };

        const joinRoomPara: MGOBE.types.JoinRoomPara = {
            playerInfo,
        };

        global.room.initRoom({ id: roomId });
        global.room.joinRoom(joinRoomPara, event => {
            if (event.code === MGOBE.ErrCode.EC_OK) {
                console.log(`加入房间成功，房间ID：${event.data.roomInfo.id}`);
            } else {
                console.log(`加入房间失败，${event.code === MGOBE.ErrCode.EC_ROOM_TEAM_MEMBER_LIMIT_EXCEED ? "当前房间玩家数量已满，" : ""}错误码：${event.code}`);
            }
        });
    }
    // SDK 随机匹配
    matchPlayers(matchCode: string) {
        if (!matchCode) {
            return console.log(`请输入正确的匹配 Code`);
        }

        this.timer = setInterval(() => console.log(`正在随机匹配，请稍等。`), 1000);
        console.log(`正在随机匹配，匹配Code：${matchCode}。请稍等，默认超时时间为 10 秒。`);

        // 注意：这里没有使用匹配属性，如果匹配规则中有设置匹配属性，这里需要做调整
        const matchAttributes: MGOBE.types.MatchAttribute[] = [];

        const playerInfo: MGOBE.types.MatchPlayerInfoPara = {
            name: "测试玩家",
            customPlayerStatus: 0,
            customProfile: "",
            matchAttributes,
        };

        const matchPlayersPara: MGOBE.types.MatchPlayersPara = {
            matchCode,
            playerInfo,
        };

        global.room.initRoom();
        global.room.matchPlayers(matchPlayersPara, event => {
            clearInterval(this.timer);

            if (event.code === MGOBE.ErrCode.EC_OK) {
                console.log(`随机匹配成功，房间ID：${event.data.roomInfo.id}`);
            } else {
                console.log(`随机匹配失败，错误码：${event.code}`);
            }
        });
    }
}
