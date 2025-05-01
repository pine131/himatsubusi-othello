let isCpuMode = true;
let cpuLevel = "normal"; // デフォルトは中級

document.addEventListener("DOMContentLoaded", () => {
    const othelloBtn = document.getElementById("select-othello");
    othelloBtn.addEventListener("click", () => {
        startOthello();
    });

    document.querySelectorAll("#level-buttons button").forEach((btn) => {
        btn.addEventListener("click", () => {
            cpuLevel = btn.dataset.level;
            startOthello(); // 難易度変更時に再スタート
        });
    });

    startOthello();
});
