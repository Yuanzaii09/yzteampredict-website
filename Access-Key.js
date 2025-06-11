import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyDIF9BvbOD_8LxOsQ55XVWdLtxOWdoY6xw",
  authDomain: "yzteampredict-store.firebaseapp.com",
  projectId: "yzteampredict-store",
  storageBucket: "yzteampredict-store.firebasestorage.app",
  messagingSenderId: "1072979545774",
  appId: "1:1072979545774:web:e9c13fac268c01f7fde73f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 加载 FingerprintJS 并获取 deviceId
let deviceId = null;
const fpPromise = import("https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@3/dist/fp.min.js")
  .then(FingerprintJS => FingerprintJS.load())
  .then(fp => fp.get())
  .then(result => {
    deviceId = result.visitorId;
  });

window.verifyKey = async function () {
  const key = document.getElementById("keyInput").value.trim();
  const result = document.getElementById("resultMessage");

  result.style.color = "red";

  if (!key) {
    result.textContent = "请输入密钥";
    return;
  }

  await fpPromise; // 确保 deviceId 准备好

  const keyRef = doc(db, "keys", key);
  const keySnap = await getDoc(keyRef);

  if (!keySnap.exists()) {
    result.textContent = "无效的密钥";
    return;
  }

  const data = keySnap.data();
  const now = new Date();
  const validFrom = data.validFrom?.toDate();
  const isUsed = data.used;
  const boundDevice = data.deviceId || null;

  if (isUsed && boundDevice && boundDevice !== deviceId) {
    result.textContent = "此密钥已绑定其他设备";
    return;
  }

  if (validFrom && now < validFrom) {
    const diff = Math.ceil((validFrom - now) / 1000);
    result.textContent = `密钥将在 ${diff} 秒后生效`;
    return;
  }

  // 第一次使用 → 绑定设备ID & 设置为已使用
  if (!boundDevice) {
    await updateDoc(keyRef, {
      used: true,
      deviceId: deviceId,
      activatedAt: new Date()
    });
  }

  // 密钥验证成功
  result.style.color = "#4CAF50";
  result.textContent = "验证成功，正在跳转...";
  setTimeout(() => {
    window.location.href = "index.html"; // 跳转主页面
  }, 1200);
};