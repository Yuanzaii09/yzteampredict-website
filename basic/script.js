// 切换按钮功能
const toggleContainer = document.querySelector('.toggle-container');
const toggleButton = document.querySelector('.custom-toggle');

toggleButton.addEventListener('click', () => {
    toggleContainer.classList.toggle('on');
});

// 切换背景与文字功能
const subtitle = document.querySelector('.subtitle');
const bg = document.querySelector('.bg');
const leftArrow = document.getElementById('leftArrow');
const rightArrow = document.getElementById('rightArrow');

const data = [
    {
        subtitle: "WINGO 30s",
        bgImage: "images/bg.png",
        link: "https://example.com/wingo30"
    },
    {
        subtitle: "WINGO 60s",
        bgImage: "images/bg2.png",
        link: "https://example.com/wingo60"
    },
    {
        subtitle: "YZTEAM CLASSIC",
        bgImage: "images/bg3.png",
        link: "https://example.com/classic"
    }
];

let currentIndex = 0;

function updateContent(index) {
    const item = data[index];
    subtitle.textContent = item.subtitle;
    bg.style.backgroundImage = `url('${item.bgImage}')`;
    bg.onclick = () => window.open(item.link, '_blank');
}

leftArrow.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + data.length) % data.length;
    updateContent(currentIndex);
});

rightArrow.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % data.length;
    updateContent(currentIndex);
});

// 初始化内容
updateContent(currentIndex);