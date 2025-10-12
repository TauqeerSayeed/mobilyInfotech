function validateBreakTime() {
  const breakInput = document.getElementById("break-time");
  const breakUnit = document.getElementById("break-unit").value;
  const error = document.getElementById("break-error");

  let breakMinutes =
    breakUnit === "hours"
      ? parseFloat(breakInput.value || 0) * 60
      : parseFloat(breakInput.value || 0);

  if (breakMinutes > 480) {
    error.style.display = "inline";
  } else {
    error.style.display = "none";
  }
}

function calculateOutTime(hoursToWork) {
  const inTimeInput = document.getElementById("in-time").value;
  const breakTimeInput = parseFloat(document.getElementById("break-time").value) || 0;
  const breakUnit = document.getElementById("break-unit").value;
  const resultDiv = document.getElementById("result");

  if (!inTimeInput) {
    resultDiv.textContent = "Please enter your In Time.";
    return;
  }

  // Convert In Time to total minutes
  const [hours, minutes] = inTimeInput.split(":").map(Number);
  let totalMinutes = hours * 60 + minutes;

  // Convert break time to minutes
  let breakMinutes = breakUnit === "hours" ? breakTimeInput * 60 : breakTimeInput;

  // Validate break time
  if (breakMinutes > 480) {
    document.getElementById("break-error").style.display = "inline";
    return;
  } else {
    document.getElementById("break-error").style.display = "none";
  }

  // Add work hours + break
  totalMinutes += hoursToWork * 60 + breakMinutes;

  // Convert to 12-hour AM/PM format
  const outHours24 = Math.floor(totalMinutes / 60) % 24;
  const outMinutes = totalMinutes % 60;
  const period = outHours24 >= 12 ? "PM" : "AM";
  const outHours12 = outHours24 % 12 || 12;

  const formattedOutTime = `${String(outHours12).padStart(2, "0")}:${String(outMinutes).padStart(2, "0")} ${period}`;

  resultDiv.innerHTML = `<strong>Out Time (${hoursToWork} Hours):</strong> ${formattedOutTime}`;
  resultDiv.classList.add("allowed");
}

// Dark Mode Toggle
document.getElementById("dark-mode-toggle").addEventListener("click", function () {
  const body = document.body;
  body.classList.toggle("dark-mode");

  // Toggle button text
  this.textContent = body.classList.contains("dark-mode") ? "☀️ Light Mode" : "🌙 Dark Mode";
});
