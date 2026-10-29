/**
 * weather-fx.js - Effets météo d'arrière-plan dynamiques sur Canvas
 * Gère les effets visuels : Pluie, Neige, Tempête/Orage, Brume/Nuages, Ciel dégagé/Étoiles
 */

let weatherCanvas = null;
let weatherCtx = null;
let weatherAnimId = null;
let weatherParticles = [];
let currentWeatherType = 'clear'; // 'rain' | 'snow' | 'storm' | 'cloud' | 'clear'
let isWeatherFxEnabled = true;
let lastTimestamp = 0;

function initWeatherFx() {
  weatherCanvas = document.getElementById('weather-canvas');
  if (!weatherCanvas) return;

  weatherCtx = weatherCanvas.getContext('2d');
  resizeWeatherCanvas();
  window.addEventListener('resize', resizeWeatherCanvas);

  // Charger la préférence de l'utilisateur
  const savedPref = localStorage.getItem('startpage_weather_fx');
  isWeatherFxEnabled = savedPref === null ? true : savedPref === 'true';

  // Synchroniser les boutons de contrôle
  updateFxControlsUI();

  // Écouter le bouton dans la topbar
  const topbarFxBtn = document.getElementById('weather-fx-toggle');
  if (topbarFxBtn) {
    topbarFxBtn.addEventListener('click', () => {
      toggleWeatherFx(!isWeatherFxEnabled);
    });
  }

  // Écouter le checkbox dans la modale météo
  const modalFxCheck = document.getElementById('weather-modal-fx-check');
  if (modalFxCheck) {
    modalFxCheck.addEventListener('change', (e) => {
      toggleWeatherFx(e.target.checked);
    });
  }

  // Mettre en pause si l'onglet est masqué pour économiser le CPU/GPU
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopWeatherAnimation();
    } else if (isWeatherFxEnabled) {
      startWeatherAnimation();
    }
  });

  if (isWeatherFxEnabled) {
    startWeatherAnimation();
  }
}

function resizeWeatherCanvas() {
  if (!weatherCanvas) return;
  weatherCanvas.width = window.innerWidth;
  weatherCanvas.height = window.innerHeight;
  initParticles();
}

function toggleWeatherFx(enabled) {
  isWeatherFxEnabled = Boolean(enabled);
  localStorage.setItem('startpage_weather_fx', String(isWeatherFxEnabled));
  updateFxControlsUI();

  if (isWeatherFxEnabled) {
    startWeatherAnimation();
    if (typeof showToast === 'function') {
      showToast('Effets météo d\'arrière-plan activés', 'info');
    }
  } else {
    stopWeatherAnimation();
    if (weatherCtx && weatherCanvas) {
      weatherCtx.clearRect(0, 0, weatherCanvas.width, weatherCanvas.height);
    }
    if (typeof showToast === 'function') {
      showToast('Effets météo d\'arrière-plan désactivés', 'info');
    }
  }
}

function updateFxControlsUI() {
  const topbarFxBtn = document.getElementById('weather-fx-toggle');
  if (topbarFxBtn) {
    topbarFxBtn.classList.toggle('active', isWeatherFxEnabled);
    topbarFxBtn.setAttribute('title', isWeatherFxEnabled 
      ? 'Effets météo d\'arrière-plan (Actifs - Cliquer pour désactiver)' 
      : 'Effets météo d\'arrière-plan (Inactifs - Cliquer pour activer)');
  }

  const modalFxCheck = document.getElementById('weather-modal-fx-check');
  if (modalFxCheck) {
    modalFxCheck.checked = isWeatherFxEnabled;
  }
}

function setWeatherFxCondition(desc) {
  if (!desc) return;
  const d = desc.toLowerCase();

  let newType = 'clear';
  if (d.includes('thunder') || d.includes('storm') || d.includes('orage')) {
    newType = 'storm';
  } else if (d.includes('rain') || d.includes('drizzle') || d.includes('shower') || d.includes('pluie') || d.includes('averse')) {
    newType = 'rain';
  } else if (d.includes('snow') || d.includes('flurry') || d.includes('ice') || d.includes('neige') || d.includes('gel')) {
    newType = 'snow';
  } else if (d.includes('cloud') || d.includes('overcast') || d.includes('fog') || d.includes('mist') || d.includes('nuag') || d.includes('couvert') || d.includes('brume')) {
    newType = 'cloud';
  } else {
    newType = 'clear';
  }

  if (newType !== currentWeatherType) {
    currentWeatherType = newType;
    initParticles();
  }
}

function initParticles() {
  if (!weatherCanvas) return;
  const w = weatherCanvas.width;
  const h = weatherCanvas.height;
  weatherParticles = [];

  const accentColor = getComputedStyle(document.body).getPropertyValue('--accent-primary').trim() || '#31e1f7';

  if (currentWeatherType === 'rain' || currentWeatherType === 'storm') {
    const count = currentWeatherType === 'storm' ? 95 : 65;
    for (let i = 0; i < count; i++) {
      weatherParticles.push({
        x: Math.random() * (w + 200) - 100,
        y: Math.random() * h,
        speed: 12 + Math.random() * 10,
        len: 16 + Math.random() * 20,
        opacity: 0.2 + Math.random() * 0.45,
        thickness: 1 + Math.random() * 1.2
      });
    }
  } else if (currentWeatherType === 'snow') {
    const count = 55;
    for (let i = 0; i < count; i++) {
      weatherParticles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: 1.5 + Math.random() * 3,
        speed: 0.8 + Math.random() * 1.8,
        swingSpeed: 0.015 + Math.random() * 0.02,
        swingDistance: 20 + Math.random() * 40,
        angle: Math.random() * Math.PI * 2,
        opacity: 0.3 + Math.random() * 0.6
      });
    }
  } else if (currentWeatherType === 'cloud') {
    const count = 18;
    for (let i = 0; i < count; i++) {
      weatherParticles.push({
        x: Math.random() * w,
        y: Math.random() * (h * 0.85),
        radius: 120 + Math.random() * 180,
        speed: 0.15 + Math.random() * 0.35,
        opacity: 0.03 + Math.random() * 0.05
      });
    }
  } else {
    // Clear / Sunny / Stars
    const count = 45;
    for (let i = 0; i < count; i++) {
      weatherParticles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: 1 + Math.random() * 2.2,
        speedY: 0.15 + Math.random() * 0.35,
        speedX: (Math.random() - 0.5) * 0.2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        angle: Math.random() * Math.PI * 2,
        baseOpacity: 0.15 + Math.random() * 0.45,
        accent: accentColor
      });
    }
  }
}

function startWeatherAnimation() {
  if (weatherAnimId) return;
  lastTimestamp = performance.now();
  weatherAnimId = requestAnimationFrame(renderWeatherFrame);
}

function stopWeatherAnimation() {
  if (weatherAnimId) {
    cancelAnimationFrame(weatherAnimId);
    weatherAnimId = null;
  }
}

let lightningFlash = 0;

function renderWeatherFrame(now) {
  if (!isWeatherFxEnabled || !weatherCtx || !weatherCanvas) {
    stopWeatherAnimation();
    return;
  }

  const w = weatherCanvas.width;
  const h = weatherCanvas.height;

  weatherCtx.clearRect(0, 0, w, h);

  // Éclair occasionnel en cas d'orage
  if (currentWeatherType === 'storm') {
    if (lightningFlash > 0) {
      weatherCtx.fillStyle = `rgba(220, 240, 255, ${lightningFlash * 0.14})`;
      weatherCtx.fillRect(0, 0, w, h);
      lightningFlash *= 0.85;
      if (lightningFlash < 0.01) lightningFlash = 0;
    } else if (Math.random() < 0.0035) {
      lightningFlash = 0.8 + Math.random() * 0.2;
    }
  }

  if (currentWeatherType === 'rain' || currentWeatherType === 'storm') {
    weatherCtx.strokeStyle = 'rgba(160, 225, 255, 0.4)';
    weatherCtx.lineCap = 'round';

    for (let p of weatherParticles) {
      weatherCtx.lineWidth = p.thickness;
      weatherCtx.strokeStyle = `rgba(160, 225, 255, ${p.opacity})`;
      weatherCtx.beginPath();
      weatherCtx.moveTo(p.x, p.y);
      weatherCtx.lineTo(p.x - p.len * 0.25, p.y + p.len);
      weatherCtx.stroke();

      p.y += p.speed;
      p.x -= p.speed * 0.25;

      if (p.y > h) {
        p.y = -20;
        p.x = Math.random() * (w + 200) - 100;
      }
    }
  } else if (currentWeatherType === 'snow') {
    for (let p of weatherParticles) {
      p.angle += p.swingSpeed;
      const offsetX = Math.sin(p.angle) * p.swingDistance * 0.03;
      p.x += offsetX;
      p.y += p.speed;

      if (p.y > h + 10) {
        p.y = -10;
        p.x = Math.random() * w;
      }
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;

      weatherCtx.fillStyle = `rgba(235, 245, 255, ${p.opacity})`;
      weatherCtx.beginPath();
      weatherCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      weatherCtx.fill();
    }
  } else if (currentWeatherType === 'cloud') {
    for (let p of weatherParticles) {
      p.x += p.speed;
      if (p.x - p.radius > w) {
        p.x = -p.radius;
      }

      const grad = weatherCtx.createRadialGradient(p.x, p.y, 10, p.x, p.y, p.radius);
      grad.addColorStop(0, `rgba(200, 220, 245, ${p.opacity})`);
      grad.addColorStop(1, 'rgba(200, 220, 245, 0)');

      weatherCtx.fillStyle = grad;
      weatherCtx.beginPath();
      weatherCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      weatherCtx.fill();
    }
  } else {
    // Clear / Stars / Dust
    for (let p of weatherParticles) {
      p.angle += p.pulseSpeed;
      p.y -= p.speedY;
      p.x += p.speedX;

      if (p.y < -10) {
        p.y = h + 10;
        p.x = Math.random() * w;
      }
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;

      const currentOpacity = p.baseOpacity * (0.6 + 0.4 * Math.sin(p.angle));
      weatherCtx.fillStyle = `rgba(180, 235, 255, ${currentOpacity})`;
      weatherCtx.beginPath();
      weatherCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      weatherCtx.fill();
    }
  }

  weatherAnimId = requestAnimationFrame(renderWeatherFrame);
}

