// ========== VALIDATE BREAK TIME (HH:mm:ss) ==========
function validateBreakTime() {
  const breakInputs = document.querySelectorAll(".break-input");
  const error = document.getElementById("break-error");
  let totalBreakSeconds = 0;

  breakInputs.forEach((input) => {
    if (input.value) {
      const parts = input.value.split(":").map(Number);
      const h = parts[0] || 0;
      const m = parts[1] || 0;
      const s = parts[2] || 0;
      totalBreakSeconds += h * 3600 + m * 60 + s;
    }
  });

  // Limit to 8 hours (28800 seconds)
  if (totalBreakSeconds > 28800) {
    error.style.display = "inline";
  } else {
    error.style.display = "none";
  }
}

// ========== ADD NEW BREAK INPUT ==========
document.getElementById("add-break").addEventListener("click", function () {
  const breakContainer = document.getElementById("break-container");

  const breakGroup = document.createElement("div");
  breakGroup.classList.add("break-time-group");

  const newBreakInput = document.createElement("input");
  newBreakInput.type = "time";
  newBreakInput.className = "break-input";
  newBreakInput.step = "1"; // allow seconds
   newBreakInput.value = "00:00:00";
  newBreakInput.oninput = validateBreakTime;

  const removeBtn = document.createElement("button");
  removeBtn.className = "remove-btn";
  removeBtn.textContent = "❌";
  removeBtn.onclick = function () {
    breakGroup.remove();
    validateBreakTime();
  };

  breakGroup.appendChild(newBreakInput);
  breakGroup.appendChild(removeBtn);

  breakContainer.insertBefore(breakGroup, document.getElementById("add-break"));
});

// ========== CALCULATE OUT TIME ==========
function calculateOutTime(hoursToWork) {
  const inTimeInput = document.getElementById("in-time").value;
  const resultDiv = document.getElementById("result");

  if (!inTimeInput) {
    resultDiv.textContent = "Please enter your In Time.";
    return;
  }

  const inParts = inTimeInput.split(":").map(Number);
  const inH = inParts[0] || 0;
  const inM = inParts[1] || 0;
  const inS = inParts[2] || 0;
  let totalSeconds = inH * 3600 + inM * 60 + inS;

  // Calculate total break seconds
  const breakInputs = document.querySelectorAll(".break-input");
  let totalBreakSeconds = 0;

  breakInputs.forEach((input) => {
    if (input.value) {
      const parts = input.value.split(":").map(Number);
      const h = parts[0] || 0;
      const m = parts[1] || 0;
      const s = parts[2] || 0;
      totalBreakSeconds += h * 3600 + m * 60 + s;
    }
  });

  if (totalBreakSeconds > 28800) {
    document.getElementById("break-error").style.display = "inline";
    return;
  } else {
    document.getElementById("break-error").style.display = "none";
  }

  // Add work time + breaks
  totalSeconds += hoursToWork * 3600 + totalBreakSeconds;

  // Convert back to HH:mm:ss 12-hour format
  const outHours24 = Math.floor(totalSeconds / 3600) % 24;
  const outMinutes = Math.floor((totalSeconds % 3600) / 60);
  const outSeconds = Math.floor(totalSeconds % 60);
  const period = outHours24 >= 12 ? "PM" : "AM";
  const outHours12 = outHours24 % 12 || 12;

  const formattedOutTime = `${String(outHours12).padStart(2, "0")}:${String(
    outMinutes
  ).padStart(2, "0")}:${String(outSeconds).padStart(2, "0")} ${period}`;

  resultDiv.innerHTML = `
    <strong>Out Time (${hoursToWork} Hours):</strong> ${formattedOutTime} <br>
    <small>Total Break: ${Math.floor(totalBreakSeconds / 60)} min ${totalBreakSeconds % 60} sec</small>
  `;
}
