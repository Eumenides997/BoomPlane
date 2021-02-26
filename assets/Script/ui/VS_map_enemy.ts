// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { stateSyncState } from "../logic/StateSyncLogic";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Prefab)
    VS_block: cc.Prefab = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad() {}

    start() {
        //初始化地图
        this.map_init()
    }

    picked() {
        this.node.destroy()
    }

    //初始化地图
    map_init() {
        console.log("stateSyncState: ", stateSyncState)
        //获取地图块的尺寸和边界
        var block = cc.instantiate(this.VS_block)
        let size = block.width
        let padding = block.getComponent("VS_map_enemy_block").padding
        for (var i = 0; i < 15; i++) {
            for (var j = 0; j < 22; j++) {
                //放置一个地图块
                var block = cc.instantiate(this.VS_block)
                this.node.addChild(block)
                block.setPosition(cc.v2(i * padding + i * size, j * padding + j * size))
                //给地图块设置坐标
                var map_block = block.getComponent("VS_map_enemy_block")
                map_block.map = this
                var block_x = i + 1
                var block_y = j + 1
                map_block.block_x = block_x
                map_block.block_y = block_y
                //遍历所有敌方地图炸弹
                stateSyncState.craters_enemy.forEach(crater => {
                    if (crater.x === block_x && crater.y === block_y) {
                        if (crater.type === "block") {
                            map_block.show_block_crater()
                        } else if (crater.type === "head") {
                            map_block.show_plane_head_crater()
                        } else if (crater.type === "body") {
                            map_block.show_plane_body_crater()
                        }
                    }
                })
            }
        }
    }

    update(dt) {
        this.map_init()
    }
}
