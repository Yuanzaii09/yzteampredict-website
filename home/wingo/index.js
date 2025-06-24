const cards = document.querySelectorAll(".card");
const boxes = document.querySelectorAll(".countdown-box");
const navBar = document.querySelector(".nav-bar");
let countdownIntervals = {};
let scrollTimeout = null;

// 切换 card 时激活对应盒子
cards.forEach((card, index) => {
    card.addEventListener("click", () => {
        document.querySelector(".card.active")?.classList.remove("active");
        card.classList.add("active");

        boxes.forEach(box => box.classList.add("hidden"));
        const selectedBox = boxes[index];
        selectedBox.classList.remove("hidden");

        for (let key in countdownIntervals) {
            clearInterval(countdownIntervals[key]);
        }

        const time = parseInt(selectedBox.getAttribute("data-time"));
        startCountdown(selectedBox, time);
    });
});

// 启动倒计时
function startCountdown(container, secondsPerRound) {
    const cdEl = container.querySelector(".cd");
    const periodEl = container.querySelector(".period");
    const resultEl = container.querySelector(".result");
    let blinkState = true;
    let resultTimeout = null;

    const intervalTime = secondsPerRound * 1000;
    let endTime = Math.ceil(Date.now() / intervalTime) * intervalTime;

    fetchAndDisplayResult(periodEl, resultEl, secondsPerRound);

    function updateCountdown() {
        const now = Date.now();
        const timeLeft = endTime - now;

        if (timeLeft <= 0) {
            clearInterval(countdownIntervals[secondsPerRound]);
            cdEl.style.color = "";
            cdEl.style.transform = "";
            cdEl.style.visibility = "visible";
            startCountdown(container, secondsPerRound);
        } else {
            const seconds = Math.floor((timeLeft % 60000) / 1000);
            cdEl.textContent = `00 : ${seconds.toString().padStart(2, "0")}`;

            if (seconds <= 5) {
                cdEl.style.color = "#ff3333";
                cdEl.style.visibility = blinkState ? "visible" : "hidden";
                blinkState = !blinkState;
            } else {
                cdEl.style.color = "";
                cdEl.style.visibility = "visible";
            }
        }
    }

    updateCountdown();
    countdownIntervals[secondsPerRound] = setInterval(updateCountdown, 250);
}

// 获取结果与计算 period（每天 8AM 起算）
async function fetchAndDisplayResult(periodEl, resultEl, secondsPerRound) {
    try {
        const res = await fetch("https://yzteampredict-website.vercel.app/api/result");
        const data = await res.json();

        // 计算 period（每天8AM起算）
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const date = now.getDate();
        const eightAM = new Date(year, month, date, 8, 0, 0);
        const secondsSince8AM = Math.floor((now - eightAM) / 1000);

        let periodNumber;
        if (secondsSince8AM < 0) {
            periodNumber = 0;
        } else {
            periodNumber = Math.floor(secondsSince8AM / secondsPerRound) + 1;
        }

        if (periodEl) {
            const dateStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${date.toString().padStart(2, "0")}`;
            periodEl.textContent = `${dateStr} / ${periodNumber}`;
        }

        // AI 分析动画
        if (resultEl) resultEl.textContent = "AI Analyzing•••";

        if (resultEl.resultTimeout) clearTimeout(resultEl.resultTimeout);

        resultEl.resultTimeout = setTimeout(() => {
            if (data.result && data.result !== "AI Analyzing•••" && data.probability !== null) {
                let label = "";
                let color = "";
                let fontSize = "smaller";

                if (data.probability >= 65) {
                    label = "➠STABLE";
                    color = "#00dd00";
                } else {
                    label = "➠UNSTABLE";
                    color = "#ffcc00";
                }

                resultEl.innerHTML = `
                    ${data.result}<br>
                    <span style="color:${color}; font-size:${fontSize}">
                        ${label} (${data.probability}%)
                    </span>
                `;
            }
        }, 2000);
    } catch {
        if (resultEl) resultEl.textContent = "获取失败";
    }
}

// 初始加载默认 active（30s）
const defaultCard = document.querySelector(".card.active");
if (defaultCard) {
    const index = Array.from(cards).indexOf(defaultCard);
    const selectedBox = boxes[index];
    selectedBox.classList.remove("hidden");
    const time = parseInt(selectedBox.getAttribute("data-time"));
    startCountdown(selectedBox, time);
}

// 导航栏逻辑
navBar?.classList.remove("hidden");
window.addEventListener("scroll", () => {
    navBar?.classList.remove("hidden");
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        navBar?.classList.add("hidden");
    }, 2000);
});