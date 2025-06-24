const cards = document.querySelectorAll(".card");

// 卡片点击切换高亮
cards.forEach(card => {
    card.addEventListener("click", () => {
        document.querySelector(".card.active")?.classList.remove("active");
        card.classList.add("active");
    });
});

async function fetchPeriodData() {
    try {
        const res = await fetch("https://yzteampredict-website.vercel.app/api/result");
        const data = await res.json();

        // 更新期数
        const periodEl = document.getElementById("period");
        if (periodEl) periodEl.textContent = data.period;

        // 更新倒计时
        const cdEl = document.querySelector(".cd");
        if (cdEl) cdEl.textContent = `00 : ${String(data.countdown).padStart(2, "0")}`;

        // 更新结果
        const resultEl = document.getElementById("result");
        if (resultEl) {
            if (data.result === "AI分析中...") {
                resultEl.textContent = data.result;
            } else {
                const color = (data.probability >= 66) ? "#80FF80" : "orange";
                resultEl.innerHTML = `${data.result} <span style="color:${color}">(${data.probability}%)</span>`;
            }
        }
    } catch (err) {
        const resultEl = document.getElementById("result");
        if (resultEl) resultEl.textContent = "获取失败";
    }
}

// 初始加载一次
fetchPeriodData();

// 每秒轮询更新
setInterval(fetchPeriodData, 1000);