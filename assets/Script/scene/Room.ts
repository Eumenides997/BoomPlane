// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import global from "../global";
import * as Util from "../util";
import { setState, setDefauleSyncState } from "../logic/StateSyncLogic";

export enum SyncType {
    msg = "房间内发消息",
    state = "实时服务器状态同步",
    frame = "帧同步",
}

const { ccclass, property } = cc._decorator;

export enum StateSyncCmd {
    up = 1,
    down = 2,
    left = 3,
    right = 4,
}

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Button)
    leave_btn: cc.Button = null;

    @property(cc.Label)
    room_id_label: cc.Label = null;

    @property(cc.Label)
    player_count_label: cc.Label = null;


    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        const roomInfo = global.room && global.room.roomInfo || { playerList: [], owner: undefined } as MGOBE.types.RoomInfo;

        setState(
            [
                { id: "1", PlaneData: { id: 1, head: { x: 3, y: 15 }, tail: { x: 3, y: 12 } } },
                { id: "1", PlaneData: { id: 2, head: { x: 3, y: 1 }, tail: { x: 3, y: 4 } } },
                { id: "1", PlaneData: { id: 3, head: { x: 14, y: 5 }, tail: { x: 11, y: 5 } } },
                { id: "1", PlaneData: { id: 4, head: { x: 5, y: 5 }, tail: { x: 8, y: 5 } } }
            ]
        );

        this.leave_btn.node.on(cc.Node.EventType.TOUCH_START, () => this.leaveRoom());

        this.setRoomView()

        this.changeCustomProperties(SyncType.state);

        // 广播回调
        Util.setBroadcastCallbacks(global.room, this, this as any);

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, () => this.sendToGameSvr(StateSyncCmd.up), this);
    }

    setRoomView() {
        const roomInfo = global.room && global.room.roomInfo || { playerList: [], owner: undefined } as MGOBE.types.RoomInfo;
        console.log('房间信息:', roomInfo)
        this.room_id_label.string = roomInfo.id
        this.player_count_label.string = roomInfo.playerList.length.toString()
    }

    // update(dt) { }


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
            } else {
                console.log(`修改房间自定义信息失败，错误码：${event.code}`);
            }
        });
    }
    // SDK 退出房间
    leaveRoom() {
        console.log(`正在退出房间`);
        cc.director.loadScene("Home");

        global.room.leaveRoom({}, event => {
            if (event.code === MGOBE.ErrCode.EC_OK) {
                console.log(`退出房间成功`);
            } else {
                console.log(`退出房间失败，错误码：${event.code}`);
            }
        });
    }

    // SDK 解散房间
    dismissRoom() {
        console.log(`正在解散房间`);

        global.room.dismissRoom({}, event => {
            if (event.code === MGOBE.ErrCode.EC_OK) {
                console.log(`解散房间成功`);
            } else {
                console.log(`解散房间失败，错误码：${event.code}`);
            }
        });
    }

    // SDK 发送实时服务器消息
    sendToGameSvr(cmd: StateSyncCmd) {
        console.log(`正在发送房间消息`);

        const sendToGameSvrPara: MGOBE.types.SendToGameSvrPara = {
            data: {
                cmd,
            },
        };

        global.room.sendToGameSvr(sendToGameSvrPara, event => {
            if (event.code === MGOBE.ErrCode.EC_OK) {
                console.log(`发送实时服务器消息成功`);
            } else {
                console.log(`发送实时服务器消息失败，错误码：${event.code}`);
            }
        });
    }

    /////////////////////////////////// SDK 广播 ///////////////////////////////////
    // SDK 玩家退房广播
    onLeaveRoom(event: MGOBE.types.BroadcastEvent<MGOBE.types.LeaveRoomBst>) {
        console.log(`广播：玩家退房`);
    }
    // SDK 实时服务器广播
    onRecvFromGameSvr(event: MGOBE.types.BroadcastEvent<MGOBE.types.RecvFromGameSvrBst>) {
        // setState(event.data && event.data.data && event.data.data["players"]);
        console.log("实时服务器广播: ", event.data)
    }
}
