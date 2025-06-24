// 独立存储每个周期的数据
const storage = {
    30: { latestPeriod: "", latestResult: "", latestProbability: 0 },
    60: { latestPeriod: "", latestResult: "", latestProbability: 0 },
    180: { latestPeriod: "", latestResult: "", latestProbability: 0 },
    300: { latestPeriod: "", latestResult: "", latestProbability: 0 },
};

module.exports = async (req, res) => {
    const now = new Date();
    const secondsPerRound = parseInt(req.query.period || "30");
    const valid = [30, 60, 180, 300];
    if (!valid.includes(secondsPerRound)) {
        return res.status(400).json({ error: "Invalid period" });
    }

    const offsetMap = { 30: 960, 60: 960, 180: 320, 300: 192 };
    const fixedCodeMap = { 30: "10005", 60: "10001", 180: "10002", 300: "10003" };

    const offset = offsetMap[secondsPerRound];
    const fixedCode = fixedCodeMap[secondsPerRound];

    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0);
    const diff = Math.floor((now - start) / 1000);
    const index = Math.floor(diff / secondsPerRound);
    const predictedIndex = index + offset + 1;

    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");

    const raw = `${y}${m}${d}${fixedCode}${String(predictedIndex).padStart(4, "0")}`;
    const period = raw.slice(0, 13) + raw.slice(14); // 删除第14位

    // 当前周期记录
    const slot = storage[secondsPerRound];

    if (slot.latestPeriod !== period) {
        slot.latestPeriod = period;

        // 生成 hash
        let hash = 0;
        for (let i = 0; i < period.length; i++) {
            hash = period.charCodeAt(i) + ((hash << 5) - hash);
        }

        slot.latestResult = (hash % 2 === 0) ? "BIG" : "SMALL";
        const seed = Math.abs(hash) % 100;

        slot.latestProbability = seed < 90
            ? Math.floor(Math.random() * 21) + 45   // 90% 概率为 45~65%
            : Math.floor(Math.random() * 21) + 66;  // 10% 概率为 66~86%
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({
        period: slot.latestPeriod,
        result: slot.latestResult,
        probability: slot.latestProbability
    });
};
