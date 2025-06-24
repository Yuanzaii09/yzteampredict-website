const cards = document.querySelectorAll(".card");
const boxes = document.querySelectorAll(".countdown-box");
const navBar = document.querySelector(".nav-bar");
let countdownIntervals = {};
let scrollTimeout = null;

// 切换 card 时激活对应盒子
cards.forEach((card, index) => {
    card.addEventListener("click", () => {
        // 切换 card 的 .active
        document.querySelector(".card.active")?.classList.remove("active");
        card.classList.add("active");

        // 隐藏所有 countdown-box
        boxes.forEach(box => box.classList.add("hidden"));

        // 显示当前对应的 countdown-box
        const selectedBox = boxes[index];
        selectedBox.classList.remove("hidden");

        // 清除之前的 interval
        for (let key in countdownIntervals) {
            clearInterval(countdownIntervals[key]);
        }

        // 启动新的 countdown
        const time = parseInt(selectedBox.getAttribute("data-time"));
        startCountdown(selectedBox, time);
    });
});

// 倒计时启动函数
function startCountdown(container, secondsPerRound) {
    const cdEl = container.querySelector(".cd");
    const periodEl = container.querySelector(".period");
    const resultEl = container.querySelector(".result");
    let blinkState = true;
    let resultTimeout = null;

    const intervalTime = secondsPerRound * 1000;
    let endTime = Math.ceil(Date.now() / intervalTime) * intervalTime;

    async function fetchAndDisplayResult() {
        try {
            const res = await fetch("https://yzteampredict-website.vercel.app/api/result");
            const data = await res.json();

            if (periodEl) periodEl.textContent = data.period;
            if (resultEl) resultEl.textContent = "AI Analyzing•••";
            if (resultTimeout) clearTimeout(resultTimeout);

            resultTimeout = setTimeout(() => {
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

    function updateCountdown() {
        const now = Date.now();
        const timeLeft = endTime - now;

        if (timeLeft <= 0) {
            clearInterval(countdownIntervals[secondsPerRound]);
            cdEl.style.color = "";
            cdEl.style.transform = "";
            cdEl.style.visibility = "visible";
            startCountdown(container, secondsPerRound); // 重新开始
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

    fetchAndDisplayResult();
    updateCountdown();
    countdownIntervals[secondsPerRound] = setInterval(updateCountdown, 250);
}

// 初始启动默认 active（30s）
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