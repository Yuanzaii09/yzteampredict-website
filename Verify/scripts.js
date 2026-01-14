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

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ✅ 生成或获取设备 ID
function getDeviceId() {
  let id = localStorage.getItem("device_id");
  if (!id) {
    id = "dev-" + Math.random().toString(36).substr(2, 12);
    localStorage.setItem("device_id", id);
  }
  return id;
}

// ✅ 获取浏览器信息
function parseUserAgent() {
  const ua = navigator.userAgent;

  const os = /Windows/i.test(ua)
    ? "Windows"
    : /Android/i.test(ua)
    ? "Android"
    : /iPhone|iPad/i.test(ua)
    ? "iOS"
    : /Mac/i.test(ua)
    ? "MacOS"
    : "Other";

  const browser =
    /Chrome/i.test(ua) && !/Edg/i.test(ua)
      ? "Chrome"
      : /Firefox/i.test(ua)
      ? "Firefox"
      : /Safari/i.test(ua) && !/Chrome/i.test(ua)
      ? "Safari"
      : /Edg/i.test(ua)
      ? "Edge"
      : "Unknown";

  return { os, browser, fullUA: ua };
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

// ✅ 主验证逻辑
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

  if (data.expiresAt && now > data.expiresAt) {
    showMessage("🔴密钥已过期", "red");
    return;
  }

  if (data.active && data.deviceId && data.deviceId !== deviceId) {
    showMessage("🔴密钥已绑定其他设备", "red");
    return;
  }

  let expiresAt = null;
  switch (data.type) {
    case "1min": expiresAt = now + 1 * 60 * 1000; break;
    case "1days": expiresAt = now + 1 * 24 * 60 * 60 * 1000; break;
    case "7days": expiresAt = now + 7 * 24 * 60 * 60 * 1000; break;
    case "14days": expiresAt = now + 14 * 24 * 60 * 60 * 1000; break;
    case "30days": expiresAt = now + 30 * 24 * 60 * 60 * 1000; break;
    case "forever":
    default: expiresAt = null;
  }

  const updateData = { deviceId };

  if (!data.active) {
    updateData.active = true;
    updateData.activatedAt = now;
    updateData.expiresAt = expiresAt;
  }

  // ✅ 获取 IP 和地理信息
  try {
    const res = await fetch("https://ipapi.co/json/");
    const geo = await res.json();
    updateData.ip = {
      address: geo.ip || "N/A",
      country: geo.country_name || "N/A",
      region: geo.region || "N/A",
      city: geo.city || "N/A"
    };
  } catch (e) {
    console.warn("⚠️ 获取 IP 失败", e);
  }

  // ✅ 获取设备信息
  const deviceInfo = parseUserAgent();
  updateData.deviceInfo = deviceInfo;

  // ✅ 更新到 Firebase
  await keyRef.update(updateData);

  // ✅ 显示成功提示
  showMessage("🟢验证成功 // 跳转中...", "green");

if (!data.active) {
  updateData.active = true;
  updateData.activatedAt = now;
  updateData.expiresAt = expiresAt
  
  const msg = `
*🚀NEW USER VERIFIED🚀*
*Key：* ${key}
*Time：*${new Date().toLocaleString()}
*DeviceID：*${deviceId}

*IP：*${updateData.ip?.address || "N/A"}
*City：*${updateData.ip?.city || "N/A"}
*Region：*${updateData.ip?.region || "N/A"}
*Country：*${updateData.ip?.country || "N/A"}

*OS：*${deviceInfo.os}
*Browser：*${deviceInfo.browser}
*UserAgent：*${deviceInfo.fullUA}
`;

// ✅ 发送 Telegram 消息
  const botToken = "8128311961:AAGsN9ELSpOMNnScCmUZT-YScvoBwo4LKkA";
  const chatId = "-1002626143079";
  
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: msg,
        parse_mode: "Markdown"
      })
    });
  }

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: msg,
          parse_mode: "Markdown"
          })
      });
  } catch (e) {
    console.warn("⚠️ Telegram 发送失败", e);
  }

  // ✅ 跳转
  setTimeout(() => {
    location.replace("https://yzteampredict.store/Home");
  }, 500);
}

// ✅ 按钮绑定
document.getElementById("verifyBtn").addEventListener("click", verifyKey);

// ✅ 复制设备ID按钮
const deviceId = getDeviceId();
document.getElementById("copyBtn").addEventListener("click", () => {
  navigator.clipboard.writeText(deviceId).then(() => {
    const btn = document.getElementById("copyBtn");
    const oldText = btn.textContent;
    btn.textContent = "✅ 已复制";
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = oldText;
      btn.disabled = false;
    }, 2000);
  });
});