// /api/result.js

let lastPeriod = "";
let lastResult = "";
let lastProbability = 0;
let lastShown = false;
let startTime = Date.now();

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

    // 每一期只生成一次结果
    if (lastPeriod !== period) {
        lastPeriod = period;
        startTime = Date.now();
        lastShown = false;

        const rand = Math.random();
        lastResult = rand < 0.5 ? "BIG" : "SMALL";

        const probRand = Math.random();
        if (probRand < 0.9) {
            lastProbability = Math.floor(Math.random() * 21) + 45; // 45-65 橙色
        } else {
            lastProbability = Math.floor(Math.random() * 21) + 66; // 66-86 绿色
        }
    }

    const elapsed = (Date.now() - startTime) / 1000;
    const showResult = elapsed >= 2 && elapsed <= 3;

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store");

    res.status(200).json({
        period,
        countdown,
        result: showResult ? lastResult : "AI运作中...",
        probability: showResult ? lastProbability : null
    });
};