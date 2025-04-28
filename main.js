import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid'; 
import '@fullcalendar/core/main.css';
import '@fullcalendar/daygrid/main.css'; // Day grid view (month view)

// Initialize the calendar
const calendar = new Calendar(document.getElementById('calendar'), {
  plugins: [dayGridPlugin],
  initialView: 'dayGridMonth', // Set the default view to month
  events: []  // Array to hold the farm tasks (will be populated later)
});

calendar.render();
calendar.on('dateClick', function(info) {
  const taskTitle = prompt("Enter a task (e.g., Water plants):");
  if (taskTitle) {
    calendar.addEvent({
      title: taskTitle,
      start: info.dateStr,
      allDay: true
    });
  }
});
// Save events to LocalStorage
function saveEvents() {
  const events = calendar.getEvents().map(event => ({
    title: event.title,
    start: event.start.toISOString(),
    end: event.end ? event.end.toISOString() : null
  }));
  localStorage.setItem('farmTasks', JSON.stringify(events));
}

// Load events from LocalStorage
function loadEvents() {
  const savedEvents = JSON.parse(localStorage.getItem('farmTasks')) || [];
  savedEvents.forEach(event => {
    calendar.addEvent({
      title: event.title,
      start: event.start,
      end: event.end
    });
  });
}

// Initialize and load events on page load
document.addEventListener('DOMContentLoaded', () => {
  loadEvents();
  calendar.render();
});

// Save events on every change
calendar.on('eventAdd', saveEvents);
calendar.on('eventChange', saveEvents);
calendar.on('eventRemove', saveEvents);
// Save events to LocalStorage
function saveEvents() {
  const events = calendar.getEvents().map(event => ({
    title: event.title,
    start: event.start.toISOString(),
    end: event.end ? event.end.toISOString() : null
  }));
  localStorage.setItem('farmTasks', JSON.stringify(events));
}

// Load events from LocalStorage
function loadEvents() {
  const savedEvents = JSON.parse(localStorage.getItem('farmTasks')) || [];
  savedEvents.forEach(event => {
    calendar.addEvent({
      title: event.title,
      start: event.start,
      end: event.end
    });
  });
}

// Initialize and load events on page load
document.addEventListener('DOMContentLoaded', () => {
  loadEvents();
  calendar.render();
});

// Save events on every change
calendar.on('eventAdd', saveEvents);
calendar.on('eventChange', saveEvents);
calendar.on('eventRemove', saveEvents);
// Request notification permission
if (Notification.permission !== 'granted') {
  Notification.requestPermission();
}

// Show notification when the task is due
function sendNotification(taskTitle) {
  if (Notification.permission === 'granted') {
    new Notification('Farm Task Reminder', {
      body: `Reminder: ${taskTitle}`,
      icon: '/path/to/icon.png'
    });
  }
}

// Call this function for reminders
sendNotification("Water plants today!");




document.querySelector('#app').innerHTML = `
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
      <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
    </a>
    <h1>Hello Vite!</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite logo to learn more
    </p>
  </div>
  <script>
  document.addEventListener('DOMContentLoaded', () => {
    const tips = [
      "🌱 Rotate your crops yearly to maintain soil fertility.",
      "💧 Water early in the morning to reduce evaporation loss.",
      "🌾 Use organic compost to enrich soil naturally.",
      "🐛 Check plants weekly to catch pests before they spread.",
      "🪵 Mulch your soil to retain moisture and suppress weeds.",
      "☀️ Dry harvested crops in sunlight to improve shelf life.",
      "📦 Store seeds in a cool, dry place to preserve quality."
    ];

    const tipText = document.getElementById('tip-text');
    if (tipText) {
      const tipIndex = new Date().getDate() % tips.length;
      tipText.textContent = tips[tipIndex];
    }
  });
</script>

import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'

document.querySelector('#app').innerHTML = `
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
      <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
    </a>
    <h1>Hello Vite!</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite logo to learn more
    </p>

    <!-- Add Tip of the Day Section -->
    <section class="daily-tip">
      <h2>🌿 Tip of the Day</h2>
      <p id="tip-text">Loading tip...</p>
    </section>
  </div>
`;

document.addEventListener('DOMContentLoaded', () => {
  const tips = [
    "🌱 Rotate your crops yearly to maintain soil fertility.",
    "💧 Water early in the morning to reduce evaporation loss.",
    "🌾 Use organic compost to enrich soil naturally.",
    "🐛 Check plants weekly to catch pests before they spread.",
    "🪵 Mulch your soil to retain moisture and suppress weeds.",
    "☀️ Dry harvested crops in sunlight to improve shelf life.",
    "📦 Store seeds in a cool, dry place to preserve quality."
  ];

  const tipText = document.getElementById('tip-text');
  if (tipText) {
    // Select tip based on the current day of the month
    const tipIndex = new Date().getDate() % tips.length;
    tipText.textContent = tips[tipIndex];
  }
});

setupCounter(document.querySelector('#counter'))


setupCounter(document.querySelector('#counter'))
