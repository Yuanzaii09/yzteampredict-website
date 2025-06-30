const cards = document.querySelectorAll(".card");
const boxes = document.querySelectorAll(".countdown-box");
const navBar = document.querySelector(".nav-bar");
let countdownIntervals = {};
let scrollTimeout = null;

// 固定码映射，秒数 => 固定数字字符串
const fixedCodes = {
    30: "10005",
    60: "10001",
    180: "10002",
    300: "10003"
};

/**
 * 根据秒数计算期数，返回格式：YYYYMMDD + 固定码(5位) + 期号(4位)
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
    const fixedCode = fixedCodes[secondsPerRound] || "00000";
    const paddedPeriod = periodNumber.toString().padStart(4, "0");

    return `${yyyymmdd}${fixedCode}${paddedPeriod}`;
}

/**
 * 异步获取结果并显示
 */
async function fetchAndDisplayResult(periodEl, resultEl, secondsPerRound) {
    try {
        const apiMap = {
            30: "30sResult",
            60: "1mResult",
            180: "3mResult",
            300: "5mResult"
        };
        const endpoint = apiMap[secondsPerRound] || "30sResult";

        const res = await fetch(`https://yzteampredict-website.vercel.app/api/${endpoint}`);
        const data = await res.json();

        if (periodEl) {
            periodEl.textContent = getPeriodString(secondsPerRound);
        }

        if (resultEl) resultEl.textContent = "AI Analyzing•••";

        if (resultEl.resultTimeout) clearTimeout(resultEl.resultTimeout);

        resultEl.resultTimeout = setTimeout(() => {
            if (data.result && data.result !== "AI Analyzing•••" && data.probability !== null) {
                const label = data.probability >= 65 ? "🟢STABLE" : "🟠UNSTABLE";
                const color = data.probability >= 65 ? "#00dd00" : "#ffcc00";

                resultEl.innerHTML = `
                    ${data.result}<br>
                    <span style="color:${color}; font-size:smaller">
                        ${label} (${data.probability}%)
                    </span>
                `;
            }
        }, 2000);
    } catch (error) {
        console.error(error);
        if (periodEl) periodEl.textContent = "-";
        if (resultEl) resultEl.textContent = "获取失败";
    }
}

/**
 * 启动倒计时逻辑
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
            cdEl.style.color = "";
            cdEl.style.visibility = "visible";
            startCountdown(container, secondsPerRound);
        } else {
            let totalSecondsLeft = Math.floor(timeLeft / 1000);
            let minutes = Math.floor(totalSecondsLeft / 60);
            let seconds = totalSecondsLeft % 60;

            cdEl.textContent = `${minutes.toString().padStart(2, "0")} : ${seconds.toString().padStart(2, "0")}`;

            if (totalSecondsLeft <= 5) {
                cdEl.style.color = "#ff3333";
                cdEl.style.visibility = blinkState ? "visible" : "hidden";
                blinkState = !blinkState;
            } else {
                cdEl.style.color = "";
                cdEl.style.visibility = "visible";
            }
        }
    }

    fetchAndDisplayResult(periodEl, resultEl, secondsPerRound);
    updateCountdown();
    countdownIntervals[secondsPerRound] = setInterval(updateCountdown, 250);
}

// 切换卡片并显示对应倒计时
cards.forEach((card, index) => {
    card.addEventListener("click", () => {
        document.querySelector(".card.active")?.classList.remove("active");
        card.classList.add("active");

        boxes.forEach(box => box.classList.add("hidden"));
        const selectedBox = boxes[index];
        selectedBox.classList.remove("hidden");

        Object.values(countdownIntervals).forEach(clearInterval);
        countdownIntervals = {};

        const time = parseInt(selectedBox.getAttribute("data-time"));
        startCountdown(selectedBox, time);
    });
});

// 页面加载时初始化默认卡片
window.addEventListener("load", () => {
    const defaultCard = document.querySelector(".card.active");
    if (defaultCard) {
        const index = Array.from(cards).indexOf(defaultCard);
        const selectedBox = boxes[index];
        selectedBox.classList.remove("hidden");
        const time = parseInt(selectedBox.getAttribute("data-time"));
        startCountdown(selectedBox, time);
    }

    // 显示导航栏后自动隐藏
    navBar?.classList.remove("hidden");
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        navBar?.classList.add("hidden");
    }, 2000);
});

// 滚动时显示导航栏并重置隐藏计时
window.addEventListener("scroll", () => {
    navBar?.classList.remove("hidden");
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        navBar?.classList.add("hidden");
    }, 2000);
});
