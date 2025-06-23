const cards = document.querySelectorAll('.card');

cards.forEach(card => {
    card.addEventListener('click', () => {
        document.querySelector('.card.active')?.classList.remove('active');
        card.classList.add('active');
    });
});

let lastPeriod = "";

function fetchResult() {
    fetch("https://yzteampredict-website.vercel.app/api/result")
        .then(res => res.json())
        .then(data => {
            
            const periodEl = document.getElementById("period");
            const cdEl = document.querySelector(".cd");
            const resultEl = document.getElementById("result");

            if (periodEl) periodEl.textContent = data.period;
            if (cdEl) cdEl.textContent = `00 : ${String(data.countdown).padStart(2, "0")}`;

            // 每次新的一期
            if (data.period !== lastPeriod) {
                lastPeriod = data.period;

                // 如果还在AI运作中
                if (data.result === "AI识别判断中...") {
                    if (resultEl) resultEl.textContent = "AI运作中...";
                } else {
                    const color = data.probability >= 66 ? "green" : "orange";
                    const percent = data.probability;
                    if (resultEl) {
                        resultEl.innerHTML = `${data.result} <span style="color:${color}">（${percent}%）</span>`;
                    }
                }
            }

        })
        .catch(() => {
            const resultEl = document.getElementById("result");
            if (resultEl) resultEl.textContent = "获取失败";
        });
}

setInterval(fetchResult, 1000);
fetchResult();