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

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ✅ 获取或生成 deviceId（存 localStorage）
function getDeviceId() {
    let id = localStorage.getItem("device_id");
    if (!id) {
        id = "dev-" + Math.random().toString(36).substr(2, 12);
        localStorage.setItem("device_id", id);
    }
    return id;
}

// ✅ 显示提示信息
function showMessage(text, color) {
    const result = document.getElementById("result");
    if (result) {
        result.textContent = text;
        result.style.color = color;
        result.style.fontWeight = "bold";

        if (color === "red") {
            result.classList.remove("shake");
            void result.offsetWidth;
            result.classList.add("shake");
        }
    }
}

// ✅ 验证密钥函数
function verifyKey() {
    const key = document.getElementById("keyInput").value.trim();
    const deviceId = getDeviceId();

    if (!key) {
        showMessage("🔴请输入密钥", "red");
        return;
    }

    const keyRef = db.ref("keys/" + key);

    keyRef.once("value").then((snapshot) => {
        if (!snapshot.exists()) {
            showMessage("🔴密钥无效", "red");
            return;
        }

        const data = snapshot.val();
        const now = Date.now();

        // ✅ 1. 判断密钥是否过期
        if (data.expiresAt && now > data.expiresAt) {
            showMessage("🔴密钥已过期", "red");
            return;
        }

        // ✅ 2. 如果密钥已被其他设备绑定
        if (data.active && data.deviceId && data.deviceId !== deviceId) {
            showMessage("🔴密钥已绑定其他设备", "red");
            return;
        }

        // ✅ 3. 设置过期时间（仅限首次激活）
        let expiresAt;
        switch (data.type) {
            case "1min":
                expiresAt = now + 1 * 60 * 1000;
                break;
            case "1days":
                expiresAt = now + 1 * 24 * 60 * 60 * 1000;
                break;
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

        const updateData = {
            deviceId: deviceId,
        };

        if (!data.active) {
            updateData.active = true;
            updateData.activatedAt = now;
            updateData.expiresAt = expiresAt;
        }

        // ✅ 4. 更新数据库并跳转
        keyRef.update(updateData).then(() => {
            showMessage("🟢验证成功 // 跳转中...", "green");
            setTimeout(() => {
                window.location.href = "https://yzteampredict.store/home";
            }, 1000);
        });
    }).catch((error) => {
        console.error("验证错误：", error);
        showMessage("⚠️出现错误 // 请稍后重试", "red");
    });
}

// ✅ 按钮监听
document.getElementById("verifyBtn").addEventListener("click", verifyKey);

// ✅ 获取或生成设备 ID
function getDeviceId() {
  let id = localStorage.getItem("device_id");
  if (!id) {
    id = "dev-" + Math.random().toString(36).substr(2, 12);
    localStorage.setItem("device_id", id);
  }
  return id;
}

const deviceId = getDeviceId();

// ✅ 复制按钮事件
const copyBtn = document.getElementById("copyBtn");

copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(deviceId).then(() => {
    const originalText = copyBtn.textContent;
    copyBtn.textContent = "✅ 已复制";
    copyBtn.disabled = true;

    setTimeout(() => {
      copyBtn.textContent = originalText;
      copyBtn.disabled = false;
    }, 2000);
  }).catch(() => {
    copyBtn.textContent = "❌ 复制失败";
    setTimeout(() => {
      copyBtn.textContent = "📋 复制ID";
    }, 2000);
  });
});