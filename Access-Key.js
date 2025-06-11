import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

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

// 获取指纹 ID
let deviceId = null;
const fpPromise = import("https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@3/dist/fp.min.js")
  .then(FingerprintJS => FingerprintJS.load())
  .then(fp => fp.get())
  .then(result => {
    deviceId = result.visitorId;
    console.log("设备ID:", deviceId);
  });

window.verifyKey = async function () {
  const key = document.getElementById("keyInput").value.trim();
  const result = document.getElementById("resultMessage");

  console.log("验证开始，输入密钥：", key);

  result.style.color = "red";
  if (!key) {
    result.textContent = "请输入密钥";
    return;
  }

  await fpPromise;

  const keyRef = doc(db, "keys", key);
  const keySnap = await getDoc(keyRef);

  if (!keySnap.exists()) {
    result.textContent = "无效的密钥";
    console.log("密钥不存在");
    return;
  }

  const data = keySnap.data();
  const now = new Date();
  const nowBeijing = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const validFrom = data.validFrom?.toDate();
  const isUsed = data.used;
  const boundDevice = data.deviceId || null;

  console.log("密钥数据：", data);

  if (isUsed && boundDevice && boundDevice !== deviceId) {
    result.textContent = "此密钥已绑定其他设备";
    return;
  }

  if (validFrom && nowBeijing < validFrom) {
    const diff = Math.ceil((validFrom - nowBeijing) / 1000);
    result.textContent = `密钥将在 ${diff} 秒后生效`;
    return;
  }

  if (!boundDevice) {
    await updateDoc(keyRef, {
      used: true,
      deviceId: deviceId,
      activatedAt: new Date()
    });
    console.log("首次使用，绑定设备");
  }

  result.style.color = "#4CAF50";
  result.textContent = "验证成功，正在跳转...";
  console.log("验证通过，即将跳转");

  setTimeout(() => {
    window.location.href = "index.html";
  }, 1200);
};