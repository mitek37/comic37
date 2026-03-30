const viewer = document.getElementById("viewer");
const pagesDiv = document.getElementById("pages");

const folder = viewer.dataset.folder;
const count = parseInt(viewer.dataset.count);

const pages = [];

for (let i = 1; i <= count; i++) {
    pages.push(`${folder}/${i}.png`);
}

pages.forEach(src => {
    const div = document.createElement("div");
    div.className = "page";

    const img = document.createElement("img");
    img.src = src;

    div.appendChild(img);
    pagesDiv.appendChild(div);
});

let current = 0;

const img = document.getElementById("page");
const slider = document.getElementById("slider");
const pageNum = document.getElementById("pageNum");

const header = document.getElementById("header");
const footer = document.getElementById("footer");

let uiVisible = true;

// ページ更新
function updatePage() {
    pagesDiv.style.transform = `translateX(${current * 100}%)`;

    slider.value = current + 1;
    pageNum.textContent = `${current+1} / ${pages.length}`;
}

// スライダー操作
slider.max = pages.length;

slider.addEventListener("input", () => {
    current = slider.value - 1;
    updatePage();
});

// スワイプ処理
let startX = 0;
let dragging = false;
let moved = false;

const SENSITIVITY = 0.6; // ←小さいほど鈍くなる（0.3〜0.5おすすめ）
const THRESHOLD = 60;    // ←ページ確定に必要な距離

viewer.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
    dragging = true;
    moved = false;
});

viewer.addEventListener("touchmove", e => {
    if (!dragging) return;

    let diff = e.touches[0].clientX - startX;
    diff *= SENSITIVITY;

    const maxMove = viewer.clientWidth;
    diff = Math.max(-maxMove, Math.min(maxMove, diff));

    pagesDiv.style.transform =
        `translateX(calc(${current * 100}% + ${diff}px))`;
}, { passive: false });

viewer.addEventListener("touchend", e => {
    dragging = false;

    let diff = e.changedTouches[0].clientX - startX;

    if (diff > THRESHOLD && current < pages.length - 1) {
        current++;
    } else if (diff < -THRESHOLD && current > 0) {
        current--;
    }

    updatePage();
});

document.addEventListener("keydown", e => {
    if (e.key === "ArrowRight" && current > 0) {
        current--; // 右キー → 次
    } else if (e.key === "ArrowLeft" && current < pages.length - 1) {
        current++; // 左キー → 前
    }
    updatePage();
});

// タップでUI表示切替
document.addEventListener("click", e => {
    if (e.target.id === "slider") return;

    uiVisible = !uiVisible;

    header.classList.toggle("hide", !uiVisible);
    footer.classList.toggle("hide", !uiVisible);
});

// 初期化
updatePage();