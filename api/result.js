let startTime = Date.now();
let lastPeriod = null;
let lastResult = null;
let lastProbability = null;

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

    if (lastPeriod !== period) {
        lastPeriod = period;
        startTime = Date.now();

        const randomResult = Math.random();
        lastResult = randomResult < 0.5 ? "BIG" : "SMALL";

        const probRoll = Math.random();
        if (probRoll < 0.9) {
            lastProbability = Math.floor(Math.random() * (65 - 45 + 1)) + 45;
        } else {
            lastProbability = Math.floor(Math.random() * (86 - 66 + 1)) + 66;
        }
    }

    const elapsed = (Date.now() - startTime) / 1000;
    const showResult = elapsed > 2 + Math.random();  // 2~3 秒之间随机

    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Access-Control-Allow-Origin", "*");

    res.status(200).json({
        period,
        countdown,
        result: showResult ? lastResult : "AI识别判断中...",
        probability: showResult ? lastProbability : null
    });
};