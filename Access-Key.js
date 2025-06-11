import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

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

// 初始化 FingerprintJS 并获取设备 ID
const fpPromise = FingerprintJS.load().then(fp => fp.get()).then(result => {
  deviceId = result.visitorId;
});

document.getElementById("verifyBtn").addEventListener("click", verifyKey);

async function verifyKey() {
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
    const nowBeijing = new Date(now.getTime() + 8 * 60 * 60 * 1000); // +8小时

    const validFrom = data.validFrom?.toDate?.() || null;
    const isUsed = data.used || false;
    const boundDevice = data.deviceId || null;

    if (validFrom && nowBeijing < validFrom) {
      const secondsLeft = Math.ceil((validFrom - nowBeijing) / 1000);
      result.textContent = `密钥将在 ${secondsLeft} 秒后生效`;
      return;
    }

    if (isUsed && boundDevice && boundDevice !== deviceId) {
      result.textContent = "此密钥已绑定其他设备";
      return;
    }

    if (!boundDevice) {
      await updateDoc(keyRef, {
        used: true,
        deviceId: deviceId,
        activatedAt: serverTimestamp()
      });
    }

    result.style.color = "#4CAF50";
    result.textContent = "验证成功，正在跳转...";
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1200);

  } catch (error) {
    console.error("验证出错：", error);
    result.textContent = "发生错误，请稍后再试";
  }
}a