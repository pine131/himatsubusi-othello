document.addEventListener("DOMContentLoaded", () => {
    const boardElement = document.getElementById("shogi-board");
    const levelButtons = document.querySelectorAll("button[data-level]");
    const difficultyDisplay = document.getElementById("current-difficulty");

    let currentLevel = "easy";
    let selectedPiece = null;
    let board = [];
    let isGameOver = false;

    const pieceSymbols = {
        "歩": [[-1, 0]],
        "香": Array.from({ length: 8 }, (_, i) => [-1 - i, 0]),
        "桂": [[-2, -1], [-2, 1]],
        "銀": [[-1, 0], [-1, -1], [-1, 1], [1, -1], [1, 1]],
        "金": [[-1, 0], [0, -1], [0, 1], [1, 0], [-1, -1], [-1, 1]],
        "角": [[-1, -1], [-1, 1], [1, -1], [1, 1]],
        "飛": [[-1, 0], [1, 0], [0, -1], [0, 1]],
        "王": [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]],
        "と": [[-1, 0], [0, -1], [0, 1], [1, 0], [-1, -1], [-1, 1]],
        "馬": [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]],
        "龍": [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]]
    };

    function initBoard() {
        const emptyRow = () => Array(9).fill(null);
        board = [];

        board.push([
            { type: "香", owner: "AI" },
            { type: "桂", owner: "AI" },
            { type: "銀", owner: "AI" },
            { type: "金", owner: "AI" },
            { type: "王", owner: "AI" },
            { type: "金", owner: "AI" },
            { type: "銀", owner: "AI" },
            { type: "桂", owner: "AI" },
            { type: "香", owner: "AI" }
        ]);
        board.push([
            null,
            { type: "飛", owner: "AI" },
            null, null, null, null,
            null,
            { type: "角", owner: "AI" },
            null
        ]);
        board.push(Array(9).fill({ type: "歩", owner: "AI" }));

        board.push(emptyRow());
        board.push(emptyRow());
        board.push(emptyRow());

        board.push(Array(9).fill({ type: "歩", owner: "player" }));
        board.push([
            null,
            { type: "角", owner: "player" },
            null, null, null, null,
            null,
            { type: "飛", owner: "player" },
            null
        ]);
        board.push([
            { type: "香", owner: "player" },
            { type: "桂", owner: "player" },
            { type: "銀", owner: "player" },
            { type: "金", owner: "player" },
            { type: "王", owner: "player" },
            { type: "金", owner: "player" },
            { type: "銀", owner: "player" },
            { type: "桂", owner: "player" },
            { type: "香", owner: "player" }
        ]);

        isGameOver = false;
        renderBoard();
    }

    function renderBoard() {
        boardElement.innerHTML = "";
        boardElement.className = "shogi-board";

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement("div");
                cell.className = "shogi-cell";
                cell.dataset.row = row;
                cell.dataset.col = col;

                const piece = board[row][col];
                if (piece) {
                    cell.textContent = piece.type;
                    cell.classList.add(piece.owner === "player" ? "player-piece" : "ai-piece");
                    if (piece.promoted) cell.classList.add("promoted");
                }

                cell.addEventListener("click", () => handleClick(row, col));
                boardElement.appendChild(cell);
            }
        }
    }

    function handleClick(row, col) {
        if (isGameOver) return;

        const clicked = board[row][col];

        if (selectedPiece && isHighlighted(row, col)) {
            const { row: fromRow, col: fromCol, type } = selectedPiece;
            let piece = board[fromRow][fromCol];

            const shouldPromote = needsPromotion(type) && isInEnemyTerritory(row);
            let newPiece = { type, owner: "player", promoted: false };

            if (shouldPromote && confirm(`${type} を成りますか？`)) {
                newPiece = promotePiece(type);
            }

            const target = board[row][col];
            if (target && target.type === "王" && target.owner === "AI") {
                alert("あなたの勝ちです！");
                isGameOver = true;
                return;
            }

            board[row][col] = newPiece;
            board[fromRow][fromCol] = null;
            selectedPiece = null;
            renderBoard();

            setTimeout(() => {
                if (isGameOver) return;

                const aiMove = getBestShogiMove(board, currentLevel);
                if (!aiMove) return;

                const { from, to, type } = aiMove;
                const movingPiece = board[from.row][from.col];

                const target = board[to.row][to.col];
                if (target && target.type === "王" && target.owner === "player") {
                    alert("あなたの負けです！");
                    isGameOver = true;
                    return;
                }

                board[to.row][to.col] = { ...movingPiece };
                board[from.row][from.col] = null;

                renderBoard();
            }, 500);

            return;
        }

        if (clicked && clicked.owner === "player") {
            selectedPiece = { row, col, type: clicked.type };
            highlightMoves(row, col, clicked.type);
        } else {
            selectedPiece = null;
            renderBoard();
        }
    }

    function isHighlighted(row, col) {
        const cell = boardElement.querySelector(`[data-row='${row}'][data-col='${col}']`);
        return cell && cell.classList.contains("highlight");
    }

    function highlightMoves(row, col, type) {
        renderBoard();
        const directions = pieceSymbols[type] || [];
        const isLongRange = ["飛", "角", "香", "馬", "龍"].includes(type);

        for (let [dx, dy] of directions) {
            let newRow = row + dx;
            let newCol = col + dy;

            while (newRow >= 0 && newRow < 9 && newCol >= 0 && newCol < 9) {
                const target = board[newRow][newCol];
                if (target && target.owner === "player") break;

                const cell = boardElement.querySelector(`[data-row='${newRow}'][data-col='${newCol}']`);
                if (cell) {
                    cell.classList.add("highlight");
                    cell.textContent += " →";
                }

                if (!isLongRange || (target && target.owner === "AI")) break;
                newRow += dx;
                newCol += dy;
            }
        }
    }

    function isInEnemyTerritory(row) {
        return row <= 2;
    }

    function needsPromotion(type) {
        return ["歩", "香", "桂", "銀", "角", "飛"].includes(type);
    }

    function promotePiece(type) {
        if (type === "歩") return { type: "と", owner: "player", promoted: true };
        if (type === "角") return { type: "馬", owner: "player", promoted: true };
        if (type === "飛") return { type: "龍", owner: "player", promoted: true };
        return { type: "金", owner: "player", promoted: true };
    }

    levelButtons.forEach(button => {
        button.addEventListener("click", () => {
            currentLevel = button.dataset.level;
            updateDifficultyDisplay(currentLevel);
            highlightLevelButton(currentLevel);
            initBoard();
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

    renderBoard();
});
