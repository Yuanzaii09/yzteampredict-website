import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyDIF9BvbOD_8LxOsQ55XVWdLtxOWdoY6xw",
  authDomain: "yzteampredict-store.firebaseapp.com",
  projectId: "yzteampredict-store",
  storageBucket: "yzteampredict-store.firebasestorage.app",
  messagingSenderId: "1072979545774",
  appId: "1:1072979545774:web:e9c13fac268c01f7fde73f"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 初始化设备 ID
let deviceId = null;
const fpPromise = import("https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@3/dist/fp.min.js")
  .then(FingerprintJS => FingerprintJS.load())
  .then(fp => fp.get())
  .then(result => {
    deviceId = result.visitorId;
    console.log("✅ 设备 ID 加载成功：", deviceId);
  })
  .catch(err => {
    console.error("❌ FingerprintJS 加载失败", err);
  });

// 验证密钥主函数
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
    console.log("📦 密钥数据：", data);

    const now = new Date();
    const nowBeijing = new Date(now.getTime() + 8 * 60 * 60 * 1000);

    // 判断 validFrom 是否存在
    let validFrom = null;
    if (data.validFrom && typeof data.validFrom.toDate === "function") {
      validFrom = data.validFrom.toDate();
    }

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

    // 检查是否超时（validDurationDays + activatedAt）
    const duration = data.validDurationDays;
    const activatedAt = data.activatedAt?.toDate?.();

    if (duration && duration > 0 && activatedAt) {
      const expiry = new Date(activatedAt.getTime() + duration * 24 * 60 * 60 * 1000);
      if (nowBeijing > expiry) {
        result.textContent = "密钥已过期";
        return;
      }
    }

    // 绑定设备（首次使用）
    if (!boundDevice) {
      if (!deviceId) {
        result.textContent = "设备识别失败，请稍后再试";
        return;
      }

      try {
        await updateDoc(keyRef, {
          used: true,
          deviceId: deviceId,
          activatedAt: new Date()
        });
        console.log("✅ 成功绑定设备并记录激活时间");
      } catch (err) {
        console.error("❌ 写入 deviceId 失败：", err);
        result.textContent = "绑定设备失败，请稍后再试";
        return;
      }
    }

    result.style.color = "#4CAF50";
    result.textContent = "验证成功，正在跳转...";
    console.log("✅ 验证成功");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1200);

  } catch (error) {
    console.error("❌ 验证出错：", error);
    result.textContent = "验证出错，请稍后尝试";
  }
};