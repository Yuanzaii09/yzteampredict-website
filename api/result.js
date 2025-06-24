let latestPeriod = "";
let latestResult = "";
let latestProbability = 0;
let aiStartTime = 0;

module.exports = async (req, res) => {
    const now = new Date();

    // 设置每天 8:00AM 作为起点
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0);
    const nowTime = now.getTime();
    const startTime = start.getTime();

    // 总秒数差
    const diffSeconds = Math.floor((nowTime - startTime) / 1000);
    const baseOffset = 960; // 手动修正值（按你需要的）

    const currentPeriodIndex = Math.floor(diffSeconds / 30);
    const countdown = 30 - (diffSeconds % 30);

    // 当前实际期数（用于结果刷新）
    const currentPeriodId = currentPeriodIndex + baseOffset;

    // 你要显示的下一期（提前预测）
    const predictedPeriod = currentPeriodId + 1;

    // 构造期号
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const fixedCode = "10005";
    const rawPeriod = `${year}${month}${day}${fixedCode}${String(predictedPeriod).padStart(5, "0")}`;
    const period = rawPeriod.slice(0, 13) + rawPeriod.slice(14); // 删除第14位的 0

    // 每新一期才更新结果
    if (currentPeriodId !== latestPeriod) {
        latestPeriod = currentPeriodId;
        aiStartTime = Date.now();

        // hash 生成 BIG/SMALL
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

    // 2-3 秒后才显示结果
    const elapsed = (Date.now() - aiStartTime) / 1000;
    const showResult = elapsed >= (2 + Math.random());

    let displayResult = "AI分析中...";
    let displayProbability = null;

    if (showResult) {
        displayResult = latestResult;
        displayProbability = latestProbability;
    }

    // 返回 JSON
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store");

    res.status(200).json({
        period,
        countdown,
        result: displayResult,
        probability: displayProbability
    });
};