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

    @property
    text: string = 'hello';

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        cc.director.preloadScene("Room")
        this.btn_again.node.x = 9999
        this.btn_again.node.on(cc.Node.EventType.TOUCH_START, () => Util.sendToGameSvr("again", "again"))
    }

    update(dt) {
        if (stateSyncState.state === "游戏结束") {
            this.btn_again.node.x = 0
        } else if (stateSyncState.state === "开始准备") {
            cc.director.loadScene("Room");
        } else {
            this.btn_again.node.x = 9999
        }
    }
}
