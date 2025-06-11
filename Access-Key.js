import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

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
  result.textContent = "";

  if (!key) {
    result.textContent = "请输入密钥";
    return;
  }

  try {
    await fpPromise;

    const keyRef = doc(db, "keys", key);
    const keySnap = await getDoc(keyRef);

    if (!keySnap.exists()) {
      result.textContent = "无效的密钥";
      return;
    }

    const data = keySnap.data();
    const now = new Date();
    const nowBeijing = new Date(now.getTime() + 8 * 60 * 60 * 1000);

    const validFrom = data.validFrom?.toDate?.();
    if (validFrom && nowBeijing < validFrom) {
      const diff = Math.ceil((validFrom - nowBeijing) / 1000);
      result.textContent = `密钥将在 ${diff} 秒后生效`;
      return;
    }

    const isUsed = data.used;
    const boundDevice = data.deviceId || null;

    if (isUsed && boundDevice && boundDevice !== deviceId) {
      result.textContent = "此密钥已绑定其他设备";
      return;
    }

    const activatedAt = data.activatedAt?.toDate?.();
    const durationDays = data.validDurationDays;

    // 自动计算 expiresAt（首次激活时）
    let expiresAt = null;
    if (activatedAt && durationDays > 0) {
      expiresAt = new Date(activatedAt.getTime() + durationDays * 24 * 60 * 60 * 1000);
    } else if (!activatedAt && durationDays > 0) {
      expiresAt = new Date(nowBeijing.getTime() + durationDays * 24 * 60 * 60 * 1000);
    }

    // 检查是否过期
    if (expiresAt && nowBeijing > expiresAt) {
      result.textContent = "密钥已过期";
      return;
    }

    // 首次激活则写入 activatedAt
    if (!boundDevice) {
      await updateDoc(keyRef, {
        used: true,
        deviceId: deviceId,
        activatedAt: nowBeijing
      });
    }

    result.style.color = "#4CAF50";
    result.textContent = "验证成功，正在跳转...";
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1200);
  } catch (error) {
    console.error("验证过程中出错：", error);
    result.textContent = "验证失败，请稍后再试";
  }
};