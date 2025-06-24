let latestPeriod = "";
let latestResult = "";
let latestProbability = 0;
let aiStartTime = 0;

module.exports = async (req, res) => {
    const now = new Date();

    // 获取今天 8:00 AM
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0);
    const diffSeconds = Math.floor((now.getTime() - startOfDay.getTime()) / 1000);

    // 正常期数逻辑
    const currentPeriodNum = Math.floor(diffSeconds / 30);
    const countdown = 30 - (diffSeconds % 30);

    const fixedCode = "10005";
    const baseOffset = 960; // 修正你和 mzplay 之间的期数差（你之前说的偏移）

    // 当前期数用于判断是否进新期
    const currentInternalPeriod = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}${fixedCode}${String(currentPeriodNum + baseOffset).padStart(5, "0")}`;

    // 显示的 period 是下一期的（+1）
    const predictedPeriodNum = currentPeriodNum + baseOffset + 1;
    const predictedRaw = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}${fixedCode}${String(predictedPeriodNum).padStart(5, "0")}`;
    const period = predictedRaw.slice(0, 13) + predictedRaw.slice(14); // 删除第14位的“0”

    // 如果进了新一期就更新结果
    if (currentInternalPeriod !== latestPeriod) {
        latestPeriod = currentInternalPeriod;
        aiStartTime = Date.now();

        // 生成稳定的结果
        let hash = 0;
        for (let i = 0; i < period.length; i++) {
            hash = period.charCodeAt(i) + ((hash << 5) - hash);
        }

        latestResult = (hash % 2 === 0) ? "BIG" : "SMALL";

        const probSeed = Math.abs(hash) % 100;
        if (probSeed < 90) {
            latestProbability = Math.floor(Math.random() * 21) + 45; // 90% 机率
        } else {
            latestProbability = Math.floor(Math.random() * 21) + 66; // 10% 机率
        }
    }

    // 是否要显示结果（2~3秒后）
    const elapsed = (Date.now() - aiStartTime) / 1000;
    const showResult = elapsed >= (2 + Math.random());

    // 构造返回值
    const displayResult = showResult ? latestResult : "AI分析中...";
    const displayProbability = showResult ? latestProbability : null;

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store");

    res.status(200).json({
        period,
        countdown,
        result: displayResult,
        probability: displayProbability
    });
};