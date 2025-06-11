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

// 初始化 Firebase 和 Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 初始化 FingerprintJS（设备ID）
let deviceId = null;
const fpPromise = import("https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@3/dist/fp.min.js")
  .then(FingerprintJS => FingerprintJS.load())
  .then(fp => fp.get())
  .then(result => {
    deviceId = result.visitorId;
    console.log("✅ 设备ID 获取成功:", deviceId);
  }).catch(err => {
    console.error("❌ 设备ID 获取失败:", err);
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

    if (!deviceId) {
      result.textContent = "设备识别失败，请重试";
      return;
    }

    const keyRef = doc(db, "keys", key);
    const keySnap = await getDoc(keyRef);

    if (!keySnap.exists()) {
      result.textContent = "此密钥无效";
      return;
    }

    const data = keySnap.data();

    const now = new Date();
    const validFrom = data.validFrom?.toDate?.() || null;
    const validDurationDays = data.validDurationDays ?? -1;
    const activatedAt = data.activatedAt?.toDate?.() || null;
    const used = data.used || false;
    const boundDevice = data.deviceId || null;

    // 已绑定但不是当前设备
    if (used && boundDevice && boundDevice !== deviceId) {
      result.textContent = "此密钥已被其他设备绑定";
      return;
    }

    // 密钥未到生效时间
    if (validFrom && now < validFrom) {
      const diff = Math.ceil((validFrom - now) / 1000);
      result.textContent = `密钥将在 ${diff} 秒后生效`;
      return;
    }

    // 检查是否过期
    if (activatedAt && validDurationDays > 0) {
      const expireTime = new Date(activatedAt.getTime() + validDurationDays * 24 * 60 * 60 * 1000);
      if (now > expireTime) {
        result.textContent = "密钥已过期";
        return;
      }
    }

    // 设置首次激活信息
    if (!boundDevice) {
      await updateDoc(keyRef, {
        used: true,
        deviceId: deviceId,
        activatedAt: new Date()
      });
    }

    result.style.color = "#4CAF50";
    result.textContent = "验证成功，正在跳转...";
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1200);

  } catch (error) {
    console.error("❌ 验证出错：", error);
    result.textContent = "验证出错，请稍后尝试";
  }
};