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

    // 设置起始时间为每天 8:00 AM
    const start = new Date();
    start.setHours(8, 0, 0, 0);
    const diffMs = now - start;

    const seconds = Math.floor(diffMs / 1000);
    const currentPeriodNum = Math.floor(seconds / 30);     // 当前期数
    const baseOffset = 960;                                 // 手动偏移修正
    const countdown = 30 - (seconds % 30);                  // 真实倒计时

    const fixedCode = "10005";

    // 当前真实期数（用于判断是否进入新期）
    const currentPeriodId = `${year}${month}${day}${fixedCode}${String(currentPeriodNum + baseOffset).padStart(5, "0")}`;

    // 前端看到的是下一期（+1）
    const predictedPeriodNum = currentPeriodNum + baseOffset + 1;
    const predictedRaw = `${year}${month}${day}${fixedCode}${String(predictedPeriodNum).padStart(5, "0")}`;
    const period = predictedRaw.slice(0, 13) + predictedRaw.slice(14);  // 删除第14位的0

    // 每期刷新时，生成结果和概率
    if (currentPeriodId !== latestPeriod) {
        latestPeriod = currentPeriodId;
        aiStartTime = Date.now();

        // 稳定 hash，决定 BIG / SMALL
        let hash = 0;
        for (let i = 0; i < period.length; i++) {
            hash = period.charCodeAt(i) + ((hash << 5) - hash);
        }

        latestResult = (hash % 2 === 0) ? "BIG" : "SMALL";

        const probSeed = Math.abs(hash) % 100;
        if (probSeed < 90) {
            latestProbability = Math.floor(Math.random() * 21) + 45;  // 90%：45–65%
        } else {
            latestProbability = Math.floor(Math.random() * 21) + 66;  // 10%：66–86%
        }
    }

    // 判断是否要显示结果（2~3 秒后）
    const elapsed = (Date.now() - aiStartTime) / 1000;
    const showResult = elapsed >= (2 + Math.random());

    let displayResult = "AI分析中...";
    let displayProbability = null;

    if (showResult) {
        displayResult = latestResult;
        displayProbability = latestProbability;
    }

    // 返回 JSON 数据
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({
        period,
        countdown,
        result: displayResult,
        probability: displayProbability
    });
};