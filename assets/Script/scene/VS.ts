// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { stateSyncState } from "../logic/StateSyncLogic";
import * as Util from "../util";
import bullet from "../ui/bullet"

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Label)
    time: cc.Label = null;

    @property(cc.Button)
    btn_again: cc.Button = null;

    @property(cc.Button)
    btn_quit: cc.Button = null;

    @property(cc.Button)
    bomb: cc.Button = null;

    @property(cc.Button)
    sign: cc.Button = null;

    @property(cc.Node)
    map_enemy: Node = null;

    @property(cc.Prefab)
    win_pre: cc.Prefab = null;

    @property(cc.Prefab)
    lose_pre: cc.Prefab = null;

    @property(cc.Node)
    exit: cc.Node = null;

    load: any
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        this.btn_again.node.x = 9999
        this.btn_again.node.on(cc.Node.EventType.TOUCH_START, () => (Util.sendToGameSvr("again", "again"), bullet.setBullet("正在等待对方再来一局")))
        var exit = this.exit
        exit.x = 9999
        this.btn_quit.node.on(cc.Node.EventType.TOUCH_START, () => exit.x = 0);
        this.bomb.node.on(cc.Node.EventType.TOUCH_START, this.onBomb)
        var map_enemy = this.map_enemy
        this.sign.node.on(cc.Node.EventType.TOUCH_START, () => this.onSign(map_enemy))
    }

    onSign(map_enemy) {
        var bomb = stateSyncState.bombPos
        var sign = stateSyncState.signPos
        var flag = true
        sign.find((p, key) => {
            if (p.x == bomb.x && p.y === bomb.y) {
                // bullet.setBullet("此位置已经标记")
                flag = false
                sign.splice(key, 1)
                return
            }
        })
        if (flag) {
            sign.push({
                x: bomb.x,
                y: bomb.y
            })
            console.log("辅助标记坐标: ", sign)
        }
        bomb.x = 0
        bomb.y = 0
        map_enemy.getComponent("VS_map_enemy").map_init()
    }

    onBomb() {
        var bomb = stateSyncState.bombPos
        var flag = true
        if (bomb.x > 0 && bomb.y > 0) {
            stateSyncState.craters_enemy.forEach(p => {
                if (p.x === bomb.x && p.y === bomb.y) {
                    bullet.setBullet("此位置已经被你炸过了")
                    flag = false
                }
            })
            if (flag) {
                console.log("开始发射炸弹")
                Util.sendToGameSvr("bomb", { x: bomb.x, y: bomb.y })
                bomb.x = 0
                bomb.y = 0
            }
        } else {
            bullet.setBullet("请点击炸弹投放位置")
        }
    }

    leaveRoom() {
        Util.leaveRoom()
    }

    update(dt) {
        stateSyncState.players.find(p => {
            if (p.id === MGOBE.Player.id) {
                if (p.ifBomb) {
                    this.bomb.node.x = 0
                } else {
                    this.bomb.node.x = 9999
                }
            }
        })
        this.time.string = stateSyncState.time.toString().slice(0, 0 + 3)
        if (stateSyncState.state === "游戏结束") {
            this.btn_again.node.x = 0
            this.btn_again.node.y = -230
            stateSyncState.players.find(p => {
                if (p.id === MGOBE.Player.id) {
                    if (p.ifWin) {
                        var win = cc.instantiate(this.win_pre)
                        this.node.addChild(win)
                        win.setPosition(cc.v2(0, 0))
                    } else {
                        var lose = cc.instantiate(this.lose_pre)
                        this.node.addChild(lose)
                        lose.setPosition(cc.v2(0, 0))
                    }
                }
            })
            // this.enabled = false
            bullet.setBullet("游戏结束")
        } else if (stateSyncState.state === "开始准备") {
            cc.director.loadScene("Room");
            bullet.setBullet("开始准备,加载房间中...")
        } else if (stateSyncState.state === "准备就绪") {
            Util.sendToGameSvr("state", "游戏中")
            bullet.setBullet("游戏开始")
        } else {
            this.btn_again.node.x = 9999
        }
    }
}
