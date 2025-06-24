let latestResults = {
    "30": { period: "", result: "", probability: 0 },
    "60": { period: "", result: "", probability: 0 },
    "180": { period: "", result: "", probability: 0 },
    "300": { period: "", result: "", probability: 0 },
};

const fixedCodes = {
    "30": "10005",
    "60": "10001",
    "180": "10002",
    "300": "10003",
};

const intervals = {
    "30": 30,
    "60": 60,
    "180": 180,
    "300": 300,
};

function generatePeriod(now, secondsPerRound, fixedCode) {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0);
    const diffSeconds = Math.floor((now - start) / 1000);
    const baseOffset = 960;

    const currentPeriodIndex = Math.floor(diffSeconds / secondsPerRound);
    const predictedPeriod = currentPeriodIndex + baseOffset + 1;

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const rawPeriod = `${year}${month}${day}${fixedCode}${String(predictedPeriod).padStart(5, "0")}`;

    return rawPeriod.slice(0, 13) + rawPeriod.slice(14);
}

function generateResultAndProbability(period, secondsPerRound) {
    // 结合period和secondsPerRound做hash，确保不同周期不同
    let combined = period + secondsPerRound.toString();

    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
        hash = combined.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash; // 保持32位整数
    }

    const result = (hash % 2 === 0) ? "BIG" : "SMALL";

    const probSeed = Math.abs(hash) % 100;
    let probability;
    if (probSeed < 90) {
        // 基于hash再用确定性随机数，保证不同周期不同概率
        probability = 45 + (Math.abs(hash) % 21);
    } else {
        probability = 66 + (Math.abs(hash) % 21);
    }

    return { result, probability };
}

module.exports = async (req, res) => {
    const now = new Date();
    const secondsPerRound = req.query.period || "30";

    if (!intervals[secondsPerRound]) {
        res.status(400).json({ error: "Invalid period parameter" });
        return;
    }

    const fixedCode = fixedCodes[secondsPerRound];
    const period = generatePeriod(now, intervals[secondsPerRound], fixedCode);

    if (latestResults[secondsPerRound].period !== period) {
        latestResults[secondsPerRound].period = period;

        const { result, probability } = generateResultAndProbability(period, intervals[secondsPerRound]);
        latestResults[secondsPerRound].result = result;
        latestResults[secondsPerRound].probability = probability;
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store");

    res.status(200).json({
        period: latestResults[secondsPerRound].period,
        result: latestResults[secondsPerRound].result,
        probability: latestResults[secondsPerRound].probability,
    });
};