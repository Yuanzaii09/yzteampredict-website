import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getDatabase,
  ref,
  get
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

/* ===============================
   Firebase 初始化
================================ */
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

/* ===============================
   稳定 deviceId（全站统一）
================================ */
function getDeviceId() {
  let id = localStorage.getItem("device_id");
  if (!id) {
    id = "dev-" + crypto.randomUUID();
    localStorage.setItem("device_id", id);
  }
  return id;
}

const deviceId = getDeviceId();

/* ===============================
   跳转验证页
================================ */
function redirectToVerify() {
  location.replace("https://yzteampredict.store/verify");
}

/* ===============================
   核心校验逻辑
================================ */
async function checkDevice() {
  try {
    const snap = await get(ref(db, "keys"));

    if (!snap.exists()) {
      redirectToVerify();
      return;
    }

    const now = Date.now();
    let passed = false;

    const keys = snap.val();

    for (const key of Object.values(keys)) {
      if (!key.active) continue;
      if (!key.deviceId) continue;
      if (key.deviceId !== deviceId) continue;
      if (key.expiresAt && now > key.expiresAt) continue;

      passed = true;
      break;
    }

    if (!passed) {
      redirectToVerify();
    }

  } catch (e) {
    console.error("Auth check error:", e);
    redirectToVerify();
  }
}

checkDevice();