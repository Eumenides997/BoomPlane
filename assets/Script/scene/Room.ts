// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import global from "../global";
import * as Util from "../util";
import { setPlayerPlanesState, stateSyncState, setState } from "../logic/StateSyncLogic";
import { correct_plane, judge_plane } from "../util"
import bullet from "../ui/bullet"

export enum SyncType {
    msg = "房间内发消息",
    state = "实时服务器状态同步",
    frame = "帧同步",
}

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Button)
    leave_btn: cc.Button = null;

    @property(cc.Button)
    submmit_btn: cc.Button = null;

    @property(cc.Button)
    random_btn: cc.Button = null;

    @property(cc.Button)
    cancel_btn: cc.Button = null;

    @property(cc.Label)
    room_id_label: cc.Label = null;

    @property(cc.Label)
    player_count_label: cc.Label = null;

    @property(cc.Node)
    ready: cc.Node = null;

    @property(cc.Node)
    map: cc.Node = null;

    @property(cc.Node)
    exit: cc.Node = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        
        stateSyncState.flag_plane = true

        var map = this.map.getComponent("map")

        this.onRandom(map)

        // Util.sendToGameSvr("user", MGOBE.Player.id)

        var exit = this.exit

        exit.x = 9999

        this.leave_btn.node.on(cc.Node.EventType.TOUCH_START, () => exit.x = 0);

        this.ready.x = 9999

        this.random_btn.node.on(cc.Node.EventType.TOUCH_START, () => this.onRandom(map));

        this.cancel_btn.node.on(cc.Node.EventType.TOUCH_START, () => this.onCancel(this.ready, this.submmit_btn, this.random_btn, this.cancel_btn));

        //提交飞机布局
        this.submmit_btn.node.on(cc.Node.EventType.TOUCH_START, () =>
            (
                // this.node.addChild(ready),
                // ready.setPosition(cc.v2(0, 0)),
                this.onSubmmit_btn(this.node, this.ready, this.submmit_btn, this.random_btn, this.cancel_btn)
            ));

        this.setRoomView()

        // 广播回调
        Util.setBroadcastCallbacks(global.room, this, this as any);
        const roomInfo = global.room && global.room.roomInfo || { playerList: [], owner: undefined } as MGOBE.types.RoomInfo;

        if (roomInfo.owner === MGOBE.Player.id) {
            this.changeCustomProperties(SyncType.state);
        } else {
            console.log("MGOBE.types.CreateRoomType:", MGOBE.types.CreateRoomType)
        }

        // cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, () => this.sendToGameSvr(StateSyncCmd.up), this);
    }

    onCancel(ready, submmit_btn, random_btn, cancel_btn) {
        ready.x = 9999
        submmit_btn.node.x = 0
        random_btn.node.x = 280
        cancel_btn.node.x = 9999
        stateSyncState.flag_plane = true
        Util.sendToGameSvr("cancel_plane", "cancel_plane")
    }

    onRandom(map) {
        var pos = []
        for (var i = 0; i < 3; i++) {
            var head_x = parseInt((Math.random() * 14 + 1).toString())//机头x坐标 1->20
            var head_y = parseInt((Math.random() * 19 + 1).toString())//机头y坐标 1->28
            var direction = parseInt((Math.random() * 4).toString())//机头方向
            if (direction === 0) {//机头朝上
                var tail_x = head_x//机尾x坐标
                var tail_y = head_y - 3//机尾y坐标
            } else if (direction === 1) {//机头朝下
                var tail_x = head_x//机尾x坐标
                var tail_y = head_y + 3//机尾y坐标
            } else if (direction === 2) {//机头朝左
                var tail_x = head_x + 3//机尾x坐标
                var tail_y = head_y//机尾y坐标
            } else {//机头朝右
                var tail_x = head_x - 3//机尾x坐标
                var tail_y = head_y//机尾y坐标
            }
            // console.log("随机坐标(", head_x, ",", head_y, "),(", tail_x, ",", tail_y, ")")
            pos.push({
                head_x: head_x,
                head_y: head_y,
                tail_x: tail_x,
                tail_y: tail_y
            })
        }
        var playerPlanes = []
        pos.forEach((p, key) => {
            playerPlanes.push({
                id: MGOBE.Player.id,
                PlaneData: {
                    id: key,
                    head: {
                        x: p.head_x,
                        y: p.head_y
                    },
                    tail: {
                        x: p.tail_x,
                        y: p.tail_y
                    }
                }
            })
        })
        // console.log(pos)
        // console.log(playerPlanes)
        setPlayerPlanesState(playerPlanes)
        correct_plane()
        // console.log(stateSyncState.playerPlanes)
        var judge = judge_plane(stateSyncState.playerPlanes)//判断飞机是否重叠
        // console.log("是否重叠:", judge)
        if (judge) {
            this.onRandom(map)
        }
        map.map_init()
    }

    onSubmmit_btn(self, ready, submmit_btn, random_btn, cancel_btn) {
        // cc.director.loadScene("VS")
        var judge = judge_plane(stateSyncState.playerPlanes)//判断飞机是否重叠
        var flag = true
        // console.log("是否重叠:", judge)
        stateSyncState.players.find(p => {
            if (p.id === MGOBE.Player.id) {
                if (p.ifPlanes) {
                    flag = false
                }
            }
        })
        if (!judge) {
            if (flag) {
                Util.sendToGameSvr("submmit_plane", stateSyncState.playerPlanes)
            } else {
                bullet.setBullet("已经准备过了")
            }
        } else {
            // console.log("重叠")
            bullet.setBullet("飞机重叠,请更正摆放")
        }
        console.log("数据:", stateSyncState)
        if (stateSyncState.time !== 0) {
            ready.x = 0
            submmit_btn.node.x = 9999
            random_btn.node.x = 9999
            cancel_btn.node.x = 0
            stateSyncState.flag_plane = false
        }
    }

    setRoomView() {
        const roomInfo = global.room && global.room.roomInfo || { playerList: [], owner: undefined } as MGOBE.types.RoomInfo;
        // console.log('房间信息:', roomInfo)
        this.room_id_label.string = roomInfo.id
        this.player_count_label.string = roomInfo.playerList.length.toString()
    }

    update(dt) {
        // console.log("游戏信息: ", stateSyncState)
        if (stateSyncState.state === "准备就绪" || stateSyncState.state === "游戏中") {
            bullet.setBullet("玩家全部确认,正在进入游戏...")
            cc.director.loadScene("VS")
        }
        this.setRoomView()
    }

    /////////////////////////////////// SDK 操作 ///////////////////////////////////
    // SDK Room 更新回调
    onRoomUpdate() {
        // 如果不在房间内，或者房间已经销毁，回到上一页
        if (!global.room || !global.room.roomInfo || !global.room.roomInfo.playerList || !global.room.roomInfo.playerList.find(p => p.id === MGOBE.Player.id)) {
            return cc.director.loadScene("Home");
        }

        this.setRoomView();
    }

    // SDK 修改房间自定义信息
    changeCustomProperties(customProperties: SyncType) {
        console.log(`正在修改房间自定义信息为：${customProperties}`);

        global.room.changeRoom({ customProperties }, event => {
            if (event.code === MGOBE.ErrCode.EC_OK) {
                console.log(`修改房间自定义信息成功`);
                // Util.sendToGameSvr("user", MGOBE.Player.id)
            } else {
                console.log(`修改房间自定义信息失败，错误码：${event.code}`);
            }
        });
    }

    /////////////////////////////////// SDK 广播 ///////////////////////////////////
    // SDK 玩家退房广播
    onLeaveRoom(event: MGOBE.types.BroadcastEvent<MGOBE.types.LeaveRoomBst>) {
        // console.log(`广播：玩家退房`, event.data);
        bullet.setBullet("玩家退出房间")
    }
    // SDK 实时服务器广播
    onRecvFromGameSvr(event: MGOBE.types.BroadcastEvent<MGOBE.types.RecvFromGameSvrBst>) {
        // setState(event.data && event.data.data && event.data.data["players"]);
        console.log("实时服务器广播: ", event.data.data)
        setState(event.data.data)

    }
}
