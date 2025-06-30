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

    firebase.initializeApp(firebaseConfig);
    const db = firebase.database();

    // 🧠 获取或生成本地设备ID（localStorage）
    function getDeviceId() {
        let id = localStorage.getItem("device_id");
        if (!id) {
            id = 'dev-' + Math.random().toString(36).substr(2, 12);
            localStorage.setItem("device_id", id);
        }
        return id;
    }

    // 🔐 核心验证函数
    function verifyKey() {
        const key = document.getElementById("keyInput").value.trim();
        const result = document.getElementById("result");
        const deviceId = getDeviceId();

        if (!key) {
            result.textContent = "❌ 请输入密钥";
            return;
        }

        const keyRef = db.ref("keys/" + key);
        keyRef.once("value").then((snapshot) => {
            if (!snapshot.exists()) {
                result.textContent = "❌ 密钥无效";
                return;
            }

            const data = snapshot.val();

            if (data.active && data.deviceId !== deviceId) {
                result.textContent = "❌ 此密钥已绑定其他设备";
                return;
            }

            const now = Date.now();
            let expiresAt;

            switch (data.type) {
                case "7days":
                    expiresAt = now + 7 * 24 * 60 * 60 * 1000;
                    break;
                case "14days":
                    expiresAt = now + 14 * 24 * 60 * 60 * 1000;
                    break;
                case "30days":
                    expiresAt = now + 30 * 24 * 60 * 60 * 1000;
                    break;
                case "forever":
                default:
                    expiresAt = null;
            }

            if (!data.active) {
                keyRef.update({
                    active: true,
                    deviceId: deviceId,
                    activatedAt: now,
                    expiresAt: expiresAt
                });
            }

            result.textContent = "✅ 验证成功，跳转中...";
            setTimeout(() => {
                window.location.href = "https://yzteampredict.store/verify";
            }, 1500);
        });
    }