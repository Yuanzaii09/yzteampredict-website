document.addEventListener('DOMContentLoaded', function () {
    function delayedPrediction() {
        let prediction;

        // 按照概率分布决定数值范围
        const randomNum = Math.random() * 100;
        if (randomNum <= 85) {
            prediction = (Math.random() * (1.99 - 1.01) + 1.01).toFixed(2);
        } else if (randomNum <= 95) {
            prediction = (Math.random() * (4.99 - 2.00) + 2.00).toFixed(2);
        } else {
            prediction = (Math.random() * (9.99 - 5.00) + 5.00).toFixed(2);
        }

        console.log("预测结果:", prediction); // 调试信息
        document.getElementById("prediction").textContent = ">" + prediction; // 加入 > 前缀
        document.getElementById("prediction-result").style.display = 'block';
        document.getElementById("loadingScreen").style.display = 'none';
    }

    const button = document.getElementById('prediction-button');

    button.addEventListener('click', function () {
        if (button.disabled) return; // 防止重复点击

        console.log("按钮被点击"); // 调试信息
        button.disabled = true; // 立即禁用按钮防止二次点击
        button.style.transition = "transform 0.1s ease-in-out"; // 确保动画流畅

        // 1. 播放缩小动画
        button.style.transform = "scale(0.9)";

        setTimeout(() => {
            // 2. 恢复原大小
            button.style.transform = "scale(1)";

            setTimeout(() => {
                // 3. 变成锁定状态
                button.innerHTML = "🔒";
                document.getElementById("loadingScreen").style.display = 'block';

                setTimeout(() => {
                    // 4. 显示预测结果
                    delayedPrediction();

                    setTimeout(() => {
                        console.log("按钮解锁"); // 调试信息
                        button.innerHTML = "START"; // 恢复按钮文本
                        button.disabled = false; // 解锁按钮
                    }, 10000); // 10秒后恢复
                }, 2000); // 2秒后显示预测
            }, 100); // 确保动画完全播放完毕
        }, 100);
    });
});