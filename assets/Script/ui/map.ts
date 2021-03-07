// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { stateSyncState } from "../logic/StateSyncLogic";
import { getPlanePos } from "../util"

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Prefab)
    block: cc.Prefab = null;

    @property
    width: number = 15;

    @property
    height: number = 20;

    // LIFE-CYCLE CALLBACKS:

    // onLoad() {}

    start() {
        //初始化地图
        this.map_init()
    }

    //初始化地图
    map_init() {
        console.log("stateSyncState: ", stateSyncState)
        //获取地图块的尺寸和边界
        var block = cc.instantiate(this.block)
        let size = block.width
        let padding = block.getComponent("map_block").padding
        for (var i = 0; i < 15; i++) {
            for (var j = 0; j < 20; j++) {
                //放置一个地图块
                var block = cc.instantiate(this.block)
                this.node.addChild(block)
                block.setPosition(cc.v2(i * padding + i * size, j * padding + j * size))
                //给地图块设置坐标
                var map_block = block.getComponent("map_block")
                map_block.map = this
                var block_x = i + 1
                var block_y = j + 1
                map_block.block_x = block_x
                map_block.block_y = block_y
                //遍历所有飞机
                stateSyncState.playerPlanes.forEach(p => {
                    var PlaneData = p.PlaneData
                    var planePos = getPlanePos(PlaneData)
                    planePos.find(p => {
                        if (p.x === block_x && p.y === block_y) {
                            if (!p.head) {
                                map_block.show_plane_body()
                            } else {
                                map_block.show_plane_head()
                            }
                        }
                    })
                })
                //遍历所有重叠部分
                stateSyncState.warmBlock.forEach(p => {
                    if (p.x === block_x && p.y === block_y) {
                        map_block.show_warm()
                    }
                })

            }
        }
    }

    // update(dt) {
    //     this.map_init()
    // }
}
