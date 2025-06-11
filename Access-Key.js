limport { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
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

// 初始化 deviceId 获取
let deviceId = null;
let fpReady = false;

const fpPromise = import("https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@3/dist/fp.min.js")
  .then(FingerprintJS => FingerprintJS.load())
  .then(fp => fp.get())
  .then(result => {
    deviceId = result.visitorId;
    fpReady = true;
    console.log("设备 ID 获取成功：", deviceId);
  })
  .catch(err => {
    console.error("FingerprintJS 初始化失败", err);
    alert("设备识别失败，请刷新页面重试");
  });

// 验证密钥函数
window.verifyKey = async function () {
  const keyInput = document.getElementById("keyInput").value.trim();
  const result = document.getElementById("resultMessage");

  result.style.color = "red";
  result.textContent = "";

  if (!keyInput) {
    result.textContent = "请输入密钥";
    return;
  }

  // 等待 deviceId 加载完成
  if (!fpReady || !deviceId) {
    result.textContent = "正在初始化设备信息，请稍后再试";
    return;
  }

  try {
    const keyRef = doc(db, "keys", keyInput);
    const keySnap = await getDoc(keyRef);

    if (!keySnap.exists()) {
      result.textContent = "此密钥无效";
      return;
    }

    const data = keySnap.data();
    const now = new Date();
    const beijingNow = new Date(now.getTime() + 8 * 60 * 60 * 1000);

    // 生效时间判断
    const validFrom = data.validFrom?.toDate?.() ?? null;
    const validDurationDays = data.validDurationDays ?? -1;
    const isUsed = data.used ?? false;
    const boundDevice = data.deviceId ?? null;
    const activatedAt = data.activatedAt?.toDate?.() ?? null;

    if (isUsed && boundDevice && boundDevice !== deviceId) {
      result.textContent = "此密钥已被其他设备绑定";
      return;
    }

    if (validFrom && beijingNow < validFrom) {
      const diff = Math.ceil((validFrom - beijingNow) / 1000);
      result.textContent = `密钥将在 ${diff} 秒后生效`;
      return;
    }

    if (validDurationDays !== -1 && activatedAt) {
      const expireTime = new Date(activatedAt.getTime() + validDurationDays * 24 * 60 * 60 * 1000);
      if (beijingNow > expireTime) {
        result.textContent = "密钥已过期";
        return;
      }
    }

    // 如果未激活则绑定
    if (!isUsed || !boundDevice) {
      await updateDoc(keyRef, {
        used: true,
        deviceId: deviceId,
        activatedAt: now
      });
      console.log("设备绑定和激活成功");
    }

    result.style.color = "green";
    result.textContent = "验证成功，正在跳转...";

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1200);

  } catch (error) {
    console.error("验证出错：", error);
    result.textContent = "验证出错，请稍后尝试";
  }
};