// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { stateSyncState, setGameState } from "../logic/StateSyncLogic";
import * as Util from "../util";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property(cc.Button)
    btn_again: cc.Button = null;

    @property(cc.Button)
    btn_quit: cc.Button = null;

    @property
    text: string = 'hello';

    @property(cc.Prefab)
    loadding: cc.Prefab = null;

    load: any
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        this.btn_again.node.x = 9999
        this.btn_again.node.on(cc.Node.EventType.TOUCH_START, () => Util.sendToGameSvr("again", "again"))
        this.btn_quit.node.on(cc.Node.EventType.TOUCH_START, Util.leaveRoom)
    }

    leaveRoom() {
        Util.leaveRoom()
    }

    update(dt) {
        if (stateSyncState.state === "游戏结束") {
            this.btn_again.node.x = 0
        } else if (stateSyncState.state === "开始准备") {
            cc.director.loadScene("Room");
        } else if (stateSyncState.state === "准备就绪") {
            Util.sendToGameSvr("state", "游戏中")
        } else {
            this.btn_again.node.x = 9999
        }
    }
}
