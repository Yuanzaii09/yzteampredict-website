import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

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

// 获取本地设备ID
const deviceId = localStorage.getItem("device_id");

if (!deviceId) {
    window.location.href = "/verify.html";
} else {
    const keysRef = ref(db, "keys");

    get(keysRef).then((snapshot) => {
        let authorized = false;

        snapshot.forEach((childSnapshot) => {
            const keyData = childSnapshot.val();
            if (keyData.deviceId === deviceId && keyData.active) {
                if (!keyData.expiresAt || Date.now() < keyData.expiresAt) {
                    authorized = true;
                }
            }
        });

        if (!authorized) {
            window.location.href = "/verify";
        }
    }).catch((error) => {
        console.error("验证失败：", error);
        window.location.href = "/verify";
    });
}
