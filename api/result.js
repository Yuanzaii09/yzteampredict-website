let resultMap = {
    30: { period: "", result: "", probability: 0 },
    60: { period: "", result: "", probability: 0 },
    180: { period: "", result: "", probability: 0 },
    300: { period: "", result: "", probability: 0 }
};

module.exports = async (req, res) => {
    const now = new Date();
    const secondsPerRound = parseInt(req.query.period || "30"); // 默认30秒
    const validPeriods = [30, 60, 180, 300];

    if (!validPeriods.includes(secondsPerRound)) {
        return res.status(400).json({ error: "Invalid period" });
    }

    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0);
    const diffSeconds = Math.floor((now - start) / 1000);
    
    const offsetMap = {
        30: 960,
        60: 960,
        180: 320,
        300: 192
    };

    const fixedCodeMap = {
        30: "10005",
        60: "10001",
        180: "10002",
        300: "10003"
    };

    const baseOffset = offsetMap[secondsPerRound];
    const fixedCode = fixedCodeMap[secondsPerRound];

    const index = Math.floor(diffSeconds / secondsPerRound) + baseOffset + 1;

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const raw = `${year}${month}${day}${fixedCode}${String(index).padStart(4, "0")}`;
    const period = raw.slice(0, 13) + raw.slice(14); // 删除第14位

    if (resultMap[secondsPerRound].period !== period) {
        resultMap[secondsPerRound].period = period;

        let hash = 0;
        for (let i = 0; i < period.length; i++) {
            hash = period.charCodeAt(i) + ((hash << 5) - hash);
        }

        const result = (hash % 2 === 0) ? "BIG" : "SMALL";
        const probSeed = Math.abs(hash) % 100;
        const probability = (probSeed < 90)
            ? Math.floor(Math.random() * 21) + 45
            : Math.floor(Math.random() * 21) + 66;

        resultMap[secondsPerRound].result = result;
        resultMap[secondsPerRound].probability = probability;
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json(resultMap[secondsPerRound]);
};