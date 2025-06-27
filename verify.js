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

// ✅ 获取 Realtime Database 实例
const database = firebase.database();

// ✅ 测试是否初始化成功
console.log("Firebase 初始化完成");