import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore, doc, getDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Firebase 配置（替换为你的配置）
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

// 获取设备指纹 ID
let deviceId = "";
const fpPromise = import('https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@3/dist/fp.min.js')
  .then(FingerprintJS => FingerprintJS.load())
  .then(fp => fp.get())
  .then(result => {
    deviceId = String(result.visitorId);
  });

window.verifyKey = async function () {
  const keyInput = document.getElementById("keyInput").value.trim();
  const resultMessage = document.getElementById("resultMessage");

  // Step 1: 检查是否为空
  if (!keyInput) {
    resultMessage.textContent = "请输入密钥";
    return;
  }

  await fpPromise; // 确保 deviceId 已生成

  const keyDocRef = doc(db, "keys", keyInput);
  const keySnap = await getDoc(keyDocRef);

  // Step 2: 密钥不存在
  if (!keySnap.exists()) {
    resultMessage.textContent = "此密钥无效";
    return;
  }

  const data = keySnap.data();

  // Step 3: 检查是否已被其他设备绑定
  if (data.deviceId && data.deviceId !== deviceId) {
    resultMessage.textContent = "此密钥已被其他设备绑定";
    return;
  }

  // Step 4: 检查数据结构合法性
  if (!data.validFrom || typeof data.validDurationDays !== "number") {
    resultMessage.textContent = "密钥数据异常，请联系管理员";
    return;
  }

  const now = new Date();
  const validFrom = data.validFrom.toDate(); // Firestore Timestamp 转 Date

  // Step 5: 检查是否生效
  if (now < validFrom) {
    const secondsToWait = Math.floor((validFrom - now) / 1000);
    resultMessage.textContent = `密钥将在 ${secondsToWait} 秒后生效`;
    return;
  }

  // Step 6: 检查是否过期
  if (data.validDurationDays !== -1) {
    const expiredAt = new Date(validFrom.getTime() + data.validDurationDays * 86400000);
    if (now > expiredAt) {
      resultMessage.textContent = "此密钥已过期";
      return;
    }
  }

  // Step 7: 写入 Firestore 绑定信息
  await updateDoc(keyDocRef, {
    activatedAt: new Date(),
    deviceId: String(deviceId),
    used: true
  });

  // Step 8: 成功提示并跳转
  resultMessage.textContent = "验证成功，正在跳转...";
  setTimeout(() => {
    window.location.href = "index.html";
  }, 1000);
};