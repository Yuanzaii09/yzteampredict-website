import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Firebase config
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

// 获取设备指纹
const fpPromise = import("https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@3/dist/fp.min.js")
  .then(FingerprintJS => FingerprintJS.load())
  .then(fp => fp.get())
  .then(result => {
    deviceId = result.visitorId;
  })
  .catch(err => {
    console.error("设备识别失败：", err);
  });

window.verifyKey = async function () {
  const keyInput = document.getElementById("keyInput");
  const result = document.getElementById("resultMessage");
  const key = keyInput.value.trim();

  result.style.color = "red";
  result.textContent = "";

  if (!key) {
    result.textContent = "请输入密钥";
    return;
  }

  await fpPromise;

  try {
    const keyRef = doc(db, "keys", key);
    const keySnap = await getDoc(keyRef);

    if (!keySnap.exists()) {
      result.textContent = "此密钥无效";
      return;
    }

    const data = keySnap.data();
    const boundDevice = data.deviceId || null;
    const isUsed = data.used || false;
    const now = new Date();

    // ✅ 检查是否已绑定其他设备
    if (isUsed && boundDevice && boundDevice !== deviceId) {
      result.textContent = "此密钥已被其他设备绑定";
      return;
    }

    // ✅ 检查密钥是否有validFrom和validDurationDays
    const validFrom = data.validFrom?.toDate?.() || null;
    const validDurationDays = data.validDurationDays;

    if (!validFrom || typeof validDurationDays !== "number") {
      result.textContent = "密钥数据异常，请联系管理员";
      return;
    }

    const expireTime = validDurationDays === -1
      ? null
      : new Date(validFrom.getTime() + validDurationDays * 24 * 60 * 60 * 1000);

    // ✅ 密钥未生效
    if (now < validFrom) {
      const secondsLeft = Math.ceil((validFrom - now) / 1000);
      result.textContent = `密钥将在 ${secondsLeft} 秒后生效`;
      return;
    }

    // ✅ 密钥已过期
    if (expireTime && now > expireTime) {
      result.textContent = "此密钥已过期";
      return;
    }

    // ✅ 写入首次绑定设备 & 激活时间
    await updateDoc(keyRef, {
      used: true,
      deviceId: boundDevice || deviceId,
      activatedAt: now
    });

    result.style.color = "#4CAF50";
    result.textContent = "验证成功，正在跳转...";

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1200);

  } catch (err) {
    console.error("验证出错：", err);
    result.textContent = "验证出错，请稍后尝试";
  }
};