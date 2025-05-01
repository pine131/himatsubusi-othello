function getValidMoves(board, color) {
    const validMoves = [];

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (board[row][col] === "" && getFlips(board, row, col, color).length > 0) {
                validMoves.push({ row, col });
            }
        }
    }

    return validMoves;
}

function getFlips(board, row, col, color) {
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

// 初級：ランダムに合法手を選ぶ
function makeCpuMove(board, color) {
    const validMoves = getValidMoves(board, color);
    if (validMoves.length === 0) return null;
    const idx = Math.floor(Math.random() * validMoves.length);
    return validMoves[idx];
}

// 中級：簡易評価関数（角・辺を好む）
function makeCpuMoveAdvanced(board, color) {
    const validMoves = getValidMoves(board, color);
    if (validMoves.length === 0) return null;

    let bestScore = -Infinity;
    let bestMove = null;

    for (let move of validMoves) {
        const score = evaluateMove(move.row, move.col);
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }

    return bestMove;
}

function evaluateMove(row, col) {
    const corners = [
        [0, 0], [0, 7], [7, 0], [7, 7]
    ];
    const edges = row === 0 || row === 7 || col === 0 || col === 7;

    for (let [r, c] of corners) {
        if (row === r && col === c) return 100;
    }
    if (edges) return 10;
    if ((row === 1 && col === 1) || (row === 6 && col === 6)) return -50;
    return 0;
}

// 上級：石をより多く取れる手を選ぶ
function makeCpuMoveStrong(board, color) {
    const validMoves = getValidMoves(board, color);
    if (validMoves.length === 0) return null;

    let maxScore = -Infinity;
    let bestMove = null;

    for (let move of validMoves) {
        const simulatedBoard = simulateBoard(board, move.row, move.col, color);
        const score = countStones(simulatedBoard, color);
        if (score > maxScore) {
            maxScore = score;
            bestMove = move;
        }
    }

    return bestMove;
}

function simulateBoard(board, row, col, color) {
    const newBoard = board.map(r => r.slice());
    const flips = getFlips(newBoard, row, col, color);
    newBoard[row][col] = color;
    flips.forEach(([r, c]) => (newBoard[r][c] = color));
    return newBoard;
}

function countStones(board, color) {
    let count = 0;
    for (let row of board) {
        for (let cell of row) {
            if (cell === color) count++;
        }
    }
    return count;
}

// 共通インターフェース（mainで使用される）
function getBestMove(board, color, level) {
    if (level === "easy") {
        return makeCpuMove(board, color);
    } else if (level === "normal") {
        return makeCpuMoveAdvanced(board, color);
    } else {
        return makeCpuMoveStrong(board, color);
    }
}
