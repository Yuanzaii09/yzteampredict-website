<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>

<script>
/* ===============================
   1️⃣ Firebase 初始化
================================ */
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
   2️⃣ 稳定 deviceId（Cookie + LS）
================================ */
function getDeviceId() {
  const cookieMatch = document.cookie.match(/device_id=([^;]+)/);
  if (cookieMatch) {
    localStorage.setItem("device_id", cookieMatch[1]);
    return cookieMatch[1];
  }

  let id = localStorage.getItem("device_id");
  if (id) {
    document.cookie = `device_id=${id}; max-age=31536000; path=/; SameSite=Lax`;
    return id;
  }

  id = "dev-" + crypto.randomUUID();
  localStorage.setItem("device_id", id);
  document.cookie = `device_id=${id}; max-age=31536000; path=/; SameSite=Lax`;
  return id;
}

const deviceId = getDeviceId();

/* ===============================
   3️⃣ UI 提示
================================ */
function showMessage(msg, color) {
  const el = document.getElementById("result");
  el.textContent = msg;
  el.style.color = color;
  el.style.fontWeight = "bold";
}

/* ===============================
   4️⃣ 验证逻辑（干净版）
================================ */
async function verifyKey() {
  const key = document.getElementById("keyInput").value.trim();
  if (!key) return showMessage("🔴请输入密钥", "red");

  const keyRef = db.ref("keys/" + key);
  const snap = await keyRef.once("value");

  if (!snap.exists())
    return showMessage("🔴密钥无效", "red");

  const data = snap.val();
  const now = Date.now();

  // 已过期
  if (data.expiresAt && now > data.expiresAt)
    return showMessage("🔴密钥已过期", "red");

  // 被其他设备占用
  if (data.deviceId && data.deviceId !== deviceId)
    return showMessage("🔴密钥已绑定其他设备", "red");

  // 第一次激活才算时间
  let updateData = { deviceId };

  if (!data.active) {
    const durationMap = {
      "1min": 60000,
      "1days": 86400000,
      "7days": 604800000,
      "14days": 1209600000,
      "30days": 2592000000
    };

    updateData.active = true;
    updateData.activatedAt = now;
    updateData.expiresAt = data.type && durationMap[data.type]
      ? now + durationMap[data.type]
      : null;
  }

  await keyRef.update(updateData);

  showMessage("🟢验证成功，跳转中...", "green");

  setTimeout(() => {
    location.replace("https://yzteampredict.store/Home");
  }, 500);
}

/* ===============================
   5️⃣ 绑定按钮
================================ */
document.getElementById("verifyBtn")
  .addEventListener("click", verifyKey);
</script>