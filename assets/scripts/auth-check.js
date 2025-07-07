import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// ✅ 初始化 Firebase
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

// ✅ 获取设备ID
const deviceId = localStorage.getItem("device_id");

// ✅ 强制跳转到验证页（不显示提示，立即跳转）
function redirectToVerify() {
    localStorage.removeItem("device_id");
    location.replace("https://yzteampredict.store/verify"); // 更快 & 无法回退
}

// ✅ 验证逻辑
function checkDevice() {
    if (!deviceId) {
        redirectToVerify();
        return;
    }

    const keysRef = ref(db, "keys");

    get(keysRef)
        .then((snapshot) => {
            const now = Date.now();
            let valid = false;

            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();

                if (data.deviceId === deviceId && data.active) {
                    if (!data.expiresAt || now <= data.expiresAt) {
                        valid = true;
                    }
                }
            });

            if (!valid) {
                redirectToVerify();
            }
        })
        .catch((error) => {
            console.error("验证失败：", error);
            redirectToVerify();
        });
}

checkDevice();