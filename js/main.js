let isCpuMode = true;
let cpuLevel = "normal"; // デフォルトは中級

document.addEventListener("DOMContentLoaded", () => {
    const othelloBtn = document.getElementById("select-othello");
    othelloBtn.addEventListener("click", () => {
        startOthello();
    });

    const levelButtons = document.querySelectorAll("button[data-level]");
    const difficultyDisplay = document.getElementById("current-difficulty");

    levelButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            cpuLevel = btn.dataset.level;

            let levelText = "";
            switch (cpuLevel) {
                case "easy":
                    levelText = "初級（easy）";
                    break;
                case "normal":
                    levelText = "中級（normal）";
                    break;
                case "hard":
                    levelText = "上級（hard）";
                    break;
            }

            difficultyDisplay.textContent = `現在の難易度：${levelText}`;

            levelButtons.forEach(b => b.classList.remove("selected"));
            btn.classList.add("selected");

            startOthello(); // 難易度変更時にリセット
        });
    });

    difficultyDisplay.textContent = "現在の難易度：中級（normal）"; // 初期表示
    document.querySelector('[data-level="normal"]').classList.add("selected");

    startOthello();
});
