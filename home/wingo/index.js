const cards = document.querySelectorAll(".card");
cards.forEach(card => {
    card.addEventListener("click", () => {
        document.querySelector(".card.active")?.classList.remove("active");
        card.classList.add("active");
    });
});

const periodEl = document.getElementById("period");
const cdEl = document.querySelector(".cd");
const resultEl = document.getElementById("result");

let resultTimeout = null;

/**
 * 获取最新结果并延迟显示
 */
async function fetchAndDisplayResult() {
    try {
        const res = await fetch("https://yzteampredict-website.vercel.app/api/result");
        const data = await res.json();

        // 更新期数
        if (periodEl) periodEl.textContent = data.period;

        // 立即先显示 AI分析中...
        if (resultEl) resultEl.textContent = "AI分析中...";

        // 清除旧的 timeout（避免多次延迟冲突）
        if (resultTimeout) clearTimeout(resultTimeout);

        // 延迟 2~3 秒后显示结果
        const delay = Math.random() * 1000 + 2000;
        resultTimeout = setTimeout(() => {
            if (data.result && data.result !== "AI分析中..." && data.probability !== null) {
                const color = (data.probability >= 66) ? "#80FF80" : "orange";
                resultEl.innerHTML = `${data.result} <span style="color:${color}">(${data.probability}%)</span>`;
            }
        }, delay);
    } catch (err) {
        if (resultEl) resultEl.textContent = "获取失败";
    }
}

/**
 * 启动 30 秒倒计时
 */
function startRealCountdown() {
    const intervalTime = 30 * 1000;
    let endTime = Math.ceil(Date.now() / intervalTime) * intervalTime;

    // 一进入新倒计时就立即触发分析
    fetchAndDisplayResult();

    function updateCountdown() {
        const now = Date.now();
        const timeLeft = endTime - now;

        if (timeLeft <= 0) {
            clearInterval(interval);
            startRealCountdown(); // 重启循环
        } else {
            const seconds = Math.floor((timeLeft % 60000) / 1000);
            if (cdEl) cdEl.textContent = `00 : ${seconds.toString().padStart(2, "0")}`;
        }
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 100);
}

// 启动
startRealCountdown();