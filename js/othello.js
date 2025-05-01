document.addEventListener("DOMContentLoaded", () => {
    const gameContainer = document.getElementById("game-container");
    const turnIndicator = document.getElementById("turn-indicator");
    const stoneCount = document.getElementById("stone-count");
    const levelButtons = document.querySelectorAll("button[data-level]");
    const difficultyDisplay = document.getElementById("current-difficulty");

    let board = [];
    let currentPlayer = "black";
    let currentLevel = "easy";
    let isCPUMode = true;
    let isGameOver = false;

    levelButtons.forEach(button => {
        button.addEventListener("click", () => {
            currentLevel = button.dataset.level;
            updateDifficultyDisplay(currentLevel);
            highlightLevelButton(currentLevel);
            initGame();
        });
    });

    function updateDifficultyDisplay(level) {
        const map = {
            easy: "初級（easy）",
            normal: "中級（normal）",
            hard: "上級（hard）"
        };
        difficultyDisplay.textContent = `現在の難易度：${map[level]}`;
    }

    function highlightLevelButton(level) {
        levelButtons.forEach(b => b.classList.remove("selected"));
        document.querySelector(`[data-level="${level}"]`).classList.add("selected");
    }

    function initGame() {
        isGameOver = false;
        board = Array(8).fill(null).map(() => Array(8).fill(""));
        board[3][3] = "white";
        board[4][4] = "white";
        board[3][4] = "black";
        board[4][3] = "black";
        currentPlayer = "black";
        renderBoard();
        updateStatus();

        const adStart = document.getElementById("ad-startgame");
        if (adStart) {
            adStart.innerHTML = `<div style="border:1px solid #ccc; padding:10px; margin:10px;">広告（ゲーム開始時）</div>`;
        }
    }

    function renderBoard() {
        gameContainer.innerHTML = "";
        gameContainer.classList.add("othello-board");

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement("div");
                cell.className = "cell";
                if (board[row][col] === "black") cell.classList.add("black");
                if (board[row][col] === "white") cell.classList.add("white");

                cell.addEventListener("click", () => handleMove(row, col));
                gameContainer.appendChild(cell);
            }
        }
    }

    function handleMove(row, col) {
        if (isGameOver || board[row][col] !== "") return;

        const flips = getFlips(row, col, currentPlayer);
        if (flips.length === 0) return;

        board[row][col] = currentPlayer;
        flips.forEach(([r, c]) => (board[r][c] = currentPlayer));
        switchPlayer();
        updateStatus();
        renderBoard();

        if (!hasValidMove(currentPlayer)) {
            switchPlayer();
            if (!hasValidMove(currentPlayer)) {
                endGame();
                return;
            }
        }

        if (isCPUMode && currentPlayer === "white") {
            setTimeout(cpuMove, 500);
        }
    }

    function getFlips(row, col, color) {
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1],
            [-1, -1], [-1, 1], [1, -1], [1, 1]
        ];
        const flips = [];

        directions.forEach(([dx, dy]) => {
            let r = row + dx;
            let c = col + dy;
            const candidates = [];

            while (r >= 0 && r < 8 && c >= 0 && c < 8) {
                if (board[r][c] === "") break;
                if (board[r][c] === color) {
                    flips.push(...candidates);
                    break;
                } else {
                    candidates.push([r, c]);
                }
                r += dx;
                c += dy;
            }
        });

        return flips;
    }

    function switchPlayer() {
        currentPlayer = currentPlayer === "black" ? "white" : "black";
    }

    function updateStatus() {
        turnIndicator.textContent = `現在の番：${currentPlayer === "black" ? "黒" : "白"}`;
        const count = countStones();
        stoneCount.textContent = `黒: ${count.black}　白: ${count.white}`;
    }

    function countStones() {
        let black = 0, white = 0;
        for (let row of board) {
            for (let cell of row) {
                if (cell === "black") black++;
                if (cell === "white") white++;
            }
        }
        return { black, white };
    }

    function hasValidMove(color) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (board[r][c] === "" && getFlips(r, c, color).length > 0) {
                    return true;
                }
            }
        }
        return false;
    }

    function endGame() {
        isGameOver = true;
        const { black, white } = countStones();
        const result =
            black > white ? "黒の勝ち！" :
                white > black ? "白の勝ち！" :
                    "引き分け！";

        gameContainer.innerHTML = `
        <h2>ゲーム終了</h2>
        <p>黒: ${black}　白: ${white}</p>
        <p><strong>${result}</strong></p>
        <button id="restart-button">もう一度プレイ</button>
      `;

        const adEnd = document.getElementById("ad-endgame");
        adEnd.innerHTML = `<div style="border:1px solid #ccc; padding:10px; margin:10px;">広告（ゲーム終了後）</div>`;

        document.getElementById("restart-button").addEventListener("click", () => {
            initGame();
        });
    }

    function cpuMove() {
        const move = getBestMove(board, "white", currentLevel);
        if (move) {
            handleMove(move.row, move.col);
        }
    }

    // 初期化呼び出しは無し（難易度選択時に実行）

});
