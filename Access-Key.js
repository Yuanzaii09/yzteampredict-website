import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// 替换为你自己的 Supabase URL 和 Key
const SUPABASE_URL = 'https://myovkkdrzewrxoeqedyh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15b3Zra2RyemV3cnhvZXFlZHloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MjkxOTgsImV4cCI6MjA2NTMwNTE5OH0.DpLy88H92DoXQGIzWTNNRvmTVtZE55eI5lBBmpw9GUI';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let deviceId = null;

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

  if (!key) {
    result.textContent = "请输入密钥";
    return;
  }

  await fpPromise;

  try {
    const { data, error } = await supabase
      .from('keys')
      .select('*')
      .eq('key', key)
      .single();

    if (error || !data) {
      result.textContent = "此密钥无效";
      return;
    }

    const boundDevice = data.deviceId || null;
    const isUsed = data.used || false;
    const now = new Date();

    if (isUsed && boundDevice && boundDevice !== deviceId) {
      result.textContent = "此密钥已被其他设备绑定";
      return;
    }

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

    // ✅ 更新数据
    await supabase
      .from('keys')
      .update({
        used: true,
        deviceId: deviceId,
        activatedAt: now.toISOString()
      })
      .eq('key', key);

    result.style.color = "#4CAF50";
    result.textContent = "验证成功，正在跳转...";

    setTimeout(() => {
      location.href = "index.html";
      location.reload();
    }, 1200);
  } catch (err) {
    console.error("验证出错：", err);
    result.textContent = "验证出错，请稍后尝试";
  }
};