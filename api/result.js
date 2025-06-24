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

    // ✅ 正确倒计时（稳定从 30 到 0）
    const seconds = Math.floor(diffMs / 1000);
    const countdown = 30 - (seconds % 30);

    // ✅ 期数偏移 +1 为预测
    const baseOffset = 960;
    const currentPeriodNum = Math.floor(seconds / 30);
    const predictedPeriodNum = currentPeriodNum + baseOffset + 1;

    const fixedCode = "10005";

    // 当前真实期号（用于结果锁定）
    const currentPeriodId = `${year}${month}${day}${fixedCode}${String(currentPeriodNum + baseOffset).padStart(5, "0")}`;

    // 前端显示的预测期号，删除第14位的 0
    const predictedRaw = `${year}${month}${day}${fixedCode}${String(predictedPeriodNum).padStart(5, "0")}`;
    const period = predictedRaw.slice(0, 13) + predictedRaw.slice(14);

    // 每期更新一次结果
    if (currentPeriodId !== latestPeriod) {
        latestPeriod = currentPeriodId;
        aiStartTime = Date.now();

        // 稳定 hash
        let hash = 0;
        for (let i = 0; i < period.length; i++) {
            hash = period.charCodeAt(i) + ((hash << 5) - hash);
        }

        latestResult = (hash % 2 === 0) ? "BIG" : "SMALL";

        const probSeed = Math.abs(hash) % 100;
        if (probSeed < 90) {
            latestProbability = Math.floor(Math.random() * 21) + 45; // 90%：45-65
        } else {
            latestProbability = Math.floor(Math.random() * 21) + 66; // 10%：66-86
        }
    }

    // AI 延迟（2-3 秒后显示）
    const elapsed = (Date.now() - aiStartTime) / 1000;
    const showResult = elapsed >= (2 + Math.random());

    let displayResult = "AI分析中...";
    let displayProbability = null;

    if (showResult) {
        displayResult = latestResult;
        displayProbability = latestProbability;
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store");

    res.status(200).json({
        period,
        countdown,
        result: displayResult,
        probability: displayProbability
    });
};