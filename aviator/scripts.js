let ws;
let hasPredicted = false;

// ✅ 启动 WebSocket 连接并监听 Aviator 数据
function startWebSocket() {
  ws = new WebSocket("wss://qpapi.tbgameloader.com");

  ws.onopen = () => console.log("✅ WebSocket 已连接");

  ws.onclose = () => {
    console.warn("⚠️ WebSocket 断开，尝试重新连接...");
    setTimeout(startWebSocket, 2000);
  };

  ws.onmessage = (event) => {
    try {
      const text = typeof event.data === "string"
        ? event.data
        : new TextDecoder().decode(event.data);

      const msg = JSON.parse(text);

      // 🛫 飞机运行中（倍率持续更新）
      if (msg.cmd === 85 && !hasPredicted) {
        showPrediction("🔮 正在预测中...");
        hasPredicted = true;
      }

      // 💥 飞机爆炸（本局结束）
      if (msg.cmd === 84) {
        const fake = generateFakeMultiplier();
        showPrediction("🎯 预测结果：" + fake);
        hasPredicted = false;
      }

    } catch (err) {
      console.warn("❌ 无法解析 WebSocket 消息", err);
    }
  };
}

// ✅ 显示预测内容（你页面中 .container 会显示这个内容）
function showPrediction(text) {
  const container = document.querySelector(".container");
  if (container) {
    container.innerHTML = `<div style="font-size: 24px; font-weight: bold;">${text}</div>`;
  }
}

// ✅ 模拟生成一个倍率预测（假数据）
function generateFakeMultiplier() {
  const val = (Math.random() * (4.99 - 1.01) + 1.01).toFixed(2);
  return `${val}x`;
}

// ✅ 启动
startWebSocket();