const cards = document.querySelectorAll(".card");
const boxes = document.querySelectorAll(".countdown-box");
const navBar = document.querySelector(".nav-bar");
let countdownIntervals = {};
let navBarHideTimeout = null;

// 固定码映射，秒数 => 固定数字字符串
const fixedCodes = {
    30: "10005",
    60: "10001",
    180: "10002",
    300: "10003"
};

/**
 * 根据秒数计算期数，返回格式：YYYYMMDD + 固定码(5位) + 期号(4位)
 * @param {number} secondsPerRound
 * @returns {string} 期号字符串
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
    const paddedPeriod = periodNumber.toString().padStart(4, "0"); // 4位数字

    return `${yyyymmdd}${fixedCode}${paddedPeriod}`;
}

/**
 * 异步获取结果并显示，带延迟2秒
 */
async function fetchAndDisplayResult(periodEl, resultEl, secondsPerRound) {
    try {
        // 动态选择 API 接口
        const apiMap = {
            30: "30sResult",
            60: "1mResult",
            180: "3mResult",
            300: "5mResult"
        };
        const endpoint = apiMap[secondsPerRound] || "30sResult";

        const res = await fetch(`https://yzteampredict-website.vercel.app/api/${endpoint}`);
        const data = await res.json();

        if (periodEl) periodEl.textContent = getPeriodString(secondsPerRound);

        if (resultEl) resultEl.textContent = "AI Analyzing•••";

        if (resultEl.resultTimeout) clearTimeout(resultEl.resultTimeout);

        resultEl.resultTimeout = setTimeout(() => {
            if (data.result && data.result !== "AI Analyzing•••" && data.probability !== null) {
                const label = data.probability >= 65 ? "➠STABLE" : "➠UNSTABLE";
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
            if (cdEl) {
                cdEl.style.color = "";
                cdEl.style.visibility = "visible";
            }
            startCountdown(container, secondsPerRound);
        } else {
            // 计算分钟和秒数显示
            let totalSecondsLeft = Math.floor(timeLeft / 1000);
            let minutes = Math.floor(totalSecondsLeft / 60);
            let seconds = totalSecondsLeft % 60;

            if (cdEl) {
                // 根据秒数判断格式，30秒的显示 00:xx，其他显示 mm:ss
                if (secondsPerRound === 30) {
                    cdEl.textContent = `00 : ${seconds.toString().padStart(2, "0")}`;
                } else {
                    cdEl.textContent = `${minutes.toString().padStart(2, "0")} : ${seconds.toString().padStart(2, "0")}`;
                }

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

navBar?.classList.remove("hidden");
clearTimeout(navBarHideTimeout);
navBarHideTimeout = setTimeout(() => {
    navBar?.classList.add("hidden");
}, 2000);