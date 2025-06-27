// ✅ 替换成你自己的 Firebase 配置
const firebaseConfig = {
    apiKey: "AIzaSyDLivUd6auK1QwZ0UG0r11eI9LZWMaakdY",
    authDomain: "yzteampredict-4598e.firebaseapp.com",
    databaseURL: "https://yzteampredict-4598e-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "yzteampredict-4598e",
    storageBucket: "yzteampredict-4598e.appspot.com",
    messagingSenderId: "87001857450",
    appId: "1:87001857450:web:07a64741cca650b001ffd3",
    measurementId: "G-3ZTKMQC0B8"
};

// ✅ 初始化 Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ✅ 获取 deviceId（每台设备唯一）
function getDeviceId() {
    let id = localStorage.getItem("deviceId");
    if (!id) {
        id = crypto.randomUUID(); // 生成全局唯一 ID（支持现代浏览器）
        localStorage.setItem("deviceId", id);
    }
    return id;
}

// ✅ 主验证函数（在 HTML 中通过按钮调用）
async function verifyKey() {
    const inputKey = document.getElementById("keyInput").value.trim();
    const deviceId = getDeviceId();

    // 🔐 输入为空检查
    if (!inputKey) {
        alert("⚠️ 请输入密钥！");
        return;
    }

    const keyRef = database.ref("keys/" + inputKey);

    try {
        const snapshot = await keyRef.get();

        if (!snapshot.exists()) {
            alert("❌ 无效密钥！");
            return;
        }

        const data = snapshot.val();

        if (data.deviceId && data.deviceId !== deviceId) {
            alert("❌ 此密钥已被其他设备使用！");
            return;
        }

        if (data.expireAt && Date.now() > data.expireAt) {
            alert("❌ 此密钥已过期！");
            return;
        }

        if (!data.deviceId) {
            await keyRef.update({ deviceId: deviceId });
        }

        alert("✅ 验证成功，正在进入...");
        window.location.href = "/home";

    } catch (error) {
        console.error("验证出错:", error);
        alert("⚠️ 验证失败，请稍后再试！");
    }
}