// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import global from "../global";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    @property(cc.EditBox)
    editBox: cc.EditBox = null;

    @property(cc.Button)
    editClick: cc.Button = null;

    @property(cc.Button)
    back_btn: cc.Button = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        this.editClick.node.on(cc.Node.EventType.TOUCH_START, this.onEditClick, this);
        this.back_btn.node.on(cc.Node.EventType.TOUCH_START, () => cc.director.loadScene("Home"));
    }

    onEditClick(data: string) {
        joinRoom(this.editBox.getComponent(cc.EditBox).string)
    }

    // update (dt) {}
}

// SDK 加入房间
export function joinRoom(roomId: string) {
    if (!roomId) {
        console.log('房间号不能为空');;
    }
    console.log(`正在加入房间，房间ID：${roomId}`);
    const playerInfo: MGOBE.types.PlayerInfoPara = {
        name: "测试玩家",
        customPlayerStatus: 0,
        customProfile: "",
    };
    const joinRoomPara: MGOBE.types.JoinRoomPara = {
        playerInfo,
    };
    global.room.initRoom({ id: roomId });
    global.room.joinRoom(joinRoomPara, event => {
        if (event.code === MGOBE.ErrCode.EC_OK) {
            cc.director.loadScene("Room")
            console.log(`加入房间成功，房间ID：${event.data.roomInfo.id}`);
        } else {
            console.log(`加入房间失败，${event.code === MGOBE.ErrCode.EC_ROOM_TEAM_MEMBER_LIMIT_EXCEED ? "当前房间玩家数量已满，" : ""}错误码：${event.code}`);
        }
    });
}