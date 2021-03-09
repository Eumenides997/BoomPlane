import global from "./global"
window.WeChat = {

}

//微信注册登录调用
WeChat.onRegisterUser = function (_userinfo) {
    //调用云函数处理注册
    wx.cloud.callFunction({
        //云函数名字
        name: "login",
        //传入的参数
        data: {
            userinfo: _userinfo
        },
        success(res) {
            console.log("登录回调成功", res)
            global.userInfo = res.result.data.userinfo
            // console.log("G:", global.userInfo)
            cc.director.loadScene("Home")
        },
        fail: console.error()
    })
}