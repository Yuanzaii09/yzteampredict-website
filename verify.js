// ✅ 替换成你自己的 Firebase 配置
const firebaseConfig = {
    apiKey: "AIzaSyDLivUd6auK1QwZ0UG0r11eI9LZWMaakdY",
    authDomain: "yzteampredict-4598e.firebaseapp.com",
    databaseURL: "https://yzteampredict-4598e-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "yzteampredict-4598e",
    storageBucket: "yzteampredict-4598e.firebasestorage.app",
    messagingSenderId: "87001857450",
    appId: "1:87001857450:web:07a64741cca650b001ffd3",
    measurementId: "G-3ZTKMQC0B8"
};

// ✅ 初始化 Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ✅ 第2步：获取或生成 deviceId（写入 localStorage）
function getDeviceId() {
    let id = localStorage.getItem("deviceId");
    if (!id) {
        id = crypto.randomUUID(); // 生成全局唯一ID
        localStorage.setItem("deviceId", id);
    }
    return id;
}

// ✅ 第3步：验证密钥逻辑
async function verifyKey(inputKey) {
    const deviceId = getDeviceId();
    const keyRef = database.ref("keys/" + inputKey);

    try {
        const snapshot = await keyRef.get();

        if (!snapshot.exists()) {
            alert("❌ 无效密钥！");
            return;
        }

        const data = snapshot.val();

        // 已绑定其他设备
        if (data.deviceId && data.deviceId !== deviceId) {
            alert("❌ 此密钥已被其他设备使用！");
            return;
        }

        // 密钥过期检查
        if (data.expireAt && Date.now() > data.expireAt) {
            alert("❌ 此密钥已过期！");
            return;
        }

        // ✅ 未绑定则绑定
        if (!data.deviceId) {
            await keyRef.update({ deviceId: deviceId });
        }

        // ✅ 验证通过
        alert("✅ 验证成功，正在进入...");
        window.location.href = "/home";

    } catch (error) {
        console.error("验证出错:", error);
        alert("⚠️ 验证失败，请稍后再试！");
    }
}