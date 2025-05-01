let currentColor = "black";
let skipCount = 0;

function startOthello() {
    initScoreStorage();

    const boardContainer = document.getElementById("game-container");
    boardContainer.innerHTML = "";

    const board = document.createElement("div");
    board.className = "othello-board";

    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.dataset.x = x;
            cell.dataset.y = y;
            board.appendChild(cell);
        }
    }

    boardContainer.appendChild(board);
    setupInitialDisks();
}

function setupInitialDisks() {
    const cells = document.querySelectorAll(".cell");
    setDisk(cells, 3, 3, "white");
    setDisk(cells, 4, 4, "white");
    setDisk(cells, 3, 4, "black");
    setDisk(cells, 4, 3, "black");

    cells.forEach((cell) => {
        cell.addEventListener("click", () => {
            const x = Number(cell.dataset.x);
            const y = Number(cell.dataset.y);

            if (cell.classList.contains("black") || cell.classList.contains("white")) return;

            const flipped = getFlippableCells(x, y, currentColor);
            if (flipped.length > 0) {
                setDisk(cells, x, y, currentColor);
                flipped.forEach((c) => c.classList.replace(getOpponentColor(), currentColor));
                currentColor = getOpponentColor();
                updateStatusBar();
                checkGameState();
            }
        });
    });

    updateStatusBar();
    displayStoredScore();
}

function setDisk(cells, x, y, color) {
    const cell = [...cells].find(
        (c) => Number(c.dataset.x) === x && Number(c.dataset.y) === y
    );
    if (cell) cell.classList.add(color);
}

function getCell(x, y) {
    return document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
}

function getOpponentColor() {
    return currentColor === "black" ? "white" : "black";
}

function getFlippableCells(x, y, color) {
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];
    const result = [];

    directions.forEach(([dx, dy]) => {
        const line = [];
        let cx = x + dx;
        let cy = y + dy;

        while (cx >= 0 && cx < 8 && cy >= 0 && cy < 8) {
            const cell = getCell(cx, cy);
            if (!cell) break;
            if (cell.classList.contains(getOpponentColor())) {
                line.push(cell);
            } else if (cell.classList.contains(color)) {
                if (line.length > 0) result.push(...line);
                break;
            } else {
                break;
            }
            cx += dx;
            cy += dy;
        }
    });

    return result;
}

function updateStatusBar() {
    const black = document.querySelectorAll(".cell.black").length;
    const white = document.querySelectorAll(".cell.white").length;
    const turnText = currentColor === "black" ? "黒" : "白";

    document.getElementById("turn-indicator").textContent = `現在の番：${turnText}`;
    document.getElementById("stone-count").textContent = `黒: ${black}　白: ${white}`;
}

function hasValidMove(color) {
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const cell = getCell(x, y);
            if (!cell.classList.contains("black") && !cell.classList.contains("white")) {
                if (getFlippableCells(x, y, color).length > 0) return true;
            }
        }
    }
    return false;
}

function checkGameState() {
    if (hasValidMove(currentColor)) {
        skipCount = 0;
    } else {
        skipCount++;
        alert(`${currentColor === "black" ? "黒" : "白"}はパスします`);
        currentColor = getOpponentColor();
        updateStatusBar();
    }

    if (skipCount >= 2) {
        showGameResult();
        return;
    }

    // CPUの番ならAIを呼び出す
    if (skipCount < 2 && isCpuMode && currentColor === "white") {
        setTimeout(() => {
            if (cpuLevel === "easy") {
                makeCpuMove();
            } else if (cpuLevel === "normal") {
                makeCpuMoveAdvanced();
            } else {
                makeCpuMoveStrong();
            }
        }, 500);
    }
}

function showGameResult() {
    const black = document.querySelectorAll(".cell.black").length;
    const white = document.querySelectorAll(".cell.white").length;
    let result;

    if (black > white) {
        result = "win";
        alert(`ゲーム終了！\n黒の勝ち！\n黒: ${black}　白: ${white}`);
    } else if (white > black) {
        result = "lose";
        alert(`ゲーム終了！\n白の勝ち！\n黒: ${black}　白: ${white}`);
    } else {
        result = "draw";
        alert(`ゲーム終了！\n引き分け！\n黒: ${black}　白: ${white}`);
    }

    updateScore(result);
    location.reload();
}

function initScoreStorage() {
    if (!localStorage.getItem("othelloScore")) {
        localStorage.setItem("othelloScore", JSON.stringify({ win: 0, lose: 0, draw: 0 }));
    }
}

function updateScore(result) {
    const score = JSON.parse(localStorage.getItem("othelloScore"));
    if (result === "win") score.win++;
    else if (result === "lose") score.lose++;
    else score.draw++;
    localStorage.setItem("othelloScore", JSON.stringify(score));
}

function displayStoredScore() {
    const score = JSON.parse(localStorage.getItem("othelloScore"));
    const total = score.win + score.lose + score.draw;
    const rate = total > 0 ? Math.round((score.win / total) * 100) : 0;
    const text = `累計：${score.win}勝 ${score.lose}敗 ${score.draw}分（勝率${rate}％）`;

    const info = document.createElement("p");
    info.textContent = text;
    document.getElementById("status-bar").appendChild(info);
}
