const cards = document.querySelectorAll(".card");

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

        const periodEl = document.getElementById("period");
        const cdEl = document.querySelector(".cd");
        const resultEl = document.getElementById("result");

        // 更新期数
        if (periodEl) {
            periodEl.textContent = data.period;
        }

        // 更新倒计时（保持 00 : xx 形式）
        if (cdEl) {
            cdEl.textContent = `00 : ${String(data.countdown).padStart(2, "0")}`;
        }

        // 显示结果逻辑
        if (resultEl) {
            if (!data.result || data.result === "AI分析中..." || data.probability == null) {
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

// 初始加载一次 + 每秒更新
fetchPeriodData();
setInterval(fetchPeriodData, 1000);