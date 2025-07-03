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

// ✅ 获取设备ID
function getDeviceId() {
  return localStorage.getItem("device_id");
}

// ✅ 获取该设备绑定的密钥
function getBoundKey(callback) {
  const keysRef = db.ref("keys/");
  keysRef.once("value").then((snapshot) => {
    const allKeys = snapshot.val();
    const deviceId = getDeviceId();
    if (!deviceId) {
      callback(null);
      return;
    }

    for (const [key, data] of Object.entries(allKeys)) {
      if (data.deviceId === deviceId) {
        callback(data);
        return;
      }
    }

    callback(null);
  });
}

// ✅ 显示剩余时间
function showCountdown(expiresAt) {
  const countdownEl = document.getElementById("countdown");

  if (!expiresAt) {
    countdownEl.textContent = "EXPIRES: UNLIMITED";
    return;
  }

  function update() {
    const now = Date.now();
    const diff = expiresAt - now;

    if (diff <= 0) {
      countdownEl.textContent = "🚫密钥已过期";
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    countdownEl.textContent = `EXPIRES: ${days} Day ${hours} Hour ${minutes} Min`;

    setTimeout(update, 60000); // 每分钟更新一次
  }

  update();
}

// ✅ 启动流程
getBoundKey((data) => {
  const el = document.getElementById("countdown");

  if (!data) {
    el.textContent = "❌未绑定密钥，请返回验证页面";
    return;
  }

  if (!data.active) {
    el.textContent = "❌密钥未激活";
    return;
  }

  showCountdown(data.expiresAt || null);
});
