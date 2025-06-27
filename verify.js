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

// 获取 FingerprintJS visitorId
const fpPromise = import("https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@3/dist/fp.min.js")
  .then(FingerprintJS => FingerprintJS.load())
  .then(fp => fp.get())
  .then(result => {
    deviceId = result.visitorId;
  })
  .catch(err => {
    console.error("设备识别失败：", err);
  });

window.verifyKey = async function () {
  const keyInput = document.getElementById("keyInput");
  const result = document.getElementById("resultMessage");
  const key = keyInput.value.trim();

  result.style.color = "red";
  result.textContent = "";

  // step 1: 检查是否输入密钥
  if (!key) {
    result.textContent = "请输入密钥";
    return;
  }

  // 等待 deviceId 加载
  await fpPromise;

  try {
    // step 2: 查询密钥是否存在
    const { data, error } = await supabase
      .from('keys')
      .select('*')
      .eq('key', key)
      .single();

    if (error || !data) {
      result.textContent = "此密钥无效";
      return;
    }

    // step 3: 检查是否已绑定其他设备
    const boundDevice = data.deviceId || null;
    const isUsed = data.used || false;
    const now = new Date();

    if (isUsed && boundDevice && boundDevice !== deviceId) {
      result.textContent = "此密钥已被其他设备绑定";
      return;
    }

    // step 4: 检查是否过期/未生效
    const validFrom = new Date(data.validFrom);
    const validDurationDays = data.validDurationDays;

    if (!validFrom || typeof validDurationDays !== "number") {
      result.textContent = "密钥数据异常，请联系管理员";
      return;
    }

    const expireTime = validDurationDays === -1
      ? null
      : new Date(validFrom.getTime() + validDurationDays * 24 * 60 * 60 * 1000);

    if (now < validFrom) {
      const secondsLeft = Math.ceil((validFrom - now) / 1000);
      result.textContent = `密钥将在 ${secondsLeft} 秒后生效`;
      return;
    }

    if (expireTime && now > expireTime) {
      result.textContent = "此密钥已过期";
      return;
    }

    // step 5: 更新 Supabase 数据库
    await supabase
      .from('keys')
      .update({
        used: true,
        deviceId: deviceId,
        activatedAt: now.toISOString()
      })
      .eq('key', key);

    // step 6: 显示成功并跳转
    result.style.color = "#4CAF50";
    result.textContent = "验证成功，正在跳转...";

    setTimeout(() => {
      window.location.href = "index.html";

      // 🔄 跳转后刷新原验证页面，避免卡住
      window.opener?.location?.reload();  // 如果是弹窗打开的
      window.location.replace("access-key.html"); // 自刷新 fallback
    }, 1200);

  } catch (err) {
    console.error("验证出错：", err);
    result.textContent = "验证出错，请稍后尝试";
  }
};