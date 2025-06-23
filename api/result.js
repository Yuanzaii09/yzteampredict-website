export default function handler(req, res) {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  const start = new Date();
  start.setHours(8, 0, 0, 0);

  const diffMs = now - start;
  let periodNum = 0;
  let countdown = 30;

  if (diffMs >= 0) {
    const diffSec = Math.floor(diffMs / 1000);
    periodNum = Math.floor(diffSec / 30);
    countdown = 30 - (diffSec % 30);
  }

  const fixedCode = "10005";
  const nextPeriodNum = periodNum + 1;
  const periodStr = String(nextPeriodNum).padStart(5, '0');
  const period = `${year}${month}${day}${fixedCode}${periodStr}`;

  const seed = `${period}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  const result = (hash % 2 === 0) ? 'BIG' : 'SMALL';

  const random = Math.abs(hash) % 100;
  let probability;
  if (random < 85) {
    probability = Math.floor(Math.random() * 25) + 45;
  } else {
    probability = Math.floor(Math.random() * 16) + 70;
  }

  res.status(200).json({
    period,
    countdown,
    result,
    probability
  });
}