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

// ========== ADVANCED TOP TOAST SYSTEM ==========
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");

  // Clear previous toast
  container.innerHTML = "";

  // Icon based on type
  const icons = {
    success: "✔️",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️"
  };

  // Colors based on type
  const bgColors = {
    success: "bg-green-600",
    error: "bg-red-600",
    warning: "bg-yellow-600 text-black",
    info: "bg-blue-600"
  };

  // Toast element
  const toast = document.createElement("div");
  toast.className = `
    ${bgColors[type]} 
    flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white 
    animate-toast-down pointer-events-auto relative w-[90%] max-w-sm
  `;

  toast.innerHTML = `
    <span class="text-xl">${icons[type]}</span>
    <span class="text-sm font-medium flex-1">${message}</span>
    <div class="absolute bottom-0 left-0 h-[3px] bg-white/60 animate-progress w-full"></div>
  `;

  container.appendChild(toast);

  // Vibrate on mobile if supported
  if (navigator.vibrate) {
    navigator.vibrate(50);
  }

  // Auto remove
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
document.getElementById("add-break").addEventListener("click", function () {
  const breakContainer = document.getElementById("break-container");

  const breakGroup = document.createElement("div");
  breakGroup.classList.add("break-time-group", "flex", "items-center", "gap-2");

  const newBreakInput = document.createElement("input");
  newBreakInput.type = "text";
  newBreakInput.className =
    "break-input flex-1 rounded-lg border border-border-color bg-white px-3 py-2 sm:py-3 text-sm sm:text-base text-text-primary placeholder:text-text-secondary/70 focus:border-primary focus:ring-2 focus:ring-primary-light outline-none";
  newBreakInput.placeholder = "e.g. 45 or 00:45:00 or 1:30";
  newBreakInput.inputMode = "numeric";
  newBreakInput.oninput = validateBreakTime;

  const removeBtn = document.createElement("button");
  removeBtn.className =
    "remove-btn flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-lg sm:rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition";
  removeBtn.innerHTML = '<span class="material-symbols-outlined text-base sm:text-lg">remove</span>';
  removeBtn.onclick = () => {
    breakGroup.style.animation = "fadeSlideIn 0.3s reverse ease-out";
    setTimeout(() => breakGroup.remove(), 250);
  };

  breakGroup.appendChild(newBreakInput);
  breakGroup.appendChild(removeBtn);
  breakContainer.insertBefore(breakGroup, document.getElementById("add-break"));
  validateBreakTime();
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
    <div class="fade-card flex flex-col items-center justify-center text-center bg-white border border-slate-200 rounded-2xl p-8 shadow-card">
      <p class="text-base font-medium text-slate-600 mb-1">Your Out-Time is</p>
      <p class="text-5xl sm:text-6xl font-extrabold tracking-tight text-primary">${formattedOutTime}</p>
      <div class="mt-4 rounded-full bg-primary-light px-4 py-1.5 text-sm text-primary">
        <span>Total Break:</span>
        <span class="font-semibold">${Math.floor(totalBreakSeconds / 60)} minutes</span>
      </div>
    </div>
  `;
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

