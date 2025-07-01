import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// ✅ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAN88MgeiYxOmb1OFfgL-wVmfJC60XFcoM",
  authDomain: "verify-b3d6c.firebaseapp.com",
  databaseURL: "https://verify-b3d6c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "verify-b3d6c",
  storageBucket: "verify-b3d6c.appspot.com",
  messagingSenderId: "734040141195",
  appId: "1:734040141195:web:c1bd782daf1ff6ed40538e"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 🔘 主处理函数
document.getElementById("submitBtn").addEventListener("click", () => {
  const key = document.getElementById("keyInput").value.trim();
  const days = document.getElementById("daysInput").value.trim().toLowerCase();
  const status = document.getElementById("statusMsg");

  if (!key || !days) {
    status.textContent = "⚠️ 请填写密钥和天数";
    status.style.color = "red";
    return;
  }

  const validDays = ["1", "7", "14", "30", "forever"];
  if (!validDays.includes(days)) {
    status.textContent = "⚠️ 请输入合法天数（1/7/14/30/forever）";
    status.style.color = "red";
    return;
  }

  const type = (days === "forever") ? "forever" : `${days}days`;

  const keyRef = ref(db, "keys/" + key);

  set(keyRef, {
    active: false,
    type: type
  }).then(() => {
    status.textContent = `✅ 密钥 ${key} 已成功添加！`;
    status.style.color = "green";
    document.getElementById("keyInput").value = "";
    document.getElementById("daysInput").value = "";
  }).catch((error) => {
    console.error(error);
    status.textContent = "❌ 上传失败，请稍后再试";
    status.style.color = "red";
  });
});
