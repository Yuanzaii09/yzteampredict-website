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
    console.log("📩 收到消息：", event.data);

    try {
      // 👉 处理 Blob（二进制消息）
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

      // 👉 处理 ArrayBuffer（也可能是二进制）
      if (event.data instanceof ArrayBuffer) {
        const text = new TextDecoder("utf-8").decode(event.data);
        console.log("🔍 ArrayBuffer 解码后：", text);
        const msg = JSON.parse(text);
        handleAviatorMessage(msg);
        return;
      }

      // 👉 处理字符串消息
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
}

// ✅ 处理 Aviator 消息的逻辑
function handleAviatorMessage(msg) {
  console.log("🧠 Aviator 消息解析：", msg);

  if (msg.cmd === 97) {
    // 🕓 新一局即将开始
    showPrediction("⌛ 正在等待开始...");
  }

  if (msg.cmd === 85 && !hasPredicted) {
    // 🛫 飞行中，倍率开始更新
    showPrediction("🔮 正在预测中...");
    hasPredicted = true;
  }

  if (msg.cmd === 84) {
    // 💥 飞机爆炸，一局结束
    const fake = generateFakeMultiplier();
    showPrediction("🎯 预测结果：" + fake);
    hasPredicted = false;
  }
}

// ✅ 显示预测内容
function showPrediction(text) {
  const container = document.querySelector(".container");
  if (container) {
    container.innerHTML = `<div style="font-size: 24px; font-weight: bold;">${text}</div>`;
  }
}

// ✅ 生成随机倍率预测（假的）
function generateFakeMultiplier() {
  const val = (Math.random() * (4.99 - 1.01) + 1.01).toFixed(2);
  return `${val}x`;
}

// ✅ 启动
startWebSocket();