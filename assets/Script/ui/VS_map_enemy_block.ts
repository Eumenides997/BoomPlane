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

    @property
    padding: number = 1;

    @property
    block_x: number = null;

    @property
    block_y: number = null;

    @property(cc.Prefab)
    body_plane_crater: cc.Prefab = null;

    @property(cc.Prefab)
    head_plane_crater: cc.Prefab = null;

    @property(cc.Prefab)
    block_crater: cc.Prefab = null;

    @property
    plane: boolean = false;

    map: any;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        var touchReceiver = this.node
        touchReceiver.on("touchstart", this.onTouchStart, this)
        touchReceiver.on("touchend", this.onTouchEnd, this)
    }

    onTouchStart(event) {
    }

    onTouchEnd() {
        // this.show_block_crater()
        //发送点击坐标给服务器
        console.log("发送点击坐标给服务器: (", this.block_x, ",", this.block_y, ")")
        Util.sendToGameSvr("bomb", { x: this.block_x, y: this.block_y })
    }

    start() {

    }

    //地图块显示弹坑
    show_block_crater() {
        var body_plane = cc.instantiate(this.block_crater)
        this.node.addChild(body_plane)
        body_plane.setPosition(cc.v2(0, 0))
    }

    //地图块显示飞机机身弹坑
    show_plane_body_crater() {
        var body_plane = cc.instantiate(this.body_plane_crater)
        this.node.addChild(body_plane)
        body_plane.setPosition(cc.v2(0, 0))
    }

    //地图块显示飞机机头弹坑
    show_plane_head_crater() {
        var body_plane = cc.instantiate(this.head_plane_crater)
        this.node.addChild(body_plane)
        body_plane.setPosition(cc.v2(0, 0))
    }

    // update (dt) {}
}
