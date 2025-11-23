let timerInterval;
let totalSeconds = 0;

let attempts = 0;
let correct = 0;
let streak = 0;

export function startTimer() {
  if (timerInterval) clearInterval(timerInterval);

  totalSeconds = 0;

  timerInterval = setInterval(() => {
    totalSeconds++;
    const min = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const sec = String(totalSeconds % 60).padStart(2, "0");
    document.getElementById("timer").textContent = `${min}:${sec}`;
  }, 1000);
}

export function stopTimer() {
  clearInterval(timerInterval);
  document.getElementById("timer").textContent = "⏱️ 00:00";
}

export function incrementAttempts() {
  attempts++;
  document.getElementById("stat-attempts").textContent = attempts;
}

export function incrementCorrect() {
  correct++;
  streak++;
  let correctPerMinute = Math.floor(correct * 60 / (totalSeconds+1));
  document.getElementById("stat-ratio").textContent = correctPerMinute + ' / minute';
  document.getElementById("stat-correct").textContent = correct;
  document.getElementById("stat-streak").textContent = streak;
}

export function resetStreak() {
  streak = 0;
  document.getElementById("stat-streak").textContent = 0;
}
