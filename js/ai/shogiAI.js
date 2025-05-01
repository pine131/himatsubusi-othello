// --- 略：aiPieceSymbols, pieceValue, getValidShogiMoves(), evaluateMove(), chooseByEvaluation() は前回と同じ ---

function simulateMove(board, move) {
    const newBoard = board.map(row => row.map(cell => (cell ? { ...cell } : null)));

    const from = move.from;
    const to = move.to;
    const piece = newBoard[from.row][from.col];

    newBoard[to.row][to.col] = { ...piece };
    newBoard[from.row][from.col] = null;

    return newBoard;
}

function evaluateBoard(board) {
    let score = 0;
    for (const row of board) {
        for (const cell of row) {
            if (!cell) continue;
            const value = pieceValue[cell.type] || 0;
            score += cell.owner === "AI" ? value : -value;
        }
    }
    return score;
}

function chooseByMinimax(board) {
    const aiMoves = getValidShogiMoves(board);
    let bestScore = -Infinity;
    let bestMove = null;

    for (const move of aiMoves) {
        const simulated = simulateMove(board, move);

        // プレイヤーの反撃手（最悪のケース）
        const playerMoves = getValidPlayerMoves(simulated);
        let worstReply = 0;
        for (const reply of playerMoves) {
            const afterPlayer = simulatePlayerMove(simulated, reply);
            const score = evaluateBoard(afterPlayer);
            worstReply = Math.min(worstReply, score);
        }

        if (worstReply > bestScore) {
            bestScore = worstReply;
            bestMove = move;
        }
    }

    return bestMove || aiMoves[0];
}

// プレイヤー用の合法手（AI視点と対称）
function getValidPlayerMoves(board) {
    const moves = [];
    const directions = Object.keys(aiPieceSymbols);

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const piece = board[row][col];
            if (!piece || piece.owner !== "player") continue;

            const pieceDirs = aiPieceSymbols[piece.type] || [];
            const isLongRange = ["飛", "角", "香", "馬", "龍"].includes(piece.type);

            for (let [dx, dy] of pieceDirs.map(([x, y]) => [-x, -y])) {
                let newRow = row + dx;
                let newCol = col + dy;

                while (newRow >= 0 && newRow < 9 && newCol >= 0 && newCol < 9) {
                    const target = board[newRow][newCol];
                    if (target && target.owner === "player") break;

                    moves.push({
                        from: { row, col },
                        to: { row: newRow, col: newCol }
                    });

                    if (!isLongRange || (target && target.owner === "AI")) break;

                    newRow += dx;
                    newCol += dy;
                }
            }
        }
    }

    return moves;
}

function simulatePlayerMove(board, move) {
    const newBoard = board.map(row => row.map(cell => (cell ? { ...cell } : null)));

    const from = move.from;
    const to = move.to;
    const piece = newBoard[from.row][from.col];

    newBoard[to.row][to.col] = { ...piece };
    newBoard[from.row][from.col] = null;

    return newBoard;
}

// === メイン関数 ===
function getBestShogiMove(board, level) {
    const moves = getValidShogiMoves(board);
    if (moves.length === 0) return null;

    if (level === "easy") {
        return moves[Math.floor(Math.random() * moves.length)];
    }

    if (level === "normal") {
        return chooseByEvaluation(moves);
    }

    if (level === "hard") {
        return chooseByMinimax(board);
    }

    return moves[0];
}
