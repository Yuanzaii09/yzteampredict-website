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
  console.log("📩 收到消息：", event.data);  // 👉 先看看收到的内容是什么

  try {
    // 👉 如果是 Blob（二进制数据），我们用 FileReader 读取
    if (event.data instanceof Blob) {
      const reader = new FileReader();
      reader.onload = function () {
        const text = reader.result;
        console.log("🔍 Blob 解码后：", text);

        const msg = JSON.parse(text);
        handleAviatorMessage(msg);
      };
      reader.readAsText(event.data);
      return;
    }

    // 👉 如果是 ArrayBuffer（也是二进制）
    if (event.data instanceof ArrayBuffer) {
      const text = new TextDecoder("utf-8").decode(event.data);
      console.log("🔍 ArrayBuffer 解码后：", text);

      const msg = JSON.parse(text);
      handleAviatorMessage(msg);
      return;
    }

    // 👉 普通字符串
    if (typeof event.data === "string") {
      console.log("🔍 文本消息：", event.data);
      const msg = JSON.parse(event.data);
      handleAviatorMessage(msg);
      return;
    }

    console.warn("⚠️ 未知格式的数据", event.data);
  } catch (err) {
    console.error("❌ 解码失败：", err);
  }
};

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