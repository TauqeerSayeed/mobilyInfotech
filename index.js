function calculateOutTime() {
    // Get the input values
    let inTime = document.getElementById('in-time').value;
    let breakTime = parseInt(document.getElementById('break-time').value);
  
    if (!inTime || isNaN(breakTime) || breakTime < 0) {
      alert("Please fill in all fields correctly.");
      return;
    }
  
    // Total working time = 7.5 hours
    const requiredWorkTimeInMillis = 7.5 * 60 * 60 * 1000;
  
    // Convert In Time to Date object
    let inDate = new Date(`2020-01-01T${inTime}:00`);
  
    // Convert Break Time to milliseconds
    let breakTimeInMillis = breakTime * 60000;
  
    // Calculate required end time
    let requiredEndTimeInMillis = inDate.getTime() + requiredWorkTimeInMillis + breakTimeInMillis;
    let requiredEndTime = new Date(requiredEndTimeInMillis);
  
    let hours = requiredEndTime.getHours();
    let minutes = requiredEndTime.getMinutes();
  
    // Format time to 12-hour format
    let period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
  
    let formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  
    // Display result
    let outTimeMessage = `To work 7.5 hours, you need to leave at: ${hours}:${formattedMinutes} ${period}`;
    document.getElementById('result').textContent = outTimeMessage;
  }
  