import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, Timestamp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

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

// 获取 FingerprintJS 的唯一 deviceId
let deviceId = null;
const fpPromise = import("https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@3/dist/fp.min.js")
  .then(FingerprintJS => FingerprintJS.load())
  .then(fp => fp.get())
  .then(result => {
    deviceId = result.visitorId;
    console.log("设备ID：", deviceId);
  })
  .catch(err => {
    console.error("FingerprintJS 错误：", err);
  });

// 按钮点击验证
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
    const nowBeijing = new Date(now.getTime() + 8 * 60 * 60 * 1000); // 北京时间

    const validFrom = data.validFrom?.toDate?.() || null;
    const validDurationDays = data.validDurationDays ?? -1;
    const isUsed = data.used;
    const boundDevice = data.deviceId || null;
    const activatedAt = data.activatedAt?.toDate?.() || null;

    // 检查定时生效
    if (validFrom && nowBeijing < validFrom) {
      const secondsLeft = Math.floor((validFrom - nowBeijing) / 1000);
      result.textContent = `密钥将在 ${secondsLeft} 秒后生效`;
      return;
    }

    // 检查是否绑定其他设备
    if (isUsed && boundDevice && boundDevice !== deviceId) {
      result.textContent = "此密钥已绑定其他设备";
      return;
    }

    // 检查限时失效
    if (validDurationDays !== -1 && activatedAt) {
      const expireTime = new Date(activatedAt.getTime() + validDurationDays * 24 * 60 * 60 * 1000);
      if (nowBeijing > expireTime) {
        result.textContent = "密钥已过期";
        return;
      }
    }

    // 如果是第一次激活，则记录激活时间与设备ID
    if (!boundDevice) {
      await updateDoc(keyRef, {
        used: true,
        deviceId: deviceId,
        activatedAt: Timestamp.fromDate(nowBeijing)
      });
      console.log("首次绑定设备与激活时间");
    }

    // 验证成功
    result.style.color = "#4CAF50";
    result.textContent = "验证成功，正在跳转...";
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1200);

  } catch (error) {
    console.error("验证出错：", error);
    result.textContent = "验证出错，请稍后尝试";
  }
};