// step 1: 初始化 Firebase
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

// step 2: 预加载 FingerprintJS 并获取设备 ID
let deviceId = null;

const fpPromise = import("https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@3/dist/fp.min.js")
  .then(FingerprintJS => FingerprintJS.load())
  .then(fp => fp.get())
  .then(result => {
    deviceId = result.visitorId; // step 2.1: 记录 fingerprint ID
  })
  .catch(err => {
    console.error("设备识别失败：", err); // step 2.2: 错误处理
  });

// step 3: 当用户点击“验证”按钮时执行
window.verifyKey = async function () {
  const keyInput = document.getElementById("keyInput");
  const result = document.getElementById("resultMessage");
  const key = keyInput.value.trim();

  result.style.color = "red";
  result.textContent = "";

  // step 4: 输入框为空，提示用户输入密钥
  if (!key) {
    result.textContent = "请输入密钥";
    return;
  }

  // step 5: 等待设备 ID 准备好
  await fpPromise;

  try {
    // step 6: 从 Firestore 获取密钥数据
    const keyRef = doc(db, "keys", key);
    const keySnap = await getDoc(keyRef);

    // step 7: 如果密钥不存在
    if (!keySnap.exists()) {
      result.textContent = "此密钥无效";
      return;
    }

    const data = keySnap.data();
    const boundDevice = data.deviceId || null;
    const isUsed = data.used || false;
    const now = new Date();

    // step 8: 如果密钥已经绑定其他设备
    if (isUsed && boundDevice && boundDevice !== deviceId) {
      result.textContent = "此密钥已被其他设备绑定";
      return;
    }

    // step 9: 检查密钥是否异常
    const validFrom = data.validFrom?.toDate?.() || null;
    const validDurationDays = data.validDurationDays;

    if (!validFrom || typeof validDurationDays !== "number") {
      result.textContent = "密钥数据异常，请联系管理员";
      return;
    }

    // step 10: 检查密钥是否尚未生效
    const expireTime = validDurationDays === -1
      ? null
      : new Date(validFrom.getTime() + validDurationDays * 24 * 60 * 60 * 1000);

    if (now < validFrom) {
      const secondsLeft = Math.ceil((validFrom - now) / 1000);
      result.textContent = `密钥将在 ${secondsLeft} 秒后生效`;
      return;
    }

    // step 11: 检查密钥是否过期
    if (expireTime && now > expireTime) {
      result.textContent = "此密钥已过期";
      return;
    }

    // step 12: 写入激活信息（首次使用）
    await updateDoc(keyRef, {
      used: true,
      deviceId: deviceId,         // 绑定当前设备
      activatedAt: now            // 设置激活时间
    });

    // step 13: 显示成功并跳转
    result.style.color = "#4CAF50";
    result.textContent = "验证成功，正在跳转...";

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1200);
  } catch (err) {
    // step 14: 捕捉任何验证失败异常
    console.error("验证出错：", err);
    result.textContent = "验证出错，请稍后尝试";
  }
};