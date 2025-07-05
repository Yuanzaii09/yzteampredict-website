// 禁用右键菜单
document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
});

// 禁用 F12、Ctrl+Shift+I、Ctrl+U、Ctrl+S 等
document.addEventListener("keydown", function (e) {
    if (e.key === "F12" || 
        (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key.toUpperCase())) ||
        (e.ctrlKey && ["U", "S"].includes(e.key.toUpperCase()))
    ) {
        e.preventDefault();
    }
});
