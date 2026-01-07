// Firebase
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

/* ===============================
   deviceId（与 auth-check.js 一致）
================================ */
function getDeviceId() {
  let id = localStorage.getItem("device_id");
  if (!id) {
    id = "dev-" + crypto.randomUUID();
    localStorage.setItem("device_id", id);
  }
  return id;
}

/* ===============================
   浏览器信息
================================ */
function parseUserAgent() {
  const ua = navigator.userAgent;
  return {
    os: /Windows/i.test(ua)
      ? "Windows"
      : /Android/i.test(ua)
      ? "Android"
      : /iPhone|iPad/i.test(ua)
      ? "iOS"
      : /Mac/i.test(ua)
      ? "MacOS"
      : "Other",
    browser:
      /Chrome/i.test(ua) && !/Edg/i.test(ua)
        ? "Chrome"
        : /Firefox/i.test(ua)
        ? "Firefox"
        : /Safari/i.test(ua) && !/Chrome/i.test(ua)
        ? "Safari"
        : /Edg/i.test(ua)
        ? "Edge"
        : "Unknown",
    fullUA: ua
  };
}

/* ===============================
   UI 提示
================================ */
function showMessage(text, color) {
  const el = document.getElementById("result");
  el.textContent = text;
  el.style.color = color;
  el.style.fontWeight = "bold";
}

/* ===============================
   主验证逻辑
================================ */
async function verifyKey() {
  const key = document.getElementById("keyInput").value.trim();
  const deviceId = getDeviceId();

  if (!key) {
    showMessage("🔴请输入密钥", "red");
    return;
  }

  const refKey = db.ref("keys/" + key);
  const snap = await refKey.once("value");

  if (!snap.exists()) {
    showMessage("🔴密钥无效", "red");
    return;
  }

  const data = snap.val();
  const now = Date.now();

  if (data.expiresAt && now > data.expiresAt) {
    showMessage("🔴密钥已过期", "red");
    return;
  }

  if (data.active && data.deviceId && data.deviceId !== deviceId) {
    showMessage("🔴密钥已绑定其他设备", "red");
    return;
  }

  // 计算过期时间
  const map = {
    "1days": 1 * 86400000,
    "7days": 7 * 86400000,
    "14days": 14 * 86400000,
    "30days": 30 * 86400000
  };

  const expiresAt = map[data.type] ? now + map[data.type] : null;

  const updateData = {
    deviceId,
    deviceInfo: parseUserAgent()
  };

  if (!data.active) {
    updateData.active = true;
    updateData.activatedAt = now;
    updateData.expiresAt = expiresAt;
  }

  try {
    const res = await fetch("https://ipapi.co/json/");
    const geo = await res.json();
    updateData.ip = {
      address: geo.ip,
      city: geo.city,
      region: geo.region,
      country: geo.country_name
    };
  } catch {}

  await refKey.update(updateData);

  showMessage("🟢验证成功，正在跳转...", "green");

  setTimeout(() => {
    location.replace("https://yzteampredict.store/Home");
  }, 600);
}

/* ===============================
   事件绑定
================================ */
document.getElementById("verifyBtn").addEventListener("click", verifyKey);

document.getElementById("copyBtn").addEventListener("click", () => {
  navigator.clipboard.writeText(getDeviceId());
});