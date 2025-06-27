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
    const resultEl = document.getElementById("resultMessage");

    if (!inputKey) {
        resultEl.textContent = "请输入密钥。";
        return;
    }

    const deviceId = getDeviceId();
    const keyRef = database.ref("keys/" + inputKey);

    try {
        const snapshot = await keyRef.get();

        if (!snapshot.exists()) {
            resultEl.textContent = "❌ 无效密钥。";
            return;
        }

        const data = snapshot.val();

        // ❌ 如果已经绑定其他设备
        if (data.deviceId && data.deviceId !== deviceId) {
            resultEl.textContent = "❌ 此密钥已绑定其他设备。";
            return;
        }

        // ❌ 检查是否过期
        if (data.expireAt && Date.now() > data.expireAt) {
            resultEl.textContent = "❌ 此密钥已过期。";
            return;
        }

        // ✅ 没绑定过则绑定 deviceId
        if (!data.deviceId) {
            await keyRef.update({ deviceId });
        }

        // ✅ 验证通过，跳转
        resultEl.textContent = "✅ 验证成功，正在跳转...";
        setTimeout(() => {
            window.location.href = "/home";
        }, 1000);

    } catch (error) {
        console.error("验证出错:", error);
        resultEl.textContent = "⚠️ 验证失败，请稍后重试。";
    }
}