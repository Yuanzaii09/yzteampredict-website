import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
  remove,
  onValue
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

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

// ✅ 添加密钥
document.getElementById("submitBtn").addEventListener("click", () => {
  const key = document.getElementById("keyInput").value.trim();
  const days = document.getElementById("daysInput").value.trim().toLowerCase();
  const status = document.getElementById("statusMsg");

  if (!key || !days) {
    status.textContent = "⚠️ 请填写密钥和天数";
    status.style.color = "red";
    return;
  }

  const validDays = ["1", "7", "14", "30", "0"];
  if (!validDays.includes(days)) {
    status.textContent = "⚠️ 请输入合法天数（1/7/14/30/0）";
    status.style.color = "red";
    return;
  }

  const type = parseInt(days);

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

// 🔄 显示密钥列表
function loadKeyList() {
  const listRef = ref(db, "keys/");
  const keyList = document.getElementById("keyList");
  keyList.innerHTML = "";

  onValue(listRef, (snapshot) => {
    keyList.innerHTML = "";
    const data = snapshot.val();
    if (!data) {
      keyList.innerHTML = "<li>暂无密钥</li>";
      return;
    }

    Object.entries(data).forEach(([key, info]) => {
      const li = document.createElement("li");

      const infoText = document.createElement("span");
      infoText.className = "key-info";
      infoText.textContent = `${key} — ${info.type} — active: ${info.active}`;

      const delBtn = document.createElement("button");
      delBtn.textContent = "删除";
      delBtn.className = "delete-btn";
      delBtn.onclick = () => {
        if (confirm(`确定删除密钥 "${key}" 吗？`)) {
          remove(ref(db, "keys/" + key));
        }
      };

      li.appendChild(infoText);
      li.appendChild(delBtn);
      keyList.appendChild(li);
    });
  });
}

loadKeyList();