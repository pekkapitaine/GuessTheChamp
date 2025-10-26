// Gestion du Timer
let timerInterval = null;
let secondsElapsed = 0;

export function startTimer() {
  const timerElement = document.getElementById("timer");
  secondsElapsed = 0;
  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    secondsElapsed++;
    const minutes = Math.floor(secondsElapsed / 60);
    const seconds = secondsElapsed % 60;
    timerElement.textContent = `⏱️ ${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, 1000);
}

export function stopTimer() {
  clearInterval(timerInterval);
  document.getElementById("timer").textContent = "⏱️ 00:00";
}
