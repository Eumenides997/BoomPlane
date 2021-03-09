// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
        BGSprite: {
            default: null,
            type: cc.Sprite,
            serialzable: true
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        console.log("1")
        var self = this
        let _url = "https://776f-workspace-2gaf9cuc022547d5-1305014436.tcb.qcloud.la/Texture/login_bg.png?sign=785508f6eb2a6f08de03e5edc269f844&t=1615123853"
        cc.loader.load({
            url: _url,
            type: 'png'
        }, function (err, texture) {
            console.log("2")
            var frame = new cc.SpriteFrame(texture)
            if (err) {
                console.log("登录背景图片", err)
            }
            console.log("3")
            self.BGSprite.getComponent(cc.Sprite).spriteFrame = frame
        })
    },

    start() {

    },

    // update (dt) {},
});

wx.login({
    success: function (res) {
        if (res.code) {
            console.log("登录成功，获取到code", res.code)
        }
        let width = window.wx.getSystemInfoSync().screenWidth;
        let height = window.wx.getSystemInfoSync().screenHeight

        var button = wx.createUserInfoButton({
            type: 'text',
            text: '',
            style: {
                left: 0,
                top: 0,
                width: width,
                height: height
            }
        })
        button.show()
        button.onTap((res) => {
            console.log(res)
            if (res.errMsg === "getUserInfo:ok") {
                console.log("已经授权")
                WeChat.onRegisterUser(res.userInfo)
                console.log(res)
                button.destroy()
            } else {
                console.log("拒绝授权")
            }
        })
    }
})
