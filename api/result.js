const cache = {
    "30": { period: "", result: "", probability: 0 },
    "60": { period: "", result: "", probability: 0 },
    "180": { period: "", result: "", probability: 0 },
    "300": { period: "", result: "", probability: 0 }
};

const fixedCodeMap = {
    "30": "10005",
    "60": "10001",
    "180": "10002",
    "300": "10003"
};

const baseOffsetMap = {
    "30": 960,
    "60": 960,
    "180": 320,
    "300": 192
};

module.exports = async (req, res) => {
    const seconds = parseInt(req.query.period);

    if (![30, 60, 180, 300].includes(seconds)) {
        return res.status(400).json({ error: "Invalid period" });
    }

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0);
    const diffSeconds = Math.floor((now - start) / 1000);

    const baseOffset = baseOffsetMap[seconds];
    const fixedCode = fixedCodeMap[seconds];
    const currentIndex = Math.floor(diffSeconds / seconds);
    const predictedIndex = currentIndex + baseOffset + 1;

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const rawPeriod = `${year}${month}${day}${fixedCode}${String(predictedIndex).padStart(4, "0")}`;
    const period = rawPeriod.slice(0, 13) + rawPeriod.slice(14); // 删除第14位

    const cacheKey = String(seconds);
    if (cache[cacheKey].period !== period) {
        // 更新缓存
        cache[cacheKey].period = period;

        // 生成新 result
        let hash = 0;
        for (let i = 0; i < period.length; i++) {
            hash = period.charCodeAt(i) + ((hash << 5) - hash);
        }

        cache[cacheKey].result = (hash % 2 === 0) ? "BIG" : "SMALL";

        const probSeed = Math.abs(hash) % 100;
        if (probSeed < 90) {
            cache[cacheKey].probability = Math.floor(Math.random() * 21) + 45; // 45-65%
        } else {
            cache[cacheKey].probability = Math.floor(Math.random() * 21) + 66; // 66-86%
        }
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({
        period: cache[cacheKey].period,
        result: cache[cacheKey].result,
        probability: cache[cacheKey].probability
    });
};