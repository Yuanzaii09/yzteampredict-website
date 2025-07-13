let latestPeriod = "";
let latestResult = "";
let latestProbability = 0;

module.exports = async (req, res) => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0);
    const secondsPerRound = 30;
    const fixedCode = "10005";
    const baseOffset = 960;

    const diff = Math.floor((now - start) / 1000);
    const index = Math.floor(diff / secondsPerRound);
    const periodIndex = baseOffset + index + 1;

    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const raw = `${y}${m}${d}${fixedCode}${String(periodIndex).padStart(4, "0")}`;
    const period = raw.slice(0, 13) + raw.slice(14);

    if (latestPeriod !== period) {
        latestPeriod = period;
    
        const rand = Math.random(); // ✅ 65% 概率 BIG
        latestResult = rand < 0.65 ? "🚀BIG" : "🚀SMALL";
    
        // 概率部分你暂时不动的话就保留原来：
        latestProbability = Math.floor(Math.random() * 21) + 45;
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({
        period: latestPeriod,
        result: latestResult,
        probability: latestProbability
    });
};