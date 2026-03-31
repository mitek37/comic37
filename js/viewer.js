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

const overlay = document.getElementById("overlay"); // 最初のナビ

let overlayActive = true;

// 最初は操作禁止（任意）
viewer.style.pointerEvents = "none";

overlay.addEventListener("click", () => {
    overlay.classList.add("hide");

    // フェード後に削除（軽量化）
    setTimeout(() => {
        overlay.style.display = "none";
        viewer.style.pointerEvents = "auto";
        overlayActive = false;
    }, 300);
});

// スワイプ処理

const EDGE_AREA = 80;     // 端の判定(px)
const FLICK_SPEED = 0.5;  // フリック速度（px/ms）

let startX = 0;
let startY = 0;
let startTime = 0;
let dragging = false;
let edgeTap = false;

viewer.addEventListener("touchstart", e => {
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    startTime = Date.now();
    dragging = true;
});

const DRAG_SENSITIVITY = 0.9; // ← 大きくする（0.8〜1.0おすすめ）
const MAX_DRAG_RATIO = 0.85;  // ← 最大移動も増やす

viewer.addEventListener("touchmove", e => {
    if (!dragging) return;

    let diffX = e.touches[0].clientX - startX;
    let diffY = e.touches[0].clientY - startY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        e.preventDefault();

        let move = diffX * DRAG_SENSITIVITY;

        const maxMove = viewer.clientWidth * MAX_DRAG_RATIO;
        move = Math.max(-maxMove, Math.min(maxMove, move));

        pagesDiv.style.transform =
            `translateX(calc(${current * 100}% + ${move}px))`;
    }
}, { passive: false });

viewer.addEventListener("touchend", e => {
    if (!dragging) return;
    if (overlayActive) return;

    dragging = false;
    edgeTap = false;

    const t = e.changedTouches[0];
    let endX = t.clientX;
    let diffX = endX - startX;

    let time = Date.now() - startTime;
    let speed = Math.abs(diffX) / time; // px/ms

    const width = viewer.clientWidth;

    let next = false;
    let prev = false;

    // ■ 1 タップ（ほぼ動いてない）
    if (Math.abs(diffX) < 10) {
        if (startX < EDGE_AREA) {
            next = true;
            edgeTap = true;
        } else if (startX > width - EDGE_AREA) {
            prev = true;
            edgeTap = true;
        }

    } else if (speed > FLICK_SPEED) { // ■ 2 フリック（速い）
        if (diffX < 0) prev = true;
        else next = true;

    } else {  // ■ 3 スライド終点が端
        if (endX < EDGE_AREA) prev = true;
        if (endX > width - EDGE_AREA) next = true;
    }

    // ■ 実際のページ移動
    if (next && current < pages.length - 1) {
        current++;
    } else if (prev && current > 0) {
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

    if (overlayActive) return;

    if (edgeTap) {
        edgeTap = false;
        return;
    }

    uiVisible = !uiVisible;

    header.classList.toggle("hide", !uiVisible);
    footer.classList.toggle("hide", !uiVisible);
});

// 初期化
updatePage();