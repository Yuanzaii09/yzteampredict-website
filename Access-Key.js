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

// 获取设备指纹
let deviceId = null;
const fpPromise = FingerprintJS.load().then(fp => fp.get()).then(result => {
  deviceId = result.visitorId;
});

// 绑定按钮事件
document.getElementById("verifyButton").addEventListener("click", verifyKey);

async function verifyKey() {
  const key = document.getElementById("keyInput").value.trim();
  const resultEl = document.getElementById("resultMessage");
  resultEl.style.color = "red";
  resultEl.textContent = "";

  if (!key) {
    resultEl.textContent = "请输入密钥";
    return;
  }

  try {
    await fpPromise;

    const keyRef = doc(db, "keys", key);
    const keySnap = await getDoc(keyRef);

    if (!keySnap.exists()) {
      resultEl.textContent = "无效的密钥";
      return;
    }

    const data = keySnap.data();
    const now = new Date();

    // Firestore 时间戳转换
    const validFrom = data.validFrom?.toDate?.() ?? null;
    const isUsed = data.used;
    const boundDevice = data.deviceId ?? null;

    if (isUsed && boundDevice && boundDevice !== deviceId) {
      resultEl.textContent = "此密钥已绑定其他设备";
      return;
    }

    if (validFrom && now < validFrom) {
      const diff = Math.ceil((validFrom - now) / 1000);
      resultEl.textContent = `密钥将在 ${diff} 秒后生效`;
      return;
    }

    // 首次使用 → 绑定设备
    if (!boundDevice) {
      await updateDoc(keyRef, {
        used: true,
        deviceId: deviceId,
        activatedAt: Timestamp.fromDate(new Date())
      });
    }

    resultEl.style.color = "#4CAF50";
    resultEl.textContent = "验证成功，正在跳转...";
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);

  } catch (error) {
    console.error("验证错误：", error);
    resultEl.textContent = "发生错误，请稍后再试";
  }
}a