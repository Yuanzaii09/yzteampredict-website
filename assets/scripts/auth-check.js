import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

/* Firebase 初始化 */
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

/* deviceId */
const deviceId = getDeviceId();

/* 跳转 */
function redirectToVerify() {
  location.replace("https://yzteampredict.store/verify");
}

/* 校验逻辑 */
async function checkDevice() {
  try {
    const snapshot = await get(ref(db, "keys"));
    if (!snapshot.exists()) {
      redirectToVerify();
      return;
    }

    const now = Date.now();
    let valid = false;

    for (const key of Object.values(snapshot.val())) {
      if (!key.active) continue;
      if (key.expiresAt && now > key.expiresAt) continue;
      if (key.deviceId === deviceId) {
        valid = true;
        break;
      }
    }

    if (!valid) redirectToVerify();

  } catch (e) {
    console.error("Auth check error:", e);
    redirectToVerify();
  }
}

checkDevice();