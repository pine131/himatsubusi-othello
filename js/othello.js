const boardSize = 8;
let board = [];
let currentPlayer = "black";

// 初期化処理
document.addEventListener("DOMContentLoaded", () => {
    initGame();
});

function initGame() {
    board = Array.from({ length: boardSize }, () =>
        Array(boardSize).fill(null)
    );

    // 初期配置
    const mid = boardSize / 2;
    board[mid - 1][mid - 1] = "white";
    board[mid][mid] = "white";
    board[mid - 1][mid] = "black";
    board[mid][mid - 1] = "black";

    renderBoard();
    updateTurnIndicator();
    updateStoneCount();
}

// 盤面描画
function renderBoard() {
    const boardElement = document.getElementById("board");
    boardElement.innerHTML = "";

    for (let y = 0; y < boardSize; y++) {
        const row = document.createElement("div");
        row.className = "board-row";

        for (let x = 0; x < boardSize; x++) {
            const cell = document.createElement("div");
            cell.className = "board-cell";
            cell.dataset.x = x;
            cell.dataset.y = y;
            cell.addEventListener("click", handleCellClick);

            if (board[y][x]) {
                const stone = document.createElement("div");
                stone.className = `stone ${board[y][x]}`;
                cell.appendChild(stone);
            }

            row.appendChild(cell);
        }

        boardElement.appendChild(row);
    }
}

// セルクリック時の処理
function handleCellClick(event) {
    const x = parseInt(event.currentTarget.dataset.x);
    const y = parseInt(event.currentTarget.dataset.y);

    if (!isValidMove(x, y, currentPlayer)) return;

    const flips = getFlips(x, y, currentPlayer);
    board[y][x] = currentPlayer;
    flips.forEach(([fx, fy]) => {
        board[fy][fx] = currentPlayer;
    });

    currentPlayer = currentPlayer === "black" ? "white" : "black";
    renderBoard();
    updateTurnIndicator();
    updateStoneCount();
}

// 石を裏返す座標を取得
function getFlips(x, y, player) {
    const opponent = player === "black" ? "white" : "black";
    const directions = [
        [0, 1], [1, 0], [0, -1], [-1, 0],
        [1, 1], [-1, -1], [1, -1], [-1, 1],
    ];
    let flips = [];

    for (let [dx, dy] of directions) {
        let nx = x + dx;
        let ny = y + dy;
        let candidates = [];

        while (
            nx >= 0 && nx < boardSize &&
            ny >= 0 && ny < boardSize &&
            board[ny][nx] === opponent
        ) {
            candidates.push([nx, ny]);
            nx += dx;
            ny += dy;
        }

        if (
            nx >= 0 && nx < boardSize &&
            ny >= 0 && ny < boardSize &&
            board[ny][nx] === player &&
            candidates.length
        ) {
            flips.push(...candidates);
        }
    }

    return flips;
}

// 有効な手かどうかをチェック
function isValidMove(x, y, player) {
    return board[y][x] === null && getFlips(x, y, player).length > 0;
}

// ターン表示を更新
function updateTurnIndicator() {
    const indicator = document.getElementById("turn-indicator");
    indicator.textContent = `現在の番：${currentPlayer === "black" ? "黒" : "白"}`;
}

// 石の数を更新
function updateStoneCount() {
    let black = 0, white = 0;
    for (let row of board) {
        for (let cell of row) {
            if (cell === "black") black++;
            else if (cell === "white") white++;
        }
    }
    document.getElementById("stone-count").innerHTML = `黒：${black}　白：${white}`;
}
