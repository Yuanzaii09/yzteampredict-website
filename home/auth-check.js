import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// ✅ 初始化 Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAN88MgeiYxOmb1OFfgL-wVmfJC60XFcoM",
    authDomain: "verify-b3d6c.firebaseapp.com",
    databaseURL: "https://verify-b3d6c-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "verify-b3d6c",
    storageBucket: "verify-b3d6c.firebasestorage.app",
    messagingSenderId: "734040141195",
    appId: "1:734040141195:web:c1bd782daf1ff6ed40538e"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ✅ 获取设备ID
const deviceId = localStorage.getItem("device_id");

// ❌ 显示未验证提示
function showUnauthorizedMessage() {
    document.body.innerHTML = `
        <div style="text-align: center; padding: 40px; font-family: 'Arial', sans-serif;">
            <h2 style="color: #000; font-size: 24px;">⚠️ 您尚未通过密钥验证 // 无法访问此页面 ⚠️</h2>
            <p style="margin-top: 20px;">
                <a href="https://yzteampredict.store/verify" style="color: #5dade2; font-size: 18px; text-decoration: underline; font-weight: bold;">
                    点击前往验证页面
                </a>
            </p>
        </div>
    `;
}

// ✅ 核心验证逻辑
if (!deviceId) {
    showUnauthorizedMessage();
} else {
    const keysRef = ref(db, "keys");

    get(keysRef).then((snapshot) => {
        let foundValid = false;

        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();

            if (data.deviceId === deviceId && data.active) {
                const now = Date.now();

                if (data.expiresAt && now > data.expiresAt) {
                    // 已过期，强制跳转
                    window.location.href = "https://yzteampredict.store/verify";
                    return;
                }

                // 有效密钥
                foundValid = true;
            }
        });

        if (!foundValid) {
            showUnauthorizedMessage();
        }
    }).catch((error) => {
        console.error("验证错误：", error);
        showUnauthorizedMessage();
    });
}