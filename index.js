// ========== VALIDATE BREAK TIME ==========
function validateBreakTime() {
  const breakInputs = document.querySelectorAll(".break-input");
  const error = document.getElementById("break-error");
  let totalBreakMinutes = 0;

  breakInputs.forEach((input) => {
    const breakUnit = input.nextElementSibling.value;
    let breakMinutes =
      breakUnit === "hours"
        ? parseFloat(input.value || 0) * 60
        : parseFloat(input.value || 0);
    totalBreakMinutes += breakMinutes;
  });

  if (totalBreakMinutes > 480) {
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
  newBreakInput.type = "number";
  newBreakInput.className = "break-input";
  newBreakInput.placeholder = "Enter break time";
  newBreakInput.oninput = validateBreakTime;

  const newBreakSelect = document.createElement("select");
  newBreakSelect.innerHTML = `
    <option value="minutes">Minutes</option>
    <option value="hours">Hours</option>
  `;
  newBreakSelect.onchange = validateBreakTime;

  // Create remove button
  const removeBtn = document.createElement("button");
  removeBtn.className = "remove-btn";
  removeBtn.textContent = "❌";
  removeBtn.onclick = function () {
    breakGroup.remove();      // Remove the entire break group
    validateBreakTime();      // Recalculate total breaks
  };

  breakGroup.appendChild(newBreakInput);
  breakGroup.appendChild(newBreakSelect);
  breakGroup.appendChild(removeBtn);

  // Insert ABOVE the "Add Break" button
  breakContainer.insertBefore(breakGroup, document.getElementById("add-break"));

  // Adjust container height dynamically
  document.querySelector(".container").style.minHeight = "auto";
});

// ========== CALCULATE OUT TIME ==========
function calculateOutTime(hoursToWork) {
  const inTimeInput = document.getElementById("in-time").value;
  const resultDiv = document.getElementById("result");

  if (!inTimeInput) {
    resultDiv.textContent = "Please enter your In Time.";
    return;
  }

  // Convert In Time to total minutes
  const [hours, minutes] = inTimeInput.split(":").map(Number);
  let totalMinutes = hours * 60 + minutes;

  // Calculate total break time (including first one)
  const breakInputs = document.querySelectorAll(".break-input");
  let totalBreakMinutes = 0;

  breakInputs.forEach((input) => {
    const breakUnit = input.nextElementSibling.value;
    let breakMinutes =
      breakUnit === "hours"
        ? parseFloat(input.value || 0) * 60
        : parseFloat(input.value || 0);
    totalBreakMinutes += breakMinutes;
  });

  // Validate total break
  if (totalBreakMinutes > 480) {
    document.getElementById("break-error").style.display = "inline";
    return;
  } else {
    document.getElementById("break-error").style.display = "none";
  }

  // Add work duration + total breaks
  totalMinutes += hoursToWork * 60 + totalBreakMinutes;

  // Convert back to HH:MM AM/PM
  const outHours24 = Math.floor(totalMinutes / 60) % 24;
  const outMinutes = totalMinutes % 60;
  const period = outHours24 >= 12 ? "PM" : "AM";
  const outHours12 = outHours24 % 12 || 12;
  const formattedOutTime = `${String(outHours12).padStart(2, "0")}:${String(
    outMinutes
  ).padStart(2, "0")} ${period}`;

  resultDiv.innerHTML = `
    <strong>Out Time (${hoursToWork} Hours):</strong> ${formattedOutTime} <br>
    <small>Total Break: ${totalBreakMinutes} minutes</small>
  `;
}
