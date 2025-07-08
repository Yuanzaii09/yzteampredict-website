function generateRandom() {
    // 生成 1.01 到 9.99 的随机数，保留两位小数
    const min = 1.01;
    const max = 9.99;
    const random = (Math.random() * (max - min) + min).toFixed(2);

    document.getElementById("randomNumber").textContent = `${random}x`;
}

// 页面加载时自动生成
document.addEventListener("DOMContentLoaded", generateRandom);
