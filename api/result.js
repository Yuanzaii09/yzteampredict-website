// result.js (Node.js后端接口示例)
let latestResults = {
    "30": { period: "", result: "", probability: 0 },
    "60": { period: "", result: "", probability: 0 },
    "180": { period: "", result: "", probability: 0 },
    "300": { period: "", result: "", probability: 0 },
};

// 4个周期对应的固定码
const fixedCodes = {
    "30": "10005",
    "60": "10001",
    "180": "10002",
    "300": "10003",
};

// 4个周期对应的时间间隔秒数
const intervals = {
    "30": 30,
    "60": 60,
    "180": 180,
    "300": 300,
};

function generatePeriod(now, secondsPerRound, fixedCode) {
    // 以当天8点为起点
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0);
    const diffSeconds = Math.floor((now - start) / 1000);
    const baseOffset = 960;

    // 当前期数（+1 预测下一期）
    const currentPeriodIndex = Math.floor(diffSeconds / secondsPerRound);
    const predictedPeriod = currentPeriodIndex + baseOffset + 1;

    // 组装期号字符串：YYYYMMDD + 固定码 + 5位期数
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const rawPeriod = `${year}${month}${day}${fixedCode}${String(predictedPeriod).padStart(5, "0")}`;

    // 删除第14位数字（字符串索引13）
    const period = rawPeriod.slice(0, 13) + rawPeriod.slice(14);

    return period;
}

function generateResultAndProbability(period) {
    // 简单hash决定结果
    let hash = 0;
    for (let i = 0; i < period.length; i++) {
        hash = period.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash; // 保持32位整数
    }

    const result = (hash % 2 === 0) ? "BIG" : "SMALL";

    const probSeed = Math.abs(hash) % 100;
    let probability;
    if (probSeed < 90) {
        probability = Math.floor(Math.random() * 21) + 45; // 90%概率 45-65
    } else {
        probability = Math.floor(Math.random() * 21) + 66; // 10%概率 66-86
    }

    return { result, probability };
}

module.exports = async (req, res) => {
    const now = new Date();
    // 通过 ?period=30 或 60 或 180 或 300 区分请求的周期
    const secondsPerRound = req.query.period || "30";

    // 校验请求参数，默认30秒
    if (!intervals[secondsPerRound]) {
        res.status(400).json({ error: "Invalid period parameter" });
        return;
    }

    // 生成当前期号
    const fixedCode = fixedCodes[secondsPerRound];
    const period = generatePeriod(now, intervals[secondsPerRound], fixedCode);

    // 如果期号改变则更新结果和概率
    if (latestResults[secondsPerRound].period !== period) {
        latestResults[secondsPerRound].period = period;

        const { result, probability } = generateResultAndProbability(period);
        latestResults[secondsPerRound].result = result;
        latestResults[secondsPerRound].probability = probability;
    }

    // 设置CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store");

    res.status(200).json({
        period: latestResults[secondsPerRound].period,
        result: latestResults[secondsPerRound].result,
        probability: latestResults[secondsPerRound].probability,
    });
};