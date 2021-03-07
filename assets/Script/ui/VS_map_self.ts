// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { stateSyncState } from "../logic/StateSyncLogic";
import { getPlanePos } from "../util"
import bullet from "../ui/bullet"

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
        let padding = block.getComponent("VS_map_self_block").padding
        for (var i = 0; i < 15; i++) {
            for (var j = 0; j < 20; j++) {
                //放置一个地图块
                var block = cc.instantiate(this.VS_block)
                this.node.addChild(block)
                block.setPosition(cc.v2(i * padding + i * size, j * padding + j * size))
                //给地图块设置坐标
                var map_block = block.getComponent("VS_map_self_block")
                map_block.map = this
                var block_x = i + 1
                var block_y = j + 1
                map_block.block_x = block_x
                map_block.block_y = block_y
                //遍历所有飞机
                stateSyncState.playerPlanes.find(p => {
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
                // for (var k = 0; k < stateSyncState.playerPlanes.length; k++) {
                //     //获取机头、机尾坐标
                //     var plane_head = stateSyncState.playerPlanes[k].PlaneData.head
                //     var plane_tail = stateSyncState.playerPlanes[k].PlaneData.tail
                //     //显示机头
                //     if (block_x === plane_head.x && block_y === plane_head.y) {
                //         map_block.show_plane_head()
                //     }
                //     //根据机头机尾放置飞机身体
                //     if (plane_head.x === plane_tail.x) {
                //         //飞机头部朝上或朝下摆放
                //         if (plane_head.y > plane_tail.y) {
                //             //飞机头部朝上摆放
                //             if (block_x === plane_head.x && block_y >= plane_tail.y && block_y < plane_head.y) {
                //                 map_block.show_plane_body()
                //             }//显示机头和机尾连线
                //             if (block_x >= plane_head.x - 2 && block_x <= plane_head.x + 2 && block_y === plane_head.y - 1) {
                //                 map_block.show_plane_body()
                //             }//显示机侧翼
                //             if (block_x >= plane_head.x - 1 && block_x <= plane_head.x + 1 && block_y === plane_head.y - 3) {
                //                 map_block.show_plane_body()
                //             }//显示机尾翼
                //         } else {
                //             //飞机头部朝下摆放
                //             if (block_x === plane_head.x && block_y <= plane_tail.y && block_y > plane_head.y) {
                //                 map_block.show_plane_body()
                //             }//显示机头和机尾连线
                //             if (block_x >= plane_head.x - 2 && block_x <= plane_head.x + 2 && block_y === plane_head.y + 1) {
                //                 map_block.show_plane_body()
                //             }//显示机侧翼
                //             if (block_x >= plane_head.x - 1 && block_x <= plane_head.x + 1 && block_y === plane_head.y + 3) {
                //                 map_block.show_plane_body()
                //             }//显示机尾翼
                //         }
                //     } else if (plane_head.x < plane_tail.x) {
                //         //飞机头部朝左摆放
                //         if (block_x <= plane_tail.x && block_x > plane_head.x && block_y === plane_head.y) {
                //             map_block.show_plane_body()
                //         }//显示机头和机尾连线
                //         if (block_x === plane_head.x + 1 && block_y <= plane_head.y + 2 && block_y >= plane_head.y - 2) {
                //             map_block.show_plane_body()
                //         }//显示机侧翼
                //         if (block_x === plane_head.x + 3 && block_y <= plane_head.y + 1 && block_y >= plane_head.y - 1) {
                //             map_block.show_plane_body()
                //         }//显示机尾翼
                //     } else {
                //         //飞机头部朝右摆放
                //         if (block_x >= plane_tail.x && block_x < plane_head.x && block_y === plane_head.y) {
                //             map_block.show_plane_body()
                //         }//显示机头和机尾连线
                //         if (block_x === plane_head.x - 1 && block_y <= plane_head.y + 2 && block_y >= plane_head.y - 2) {
                //             map_block.show_plane_body()
                //         }//显示机侧翼
                //         if (block_x === plane_head.x - 3 && block_y <= plane_head.y + 1 && block_y >= plane_head.y - 1) {
                //             map_block.show_plane_body()
                //         }//显示机尾翼
                //     }
                // }

                //遍历所有己方地图炸弹
                stateSyncState.craters_self.forEach(crater => {
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

    private static isUpdate: boolean = false

    public static setUpdate() {
        this.isUpdate = true
    }

    update(dt) {
        if (NewClass.isUpdate) {//有新的弹坑时重新加载地图
            // console.log("加载地图...")
            bullet.setBullet("投放炸弹中...")
            this.map_init()
            NewClass.isUpdate = false//加载完成后停止重复加载
        }
    }
}
