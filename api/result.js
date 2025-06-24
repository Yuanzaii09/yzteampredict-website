let latestPeriod = "";
let latestResult = "";
let latestProbability = 0;
let aiStartTime = 0;

module.exports = async (req, res) => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    // ✅ 设置今天早上 8:00 为起点，精确避免 UTC 错误
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0);

    const diffSeconds = Math.floor((now.getTime() - start.getTime()) / 1000);
    const currentPeriodNum = Math.floor(diffSeconds / 30);  // 当前期数（真实）
    const baseOffset = 960;                                 // 手动偏移
    const countdown = 30 - (diffSeconds % 30);              // 倒计时（0～30 秒）

    // 当前真实期号（用于内部判断）
    const currentPeriodId = `${year}${month}${day}10005${String(currentPeriodNum + baseOffset).padStart(5, "0")}`;

    // ✅ 用于展示的预测期数：多加 1
    const predictedPeriodNum = currentPeriodNum + baseOffset + 1;
    const rawPeriod = `${year}${month}${day}10005${String(predictedPeriodNum).padStart(5, "0")}`;

    // ✅ 删除第 14 位 0（模拟外挂显示格式）
    const period = rawPeriod.slice(0, 13) + rawPeriod.slice(14);

    // ✅ 如果进入新期，就更新结果
    if (currentPeriodId !== latestPeriod) {
        latestPeriod = currentPeriodId;
        aiStartTime = Date.now();

        // 稳定 hash，生成 BIG / SMALL
        let hash = 0;
        for (let i = 0; i < period.length; i++) {
            hash = period.charCodeAt(i) + ((hash << 5) - hash);
        }

        latestResult = (hash % 2 === 0) ? "BIG" : "SMALL";

        // ✅ 概率（90%：45~65%，10%：66~86%）
        const probSeed = Math.abs(hash) % 100;
        if (probSeed < 90) {
            latestProbability = Math.floor(Math.random() * 21) + 45;
        } else {
            latestProbability = Math.floor(Math.random() * 21) + 66;
        }
    }

    // ✅ 判断是否显示结果（AI分析中... 等待 2~3 秒）
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