// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;



@ccclass
export default class NewClass extends cc.Component {


    @property(cc.Label)
    label: cc.Label = null;

    private static staticLogStrs: string = "经典飞机大战"

    private static time: number = 255

    public static setBullet(data: string) {
        this.staticLogStrs = data
        this.time = 255
    }

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        // this.label.string = "666"
    }

    update(dt) {
        this.label.string = NewClass.staticLogStrs
        this.node.opacity = NewClass.time
        NewClass.time -= 2
    }
}
