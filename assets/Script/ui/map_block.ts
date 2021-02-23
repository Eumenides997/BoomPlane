// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property
    size: number = 35;

    @property
    padding: number = 1;

    @property
    block_x: number = null;

    @property
    block_y: number = null;

    @property(cc.Prefab)
    body_plane: cc.Prefab = null;

    @property(cc.Prefab)
    head_plane: cc.Prefab = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {

        var touchReceiver = this.node
        touchReceiver.on("touchstart", this.onTouchStart, this)
        touchReceiver.on("touchend", this.onTouchEnd, this)
    }

    onTouchStart(event) {
        console.log("点击的地图块坐标: (", this.block_x, ",", this.block_y + ")")//对应坐标的地图块位置
    }

    onTouchEnd() {
    }

    start() {

    }

    //地图块显示飞机机身
    show_plane_body() {
        var body_plane = cc.instantiate(this.body_plane)
        this.node.addChild(body_plane)
        body_plane.setPosition(cc.v2(0, 0))
    }
    //地图块显示飞机机头
    show_plane_head() {
        var head_plane = cc.instantiate(this.head_plane)
        this.node.addChild(head_plane)
        head_plane.setPosition(cc.v2(0, 0))
    }

    // update (dt) {}
}
