document.addEventListener("DOMContentLoaded", () => {

  // ===================== NAV TABS =====================
  document.querySelectorAll("nav button").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll("nav button").forEach(b => b.classList.remove("active"));

      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
    };
  });

  // ===================== GPA =====================
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

    gpaResult.innerHTML =
      `GPA: ${(totalPoints / totalCredits).toFixed(2)} <br>Credits: ${totalCredits}`;
  };

  createSubjectRow();

  // ===================== TIMER =====================
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
    } else {
      modeLabel.textContent = "Break Time";
      hint.textContent = breakTips[Math.floor(Math.random() * breakTips.length)];
    }

    document.title = `${display.textContent} - ${timerState.mode}`;
  }

  function switchMode() {
    beep.play();

    if (timerState.mode === "focus") {
      timerState.sessions++;

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

      if (timerState.timeLeft <= 0) switchMode();

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

  // ===================== NOTES =====================
  function getNotes() {
    return JSON.parse(localStorage.getItem("notes_v2") || "[]");
  }

  function saveNotes(notes) {
    localStorage.setItem("notes_v2", JSON.stringify(notes));
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
      n.style.display =
        n.innerText.toLowerCase().includes(term) ? "block" : "none";
    });
  };

  renderNotes();

  // ===================== SUMMARIZER =====================
  document.getElementById("summarizeBtn").onclick = () => {
    const text = document.getElementById("inputText").value.trim();
    const output = document.getElementById("summaryOutput");

    if (!text) {
      output.textContent = "Please enter text.";
      return;
    }

    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

    if (sentences.length <= 2) {
      output.textContent = text;
      return;
    }

    const stopWords = new Set([
      "the","is","in","and","to","of","a","for","on","with",
      "as","by","at","an","be","this","that","it","from","or"
    ]);

    const words = text.toLowerCase().match(/\w+/g) || [];

    const freq = {};
    words.forEach(w => {
      if (!stopWords.has(w)) {
        freq[w] = (freq[w] || 0) + 1;
      }
    });

    const maxFreq = Math.max(...Object.values(freq));

    for (let w in freq) freq[w] /= maxFreq;

    const scored = sentences.map((s, i) => {
      const ws = s.toLowerCase().match(/\w+/g) || [];
      let score = 0;

      ws.forEach(w => {
        if (freq[w]) score += freq[w];
      });

      return { s, score, i };
    });

    const top = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.ceil(scored.length * 0.4))
      .sort((a, b) => a.i - b.i);

    output.innerHTML = top.map(x => "• " + x.s.trim()).join("<br><br>");
  };

});