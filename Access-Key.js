import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// FireBase数据
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

window.verifyKey = async function () {
  const key = document.getElementById("keyInput").value.trim();
  const result = document.getElementById("resultMessage");

  if (!key) {
    result.textContent = "请输入密钥";
    return;
  }

  const keyRef = doc(db, "keys", key);
  const keySnap = await getDoc(keyRef);

  if (!keySnap.exists()) {
    result.textContent = "无效的密钥";
    return;
  }

  const data = keySnap.data();
  const now = new Date();
  const validFrom = data.validFrom?.toDate(); // Firestore Timestamp
  const isUsed = data.used;

  if (isUsed) {
    result.textContent = "此密钥已被使用";
    return;
  }

  if (validFrom && now < validFrom) {
    const diff = Math.ceil((validFrom - now) / 1000);
    result.textContent = `密钥将在 ${diff} 秒后生效`;
    return;
  }

  // 密钥有效
  result.style.color = "#4CAF50";
  result.textContent = "验证成功，正在跳转...";
  // 你可以在这里添加跳转页面的逻辑
  window.location.href = "index.html"; // 主外挂页面
};