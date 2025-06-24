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
 * 获取结果并延迟 2 秒显示
 */
async function fetchAndDisplayResult() {
    try {
        const res = await fetch("https://yzteampredict-website.vercel.app/api/result");
        const data = await res.json();

        // 显示期号
        if (periodEl) periodEl.textContent = data.period;

        // 立即显示 AI分析中...
        if (resultEl) resultEl.textContent = "AI分析中...";

        // 清除旧定时器
        if (resultTimeout) clearTimeout(resultTimeout);

        // 固定 2 秒延迟后显示结果
        resultTimeout = setTimeout(() => {
            if (data.result && data.result !== "AI分析中..." && data.probability !== null) {
                let label = "";
                let color = "";
                let fontSize = "smaller";
        
                if (data.probability >= 65) {
                    label = "STABLE";
                    color = "#00dd00";
                } else {
                    label = "UNSTABLE";
                    color = "#dddd00";
                }
        
                resultEl.innerHTML = `
                    ${data.result}<br>
                    <span style="color:${color}; font-size:${fontSize}">
                        ${label} (${data.probability}%)
                    </span>
                `;
            }
        }, 2000);
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

    // 一开始就执行 fetch
    fetchAndDisplayResult();

    function updateCountdown() {
        const now = Date.now();
        const timeLeft = endTime - now;

        if (timeLeft <= 0) {
            clearInterval(interval);
            startRealCountdown(); // 进入下一轮
        } else {
            const seconds = Math.floor((timeLeft % 60000) / 1000);
            if (cdEl) cdEl.textContent = `00 : ${seconds.toString().padStart(2, "0")}`;
        }
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 100);
}

// 启动倒计时 + 自动调用
startRealCountdown();