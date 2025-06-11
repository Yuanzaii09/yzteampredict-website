import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Firebase 初始化
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

// 获取设备 ID
let deviceId = null;
const fpPromise = FingerprintJS.load().then(fp => fp.get()).then(result => {
  deviceId = result.visitorId;
  console.log("设备 ID 获取成功：", deviceId);
}).catch(err => {
  console.error("FingerprintJS 错误：", err);
});

async function verifyKey() {
  const keyInput = document.getElementById("keyInput");
  const result = document.getElementById("resultMessage");
  result.style.color = "red";
  result.textContent = "";

  const key = keyInput.value.trim();
  if (!key) {
    result.textContent = "请输入密钥";
    return;
  }

  if (!deviceId) {
    result.textContent = "设备信息未加载，请稍后再试";
    return;
  }

  try {
    const keyRef = doc(db, "keys", key);
    const keySnap = await getDoc(keyRef);

    if (!keySnap.exists()) {
      result.textContent = "无效的密钥";
      return;
    }

    const data = keySnap.data();
    const now = new Date();
    const beijingNow = new Date(now.getTime() + 8 * 60 * 60 * 1000);

    const validFrom = data.validFrom?.toDate?.();
    const used = data.used;
    const boundDevice = data.deviceId;
    const activatedAt = data.activatedAt?.toDate?.();
    const validDays = data.validDurationDays;

    if (used && boundDevice && boundDevice !== deviceId) {
      result.textContent = "此密钥已绑定其他设备";
      return;
    }

    if (validFrom && beijingNow < validFrom) {
      const diffSec = Math.floor((validFrom - beijingNow) / 1000);
      result.textContent = `密钥将在 ${diffSec} 秒后生效`;
      return;
    }

    if (validDays > 0 && activatedAt) {
      const expireAt = new Date(activatedAt.getTime() + validDays * 86400000);
      if (beijingNow > expireAt) {
        result.textContent = "此密钥已过期";
        return;
      }
    }

    // 首次激活：绑定设备
    if (!boundDevice) {
      await updateDoc(keyRef, {
        used: true,
        deviceId,
        activatedAt: new Date()
      });
      console.log("首次绑定成功");
    }

    result.style.color = "#4CAF50";
    result.textContent = "验证成功，正在跳转...";

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1200);

  } catch (error) {
    console.error("验证失败：", error);
    result.textContent = "验证出错，请稍后再试\n" + error.message;
console.error("验证失败：", error);
  }
}

// 按钮绑定监听
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("verifyButton").addEventListener("click", verifyKey);
});