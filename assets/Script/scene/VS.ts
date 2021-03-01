// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { stateSyncState } from "../logic/StateSyncLogic";
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
    win_pre: cc.Prefab = null;

    @property(cc.Prefab)
    lose_pre: cc.Prefab = null;

    load: any
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        this.btn_again.node.x = 9999
        this.btn_again.node.on(cc.Node.EventType.TOUCH_START, () => (Util.sendToGameSvr("again", "again"), this.enabled = true))
        this.btn_quit.node.on(cc.Node.EventType.TOUCH_START, Util.leaveRoom)
    }

    leaveRoom() {
        Util.leaveRoom()
    }

    update(dt) {
        if (stateSyncState.state === "游戏结束") {
            this.btn_again.node.x = 0
            this.btn_again.node.y = -230
            stateSyncState.players.find(p => {
                if (p.id === MGOBE.Player.id) {
                    if (p.ifWin) {
                        var win = cc.instantiate(this.win_pre)
                        this.node.addChild(win)
                        win.setPosition(cc.v2(0, 0))
                    } else {
                        var lose = cc.instantiate(this.lose_pre)
                        this.node.addChild(lose)
                        lose.setPosition(cc.v2(0, 0))
                    }
                }
            })
            this.enabled = false
        } else if (stateSyncState.state === "开始准备") {
            cc.director.loadScene("Room");
        } else if (stateSyncState.state === "准备就绪") {
            Util.sendToGameSvr("state", "游戏中")
        } else {
            this.btn_again.node.x = 9999
        }
    }
}
