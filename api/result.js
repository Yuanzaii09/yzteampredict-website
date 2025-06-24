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

module.exports = async (req, res) => {
  const now = new Date();
  const query = req.query || {};
  // 取周期秒数参数，默认30秒
  const periodSec = query.period ? query.period.toString() : "30";
  const fixedCode = fixedCodes[periodSec] || "10005";

  // 计算当天8点作为基准时间
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0);
  const diffSeconds = Math.floor((now - start) / 1000);

  // 计算当前期数索引（预测 +1）
  const currentPeriodIndex = Math.floor(diffSeconds / Number(periodSec));
  const baseOffset = 960;
  const predictedPeriod = currentPeriodIndex + baseOffset + 1;

  // 构造期号字符串
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const rawPeriod = `${year}${month}${day}${fixedCode}${String(predictedPeriod).padStart(4, "0")}`;

  // 删除第14位字符（索引13），合成最终期号
  const period = rawPeriod.slice(0, 13) + rawPeriod.slice(14);

  // 如果是新期号，则重新生成结果
  const last = latestResults[periodSec];
  if (last.period !== period) {
    last.period = period;

    // 哈希计算 BIG / SMALL
    let hash = 0;
    for (let i = 0; i < period.length; i++) {
      hash = period.charCodeAt(i) + ((hash << 5) - hash);
    }

    last.result = (hash % 2 === 0) ? "BIG" : "SMALL";

    const probSeed = Math.abs(hash) % 100;
    if (probSeed < 90) {
      last.probability = Math.floor(Math.random() * 21) + 45; // 45-65%
    } else {
      last.probability = Math.floor(Math.random() * 21) + 66; // 66-86%
    }
  }

  // 返回结果
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    period: last.period,
    result: last.result,
    probability: last.probability,
  });
};