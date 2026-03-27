
document.querySelectorAll("nav button").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll("nav button").forEach(b => b.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  };
});


const subjectsContainer = document.getElementById("subjects");
const scaleSelect = document.getElementById("gradingScale");
const gpaResult = document.getElementById("gpaResult");

const gradeScales = {
  "4.0": {
    "A":4, "A-":3.7,
    "B+":3.3, "B":3, "B-":2.7,
    "C+":2.3, "C":2, "C-":1.7,
    "D+":1.3, "D":1, "D-":0.7,
    "F":0
  },
  "4.3": {
    "A+":4.3, "A":4, "A-":3.7,
    "B+":3.3, "B":3, "B-":2.7,
    "C+":2.3, "C":2, "C-":1.7,
    "D+":1.3, "D":1, "D-":0.7,
    "F":0
  }
};

function createSubjectRow() {
  const row = document.createElement("div");
  row.className = "subject-row";

  const grade = document.createElement("input");
  grade.placeholder = "Grade";

  const credits = document.createElement("input");
  credits.type = "number";
  credits.placeholder = "Credits";

  const remove = document.createElement("button");
  remove.textContent = "X";
  remove.onclick = () => row.remove();

  row.append(grade, credits, remove);
  subjectsContainer.appendChild(row);
}

document.getElementById("addSubject").onclick = createSubjectRow;

document.getElementById("calculateGPA").onclick = () => {
  const map = gradeScales[scaleSelect.value];

  let totalPoints = 0;
  let totalCredits = 0;

  document.querySelectorAll(".subject-row").forEach(row => {
    const grade = row.children[0].value.toUpperCase();
    const credits = parseFloat(row.children[1].value);

    if (!(grade in map) || isNaN(credits)) return;

    totalPoints += map[grade] * credits;
    totalCredits += credits;
  });

  if (!totalCredits) {
    gpaResult.textContent = "Invalid data";
    return;
  }

  gpaResult.innerHTML = `
    GPA: ${ (totalPoints / totalCredits).toFixed(2) } <br>
    Credits: ${totalCredits}
  `;
};

createSubjectRow();


let timer = null;

let timerState = {
  mode: "focus",
  work: 1500,
  shortBreak: 300,
  longBreak: 900,
  sessions: 0,
  timeLeft: 1500,
  running: false
};

const display = document.getElementById("timerDisplay");
const modeLabel = document.getElementById("timerMode");
const hint = document.getElementById("breakHint");
const section = document.getElementById("timer");

const beep = new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg");

const breakTips = [
  "Stretch your body",
  "Drink water",
  "Look away from screen",
  "Walk a little",
  "Relax your eyes"
];

function updateUI() {
  const m = Math.floor(timerState.timeLeft / 60);
  const s = timerState.timeLeft % 60;

  display.textContent = `${m}:${s.toString().padStart(2, "0")}`;

  if (timerState.mode === "focus") {
    modeLabel.textContent = "Focus Mode";
    hint.textContent = "Stay focused. No distractions.";
    section.classList.add("focus-mode");
    section.classList.remove("break-mode");
  } else {
    modeLabel.textContent = "Break Time";
    hint.textContent = breakTips[Math.floor(Math.random() * breakTips.length)];
    section.classList.add("break-mode");
    section.classList.remove("focus-mode");
  }

  document.title = `${display.textContent} - ${timerState.mode}`;
}

function switchMode() {
  beep.play();

  if (timerState.mode === "focus") {
    timerState.sessions++;

    // every 4 sessions → long break
    if (timerState.sessions % 4 === 0) {
      timerState.mode = "longBreak";
      timerState.timeLeft = timerState.longBreak;
    } else {
      timerState.mode = "break";
      timerState.timeLeft = timerState.shortBreak;
    }

  } else {
    timerState.mode = "focus";
    timerState.timeLeft = timerState.work;
  }
}

function startTimer() {
  if (timerState.running) return;

  const w = parseInt(document.getElementById("workTime").value);
  const b = parseInt(document.getElementById("breakTime").value);

  if (w > 0) timerState.work = w * 60;
  if (b > 0) timerState.shortBreak = b * 60;

  timerState.running = true;

  timer = setInterval(() => {
    timerState.timeLeft--;

    if (timerState.timeLeft <= 0) {
      switchMode();
    }

    updateUI();
  }, 1000);
}

function pauseTimer() {
  clearInterval(timer);
  timerState.running = false;
}

function resetTimer() {
  clearInterval(timer);
  timerState.running = false;

  timerState.mode = "focus";
  timerState.timeLeft = timerState.work;
  timerState.sessions = 0;

  updateUI();
}

document.getElementById("startTimer").onclick = startTimer;
document.getElementById("pauseTimer").onclick = pauseTimer;
document.getElementById("resetTimer").onclick = resetTimer;

updateUI();

const notesKey = "notes_v2";

function getNotes() {
  return JSON.parse(localStorage.getItem(notesKey) || "[]");
}

function saveNotes(notes) {
  localStorage.setItem(notesKey, JSON.stringify(notes));
}

function renderNotes() {
  const list = document.getElementById("notesList");
  list.innerHTML = "";

  getNotes().forEach(note => {
    const div = document.createElement("div");
    div.className = "note";

    const p = document.createElement("p");
    p.textContent = note.text;

    const del = document.createElement("button");
    del.textContent = "Delete";
    del.onclick = () => {
      saveNotes(getNotes().filter(n => n.id !== note.id));
      renderNotes();
    };

    div.append(p, del);
    list.appendChild(div);
  });
}

document.getElementById("saveNote").onclick = () => {
  const text = document.getElementById("noteInput").value.trim();
  if (!text) return;

  const notes = getNotes();
  notes.push({ id: Date.now(), text });

  saveNotes(notes);
  renderNotes();
};

document.getElementById("searchNotes").oninput = (e) => {
  const term = e.target.value.toLowerCase();

  document.querySelectorAll(".note").forEach(n => {
    n.style.display = n.innerText.toLowerCase().includes(term) ? "block" : "none";
  });
};

renderNotes();



const stopWords = new Set([
  "the","is","in","and","to","of","a","for","on","with",
  "as","by","at","an","be","this","that","it","from","or"
]);

document.getElementById("summarizeBtn").onclick = () => {
  const text = document.getElementById("inputText").value.trim();
  const output = document.getElementById("summaryOutput");

  if (!text) {
    output.textContent = "Please enter text.";
    return;
  }

  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];

  if (sentences.length <= 2) {
    output.textContent = text;
    return;
  }

  // Step 1: word frequency
  const words = text.toLowerCase().match(/\w+/g) || [];
  const freq = {};

  words.forEach(word => {
    if (!stopWords.has(word)) {
      freq[word] = (freq[word] || 0) + 1;
    }
  });

  // Step 2: normalize frequency
  const maxFreq = Math.max(...Object.values(freq));

  Object.keys(freq).forEach(word => {
    freq[word] = freq[word] / maxFreq;
  });

  // Step 3: score sentences
  const scored = sentences.map((sentence, index) => {
    const sWords = sentence.toLowerCase().match(/\w+/g) || [];

    if (sWords.length < 5) return null; // ignore weak sentences

    let score = 0;

    sWords.forEach(word => {
      if (freq[word]) score += freq[word];
    });

    return { sentence, score, index };
  }).filter(Boolean);

  if (scored.length === 0) {
    output.textContent = text;
    return;
  }

  // Step 4: pick top sentences (30%)
  const selectCount = Math.ceil(scored.length * 0.3);

  const top = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, selectCount);

  // Step 5: restore original order
  top.sort((a, b) => a.index - b.index);

  output.textContent = top.map(s => s.sentence.trim()).join(" ");
};