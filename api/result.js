// api/result.js

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

    // ⏱️ 用 period 生成可预测的 seed
    const seed = period;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }

    const result = (hash % 2 === 0) ? "BIG" : "SMALL";

    const probSeed = Math.abs(hash) % 100;
    let probability;
    if (probSeed < 90) {
        probability = Math.floor(Math.random() * 21) + 45; // 90% 概率：45-65%
    } else {
        probability = Math.floor(Math.random() * 21) + 66; // 10% 概率：66-86%
    }

    // 🧠 判断现在是否已到结果展示时间：每期的 27s-30s 才展示结果（后端决定）
    const timeInPeriod = seconds % 30;
    const showResult = timeInPeriod >= 27; // 显示结果时间段

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store");

    res.status(200).json({
        period,
        countdown,
        result: showResult ? result : "AI运作中...",
        probability: showResult ? probability : null
    });
};