import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore, doc, getDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Firebase 配置（替换成你自己的）
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

// 初始化指纹
let deviceId = "";
const fpPromise = import('https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@3/dist/fp.min.js')
  .then(FingerprintJS => FingerprintJS.load())
  .then(fp => fp.get())
  .then(result => {
    deviceId = String(result.visitorId);
  });

// 等页面加载后绑定按钮事件
document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("verifyButton");
  if (button) {
    button.addEventListener("click", verifyKey);
    console.log("✅ 按钮绑定完成");
  } else {
    alert("❌ 找不到按钮 verifyButton，请检查 HTML 是否正确设置 id");
  }
});

// 验证密钥函数
async function verifyKey() {
  const keyInput = document.getElementById("keyInput").value.trim();
  const resultMessage = document.getElementById("resultMessage");

  // Step 1: 输入为空
  if (!keyInput) {
    resultMessage.textContent = "请输入密钥";
    return;
  }

  await fpPromise;
  console.log("✅ 指纹生成完毕:", deviceId);

  const keyDocRef = doc(db, "keys", keyInput);
  const keySnap = await getDoc(keyDocRef);

  // Step 2: 密钥不存在
  if (!keySnap.exists()) {
    resultMessage.textContent = "此密钥无效";
    return;
  }

  const data = keySnap.data();

  // Step 3: 密钥被其他设备绑定
  if (data.deviceId && data.deviceId !== deviceId) {
    resultMessage.textContent = "此密钥已被其他设备绑定";
    return;
  }

  // Step 4: 数据异常
  if (!data.validFrom || typeof data.validDurationDays !== "number") {
    resultMessage.textContent = "密钥数据异常，请联系管理员";
    return;
  }

  const now = new Date();
  const validFrom = data.validFrom.toDate();

  // Step 5: 密钥尚未生效
  if (now < validFrom) {
    const secondsToWait = Math.floor((validFrom - now) / 1000);
    resultMessage.textContent = `密钥将在 ${secondsToWait} 秒后生效`;
    return;
  }

  // Step 6: 密钥过期
  if (data.validDurationDays !== -1) {
    const expiredAt = new Date(validFrom.getTime() + data.validDurationDays * 86400000);
    if (now > expiredAt) {
      resultMessage.textContent = "此密钥已过期";
      return;
    }
  }

  // Step 7: 更新 Firestore（绑定设备）
  try {
    await updateDoc(keyDocRef, {
      activatedAt: new Date(),
      deviceId: String(deviceId),
      used: true
    });

    // Step 8: 成功跳转
    resultMessage.textContent = "验证成功，正在跳转...";
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);

  } catch (error) {
    console.error("Firestore 写入失败：", error);
    resultMessage.textContent = "密钥绑定失败，请重试或联系管理员";
  }
}