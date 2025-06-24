let latestPeriod = "";
let latestResult = "";
let latestProbability = 0;
let aiStartTime = 0;

module.exports = async (req, res) => {
    const now = new Date();

    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0);
    const diffSeconds = Math.floor((now - startOfDay) / 1000);

    const currentPeriodNum = Math.floor(diffSeconds / 30); // ✅ 每30秒一轮
    const baseOffset = 960;
    const predictedPeriodNum = currentPeriodNum + baseOffset + 1;

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const fixedCode = "10005";

    const rawPeriod = `${year}${month}${day}${fixedCode}${String(predictedPeriodNum).padStart(5, "0")}`;
    const period = rawPeriod.slice(0, 13) + rawPeriod.slice(14); // ✅ 删除第14位的0

    const countdown = 30 - (diffSeconds % 30); // ✅ 30秒倒计时
    const currentPeriodId = `${year}${month}${day}${fixedCode}${String(currentPeriodNum + baseOffset).padStart(5, "0")}`;

    if (currentPeriodId !== latestPeriod) {
        latestPeriod = currentPeriodId;
        aiStartTime = Date.now();

        let hash = 0;
        for (let i = 0; i < period.length; i++) {
            hash = period.charCodeAt(i) + ((hash << 5) - hash);
        }

        latestResult = (hash % 2 === 0) ? "BIG" : "SMALL";

        const probSeed = Math.abs(hash) % 100;
        if (probSeed < 90) {
            latestProbability = Math.floor(Math.random() * 21) + 45;
        } else {
            latestProbability = Math.floor(Math.random() * 21) + 66;
        }
    }

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
