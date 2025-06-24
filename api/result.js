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
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0);

    // ✅ 总秒数，精确取整
    const totalSeconds = Math.floor((now - start) / 1000);

    // ✅ 倒计时（30 → 0）
    const countdown = 30 - (totalSeconds % 30);

    // ✅ 当前期数（用于锁定结果）
    const baseOffset = 960;
    const currentPeriodNum = Math.floor(totalSeconds / 30);
    const predictedPeriodNum = currentPeriodNum + baseOffset + 1;

    const fixedCode = "10005";

    const currentPeriodId = `${year}${month}${day}${fixedCode}${String(currentPeriodNum + baseOffset).padStart(5, "0")}`;

    // ✅ 显示的预测期号，删除第14位的0
    const rawPeriod = `${year}${month}${day}${fixedCode}${String(predictedPeriodNum).padStart(5, "0")}`;
    const period = rawPeriod.slice(0, 13) + rawPeriod.slice(14);

    // 每期只生成一次结果
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
            latestProbability = Math.floor(Math.random() * 21) + 45; // 90%：45-65%
        } else {
            latestProbability = Math.floor(Math.random() * 21) + 66; // 10%：66-86%
        }
    }

    // ✅ 判断是否显示结果（2~3 秒后）
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