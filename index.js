// Dark Mode Toggle
const toggleBtn = document.getElementById('dark-mode-toggle');

// Toggle dark mode class on body and change button text
toggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');

  if (document.body.classList.contains('dark-mode')) {
    toggleBtn.textContent = 'Light Mode';
  } else {
    toggleBtn.textContent = 'Dark Mode';
  }
});

// Validate Break Time Input
function validateBreakTime() {
  const breakInput = document.getElementById('break-time');
  const breakUnit = document.getElementById('break-unit').value;
  const breakError = document.getElementById('break-error');

  // Get value as float
  let breakValue = parseFloat(breakInput.value);

  // Hide error if value is invalid or empty
  if (isNaN(breakValue) || breakValue < 0) {
    breakError.style.display = 'none';
    return;
  }

  // Convert to minutes if user entered hours
  const breakInMinutes = breakUnit === "hours" ? breakValue * 60 : breakValue;

  // Show error if break exceeds 480 minutes (8 hours)
  if (breakInMinutes > 480) {
    breakError.style.display = 'block';
  } else {
    breakError.style.display = 'none';
  }
}

// Main Function to Calculate Out Time
function calculateOutTime() {
  const inTime = document.getElementById('in-time').value;
  const breakTimeRaw = parseFloat(document.getElementById('break-time').value);
  const breakUnit = document.getElementById('break-unit').value;
  const resultDiv = document.getElementById('result');
  const breakError = document.getElementById('break-error');

  // Reset result area
  resultDiv.textContent = "";
  resultDiv.className = "";

  // Validate inputs
  if (!inTime || isNaN(breakTimeRaw) || breakTimeRaw < 0) {
    alert("Please fill in all fields correctly.");
    return;
  }

  // Convert break time to minutes if needed
  const breakTime = breakUnit === "hours" ? breakTimeRaw * 60 : breakTimeRaw;

  // Check if break is too long
  if (breakTime > 480) {
    breakError.style.display = 'block';
    alert("Break time cannot exceed 480 minutes (8 hours).");
    return;
  }

  // Calculate required end time
  const requiredWorkTimeInMillis = 7.5 * 60 * 60 * 1000; // 7.5 hours in milliseconds
  const inDate = new Date(`2020-01-01T${inTime}:00`); // Use fixed date for time calculations
  const breakTimeInMillis = breakTime * 60000; // Convert minutes to milliseconds

  // Add work time and break to in-time
  const requiredEndTimeInMillis = inDate.getTime() + requiredWorkTimeInMillis + breakTimeInMillis;
  const requiredEndTime = new Date(requiredEndTimeInMillis);

  // Format the result for display
  let hours = requiredEndTime.getHours();
  let minutes = requiredEndTime.getMinutes();
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // Convert to 12-hour format
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

  // Show final message
  const outTimeMessage = `To work 7.5 hours, you need to leave at: ${hours}:${formattedMinutes} ${period}`;
  resultDiv.textContent = outTimeMessage;
  resultDiv.classList.add("allowed");


}
