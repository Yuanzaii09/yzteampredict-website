let ws;
let hasPredicted = false;

// 启动 WebSocket
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

      if (msg.cmd === 97) {
        // 🕒 新一局即将开始，重置标志
        hasPredicted = false;
        console.log("🕒 新一局即将开始");
      }

      if (msg.cmd === 85 && !hasPredicted) {
        showPrediction("🔮 正在预测中...");
        hasPredicted = true;
        console.log("🧠 正在预测中...");
      }

      if (msg.cmd === 84) {
        const fake = generateFakeMultiplier();
        showPrediction("🎯 预测结果：" + fake);
        console.log("🎯 显示预测结果：" + fake);
      }

    } catch (err) {
      console.warn("❌ 无法解析 WebSocket 消息", err);
    }
  };
}

// 显示预测
function showPrediction(text) {
  const container = document.querySelector(".container");
  if (container) {
    container.innerHTML = `<div style="font-size: 24px; font-weight: bold;">${text}</div>`;
  }
}

// 生成假倍率
function generateFakeMultiplier() {
  const val = (Math.random() * (4.99 - 1.01) + 1.01).toFixed(2);
  return `${val}x`;
}

// 启动
startWebSocket();