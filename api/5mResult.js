let latestPeriod = "";
let latestResult = "";
let latestProbability = 0;

module.exports = async (req, res) => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0);
    const secondsPerRound = 300;
    const fixedCode = "10003";
    const baseOffset = 192;

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

        let hash = 0;
        for (let i = 0; i < period.length; i++) {
            hash = period.charCodeAt(i) + ((hash << 5) - hash);
        }

        latestResult = (hash % 2 === 0) ? "🚀BIG" : "🚀SMALL";

        const probSeed = Math.abs(hash) % 100;
        latestProbability = probSeed < 90
            ? Math.floor(Math.random() * 21) + 45
            : Math.floor(Math.random() * 21) + 66;
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({
        period: latestPeriod,
        result: latestResult,
        probability: latestProbability
    });
};