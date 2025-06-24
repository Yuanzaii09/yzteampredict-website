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

let countdownTimer = cdEl;
let resultTimeout = null;

// 主函数：每 30 秒触发一次
function startRealCountdown() {
    const intervalTime = 30 * 1000; // 30秒
    let endTime = Math.ceil(Date.now() / intervalTime) * intervalTime;

    async function fetchAndDisplay() {
        try {
            const res = await fetch("https://yzteampredict-website.vercel.app/api/result");
            const data = await res.json();

            if (periodEl) periodEl.textContent = data.period;
            if (resultEl) resultEl.textContent = "AI分析中...";

            // 清除旧 timeout 避免重复
            if (resultTimeout) clearTimeout(resultTimeout);

            // 延迟 2～3 秒后显示最终结果
            const delay = Math.random() * 1000 + 2000;
            resultTimeout = setTimeout(() => {
                let color = (data.probability >= 66) ? "#80FF80" : "orange";
                resultEl.innerHTML = `${data.result} <span style="color:${color}">(${data.probability}%)</span>`;
            }, delay);
        } catch (err) {
            if (resultEl) resultEl.textContent = "获取失败";
        }
    }

    // 初次触发获取
    fetchAndDisplay();

    function updateCountdown() {
        const now = Date.now();
        const timeLeft = endTime - now;

        if (timeLeft <= 0) {
            clearInterval(interval);
            startRealCountdown(); // 重启循环
        } else {
            const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);
            if (cdEl) cdEl.textContent = `00 : ${seconds.toString().padStart(2, "0")}`;
        }
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 100);
}

// 启动倒计时和逻辑
startRealCountdown();