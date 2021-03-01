// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import * as Util from "../util";
import global from "../global";
import configs from "../config"

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Button)
    cancel_btn: cc.Button = null;

    @property
    text: string = 'hello';

    private timer = undefined;

    private flag: boolean = true

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        this.cancel_btn.node.on(cc.Node.EventType.TOUCH_START, () => (cc.director.loadScene("Home"), this.flag = false));
        this.matchPlayers(configs.matchCode)
    }

    // update (dt) {}

    // SDK 随机匹配
    matchPlayers(matchCode: string) {
        if (!matchCode) {
            return console.log(`请输入正确的匹配 Code`);
        }

        this.timer = setInterval(() => console.log(`正在随机匹配，请稍等。`), 1000);
        console.log(`正在随机匹配，匹配Code：${matchCode}。请稍等，默认超时时间为 10 秒。`);

        // 注意：这里没有使用匹配属性，如果匹配规则中有设置匹配属性，这里需要做调整
        const matchAttributes: MGOBE.types.MatchAttribute[] = [];

        const playerInfo: MGOBE.types.MatchPlayerInfoPara = {
            name: "测试玩家",
            customPlayerStatus: 0,
            customProfile: "",
            matchAttributes,
        };

        const matchPlayersPara: MGOBE.types.MatchPlayersPara = {
            matchCode,
            playerInfo,
        };

        global.room.initRoom();
        global.room.matchPlayers(matchPlayersPara, event => {
            clearInterval(this.timer);
            if (event.code === MGOBE.ErrCode.EC_OK) {
                console.log(`随机匹配成功，房间ID：${event.data.roomInfo.id}`);
                if(this.flag){
                    cc.director.loadScene("Room")
                }else{
                    Util.leaveRoom()
                }
            } else {
                console.log(`随机匹配失败，错误码：${event.code}`);
            }
        });
    }
}
