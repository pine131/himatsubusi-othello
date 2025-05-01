let words = [];
let currentWord = "";
let score = 0;
let currentDifficulty = "";
let isPlaying = false;

// 難易度ごとのJSON読み込み
function setDifficulty(level) {
    if (isPlaying) return alert("ゲーム中は難易度を変更できません！");
    currentDifficulty = level;
    document.getElementById("current-difficulty").textContent = `難易度：${level}`;
    fetch(`data/${level}Words.json`)
        .then(res => res.json())
        .then(data => {
            words = data;
            document.getElementById("word-display").textContent = "ゲーム開始ボタンを押してください";
        })
        .catch(err => {
            console.error("単語データの読み込みに失敗しました", err);
            alert("単語の読み込みに失敗しました");
        });
}

// ゲーム開始
function startGame() {
    if (!currentDifficulty) {
        alert("難易度を選択してください");
        return;
    }
    score = 0;
    isPlaying = true;
    document.getElementById("score-display").textContent = `スコア：${score}`;
    document.getElementById("input-area").disabled = false;
    document.getElementById("input-area").value = "";
    document.getElementById("input-area").focus();
    nextWord();
}

// 次の単語を表示
function nextWord() {
    const randomIndex = Math.floor(Math.random() * words.length);
    currentWord = words[randomIndex];
    document.getElementById("word-display").textContent = currentWord.kana;
}

// 入力処理
document.getElementById("input-area").addEventListener("input", () => {
    const input = document.getElementById("input-area").value.trim();
    if (input.toLowerCase() === currentWord.roma.toLowerCase()) {
        score++;
        document.getElementById("score-display").textContent = `スコア：${score}`;
        document.getElementById("input-area").value = "";
        nextWord();
    }
});
