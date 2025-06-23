// 文件位置：/api/result.js

let startTime = Date.now();
let lastPeriod = null;
let lastResult = null;

module.exports = async (req, res) => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const start = new Date();
  start.setHours(8, 0, 0, 0);
  const diffMs = now - start;

  const seconds = Math.floor(diffMs / 1000);
  const periodNum = Math.floor(seconds / 30);
  const countdown = 30 - (seconds % 30);

  const fixedCode = "10005";
  const periodStr = String(periodNum + 1).padStart(4, "0"); // 只要4位期数
  const period = `${year}${month}${day}${fixedCode}${periodStr}`;
  
  // 自动同步 result：每 30 秒刷新一次
  if (lastPeriod !== period) {
    lastPeriod = period;
    const random = Math.random();
    lastResult = random < 0.5 ? "BIG" : "SMALL";
    startTime = Date.now();
  }

  const elapsed = (Date.now() - startTime) / 1000;
  const showResult = elapsed > 2 + Math.random() * 3; // 2~5 秒

  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).json({
    period,
    countdown,
    result: showResult ? lastResult : "AI识别判断中..."
  });
};