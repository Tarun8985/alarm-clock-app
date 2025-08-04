let alarms = JSON.parse(localStorage.getItem("alarms")) || [];
let is24Hour = document.getElementById("toggleFormat")?.checked ?? true;
let currentTone = document.getElementById("tone")?.value || "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg";
const alarmAudio = document.getElementById("alarmSound");
alarmAudio.loop = true; // Enable loop for alarm sound

function updateClock() {
  const now = new Date();
  const options = { hour12: !is24Hour, hour: '2-digit', minute: '2-digit', second: '2-digit' };
  const timeStr = now.toLocaleTimeString('en-US', options);
  document.getElementById("clock").textContent = timeStr;
  const matchTime = now.toTimeString().split(" ")[0];
  checkAlarms(matchTime);
}

function checkAlarms(currentTime) {
  alarms.forEach((alarm, index) => {
    if (alarm.time === currentTime && alarm.enabled && !alarm.rang) {
      alarmAudio.src = currentTone;
      alarmAudio.play();
      alarm.rang = true;
      saveAlarms();

      
      showAlarmModal(alarm.time, index);
    }
  });
}
function changeTone() {
  currentTone = document.getElementById("tone").value;
}

function uploadCustomTone() {
  const fileInput = document.getElementById("customTone");
  const file = fileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      currentTone = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}
let currentRingingIndex = null;

function showAlarmModal(time, index) {
  currentRingingIndex = index;
  document.getElementById("modalTimeText").textContent = `Alarm ringing at ${time}`;
  document.getElementById("alarmModal").style.display = "flex";
}

function handleSnooze() {
  if (currentRingingIndex !== null) {
    snoozeAlarm(currentRingingIndex);
    currentRingingIndex = null;
  }
  closeModal();
}

function dismissAlarm() {
  alarmAudio.pause();
  alarmAudio.currentTime = 0;
  currentRingingIndex = null;
  closeModal();
}

function closeModal() {
  document.getElementById("alarmModal").style.display = "none";
}

function snoozeAlarm(index) {
  alarmAudio.pause(); 
  alarmAudio.currentTime = 0;

  const alarm = alarms[index];
  const [h, m, s] = alarm.time.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m, s);
  date.setMinutes(date.getMinutes() + 5);

  const newTime = date.toTimeString().split(" ")[0];


  alarms[index].rang = true;


  alarms.push({ time: newTime, enabled: true, rang: false });

  saveAlarms();
  renderAlarms();
}

function renderAlarms() {
  const alarmList = document.getElementById("alarmList");
  alarmList.innerHTML = "";
  alarms.forEach((alarm, index) => {
    const li = document.createElement("li");
    li.className = "alarm-item";
    li.innerHTML = `
      ${alarm.time} 
      <div class="alarm-controls">
        <button onclick="toggleAlarm(${index})">${alarm.enabled ? 'Disable' : 'Enable'}</button>
        <button onclick="deleteAlarm(${index})">Delete</button>
      </div>
    `;
    alarmList.appendChild(li);
  });
}

function setAlarm() {
  const alarmTime = document.getElementById("alarmTime").value;
  if (!alarmTime) return alert("Please select a valid time");
  const timeWithSeconds = alarmTime + ":00";
  alarms.push({ time: timeWithSeconds, enabled: true, rang: false });
  saveAlarms();
  renderAlarms();
}

function deleteAlarm(index) {
  alarms.splice(index, 1);
  saveAlarms();
  renderAlarms();
}

function toggleAlarm(index) {
  alarms[index].enabled = !alarms[index].enabled;
  saveAlarms();
  renderAlarms();
}

function toggleTimeFormat() {
  is24Hour = document.getElementById("toggleFormat").checked;
}

function saveAlarms() {
  localStorage.setItem("alarms", JSON.stringify(alarms));
}

setInterval(updateClock, 1000);
renderAlarms();