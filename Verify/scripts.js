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

// ✅ 获取或生成 deviceId（本地存储）
function getDeviceId() {
  let id = localStorage.getItem("device_id");
  if (!id) {
    id = "dev-" + Math.random().toString(36).substr(2, 12);
    localStorage.setItem("device_id", id);
  }
  return id;
}

// ✅ 获取设备信息（User Agent）
function getDeviceInfo() {
  const ua = navigator.userAgent;
  const platform = navigator.platform;
  return {
    userAgent: ua,
    platform: platform
  };
}

// ✅ 显示提示信息
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

// ✅ 验证密钥逻辑
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

  // ✅ 密钥过期判断
  if (data.expiresAt && now > data.expiresAt) {
    showMessage("🔴密钥已过期", "red");
    return;
  }

  // ✅ 密钥绑定其他设备
  if (data.active && data.deviceId && data.deviceId !== deviceId) {
    showMessage("🔴密钥已绑定其他设备", "red");
    return;
  }

  // ✅ 计算过期时间（仅首次激活）
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

  // ✅ 首次激活
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
  } catch (err) {
    console.warn("⚠️ 获取 IP 失败", err);
  }

  // ✅ 获取设备信息
  updateData.deviceInfo = getDeviceInfo();

  // ✅ 更新数据库
  await keyRef.update(updateData);
  showMessage("🟢验证成功 // 跳转中...", "green");

  setTimeout(() => {
    location.replace("https://yzteampredict.store/Home");
  }, 500);
}

// ✅ 绑定验证按钮
document.getElementById("verifyBtn").addEventListener("click", verifyKey);

// ✅ 复制 device_id 按钮功能
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