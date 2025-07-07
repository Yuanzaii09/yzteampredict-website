// ✅ 允许访问的路径（文件夹）
const allowedPaths = [
  "../home",
  "../mzwingo",
  "../myswingo",
  "../lunartraders",
  "../verify",
  "../terms-of-service"
];

// ✅ 当前路径
const currentPath = window.location.pathname;

// ✅ 如果当前路径不在允许列表中 → 重定向到 404
if (!allowedPaths.includes(currentPath)) {
  window.location.replace("https://yzteampredict.store/404/index.html");
}
