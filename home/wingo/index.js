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

function startRealCountdown() {
    const intervalTime = 30 * 1000;
    let endTime = Math.ceil(Date.now() / intervalTime) * intervalTime;

    function updateCountdown() {
        const now = Date.now();
        const timeLeft = endTime - now;

        if (timeLeft <= 0) {
            clearInterval(interval);

            const delay = Math.random() * 1000 + 2000;
            setTimeout(fetchAndDisplayResult, delay);

            startRealCountdown(); // 重新开始倒计时
        } else {
            const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);
            if (cdEl) cdEl.textContent = `00 : ${seconds.toString().padStart(2, "0")}`;
        }
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 100);
}

async function fetchAndDisplayResult() {
    try {
        const res = await fetch("https://yzteampredict-website.vercel.app/api/result");
        const data = await res.json();

        if (periodEl) periodEl.textContent = data.period;

        let color = (data.probability >= 66) ? "#80FF80" : "orange";
        resultEl.innerHTML = `${data.result} <span style="color:${color}">(${data.probability}%)</span>`;
    } catch (err) {
        if (resultEl) resultEl.textContent = "获取失败";
    }
}

startRealCountdown();