// ✅ 初始化 Firebase
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

// ✅ 获取本地设备ID
function getDeviceId() {
  return localStorage.getItem("device_id");
}

// ✅ 显示倒计时
function displayCountdown(expiresAt) {
  const countdownEl = document.getElementById("countdown");

  if (!expiresAt) {
    countdownEl.textContent = "🔓 永久有效";
    return;
  }

  function updateCountdown() {
    const now = Date.now();
    const remaining = expiresAt - now;

    if (remaining <= 0) {
      countdownEl.textContent = "🔴 密钥已过期";
      return;
    }

    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    countdownEl.textContent = `🕒 剩余时间：${days}天${hours}小时${minutes}分钟`;
  }

  updateCountdown();
  setInterval(updateCountdown, 60000); // 每分钟更新一次
}

// ✅ 检查密钥信息
function checkAccess() {
  const deviceId = getDeviceId();
  if (!deviceId) {
    document.body.innerHTML = `<p style="color:red; font-weight:bold;">⚠️ 未验证设备，<a href="/verify">请先验证</a></p>`;
    return;
  }

  const keysRef = db.ref("keys/");
  keysRef.once("value").then(snapshot => {
    const allKeys = snapshot.val();
    let found = false;

    for (const [key, data] of Object.entries(allKeys)) {
      if (data.deviceId === deviceId && data.active) {
        found = true;
        displayCountdown(data.expiresAt);
        break;
      }
    }

    if (!found) {
      document.body.innerHTML = `<p style="color:red; font-weight:bold;">⚠️ 未绑定密钥，<a href="/verify">请先验证</a></p>`;
    }
  });
}

checkAccess();
