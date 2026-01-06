import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
    getDatabase,
    ref,
    get,
    update
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

/* ===============================
   1️⃣ Firebase 初始化
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
   2️⃣ 稳定 deviceId（只生成一次）
================================ */
function getOrCreateDeviceId() {
    let id = localStorage.getItem("device_id");

    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem("device_id", id);
    }

    return id;
}

const deviceId = getOrCreateDeviceId();

/* ===============================
   3️⃣ 强制跳转（不删 deviceId）
================================ */
function redirectToVerify() {
    location.replace("https://yzteampredict.store/verify");
}

/* ===============================
   4️⃣ 设备校验主逻辑
================================ */
async function checkDevice() {
    try {
        const keysRef = ref(db, "keys");
        const snapshot = await get(keysRef);

        if (!snapshot.exists()) {
            redirectToVerify();
            return;
        }

        const now = Date.now();
        let valid = false;

        for (const child of Object.values(snapshot.val())) {
            // key 未启用
            if (!child.active) continue;

            // 已过期
            if (child.expiresAt && now > child.expiresAt) continue;

            /**
             * 情况 A：key 已绑定当前 device
             */
            if (child.deviceId === deviceId) {
                valid = true;
                break;
            }

            /**
             * 情况 B：key 尚未绑定任何 device（首次使用）
             */
            if (!child.deviceId) {
                // ❗️这里【不自动绑定】
                // 绑定逻辑应该只发生在「用户输入密钥成功后」
                continue;
            }
        }

        if (!valid) {
            redirectToVerify();
        }

    } catch (err) {
        console.error("校验异常：", err);
        redirectToVerify();
    }
}

checkDevice();