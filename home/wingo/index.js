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
let blinkState = true;

/**
 * 获取结果并延迟 2 秒显示
 */
async function fetchAndDisplayResult() {
    try {
        const res = await fetch("https://yzteampredict-website.vercel.app/api/result");
        const data = await res.json();

        // 显示期号
        if (periodEl) periodEl.textContent = data.period;

        // 立即显示 AI分析中...
        if (resultEl) resultEl.textContent = "AI Analyzing•••";

        // 清除旧定时器
        if (resultTimeout) clearTimeout(resultTimeout);

        // 固定 2 秒延迟后显示结果
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
    } catch (err) {
        if (resultEl) resultEl.textContent = "获取失败";
    }
}

    /* 启动 30 秒倒计时 */
    function startRealCountdown() {
        const intervalTime = 30 * 1000;
        let endTime = Math.ceil(Date.now() / intervalTime) * intervalTime;
    
        fetchAndDisplayResult();

    function updateCountdown() {
        const now = Date.now();
        const timeLeft = endTime - now;

        if (timeLeft <= 0) {
            clearInterval(interval);
            if (cdEl) {
                cdEl.style.color = "";
                cdEl.style.transform = "";
                cdEl.style.visibility = "visible";
            }
            startRealCountdown();
        } else {
            const seconds = Math.floor((timeLeft % 60000) / 1000);

            if (cdEl) {
                cdEl.textContent = `00 : ${seconds.toString().padStart(2, "0")}`;

                if (seconds <= 5) {
                    // 添加红色、缩放和闪烁
                    cdEl.style.color = "#ff3333";
                    cdEl.style.visibility = blinkState ? "visible" : "hidden";
                    blinkState = !blinkState;
                } else {
                    // 恢复正常
                    cdEl.style.color = "";
                    cdEl.style.visibility = "visible";
                }
            }
        }
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 250);
}

// 启动倒计时
startRealCountdown();

    const navBar = document.querySelector(".nav-bar");
    let scrollTimeout = null;
    
    // 页面初始显示导航栏
    navBar?.classList.remove("hidden");
    
    window.addEventListener("scroll", () => {
        // 每次滚动都显示导航栏
        navBar?.classList.remove("hidden");
    
        // 清除上一个隐藏计时器
        clearTimeout(scrollTimeout);
    
        // 设置新的计时器，在静止 2 秒后隐藏
        scrollTimeout = setTimeout(() => {
            navBar?.classList.add("hidden");
        }, 2000);
    });