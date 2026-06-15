// ========== COLLAPSIBLE CARDS ==========

function toggleMoreShifts() {
  const body    = document.getElementById("more-shifts-body");
  const label   = document.getElementById("expand-shifts-label");
  const chevron = document.getElementById("expand-shifts-chevron");
  const isOpen  = body.classList.contains("open");
  body.classList.toggle("open", !isOpen);
  label.textContent = isOpen ? "More shifts" : "Less";
  chevron.style.transform = isOpen ? "" : "rotate(180deg)";
}

function toggleBreakTime() {
  const header = document.getElementById("break-header-btn");
  const body   = document.getElementById("break-body");
  const isOpen = header.getAttribute("aria-expanded") === "true";
  header.setAttribute("aria-expanded", isOpen ? "false" : "true");
  body.classList.toggle("open", !isOpen);
}

function toggleCustomCalc() {
  const header  = document.getElementById("custom-calc-header-btn");
  const body    = document.getElementById("custom-calc-body");
  const presets = document.getElementById("shift-presets-card");
  const isOpen  = header.getAttribute("aria-expanded") === "true";

  header.setAttribute("aria-expanded", isOpen ? "false" : "true");
  body.classList.toggle("open", !isOpen);
  presets.classList.toggle("hidden-card", !isOpen);
}

// ========== HERO PHRASE ROTATION ==========

document.addEventListener("DOMContentLoaded", function () {
  const line1 = document.getElementById("hero-line1");
  const line2 = document.getElementById("hero-phrase");
  if (!line1 || !line2) return;

  // Pairs: [first line, second line (gradient)]
  const phrases = [
    ["Know exactly",   "when to leave"],
    ["Work smarter,",  "not harder"],
    ["Own your time,", "own your day"],
    ["Leave on time",  "every time"],
    ["Plan smart,",    "live better"],
  ];
  let idx = 0;

  function animOut(el, delay) {
    setTimeout(function () {
      el.style.opacity = "0";
      el.style.transform = "translateY(-10px)";
    }, delay);
  }

  function animIn(el, text, delay) {
    setTimeout(function () {
      el.style.transition = "none";
      el.style.transform = "translateY(13px)";
      el.textContent = text;
      void el.offsetWidth; // force reflow
      el.style.transition = "";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, delay);
  }

  function rotate() {
    // Exit: line1 leads, line2 follows 55ms later
    animOut(line1, 0);
    animOut(line2, 55);

    idx = (idx + 1) % phrases.length;

    // Enter: after exit finishes, line1 first, line2 70ms later
    animIn(line1, phrases[idx][0], 360);
    animIn(line2, phrases[idx][1], 430);
  }

  // Start cycling after 2.5s, then every 3.5s
  setTimeout(function () {
    setInterval(rotate, 3500);
  }, 2500);
});


// ========== THEME TOGGLE ==========

function toggleTheme() {
  const html  = document.documentElement;
  const next  = html.getAttribute("data-theme") === "light" ? "dark" : "light";
  html.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
}


// ========== TOASTER UI ==========

// Add toast container automatically if missing
document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("toast-container")) {
    const div = document.createElement("div");
    div.id = "toast-container";
    div.className = "fixed top-4 right-4 z-[9999] space-y-3";
    document.body.appendChild(div);
  }
});

// ========== TOAST SYSTEM — Glassmorphism ==========
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  container.innerHTML = "";

  const icons = {
    success: "check_circle",
    error:   "cancel",
    warning: "warning",
    info:    "info"
  };

  const toast = document.createElement("div");
  toast.className = `glass-toast glass-toast-${type} animate-toast-down pointer-events-auto`;
  toast.innerHTML = `
    <span class="material-symbols-outlined glass-toast-icon">${icons[type] || icons.info}</span>
    <span class="glass-toast-msg">${message}</span>
    <div class="glass-toast-bar animate-progress"></div>
  `;

  container.appendChild(toast);

  if (navigator.vibrate) navigator.vibrate(50);

  setTimeout(() => {
    toast.classList.add("animate-toast-up");
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}



// ========== HELPER: PARSE BREAK INPUT (flexible formats) ==========
function parseBreakToSeconds(raw) {
  if (!raw && raw !== "0") return NaN;
  const s = String(raw).trim();

  if (/^\d+$/.test(s)) return parseInt(s, 10) * 60;

  if (s.includes(":")) {
    const parts = s.split(":").map(p => p.trim());
    if (parts.length === 3) {
      const [hh, mm, ss] = parts.map(Number);
      if (hh >= 0 && mm >= 0 && mm < 60 && ss >= 0 && ss < 60)
        return hh * 3600 + mm * 60 + ss;
    } else if (parts.length === 2) {
      const [hh, mm] = parts.map(Number);
      if (hh >= 0 && mm >= 0 && mm < 60) return hh * 3600 + mm * 60;
    }
  }
  return NaN;
}



// ========== VALIDATE BREAK TIME ==========
function validateBreakTime() {
  const breakInputs = document.querySelectorAll(".break-input");
  const error = document.getElementById("break-error");
  let totalBreakSeconds = 0;
  let hasInvalid = false;

  breakInputs.forEach(input => {
    const raw = input.value;
    if (raw !== "") {
      const seconds = parseBreakToSeconds(raw);
      if (Number.isNaN(seconds)) {
        hasInvalid = true;
        input.style.border = "2px solid red";
      } else {
        input.style.border = "1px solid #ccc";
        totalBreakSeconds += seconds;
      }
    } else input.style.border = "1px solid #ccc";
  });

  if (hasInvalid) {
    error.textContent = "Invalid format. Use 45 or HH:mm[:ss].";
    error.style.display = "inline";
    return false;
  } else if (totalBreakSeconds > 28800) {
    error.textContent = "Break time cannot exceed 8 hours.";
    error.style.display = "inline";
    return false;
  } else {
    error.style.display = "none";
    return true;
  }
}



// ========== ADD NEW BREAK INPUT ==========
// ========== BREAK INPUT SYSTEM (Button + Enter + Backspace) ==========

document.addEventListener("DOMContentLoaded", function () {

  const breakContainer = document.getElementById("break-container");
  const addBreakBtn = document.getElementById("add-break");

  // Function to attach keyboard events
  function attachInputEvents(input) {

    // Validate while typing
    input.addEventListener("input", validateBreakTime);

    input.addEventListener("keydown", function (e) {

      // 🔥 ENTER → Add new input
      if (e.key === "Enter") {
        e.preventDefault();
        const newInputGroup = createBreakInput();
        breakContainer.insertBefore(newInputGroup, addBreakBtn);
        newInputGroup.querySelector("input").focus();
      }

      // 🔥 BACKSPACE on empty → Remove input (except first)
      if (e.key === "Backspace" && input.value === "") {
        const allGroups = document.querySelectorAll(".break-time-group");

        if (allGroups.length > 1) {
          e.preventDefault();

          const group = input.closest(".break-time-group");
          const prev = group.previousElementSibling;

          group.remove();

          if (prev) {
            const prevInput = prev.querySelector("input");
            if (prevInput) prevInput.focus();
          }
        }
      }

    });
  }

  // Function to create new break input group
  function createBreakInput() {

    const breakGroup = document.createElement("div");
    breakGroup.classList.add("break-time-group", "flex", "items-center", "gap-2");

    const newBreakInput = document.createElement("input");
    newBreakInput.type = "text";
    newBreakInput.className = "break-input glass-input-flex";
    newBreakInput.placeholder = "e.g. 45 or 00:45:00 or 1:30";
    newBreakInput.inputMode = "numeric";

    attachInputEvents(newBreakInput);

    // Remove button
    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";

    removeBtn.innerHTML =
      '<span class="material-symbols-outlined text-base sm:text-lg">remove</span>';

    removeBtn.onclick = () => {
      const allGroups = document.querySelectorAll(".break-time-group");

      if (allGroups.length > 1) {
        breakGroup.remove();
      }
    };

    breakGroup.appendChild(newBreakInput);
    breakGroup.appendChild(removeBtn);

    return breakGroup;
  }

  // Button click → Add break
  addBreakBtn.addEventListener("click", function () {
    const newInputGroup = createBreakInput();
    breakContainer.insertBefore(newInputGroup, addBreakBtn);
    newInputGroup.querySelector("input").focus();
  });

  // Attach events to existing first input
  document.querySelectorAll(".break-input").forEach(input => {
    attachInputEvents(input);
  });

});

function formatHours(hoursDecimal) {
  const hrs = Math.floor(hoursDecimal);
  const mins = Math.round((hoursDecimal - hrs) * 60);
  return `${hrs}h ${mins}m`;
}


// ========== CALCULATE OUT TIME WITH TOAST ==========
function calculateOutTime(hoursToWork) {
  const inTimeInput = document.getElementById("in-time").value;
  const resultDiv = document.getElementById("result");

  if (!inTimeInput) {
    showToast("Please enter your In Time.", "error");
    return;
  }
  if (!validateBreakTime()) return;

  const [inH, inM, inS = 0] = inTimeInput.split(":").map(Number);

  const inDate = new Date();
  inDate.setHours(inH, inM, inS, 0);

  let totalBreakSeconds = 0;
  document.querySelectorAll(".break-input").forEach(input => {
    const seconds = parseBreakToSeconds(input.value);
    if (!Number.isNaN(seconds)) totalBreakSeconds += seconds;
  });

  const targetOut = new Date(inDate.getTime() + (hoursToWork * 3600 * 1000) + (totalBreakSeconds * 1000));

  const now = new Date();
  let diffMs = targetOut - now;

  if (diffMs > 0) {
    const diffSec = Math.floor(diffMs / 1000);
    const hrs = Math.floor(diffSec / 3600);
    const mins = Math.floor((diffSec % 3600) / 60);
    const formattedWorkHours = formatHours(hoursToWork);

    showToast(`⏳ You still need ${hrs} hr ${mins} min to complete ${formattedWorkHours}.`, "info");

  } else {
    showToast("🎉 You already completed your hours — go now leave!", "success");
  }

  let totalSeconds = inH * 3600 + inM * 60 + inS;
  totalSeconds += hoursToWork * 3600 + totalBreakSeconds;

  const outHours24 = Math.floor(totalSeconds / 3600) % 24;
  const outMinutes = Math.floor((totalSeconds % 3600) / 60);
  const period = outHours24 >= 12 ? "PM" : "AM";
  const outHours12 = outHours24 % 12 || 12;

  const formattedOutTime =
    `${String(outHours12).padStart(2, "0")}:${String(outMinutes).padStart(2, "0")} ${period}`;

  resultDiv.innerHTML = `
    <div class="result-card fade-card">
      <div class="result-glow"></div>
      <p class="result-eyebrow">Your Out-Time</p>
      <p class="result-time-display">${formattedOutTime}</p>
      <div class="result-badge">
        <span class="material-symbols-outlined" style="font-size:13px">coffee</span>
        Total Break: <span style="font-weight:700;margin-left:4px">${Math.floor(totalBreakSeconds / 60)} min</span>
      </div>
    </div>
  `;

  // On mobile, scroll result into view so user doesn't have to scroll manually
  if (window.innerWidth < 1024) {
    setTimeout(function () {
      document.getElementById("result-section").scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }
}


function dismissBanner() {
  const banner = document.getElementById("feature-banner");
  banner.classList.remove("animate-fade-in");
  banner.classList.add("animate-fade-out");

  setTimeout(() => {
    banner.remove();
  }, 400);
}


// ========== COMPLETED TILL NOW ==========
function calculateCompletedTillNow() {
  const inTimeInput = document.getElementById("in-time").value;
  if (!inTimeInput) {
    showToast("Please enter your In Time.", "error");
    return;
  }
  if (!validateBreakTime()) return;

  const [inH, inM, inS = 0] = inTimeInput.split(":").map(Number);

  const inDate = new Date();
  inDate.setHours(inH, inM, inS, 0);

  let totalBreakSeconds = 0;
  document.querySelectorAll(".break-input").forEach(input => {
    const sec = parseBreakToSeconds(input.value);
    if (!Number.isNaN(sec)) totalBreakSeconds += sec;
  });

  const now = new Date();
  let workedSeconds = (now - inDate) / 1000 - totalBreakSeconds;

  if (workedSeconds <= 0) {
    showToast("You haven't completed any work yet.", "warning");
    return;
  }

  const hrs = Math.floor(workedSeconds / 3600);
  const mins = Math.floor((workedSeconds % 3600) / 60);

  showToast(`✅ You have completed ${hrs} hr ${mins} min so far.`, "success");
}


// ========== CUSTOM HOURS ==========
function calculateCustomHours() {
  const h = parseInt(document.getElementById("custom-hours").value || 0);
  const m = parseInt(document.getElementById("custom-minutes").value || 0);

  if (h === 0 && m === 0) {
    showToast("Please enter custom hours or minutes.", "error");
    return;
  }
  if (m >= 60) {
    showToast("Minutes must be less than 60.", "warning");
    return;
  }

  const decimalHours = h + m / 60;
  calculateOutTime(decimalHours);
}


// Auto-hide after 5 seconds (optional)
// setTimeout(() => dismissBanner(), 5000);

