let ws;
let hasPredicted = false;

// ✅ 启动 WebSocket 连接并监听 Aviator 数据
function startWebSocket() {
  ws = new WebSocket("wss://qpapi.tbgameloader.com");

  ws.binaryType = "arraybuffer"; // 👈 关键：强制接收为 ArrayBuffer

  ws.onopen = () => console.log("✅ WebSocket 已连接");

  ws.onclose = () => {
    console.warn("⚠️ WebSocket 断开，尝试重新连接...");
    setTimeout(startWebSocket, 2000);
  };

  ws.onmessage = (event) => {
    try {
      const text = new TextDecoder("utf-8").decode(event.data);
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}") + 1;
      const jsonStr = text.substring(jsonStart, jsonEnd);

      const msg = JSON.parse(jsonStr);
      console.log("📨 接收到消息：", msg);

      handleAviatorMessage(msg);

    } catch (err) {
      console.warn("❌ 无法解析 WebSocket 消息", err);
    }
  };
}

// ✅ 处理 Aviator 消息逻辑
function handleAviatorMessage(msg) {
  if (msg.cmd === 97) {
    showPrediction("⌛ 等待新一局开始...");
  }

  if (msg.cmd === 85 && !hasPredicted) {
    showPrediction("🔮 正在预测中...");
    hasPredicted = true;
  }

  if (msg.cmd === 84) {
    const fake = generateFakeMultiplier();
    showPrediction("🎯 预测结果：" + fake);
    hasPredicted = false;
  }
}

// ✅ 显示预测文字到页面
function showPrediction(text) {
  const container = document.querySelector(".container");
  if (container) {
    container.innerHTML = `<div style="font-size: 24px; font-weight: bold;">${text}</div>`;
  }
}

// ✅ 生成假倍率
function generateFakeMultiplier() {
  const val = (Math.random() * (4.99 - 1.01) + 1.01).toFixed(2);
  return `${val}x`;
}

// ✅ 启动
startWebSocket();