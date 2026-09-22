const question = document.getElementById("question");
const subject = document.getElementById("subject");
const solve = document.getElementById("solve");
const answer = document.getElementById("answer");
const status = document.getElementById("status");
const counter = document.getElementById("counter");
const clear = document.getElementById("clear");

question.addEventListener("input", () => {
  counter.textContent = `${question.value.length.toLocaleString()} characters`;
});

async function checkStatus() {
  try {
    const response = await fetch("/api/status");
    const data = await response.json();

    if (data.loaded) {
      status.textContent = "● Local model ready";
      status.classList.add("ready");
    } else {
      status.textContent = "● Model loads on first question";
    }
  } catch {
    status.textContent = "● Server unavailable";
  }
}

solve.addEventListener("click", async () => {
  const text = question.value.trim();

  if (!text) {
    answer.innerHTML = '<div class="error">Please enter an assignment question.</div>';
    return;
  }

  solve.disabled = true;
  solve.textContent = "Running QVAC locally...";
  answer.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <h3>Generating solution locally</h3>
      <p>The first run may take longer while QVAC loads the model.</p>
    </div>
  `;

  try {
    const response = await fetch("/api/solve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: subject.value,
        question: text
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.details || data.error || "Request failed");
    }

    answer.textContent = data.answer;
    status.textContent = "● Local model ready";
    status.classList.add("ready");
  } catch (error) {
    answer.innerHTML = `<div class="error">${escapeHtml(error.message)}</div>`;
  } finally {
    solve.disabled = false;
    solve.textContent = "Solve with Local AI";
  }
});

clear.addEventListener("click", () => {
  answer.innerHTML = `
    <div class="empty">
      <div class="icon">✦</div>
      <h3>Your answer will appear here</h3>
      <p>Enter an assignment question and run the local QVAC model.</p>
    </div>
  `;
});

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

checkStatus();