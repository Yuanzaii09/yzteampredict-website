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

    // 设置每天开始时间为早上8点
    const start = new Date();
    start.setHours(8, 0, 0, 0);
    const diffMs = now - start;

    const seconds = Math.floor(diffMs / 1000);

    // ✅ 你实际需要的偏移（手动试一下：如果你现在看到 mzplay 是 1881，而你网站是 0938，偏移量为 943）
    const baseOffset = 958;

    // ✅ 计算期数，加 baseOffset，并 +1 表示预测下一期
    const periodNum = Math.floor(seconds / 30) + baseOffset + 1;

    // 倒计时
    const countdown = 30 - (seconds % 30);

    // 构造最终期号
    const fixedCode = "10005";
    const periodStr = String(periodNum).padStart(5, "0");
    const period = `${year}${month}${day}${fixedCode}${periodStr}`;

    // 每期更新结果
    if (period !== latestPeriod) {
        latestPeriod = period;
        aiStartTime = Date.now();

        // 生成稳定的结果
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

    // 判断是否显示结果
    const elapsed = (Date.now() - aiStartTime) / 1000;
    const showResult = elapsed >= (2 + Math.random()); // 2~3秒之间

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