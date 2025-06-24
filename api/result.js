let latestPeriod = "";
let latestResult = "";
let latestProbability = 0;
let aiStartTime = 0;

module.exports = async (req, res) => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    // ✅ 今天 8:00AM 开始计算
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0);
    const diffSeconds = Math.floor((now.getTime() - start.getTime()) / 1000);

    // ✅ 每30秒一期
    const currentPeriodNum = Math.floor(diffSeconds / 30);
    const baseOffset = 960; // 你实际测试的偏移
    const predictedPeriodNum = currentPeriodNum + baseOffset + 1;

    // ✅ 倒计时从 30 → 0
    const countdown = 30 - (diffSeconds % 30);

    // ✅ 当前实际期数（用于判断是否换期）
    const currentPeriodId = `${year}${month}${day}10005${String(currentPeriodNum + baseOffset).padStart(5, "0")}`;

    // ✅ 展示用预测期号（+1），并删除第14位的 0
    const rawPeriod = `${year}${month}${day}10005${String(predictedPeriodNum).padStart(5, "0")}`;
    const period = rawPeriod.slice(0, 13) + rawPeriod.slice(14); // 删除第14位0

    // ✅ 进入新期，生成新结果
    if (currentPeriodId !== latestPeriod) {
        latestPeriod = currentPeriodId;
        aiStartTime = Date.now();

        // 稳定 hash 决定 BIG / SMALL
        let hash = 0;
        for (let i = 0; i < period.length; i++) {
            hash = period.charCodeAt(i) + ((hash << 5) - hash);
        }

        latestResult = (hash % 2 === 0) ? "BIG" : "SMALL";

        const probSeed = Math.abs(hash) % 100;
        if (probSeed < 90) {
            latestProbability = Math.floor(Math.random() * 21) + 45; // 90%：45–65%
        } else {
            latestProbability = Math.floor(Math.random() * 21) + 66; // 10%：66–86%
        }
    }

    // ✅ 控制 AI运作中... 显示时间（2~3秒）
    const elapsed = (Date.now() - aiStartTime) / 1000;
    const showResult = elapsed >= (2 + Math.random());

    let displayResult = "AI分析中...";
    let displayProbability = null;

    if (showResult) {
        displayResult = latestResult;
        displayProbability = latestProbability;
    }

    // ✅ 返回数据
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({
        period,
        countdown,
        result: displayResult,
        probability: displayProbability
    });
};