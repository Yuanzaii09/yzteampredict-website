const cards = document.querySelectorAll(".card");

// 卡片点击高亮效果
cards.forEach(card => {
    card.addEventListener("click", () => {
        document.querySelector(".card.active")?.classList.remove("active");
        card.classList.add("active");
    });
});

// 每秒从后端获取数据
async function fetchPeriodData() {
    try {
        const res = await fetch("https://yzteampredict-website.vercel.app/api/result");
        const data = await res.json();

        const periodEl = document.getElementById("period");
        const cdEl = document.querySelector(".cd");
        const resultEl = document.getElementById("result");

        // 更新期号
        if (periodEl) {
            periodEl.textContent = data.period;
        }

        // 更新倒计时
        if (cdEl) {
            cdEl.textContent = `00 : ${String(data.countdown).padStart(2, "0")}`;
        }

        // 更新预测结果
        if (resultEl) {
            if (data.result === "AI分析中...") {
                resultEl.textContent = "AI分析中...";
            } else {
                let color = (data.probability >= 66) ? "#80FF80" : "orange";
                resultEl.innerHTML = `${data.result} <span style="color:${color}">(${data.probability}%)</span>`;
            }
        }

    } catch (err) {
        const resultEl = document.getElementById("result");
        if (resultEl) {
            resultEl.textContent = "获取失败";
        }
    }
}

// 初次加载一次 + 每秒刷新一次
fetchPeriodData();
setInterval(fetchPeriodData, 1000);