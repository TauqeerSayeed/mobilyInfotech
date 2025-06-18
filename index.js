function validateBreakTime() {
    const breakInput = document.getElementById('break-time');
    const breakError = document.getElementById('break-error');
  
    if (parseInt(breakInput.value) > 480) {
      breakError.style.display = 'block';
    } else {
      breakError.style.display = 'none';
    }
  }
  
  function calculateOutTime() {
    const inTime = document.getElementById('in-time').value;
    const breakTime = parseInt(document.getElementById('break-time').value);
    const resultDiv = document.getElementById('result');
    const breakError = document.getElementById('break-error');
  
    // Reset result
    resultDiv.textContent = "";
    resultDiv.className = "";
  
    if (!inTime || isNaN(breakTime) || breakTime < 0) {
      alert("Please fill in all fields correctly.");
      return;
    }
  
    if (breakTime > 480) {
      breakError.style.display = 'block';
      alert("Break time cannot exceed 480 minutes (8 hours).");
      return;
    }
  
    const requiredWorkTimeInMillis = 7.5 * 60 * 60 * 1000;
    const inDate = new Date(`2020-01-01T${inTime}:00`);
    const breakTimeInMillis = breakTime * 60000;
  
    const requiredEndTimeInMillis = inDate.getTime() + requiredWorkTimeInMillis + breakTimeInMillis;
    const requiredEndTime = new Date(requiredEndTimeInMillis);
  
    let hours = requiredEndTime.getHours();
    let minutes = requiredEndTime.getMinutes();
  
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  
    const outTimeMessage = `To work 7.5 hours, you need to leave at: ${hours}:${formattedMinutes} ${period}`;
    resultDiv.textContent = outTimeMessage;
    resultDiv.classList.add("allowed");
  }
  