/**
 * weather.js - Widget météo via wttr.in
 */
async function fetchWeather() {
  const tempEl = document.getElementById('weather-temp');
  const iconEl = document.getElementById('weather-icon');
  if (!tempEl || !iconEl) return;

  try {
    const res = await fetch('https://wttr.in/?format=j1');
    if (!res.ok) throw new Error();
    const data = await res.json();
    const current = data.current_condition[0];
    const temp = current.temp_C;
    const desc = current.weatherDesc[0].value.toLowerCase();
    tempEl.textContent = `${temp}°C ~ ${desc}`;

    if (desc.includes('rain') || desc.includes('drizzle')) {
      iconEl.className = 'fa-solid fa-cloud-rain';
    } else if (desc.includes('clear') || desc.includes('sun')) {
      iconEl.className = 'fa-solid fa-sun';
    } else if (desc.includes('snow')) {
      iconEl.className = 'fa-solid fa-snowflake';
    } else {
      iconEl.className = 'fa-solid fa-cloud';
    }
  } catch {
    tempEl.textContent = 'offline';
  }
}

function initWeather() {
  fetchWeather();
  setInterval(fetchWeather, 1800000); // 30 minutes
}
