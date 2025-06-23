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
    const periodNum = Math.floor(seconds / 30);
    const countdown = 30 - (seconds % 30);

    const fixedCode = "10005";
    const periodStr = String(periodNum + 1).padStart(5, "0");
    const period = `${year}${month}${day}${fixedCode}${periodStr}`;

    // 每期刚开始就更新
    if (period !== latestPeriod) {
        latestPeriod = period;
        aiStartTime = Date.now();

        // 生成稳定结果
        const seed = period;
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = seed.charCodeAt(i) + ((hash << 5) - hash);
        }

        latestResult = (hash % 2 === 0) ? "BIG" : "SMALL";

        const probSeed = Math.abs(hash) % 100;
        if (probSeed < 90) {
            latestProbability = Math.floor(Math.random() * 21) + 45; // 90%：45-65%
        } else {
            latestProbability = Math.floor(Math.random() * 21) + 66; // 10%：66-86%
        }
    }

    // 判断是否要显示结果（2-3 秒后）
    const elapsed = (Date.now() - aiStartTime) / 1000;
    const showResult = elapsed >= (2 + Math.random()); // 每次都重新随机

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