let latestPeriod = "";
let latestResult = "";
let latestProbability = 0;

module.exports = async (req, res) => {
    const now = new Date();

    // 1. 计算时间差
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0);
    const diffSeconds = Math.floor((now - start) / 1000);
    const baseOffset = 960;

    // 2. 计算当前期数（预测用 +1）
    const currentPeriodIndex = Math.floor(diffSeconds / 30);
    const predictedPeriod = currentPeriodIndex + baseOffset + 1;

    // 3. 构造期号
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const fixedCode = "10005";
    const rawPeriod = `${year}${month}${day}${fixedCode}${String(predictedPeriod).padStart(5, "0")}`;
    const period = rawPeriod.slice(0, 13) + rawPeriod.slice(14); // 删除第14位的0

    // 4. 每新一期就生成新结果
    if (latestPeriod !== period) {
        latestPeriod = period;

        // hash 生成 BIG / SMALL
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

    // 返回结果（不需要 countdown 了）
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({
        period,
        result: latestResult,
        probability: latestProbability
    });
};