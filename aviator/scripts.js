document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".container");

  // 插入显示区域
  const status = document.createElement("div");
  status.id = "status";
  status.style.textAlign = "center";
  status.style.fontSize = "20px";
  status.style.marginTop = "20px";
  container.appendChild(status);

  const prediction = document.createElement("div");
  prediction.id = "prediction";
  prediction.style.textAlign = "center";
  prediction.style.fontSize = "24px";
  prediction.style.fontWeight = "bold";
  prediction.style.marginTop = "10px";
  container.appendChild(prediction);

  // 🔍 修改这个选择器为 Aviator 实际倍率显示元素
  const multiplierEl = document.querySelector(".crash-point") || document.querySelector(".multiplier-value");

  if (!multiplierEl) {
    status.textContent = "❌ 没有找到倍率元素";
    return;
  }

  let lastWasEmpty = multiplierEl.textContent.trim() === "";

  const observer = new MutationObserver(() => {
    const current = multiplierEl.textContent.trim();

    // 一轮结束：倍率重新出现
    if (lastWasEmpty && current !== "") {
      onRoundEnd(current);
    }

    // 新一轮开始：倍率变空
    if (!lastWasEmpty && current === "") {
      onRoundStart();
    }

    lastWasEmpty = (current === "");
  });

  observer.observe(multiplierEl, { childList: true, subtree: true });

  function onRoundStart() {
    status.textContent = "🌀 预测中...";
    prediction.textContent = "";
  }

  function onRoundEnd(multiplierText) {
    const fakePrediction = generatePrediction();
    status.textContent = `✈️ 上局爆点：${multiplierText}`;
    prediction.textContent = `📈 预测倍率：${fakePrediction}x`;
  }

  // 生成“假预测”
  function generatePrediction() {
    const num = (Math.random() * 5 + 1).toFixed(2); // 生成 1.00 到 6.00 的随机倍率
    return num;
  }
});