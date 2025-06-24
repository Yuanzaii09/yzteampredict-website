// 文件位置：/api/result.js

let latestPeriod = "";
let latestResult = "";
let latestProbability = 0;
let aiStartTime = 0;

module.exports = async (req, res) => {

    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    // 设置每天起始时间为 8:00 AM
    const start = new Date();
    start.setHours(8, 0, 0, 0);
    const diffMs = now - start;

    // ✅ 精准倒计时（不会跳）
    const msToNextPeriod = 30000 - (diffMs % 30000);
    const countdown = Math.floor(msToNextPeriod / 1000);

    // ✅ 期数偏移（调整和mzplay同步）+1为预测
    const baseOffset = 960;
    const currentPeriodNum = Math.floor(diffMs / 30000);
    const predictedPeriodNum = currentPeriodNum + baseOffset + 1;

    const fixedCode = "10005";

    // ✅ 构造真实期数（用于每期只生成一次）
    const currentPeriodId = `${year}${month}${day}${fixedCode}${String(currentPeriodNum + baseOffset).padStart(5, "0")}`;

    // ✅ 构造预测期号并删除第14位的0
    const predictedRaw = `${year}${month}${day}${fixedCode}${String(predictedPeriodNum).padStart(5, "0")}`;
    const period = predictedRaw.slice(0, 13) + predictedRaw.slice(14);

    // ✅ 每期开始只生成一次
    if (currentPeriodId !== latestPeriod) {
        latestPeriod = currentPeriodId;
        aiStartTime = Date.now();

        // 生成稳定 hash，用于 BIG / SMALL
        let hash = 0;
        for (let i = 0; i < period.length; i++) {
            hash = period.charCodeAt(i) + ((hash << 5) - hash);
        }

        latestResult = (hash % 2 === 0) ? "BIG" : "SMALL";

        const probSeed = Math.abs(hash) % 100;
        if (probSeed < 90) {
            latestProbability = Math.floor(Math.random() * 21) + 45; // 90%: 45–65%
        } else {
            latestProbability = Math.floor(Math.random() * 21) + 66; // 10%: 66–86%
        }
    }

    // ✅ 控制显示延迟时间（2~3秒）
    const elapsed = (Date.now() - aiStartTime) / 1000;
    const showResult = elapsed >= (2 + Math.random());

    let displayResult = "AI分析中...";
    let displayProbability = null;

    if (showResult) {
        displayResult = latestResult;
        displayProbability = latestProbability;
    }

    // ✅ 返回前端
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store");

    res.status(200).json({
        period,
        countdown,
        result: displayResult,
        probability: displayProbability
    });
};