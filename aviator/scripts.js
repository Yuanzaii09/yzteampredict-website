let ws;

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
      
      console.log("📩 收到 raw 消息：", text);

      const msg = JSON.parse(text);
      console.log("📦 解析后的 msg：", msg);

      if (msg.cmd === 85) {
        console.log("✈️ 命中 cmd 85（倍率飞行中）");
        showPrediction("🔮 正在预测中...");
      }

      if (msg.cmd === 84) {
        console.log("💥 命中 cmd 84（飞机爆炸）");
        const fake = generateFakeMultiplier();
        showPrediction("🎯 预测结果：" + fake);
      }

    } catch (err) {
      console.warn("❌ 无法解析 WebSocket 消息", err);
    }
  };
}

// ✅ 显示预测内容
function showPrediction(text) {
  const container = document.querySelector(".container");
  if (container) {
    container.innerHTML = `<div style="font-size: 24px; font-weight: bold;">${text}</div>`;
  }
}

// ✅ 假倍率生成函数
function generateFakeMultiplier() {
  const val = (Math.random() * (4.99 - 1.01) + 1.01).toFixed(2);
  return `${val}x`;
}

// ✅ 启动监听
startWebSocket();