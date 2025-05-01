function makeCpuMove() {
    const legalMoves = [];

    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const cell = getCell(x, y);
            if (!cell.classList.contains("black") && !cell.classList.contains("white")) {
                const flips = getFlippableCells(x, y, currentColor);
                if (flips.length > 0) {
                    legalMoves.push({ x, y, flips });
                }
            }
        }
    }

    if (legalMoves.length === 0) {
        checkGameState();
        return;
    }

    const move = legalMoves[Math.floor(Math.random() * legalMoves.length)];
    const cells = document.querySelectorAll(".cell");
    setDisk(cells, move.x, move.y, currentColor);
    move.flips.forEach((c) => c.classList.replace(getOpponentColor(), currentColor));
    currentColor = getOpponentColor();
    updateStatusBar();
    checkGameState();
}

function makeCpuMoveAdvanced() {
    const legalMoves = [];

    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const cell = getCell(x, y);
            if (!cell.classList.contains("black") && !cell.classList.contains("white")) {
                const flips = getFlippableCells(x, y, currentColor);
                if (flips.length > 0) {
                    const score = evaluateMove(x, y);
                    legalMoves.push({ x, y, flips, score });
                }
            }
        }
    }

    if (legalMoves.length === 0) {
        checkGameState();
        return;
    }

    legalMoves.sort((a, b) => b.score - a.score);
    const topMoves = legalMoves.filter(m => m.score === legalMoves[0].score);
    const move = topMoves[Math.floor(Math.random() * topMoves.length)];
    const cells = document.querySelectorAll(".cell");
    setDisk(cells, move.x, move.y, currentColor);
    move.flips.forEach((c) => c.classList.replace(getOpponentColor(), currentColor));
    currentColor = getOpponentColor();
    updateStatusBar();
    checkGameState();
}

function evaluateMove(x, y) {
    const corners = [[0, 0], [0, 7], [7, 0], [7, 7]];
    const danger = [
        [0, 1], [1, 0], [1, 1], [0, 6], [1, 6], [1, 7],
        [6, 0], [6, 1], [7, 1], [6, 6], [6, 7], [7, 6]
    ];
    if (corners.some(([cx, cy]) => cx === x && cy === y)) return 100;
    if (danger.some(([dx, dy]) => dx === x && dy === y)) return -50;
    if (x === 0 || x === 7 || y === 0 || y === 7) return 10;
    return 0;
}

function makeCpuMoveStrong() {
    const legalMoves = [];

    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const cell = getCell(x, y);
            if (!cell.classList.contains("black") && !cell.classList.contains("white")) {
                const flips = getFlippableCells(x, y, currentColor);
                if (flips.length > 0) {
                    const score = simulateBoardScore(x, y, flips);
                    legalMoves.push({ x, y, flips, score });
                }
            }
        }
    }

    if (legalMoves.length === 0) {
        checkGameState();
        return;
    }

    legalMoves.sort((a, b) => b.score - a.score);
    const bestMoves = legalMoves.filter(m => m.score === legalMoves[0].score);
    const move = bestMoves[Math.floor(Math.random() * bestMoves.length)];
    const cells = document.querySelectorAll(".cell");
    setDisk(cells, move.x, move.y, currentColor);
    move.flips.forEach((c) => c.classList.replace(getOpponentColor(), currentColor));
    currentColor = getOpponentColor();
    updateStatusBar();
    checkGameState();
}

function simulateBoardScore(x, y, flips) {
    const tempStones = document.querySelectorAll(".cell." + currentColor).length;
    const total = tempStones + flips.length + 1;
    return total;
}
