// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import * as Util from "../util";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Button)
    confirm: cc.Button = null;

    @property(cc.Button)
    cancel: cc.Button = null;

    @property
    text: string = 'hello';

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        this.confirm.node.on(cc.Node.EventType.TOUCH_START, Util.leaveRoom)
        var self = this.node
        this.cancel.node.on(cc.Node.EventType.TOUCH_START, () => this.recover(self))
    }

    show(self) {
        self.x = 0
    }

    recover(self) {
        self.x = 9999
    }

    // update (dt) {}
}
