// ✅ Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyAN88MgeiYxOmb1OFfgL-wVmfJC60XFcoM",
  authDomain: "verify-b3d6c.firebaseapp.com",
  databaseURL: "https://verify-b3d6c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "verify-b3d6c",
  storageBucket: "verify-b3d6c.appspot.com",
  messagingSenderId: "734040141195",
  appId: "1:734040141195:web:c1bd782daf1ff6ed40538e"
};

// ✅ 初始化 Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ✅ 获取或生成 deviceId
function getDeviceId() {
  let id = localStorage.getItem("device_id");
  if (!id) {
    id = "dev-" + Math.random().toString(36).substr(2, 12);
    localStorage.setItem("device_id", id);
  }
  return id;
}

// ✅ 获取设备信息
function getDeviceInfo() {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform
  };
}

// ✅ 显示提示
function showMessage(text, color) {
  const result = document.getElementById("result");
  if (result) {
    result.textContent = text;
    result.style.color = color;
    result.style.fontWeight = "bold";
    if (color === "red") {
      result.classList.remove("shake");
      void result.offsetWidth;
      result.classList.add("shake");
    }
  }
}

// ✅ 验证密钥函数
async function verifyKey() {
  const key = document.getElementById("keyInput").value.trim();
  const deviceId = getDeviceId();

  if (!key) {
    showMessage("🔴请输入密钥", "red");
    return;
  }

  const keyRef = db.ref("keys/" + key);
  const snapshot = await keyRef.once("value");

  if (!snapshot.exists()) {
    showMessage("🔴密钥无效", "red");
    return;
  }

  const data = snapshot.val();
  const now = Date.now();

  // ✅ 判断是否过期
  if (data.expiresAt && now > data.expiresAt) {
    showMessage("🔴密钥已过期", "red");
    return;
  }

  // ✅ 判断是否绑定其他设备
  if (data.active && data.deviceId && data.deviceId !== deviceId) {
    showMessage("🔴密钥已绑定其他设备", "red");
    return;
  }

  // ✅ 设置过期时间（仅首次激活）
  let expiresAt = null;
  switch (data.type) {
    case "1min":    expiresAt = now + 1 * 60 * 1000; break;
    case "1days":   expiresAt = now + 1 * 24 * 60 * 60 * 1000; break;
    case "7days":   expiresAt = now + 7 * 24 * 60 * 60 * 1000; break;
    case "14days":  expiresAt = now + 14 * 24 * 60 * 60 * 1000; break;
    case "30days":  expiresAt = now + 30 * 24 * 60 * 60 * 1000; break;
    case "forever":
    default:        expiresAt = null;
  }

  const updateData = { deviceId };

  if (!data.active) {
    updateData.active = true;
    updateData.activatedAt = now;
    updateData.expiresAt = expiresAt;
  }

  // ✅ 获取 IP 和地区
  try {
    const res = await fetch("https://ipapi.co/json/");
    const geo = await res.json();
    updateData.ip = {
      address: geo.ip || "N/A",
      country: geo.country_name || "N/A",
      region: geo.region || "N/A",
      city: geo.city || "N/A"
    };
  } catch (err) {
    console.warn("⚠️ 获取 IP 失败", err);
  }

  // ✅ 获取设备信息
  updateData.deviceInfo = getDeviceInfo();

  // ✅ 更新 Firebase
  await keyRef.update(updateData);

  // ✅ 构建发送到 Telegram 的内容
  const message = `
🔔 New User Verified!
🔑 Key: ${key}
🆔 Device ID: ${deviceId}
🌐 IP: ${updateData.ip?.address || "N/A"}
📍 Country: ${updateData.ip?.country || "N/A"}
📍 Region: ${updateData.ip?.region || "N/A"}
🏙️ City: ${updateData.ip?.city || "N/A"}
📱 Device: ${updateData.deviceInfo?.platform || "N/A"}
🧭 Browser: ${updateData.deviceInfo?.userAgent?.slice(0, 50)}...
🕒 Time: ${new Date().toLocaleString()}
`;

  // ✅ 发送到 Telegram 群组
  const botToken = "8128311961:AAGsN9ELSpOMNnScCmUZT-YScvoBwo4LKkA";
  const chatId = "-1002626143079";
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message
      })
    });
  } catch (err) {
    console.warn("❌ 发送 Telegram 消息失败", err);
  }

  // ✅ 显示并跳转
  showMessage("🟢验证成功 // 跳转中...", "green");
  setTimeout(() => {
    location.replace("https://yzteampredict.store/Home");
  }, 500);
}

// ✅ 绑定按钮
document.getElementById("verifyBtn").addEventListener("click", verifyKey);

// ✅ 初始化 Device ID 和复制按钮
const deviceId = getDeviceId();
const copyBtn = document.getElementById("copyBtn");
copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(deviceId).then(() => {
    const original = copyBtn.textContent;
    copyBtn.textContent = "✅ 已复制";
    copyBtn.disabled = true;
    setTimeout(() => {
      copyBtn.textContent = original;
      copyBtn.disabled = false;
    }, 2000);
  }).catch(() => {
    copyBtn.textContent = "❌ 复制失败";
    setTimeout(() => {
      copyBtn.textContent = "📋 复制ID";
    }, 2000);
  });
});