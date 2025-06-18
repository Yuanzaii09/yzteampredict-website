document.addEventListener('DOMContentLoaded', function () {
    let GAMEID = "";
    const countdownTimer = document.getElementById('countdown-timer');
    const predictionResult = document.getElementById('prediction-result');
    const predictionElement = document.getElementById('prediction');
    const probabilityElement = document.getElementById('probability');

    // 获取当前页面的路径，用来生成独立的键名
    const pagePrefix = window.location.pathname.split('/').pop(); // 获取文件名作为前缀（如 page2.html）

    /**
     * 更新游戏号码
     */
    function getGameID() {
        const now = new Date();
        now.setSeconds(now.getSeconds() + 30); // 快进当前时间 30 秒

        const baseTime = new Date();
        baseTime.setHours(8, 0, 0, 0); // 基准时间设置为当天的 8 点

        if (now < baseTime) {
            baseTime.setDate(baseTime.getDate() - 1); // 如果当前时间早于 8 点，取前一天
        }

        const elapsedIntervals = Math.floor((now - baseTime) / (30 * 1000)); // 每 30 秒为一个区间
        const gameID = `${elapsedIntervals.toString().padStart(4, '0')}`;
        GAMEID = gameID;

        document.getElementById("gameID").textContent = GAMEID; // 更新游戏号码
    }

    /**
     * 随机生成预测结果
     */
    function generatePrediction() {
        const predictions = ['大', '小'];
        const randomPrediction = predictions[Math.floor(Math.random() * predictions.length)];

        // 生成 50-75% 概率的概率为 35%，生成 76-98% 概率的概率为 65%
        let randomProbability;
        if (Math.random() <= 0.45) { // 45% 概率生成 50% - 75%
            randomProbability = Math.floor(Math.random() * (75 - 50 + 1)) + 50; // 生成 50 到 75 之间的数
        } else { // 55% 概率生成 76% - 98%
            randomProbability = Math.floor(Math.random() * (98 - 76 + 1)) + 76; // 生成 76 到 98 之间的数
        }

        // 保存预测结果到 localStorage，使用页面特定的键名
        localStorage.setItem(`${pagePrefix}_prediction`, randomPrediction);
        localStorage.setItem(`${pagePrefix}_probability`, randomProbability);

        predictionElement.textContent = randomPrediction;
        probabilityElement.textContent = randomProbability + "%";

        predictionResult.style.display = 'block'; // 显示预测结果
    }

    /**
     * 从 localStorage 获取预测结果
     */
    function loadSavedPrediction() {
        const savedPrediction = localStorage.getItem(`${pagePrefix}_prediction`);
        const savedProbability = localStorage.getItem(`${pagePrefix}_probability`);

        if (savedPrediction && savedProbability) {
            predictionElement.textContent = savedPrediction;
            probabilityElement.textContent = savedProbability + "%";
            predictionResult.style.display = 'block'; // 显示保存的预测结果
        }
    }

    /**
     * 倒计时逻辑
     */
    function startRealCountdown() {
        const intervalTime = 30 * 1000; // 每 30 秒
        let endTime = Math.ceil(Date.now() / intervalTime) * intervalTime; // 计算下一整 30 秒的时间戳

        function updateCountdown() {
            const now = Date.now();
            const timeLeft = endTime - now;

            if (timeLeft <= 0) {
                clearInterval(interval); // 停止当前计时器
                getGameID(); // 更新游戏号码
                generatePrediction(); // 生成预测结果
                startRealCountdown(); // 重新启动倒计时
            } else {
                const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);
                countdownTimer.textContent = `00:${seconds.toString().padStart(2, '0')}`;
            }
        }

        updateCountdown(); // 初始化倒计时显示
        const interval = setInterval(updateCountdown, 100); // 每 100 毫秒更新显示
    }

    // 初始化
    getGameID(); // 快进 30 秒后更新游戏号码
    loadSavedPrediction(); // 尝试加载保存的预测结果
    startRealCountdown();
});