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

        if (periodEl) periodEl.textContent = data.period;
        if (cdEl) cdEl.textContent = `00 : ${String(data.countdown).padStart(2, "0")}`;

        if (resultEl) {
            if (data.result === "AI分析中...") {
                resultEl.textContent = data.result;
            } else {
                let color;
        if (data.probability >= 66) {
            color = '#80FF80';
        } else {
            color = 'orange';
        }
        resultEl.innerHTML = `${data.result} <span style="color:${color}">(${data.probability}%)</span>`;
            }
        }
    } catch (err) {
        const resultEl = document.getElementById("result");
        if (resultEl) resultEl.textContent = "获取失败";
    }
}

fetchPeriodData();
setInterval(fetchPeriodData, 1000);