/**
 * weather.js - Widget météo via wttr.in & Modale météo détaillée
 */

let cachedWeatherData = null;

const weatherDescFr = {
  'clear': 'Ciel dégagé',
  'sunny': 'Ensoleillé',
  'partly cloudy': 'Éclaircies',
  'cloudy': 'Nuageux',
  'overcast': 'Couvert',
  'mist': 'Brume',
  'fog': 'Brouillard',
  'light rain': 'Pluie légère',
  'moderate rain': 'Pluie modérée',
  'heavy rain': 'Forte pluie',
  'patchy rain nearby': 'Averses éparses',
  'patchy rain possible': 'Risque d\'averses',
  'light drizzle': 'Bruine légère',
  'drizzle': 'Bruine',
  'thunderstorm': 'Orage',
  'thundery outbreaks possible': 'Orages possibles',
  'light snow': 'Neige légère',
  'moderate snow': 'Neige modérée',
  'heavy snow': 'Forte neige',
  'sleet': 'Grésil',
  'blizzard': 'Blizzard'
};

function translateWeatherDesc(desc) {
  if (!desc) return '';
  const clean = desc.trim().toLowerCase();
  for (const [en, fr] of Object.entries(weatherDescFr)) {
    if (clean.includes(en)) return fr;
  }
  return desc.trim();
}

function getWeatherIconClass(desc) {
  if (!desc) return 'fa-solid fa-cloud';
  const d = desc.toLowerCase();
  if (d.includes('thunder') || d.includes('storm') || d.includes('orage')) {
    return 'fa-solid fa-cloud-bolt';
  } else if (d.includes('rain') || d.includes('drizzle') || d.includes('shower') || d.includes('pluie')) {
    return 'fa-solid fa-cloud-rain';
  } else if (d.includes('snow') || d.includes('ice') || d.includes('flurry') || d.includes('neige')) {
    return 'fa-solid fa-snowflake';
  } else if (d.includes('fog') || d.includes('mist') || d.includes('brume') || d.includes('brouillard')) {
    return 'fa-solid fa-smog';
  } else if (d.includes('clear') || d.includes('sun') || d.includes('ensoleillé')) {
    return 'fa-solid fa-sun';
  } else if (d.includes('partly cloudy') || d.includes('éclaircies')) {
    return 'fa-solid fa-cloud-sun';
  }
  return 'fa-solid fa-cloud';
}

function getSavedCity() {
  return (localStorage.getItem('startpage_weather_city') || '').trim();
}

function setSavedCity(city) {
  if (city) {
    localStorage.setItem('startpage_weather_city', city.trim());
  } else {
    localStorage.removeItem('startpage_weather_city');
  }
}

async function fetchWeather() {
  const tempEl = document.getElementById('weather-temp');
  const iconEl = document.getElementById('weather-icon');
  const city = getSavedCity();

  if (tempEl) tempEl.textContent = 'Chargement...';

  const queryUrl = city
    ? `https://wttr.in/${encodeURIComponent(city)}?format=j1`
    : 'https://wttr.in/?format=j1';

  try {
    const res = await fetch(queryUrl);
    if (!res.ok) throw new Error('Erreur de requête météo');
    const data = await res.json();
    if (!data.current_condition || !data.current_condition[0]) {
      throw new Error('Données météo invalides');
    }

    cachedWeatherData = data;
    const current = data.current_condition[0];
    const temp = current.temp_C;
    const rawDesc = current.weatherDesc[0]?.value || 'Météo';
    const frDesc = translateWeatherDesc(rawDesc);
    const iconClass = getWeatherIconClass(rawDesc);

    // Mettre à jour le widget dans la topbar
    if (tempEl) {
      tempEl.textContent = `${temp}°C ~ ${frDesc}`;
    }
    if (iconEl) {
      iconEl.className = iconClass;
    }

    // Mettre à jour l'effet météo d'arrière-plan
    if (typeof setWeatherFxCondition === 'function') {
      setWeatherFxCondition(rawDesc);
    }

    // Rafraîchir les informations de la modale si elle est ouverte
    renderWeatherModalDetails(data);
    return true;
  } catch (err) {
    if (tempEl) tempEl.textContent = city ? `offline (${city})` : 'offline';
    if (iconEl) iconEl.className = 'fa-solid fa-triangle-exclamation';
    return false;
  }
}

function renderWeatherModalDetails(data) {
  if (!data || !data.current_condition || !data.current_condition[0]) return;

  const current = data.current_condition[0];
  const area = data.nearest_area && data.nearest_area[0];
  const areaName = area?.areaName?.[0]?.value || getSavedCity() || 'Position locale';
  const country = area?.country?.[0]?.value || '';
  const fullLoc = country ? `${areaName}, ${country}` : areaName;

  const rawDesc = current.weatherDesc[0]?.value || '';
  const frDesc = translateWeatherDesc(rawDesc);
  const iconCls = getWeatherIconClass(rawDesc);

  // Mettre à jour les champs principaux de la modale
  const modalTemp = document.getElementById('weather-detail-temp');
  const modalDesc = document.getElementById('weather-detail-desc');
  const modalLoc = document.getElementById('weather-detail-loc');
  const modalIcon = document.getElementById('weather-detail-icon');

  if (modalTemp) modalTemp.textContent = `${current.temp_C}°C`;
  if (modalDesc) modalDesc.textContent = frDesc;
  if (modalLoc) modalLoc.textContent = fullLoc;
  if (modalIcon) modalIcon.className = `${iconCls} weather-hero-icon`;

  // Métriques détaillées
  const metricFeels = document.getElementById('weather-metric-feels');
  const metricHumidity = document.getElementById('weather-metric-humidity');
  const metricWind = document.getElementById('weather-metric-wind');
  const metricUv = document.getElementById('weather-metric-uv');

  if (metricFeels) metricFeels.textContent = `${current.FeelsLikeC}°C`;
  if (metricHumidity) metricHumidity.textContent = `${current.humidity}%`;
  if (metricWind) metricWind.textContent = `${current.windspeedKmph} km/h (${current.winddir16Point || ''})`;
  if (metricUv) metricUv.textContent = `${current.uvIndex || '0'} / 10`;

  // Prévisions 3 jours
  const forecastList = document.getElementById('weather-forecast-list');
  if (forecastList && data.weather && Array.isArray(data.weather)) {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const todayStr = new Date().toISOString().slice(0, 10);

    forecastList.innerHTML = data.weather
      .slice(0, 3)
      .map((w, idx) => {
        const parts = w.date.split('-').map(Number);
        const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
        let dayLabel = days[dateObj.getDay()];
        if (w.date === todayStr || idx === 0) {
          dayLabel = "Aujourd'hui";
        } else if (idx === 1) {
          dayLabel = 'Demain';
        }

        const hourlyMid = w.hourly && (w.hourly[4] || w.hourly[0]);
        const dayDescRaw = hourlyMid?.weatherDesc?.[0]?.value || '';
        const dayDesc = translateWeatherDesc(dayDescRaw);
        const dayIcon = getWeatherIconClass(dayDescRaw);

        return `
          <div class="forecast-card">
            <span class="forecast-day">${dayLabel}</span>
            <i class="${dayIcon} forecast-icon"></i>
            <span class="forecast-temps">
              <span class="temp-max">${w.maxtempC}°</span>
              <span class="temp-sep">/</span>
              <span class="temp-min">${w.mintempC}°</span>
            </span>
            <span class="forecast-desc">${dayDesc}</span>
          </div>
        `;
      })
      .join('');
  }
}

function openWeatherModal() {
  const modal = document.getElementById('weather-modal');
  const cityInput = document.getElementById('weather-city-input');
  const cityStatus = document.getElementById('weather-city-status');

  if (cityStatus) cityStatus.textContent = '';
  if (cityInput) cityInput.value = getSavedCity();

  if (modal) modal.hidden = false;

  if (cachedWeatherData) {
    renderWeatherModalDetails(cachedWeatherData);
  } else {
    fetchWeather();
  }
}

function closeWeatherModal() {
  const modal = document.getElementById('weather-modal');
  if (modal) modal.hidden = true;
}

function initWeather() {
  // Clic sur le widget topbar pour ouvrir la modale détaillée
  const weatherPill = document.getElementById('weather');
  if (weatherPill) {
    weatherPill.addEventListener('click', openWeatherModal);
  }

  // Fermeture de la modale
  const closeBtn = document.getElementById('weather-modal-close');
  if (closeBtn) closeBtn.addEventListener('click', closeWeatherModal);

  const modal = document.getElementById('weather-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeWeatherModal();
    });
  }

  // Formulaire de ville
  const cityForm = document.getElementById('weather-city-form');
  const cityInput = document.getElementById('weather-city-input');
  const cityStatus = document.getElementById('weather-city-status');
  const autoLocBtn = document.getElementById('weather-auto-loc-btn');

  if (cityForm) {
    cityForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newCity = (cityInput ? cityInput.value : '').trim();
      if (!newCity) {
        setSavedCity('');
        if (cityStatus) cityStatus.innerHTML = '<span class="status-info">Retour à la détection automatique par IP.</span>';
        await fetchWeather();
        return;
      }

      if (cityStatus) cityStatus.innerHTML = '<span class="status-info">Recherche en cours...</span>';
      setSavedCity(newCity);
      const success = await fetchWeather();
      if (success) {
        if (cityStatus) cityStatus.innerHTML = `<span class="status-success"><i class="fa-solid fa-check"></i> Ville définie : ${newCity}</span>`;
        if (typeof showToast === 'function') {
          showToast(`Météo mise à jour pour : ${newCity}`, 'success');
        }
      } else {
        if (cityStatus) cityStatus.innerHTML = '<span class="status-error"><i class="fa-solid fa-triangle-exclamation"></i> Impossible de trouver cette ville.</span>';
      }
    });
  }

  if (autoLocBtn) {
    autoLocBtn.addEventListener('click', async () => {
      setSavedCity('');
      if (cityInput) cityInput.value = '';
      if (cityStatus) cityStatus.innerHTML = '<span class="status-info">Détection automatique activée.</span>';
      await fetchWeather();
      if (typeof showToast === 'function') {
        showToast('Météo réinitialisée sur la géolocalisation automatique', 'info');
      }
    });
  }

  fetchWeather();
  setInterval(fetchWeather, 1800000); // 30 minutes
}
