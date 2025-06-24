const cards = document.querySelectorAll(".card");
const boxes = document.querySelectorAll(".countdown-box");
const navBar = document.querySelector(".nav-bar");
let countdownIntervals = {};
let scrollTimeout = null;

/**
 * 根据秒数计算期数
 * @param {number} secondsPerRound 每期秒数
 * @returns {string} 期号，格式 YYYYMMDDxxxxx（5位数期号，从8点开始算）
 */
function getPeriodString(secondsPerRound) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-based
    const date = now.getDate();
    const eightAM = new Date(year, month, date, 8, 0, 0);
    const secondsSince8AM = Math.floor((now - eightAM) / 1000);
    let periodNumber = secondsSince8AM < 0 ? 0 : Math.floor(secondsSince8AM / secondsPerRound) + 1;

    const yyyymmdd = `${year}${(month + 1).toString().padStart(2, "0")}${date.toString().padStart(2, "0")}`;
    const paddedPeriod = periodNumber.toString().padStart(5, "0");

    return `${yyyymmdd}${paddedPeriod}`;
}

/**
 * 异步获取结果并显示，带延迟2秒
 */
async function fetchAndDisplayResult(periodEl, resultEl, secondsPerRound) {
    try {
        const res = await fetch("https://yzteampredict-website.vercel.app/api/result");
        const data = await res.json();

        if (periodEl) {
            periodEl.textContent = getPeriodString(secondsPerRound);
        }

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

/**
 * 启动倒计时逻辑
 * @param {HTMLElement} container countdown-box 容器
 * @param {number} secondsPerRound 每期秒数
 */
function startCountdown(container, secondsPerRound) {
    const cdEl = container.querySelector(".cd");
    const periodEl = container.querySelector(".period");
    const resultEl = container.querySelector(".result");
    let blinkState = true;

    const intervalTime = secondsPerRound * 1000;
    let endTime = Math.ceil(Date.now() / intervalTime) * intervalTime;

    async function updateCountdown() {
        const now = Date.now();
        const timeLeft = endTime - now;

        if (timeLeft <= 0) {
            clearInterval(countdownIntervals[secondsPerRound]);
            if (cdEl) {
                cdEl.style.color = "";
                cdEl.style.visibility = "visible";
            }
            // 重新开始倒计时和拉取数据
            startCountdown(container, secondsPerRound);
        } else {
            const seconds = Math.floor((timeLeft % 60000) / 1000);
            if (cdEl) {
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
    }

    fetchAndDisplayResult(periodEl, resultEl, secondsPerRound);
    updateCountdown();
    countdownIntervals[secondsPerRound] = setInterval(updateCountdown, 250);
}

// 卡片点击事件，切换显示和倒计时
cards.forEach((card, index) => {
    card.addEventListener("click", () => {
        // 切换卡片 active 状态
        document.querySelector(".card.active")?.classList.remove("active");
        card.classList.add("active");

        // 隐藏所有倒计时盒子
        boxes.forEach(box => box.classList.add("hidden"));

        // 显示当前对应盒子
        const selectedBox = boxes[index];
        selectedBox.classList.remove("hidden");

        // 清除所有之前的倒计时
        for (let key in countdownIntervals) {
            clearInterval(countdownIntervals[key]);
        }

        // 启动当前倒计时
        const time = parseInt(selectedBox.getAttribute("data-time"));
        startCountdown(selectedBox, time);
    });
});

// 初始化时启动默认选项的倒计时（带显示）
const defaultCard = document.querySelector(".card.active");
if (defaultCard) {
    const index = Array.from(cards).indexOf(defaultCard);
    const selectedBox = boxes[index];
    selectedBox.classList.remove("hidden");
    const time = parseInt(selectedBox.getAttribute("data-time"));
    startCountdown(selectedBox, time);
}

// 导航栏显示隐藏逻辑
navBar?.classList.remove("hidden");
window.addEventListener("scroll", () => {
    navBar?.classList.remove("hidden");
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        navBar?.classList.add("hidden");
    }, 2000);
});