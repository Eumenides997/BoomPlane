// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { stateSyncState, setState } from "../logic/StateSyncLogic";

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

    @property
    plane: boolean = false;

    map: any;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        var touchReceiver = this.node
        touchReceiver.on("touchstart", this.onTouchStart, this)
        touchReceiver.on("touchmove", this.onTouchMove, this)
        touchReceiver.on("touchend", this.onTouchEnd, this)
        touchReceiver.on("touchcancel", this.onTouchCancel, this)
    }

    //判断是否有飞机,并返回飞机对象
    getBlockData() {
        for (var k = 0; k < stateSyncState.playerPlanes.length; k++) {
            var PlaneData = stateSyncState.playerPlanes[k].PlaneData
            var plane_head = PlaneData.head
            //待完善->点击所有飞机的位置都可以判断成功
            if (plane_head.x === this.block_x && plane_head.y === this.block_y) {
                return PlaneData
            }
        }
    }

    //按飞机id逆时针旋转飞机
    rotatePlane(id: string) {
        var stateSyncState2 = []
        for (var k = 0; k < stateSyncState.playerPlanes.length; k++) {
            var players = stateSyncState.playerPlanes[k]
            var PlaneData = players.PlaneData
            if (PlaneData.id === id) {//找到飞机
                var plane_head = PlaneData.head
                var plane_tail = PlaneData.tail
                //旋转
                if (plane_head.x === plane_tail.x) {
                    if (plane_head.y > plane_tail.y) {
                        //机头朝上
                        players.PlaneData.head.x -= 1
                        players.PlaneData.head.y -= 1
                        players.PlaneData.tail.x += 2
                        players.PlaneData.tail.y += 2
                    } else {
                        //机头朝下
                        players.PlaneData.head.x += 1
                        players.PlaneData.head.y += 1
                        players.PlaneData.tail.x -= 2
                        players.PlaneData.tail.y -= 2
                    }
                } else if (plane_head.x < plane_tail.x) {
                    //机头朝左
                    players.PlaneData.head.x += 1
                    players.PlaneData.head.y -= 1
                    players.PlaneData.tail.x -= 2
                    players.PlaneData.tail.y += 2
                } else {
                    //机头朝右
                    players.PlaneData.head.x -= 1
                    players.PlaneData.head.y += 1
                    players.PlaneData.tail.x += 2
                    players.PlaneData.tail.y -= 2
                }
                stateSyncState2.push(players)
            } else {
                stateSyncState2.push(players)
            }
        }
        // console.log("stateSyncState2: ", stateSyncState2)
        setState(stateSyncState2)
        // console.log("stateSyncState: ", stateSyncState)
        this.map.map_init()
    }

    onTouchStart(event) {

    }

    onTouchEnd() {
        //判断地图块上是否有飞机
        var PlaneData = this.getBlockData()
        if (PlaneData) {
            //旋转
            // console.log("旋转plane: ", PlaneData.id)
            this.rotatePlane(PlaneData.id)

        }
    }

    onTouchMove(event) {
        //判断地图块上是否有飞机
        var PlaneData = this.getBlockData()
        if (PlaneData) {
            this.plane = true//判断按下机头
            // console.log("按下机头,plane: ", PlaneData.id)
        }
    }

    //移动飞机按位移坐标
    movePlane(dit_x, dit_y, id) {
        var stateSyncState2 = []
        for (var k = 0; k < stateSyncState.playerPlanes.length; k++) {
            var players = stateSyncState.playerPlanes[k]
            var PlaneData = players.PlaneData
            if (PlaneData.id === id) {//找到飞机
                players.PlaneData.head.x += dit_x
                players.PlaneData.head.y += dit_y
                players.PlaneData.tail.x += dit_x
                players.PlaneData.tail.y += dit_y
                stateSyncState2.push(players)
            } else {
                stateSyncState2.push(players)
            }

        }
        // console.log("stateSyncState2: ", stateSyncState2)
        setState(stateSyncState2)
        // console.log("stateSyncState: ", stateSyncState)
        this.map.map_init()
    }

    onTouchCancel(event) {
        if (this.plane) {//有飞机
            console.log("松开机头机头: (", this.block_x, ",", this.block_y + ")")
            this.plane = false//判断松开机头
            var nodePos1 = event.getStartLocation(); //获取触摸结束之前的坐标；
            // console.log("nodePos1: (", nodePos1.x, ",", nodePos1.y, ")")
            var nodePos2 = event.getLocation(); //获取触摸结束之后的坐标；
            // console.log("nodePos2: (", nodePos2.x, ",", nodePos2.y, ")")
            var width = this.size + 4
            //输出移动到的地图坐标
            var dit_x = (nodePos2.x - nodePos1.x) / width
            var dit_y = (nodePos2.y - nodePos1.y) / width
            dit_x = parseInt(dit_x.toString())
            dit_y = parseInt(dit_y.toString())
            // console.log("(block_x,block_x): (", dit_x, ",", dit_y, ")")
            //移动飞机
            var PlaneData = this.getBlockData()
            this.movePlane(dit_x, dit_y, PlaneData.id)
        }
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
