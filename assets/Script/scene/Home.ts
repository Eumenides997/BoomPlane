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

    @property(cc.Prefab)
    loadding: cc.Prefab = null;

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
        this.joinRoomButton.node.on(cc.Node.EventType.TOUCH_START, () => cc.director.loadScene("JoinRoom"));
        this.matchPlaerButton.node.on(cc.Node.EventType.TOUCH_START, () => cc.director.loadScene("MatchRoom"));
        // console.log("this is home")
        this.initSDK()
    }

    onJoinRoom() {

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


}
