/**
 * 随机产生 openId
 */
const mockOpenId = (): string => {
    let str = Date.now().toString(36);

    for (let i = 0; i < 7; i++) {
        str += Math.ceil(Math.random() * (10 ** 4)).toString(36);
    }

    return str;
};

export default {
    // MGOBE 游戏信息
    gameId: "obg-2qurdv17",
    secretKey: "d613ec2c0ab152e9921f634e277a59e7859fb313",
    url: "2qurdv17.wxlagame.com",
    // 玩家 ID，建议使用真实的 openId
    openId: mockOpenId(),
    // 默认匹配 Code
    matchCode: "match-qrin4la6",
};