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
    if (!deviceId || !allKeys) {
      callback(null);
      return;
    }

    for (const [key, data] of Object.entries(allKeys)) {
      if (data.deviceId === deviceId) {
        callback(data);
        return;
      }
    }

    callback(null); // 没找到匹配的密钥
  }).catch((error) => {
    console.error("读取失败：", error);
    callback(null); // 读取失败也当作验证失败
  });
}

// ✅ 显示剩余时间（含自动跳转）
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
      localStorage.removeItem("device_id");
      window.location.replace("https://yzteampredict.store/verify");
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    countdownEl.textContent = `EXPIRES: ${days} Day ${hours} Hour ${minutes} Min ${seconds} Sec`;

    setTimeout(update, 1000);
  }

  update();
}

// ✅ 启动验证流程
getBoundKey((data) => {
  const el = document.getElementById("countdown");

  if (!data || !data.active) {
    localStorage.removeItem("device_id");
    el.textContent = "❌未验证或密钥未激活";
    setTimeout(() => {
      window.location.replace("https://yzteampredict.store/verify");
    }, 1000);
    return;
  }

  showCountdown(data.expiresAt || null);
});