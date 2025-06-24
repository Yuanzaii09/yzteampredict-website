const cards = document.querySelectorAll(".card");
const boxes = document.querySelectorAll(".countdown-box");
const navBar = document.querySelector(".nav-bar");
let countdownIntervals = {};
let scrollTimeout = null;

/**
 * 根据秒数周期生成期号字符串，格式如：20250624100051149
 */
function getPeriodString(secondsPerRound) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0);
    const diffSeconds = Math.floor((now - start) / 1000);

    // 基础偏移量，和你的逻辑对应
    const baseOffsetMap = {
        30: 960,
        60: 960,
        180: 320,
        300: 192
    };

    // 中间固定码
    const fixedCodeMap = {
        30: "10005",
        60: "10001",
        180: "10002",
        300: "10003"
    };

    const baseOffset = baseOffsetMap[secondsPerRound] || 0;
    const fixedCode = fixedCodeMap[secondsPerRound] || "00000";

    // 当前轮数索引
    const currentIndex = Math.floor(diffSeconds / secondsPerRound);
    const predictedIndex = currentIndex + baseOffset + 1;

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    // 拼接期号，后面四位是期数
    const rawPeriod = `${year}${month}${day}${fixedCode}${String(predictedIndex).padStart(4, "0")}`;

    // 按你的要求，删掉第14位字符，拼接后返回
    return rawPeriod.slice(0, 13) + rawPeriod.slice(14);
}

/**
 * 异步获取结果并显示，带延迟2秒
 * 根据 secondsPerRound 传参数给接口，后台返回对应结果
 */
async function fetchAndDisplayResult(periodEl, resultEl, secondsPerRound) {
    try {
        const res = await fetch(`https://yzteampredict-website.vercel.app/api/result?period=${secondsPerRound}`);
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
 * 启动指定容器的倒计时逻辑
 */
function startCountdown(container, secondsPerRound) {
    const cdEl = container.querySelector(".cd");
    const periodEl = container.querySelector(".period");
    const resultEl = container.querySelector(".result");
    let blinkState = true;

    const intervalTime = secondsPerRound * 1000;
    let endTime = Math.ceil(Date.now() / intervalTime) * intervalTime;

    async function update() {
        try {
            const now = Date.now();
            const timeLeft = endTime - now;

            if (timeLeft <= 0) {
                clearInterval(countdownIntervals[secondsPerRound]);
                cdEl.style.color = "";
                cdEl.style.visibility = "visible";
                startCountdown(container, secondsPerRound);
            } else {
                const totalSecondsLeft = Math.floor(timeLeft / 1000);
                // 格式化倒计时为 MM : SS
                const minutes = Math.floor(totalSecondsLeft / 60);
                const seconds = totalSecondsLeft % 60;
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
        } catch (e) {
            console.error(e);
        }
    }

    fetchAndDisplayResult(periodEl, resultEl, secondsPerRound);
    update();
    countdownIntervals[secondsPerRound] = setInterval(() => {
        update();
        fetchAndDisplayResult(periodEl, resultEl, secondsPerRound);
    }, 1000);
}

// 绑定点击切换卡片和显示对应倒计时容器
cards.forEach((card, index) => {
    card.addEventListener("click", () => {
        // 切换 active
        document.querySelector(".card.active")?.classList.remove("active");
        card.classList.add("active");

        // 隐藏所有倒计时容器
        boxes.forEach(box => box.classList.add("hidden"));

        // 显示当前对应容器
        const selectedBox = boxes[index];
        selectedBox.classList.remove("hidden");

        // 清除之前所有倒计时interval
        Object.values(countdownIntervals).forEach(clearInterval);
        countdownIntervals = {};

        // 读取当前周期秒数并启动倒计时
        const time = parseInt(selectedBox.getAttribute("data-time"));
        startCountdown(selectedBox, time);
    });
});

// 页面加载时默认启动第一个（30秒）
(() => {
    const defaultCard = document.querySelector(".card.active");
    if (!defaultCard) return;

    const index = Array.from(cards).indexOf(defaultCard);
    const selectedBox = boxes[index];
    selectedBox.classList.remove("hidden");

    const time = parseInt(selectedBox.getAttribute("data-time"));
    startCountdown(selectedBox, time);
})();

// 导航栏显示隐藏逻辑
navBar?.classList.remove("hidden");
window.addEventListener("scroll", () => {
    navBar?.classList.remove("hidden");
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        navBar?.classList.add("hidden");
    }, 2000);
});