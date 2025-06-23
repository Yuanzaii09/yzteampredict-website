// api/result.js

let latestPeriod = "";
let latestResult = "";
let latestProbability = 0;
let aiStartTime = 0;

module.exports = async (req, res) => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const start = new Date();
    start.setHours(8, 0, 0, 0);
    const diffMs = now - start;

    const seconds = Math.floor(diffMs / 1000);
    // ✅ 偏移量，让你的期数和 mzplay 对齐（实际差多少就填多少）
    const baseOffset = 959;
    // ✅ 加 1 是因为你要预测“下一期”
    const periodNum = Math.floor(seconds / 30) + baseOffset + 1;

    const predictedPeriodNum = currentPeriodNum + 1; // ✅ 预测下一期
    const countdown = 30 - (seconds % 30);

    const fixedCode = "10005";
    const periodSuffix = String(predictedPeriodNum).padStart(4, "0"); // ✅ 改成4位
    const period = `${year}${month}${day}${fixedCode}${periodSuffix}`; // ✅ 正确拼接

    // 仅在预测期数变化时重新生成
    if (period !== latestPeriod) {
        latestPeriod = period;
        aiStartTime = Date.now();

        // 稳定结果：用哈希模拟伪随机
        const seed = period;
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = seed.charCodeAt(i) + ((hash << 5) - hash);
        }

        latestResult = (hash % 2 === 0) ? "BIG" : "SMALL";

        const probSeed = Math.abs(hash) % 100;
        if (probSeed < 90) {
            latestProbability = Math.floor(Math.random() * 21) + 45; // 90%: 45–65%
        } else {
            latestProbability = Math.floor(Math.random() * 21) + 66; // 10%: 66–86%
        }
    }

    // 判断是否显示结果（2~3 秒后）
    const elapsed = (Date.now() - aiStartTime) / 1000;
    const showResult = elapsed >= (2 + Math.random());

    let displayResult = "AI运作中...";
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