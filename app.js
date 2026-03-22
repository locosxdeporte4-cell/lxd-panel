const navLinks = document.querySelectorAll(".nav-link");
const contentSections = document.querySelectorAll(".content-section");
const platformCards = document.querySelectorAll(".platform-card");
const platformMenuItems = document.querySelectorAll(".platform-menu-item");
const platformPanels = document.querySelectorAll(".platform-panel");
const modeButtons = document.querySelectorAll(".mode-btn");
const youtubeModePanels = document.querySelectorAll(".youtube-mode-panel");
const actionButtons = document.querySelectorAll(".action-btn");
const masterLog = document.getElementById("master-log");

const state = {
  server: "Encendido",
  rtmp: "Activo",
  signal: "Inestable",
  activePlatforms: ["youtube", "twitch"],
  youtubeMode: "scheduled"
};

function timeNow() {
  const now = new Date();
  return now.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function writeLog(message, level = "INFO") {
  const line = `[${timeNow()}] [${level}] ${message}\n`;
  masterLog.textContent = line + masterLog.textContent;
}

function switchSection(sectionName) {
  navLinks.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.section === sectionName);
  });

  contentSections.forEach(section => {
    section.classList.toggle("active", section.id === `section-${sectionName}`);
  });
}

navLinks.forEach(btn => {
  btn.addEventListener("click", () => {
    switchSection(btn.dataset.section);
  });
});

function openPlatformPanel(platform) {
  switchSection("platforms");

  platformMenuItems.forEach(item => {
    item.classList.toggle("active", item.dataset.platformPanel === platform);
  });

  platformPanels.forEach(panel => {
    panel.classList.toggle("active", panel.id === `panel-${platform}`);
  });

  writeLog(`Se abrió el módulo de ${platform.toUpperCase()}.`);
}

platformCards.forEach(card => {
  card.addEventListener("click", () => {
    openPlatformPanel(card.dataset.platform);
  });
});

platformMenuItems.forEach(item => {
  item.addEventListener("click", () => {
    openPlatformPanel(item.dataset.platformPanel);
  });
});

modeButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const mode = btn.dataset.youtubeMode;
    state.youtubeMode = mode;

    modeButtons.forEach(b => b.classList.toggle("active", b === btn));
    youtubeModePanels.forEach(panel => {
      panel.classList.toggle(
        "active",
        panel.id === `yt-mode-${mode}`
      );
    });

    writeLog(`YouTube quedó en modo ${mode.toUpperCase()}.`);
  });
});

document.getElementById("btn-refresh").addEventListener("click", async () => {
  try {
    writeLog("Consultando estado general del sistema...");

    const response = await fetch("/api/system/status");

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    document.getElementById("server-state-text").textContent = data.server;
    document.getElementById("rtmp-state-text").textContent = data.rtmp;
    document.getElementById("signal-state-text").textContent = data.signal;
    document.getElementById("active-platforms-count").textContent =
      `${data.activePlatforms.length} / 5`;

    writeLog(
      `Estado actualizado. Servidor=${data.server}, RTMP=${data.rtmp}, Señal=${data.signal}.`
    );
  } catch (error) {
    writeLog(`Error consultando estado general: ${error.message}`, "ERROR");
  }
});

document.getElementById("btn-open-master-log").addEventListener("click", () => {
  switchSection("logs");
  writeLog("Se abrió la vista de log general.");
});

function guardYouTubeMode(expectedMode, actionName) {
  if (state.youtubeMode !== expectedMode) {
    writeLog(
      `Bloqueado: la acción "${actionName}" requiere modo ${expectedMode.toUpperCase()} y el panel está en ${state.youtubeMode.toUpperCase()}.`,
      "WARN"
    );
    return false;
  }
  return true;
}

async function simulateAction(action) {
  switch (action) {
    case "yt-list-events":
      if (!guardYouTubeMode("scheduled", action)) return;
      writeLog("YouTube scheduled: listar eventos programados.");
      break;

    case "yt-start-push":
  if (!guardYouTubeMode("scheduled", action)) return;

  try {
    writeLog("YouTube scheduled: iniciando push-youtube...");

    const res = await fetch("/api/youtube-start", {
      method: "POST"
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Error desconocido");
    }

    writeLog("push-youtube iniciado correctamente");
  } catch (err) {
    writeLog(`Error iniciando push-youtube: ${err.message}`, "ERROR");
  }

  break;

    case "yt-validate-ffmpeg":
      if (!guardYouTubeMode("scheduled", action)) return;
      writeLog("YouTube scheduled: validación FFmpeg solicitada.");
      break;

    case "yt-go-live-scheduled":
      if (!guardYouTubeMode("scheduled", action)) return;
      writeLog("YouTube scheduled: transición a LIVE solicitada.", "WARN");
      break;

    case "yt-start-push-new":
      if (!guardYouTubeMode("new", action)) return;
      writeLog("YouTube new: start push-youtube.");
      break;

    case "yt-create-broadcast":
      if (!guardYouTubeMode("new", action)) return;
      writeLog("YouTube new: create_broadcast_reuse_stream.py solicitado.");
      break;

    case "yt-go-live-new":
      if (!guardYouTubeMode("new", action)) return;
      writeLog("YouTube new: go_live.py solicitado.", "WARN");
      break;

    case "yt-stop-live":
      writeLog("YouTube stop: stop_youtube_live.py solicitado.");
      break;

    case "yt-stop-push":
      writeLog("YouTube stop: stop push-youtube solicitado.", "WARN");
      break;

    case "yt-validate-stop":
      writeLog("YouTube stop: validación FFmpeg posterior solicitada.");
      break;

    case "fb-start":
      writeLog("Facebook: iniciar transmisión.");
      break;
    case "fb-stop":
      writeLog("Facebook: detener transmisión.", "WARN");
      break;
    case "fb-status":
      writeLog("Facebook: validar estado.");
      break;
    case "fb-key":
      writeLog("Facebook: cambiar clave.");
      break;

    case "ig-start":
      writeLog("Instagram: iniciar transmisión.");
      break;
    case "ig-stop":
      writeLog("Instagram: detener transmisión.", "WARN");
      break;
    case "ig-status":
      writeLog("Instagram: validar estado.");
      break;
    case "ig-key":
      writeLog("Instagram: actualizar llave.");
      break;

    case "tw-start":
      writeLog("Twitch: iniciar transmisión.");
      break;
    case "tw-stop":
      writeLog("Twitch: detener transmisión.", "WARN");
      break;
    case "tw-status":
      writeLog("Twitch: validar estado.");
      break;
    case "tw-key":
      writeLog("Twitch: cambiar clave.");
      break;

    case "kick-start":
      writeLog("Kick: iniciar transmisión.");
      break;
    case "kick-stop":
      writeLog("Kick: detener transmisión.", "WARN");
      break;
    case "kick-status":
      writeLog("Kick: validar estado.");
      break;
    case "kick-key":
      writeLog("Kick: cambiar clave.");
      break;

    default:
      writeLog(`Acción no reconocida: ${action}`, "ERROR");
      break;
  }
}

actionButtons.forEach(btn => {
  btn.addEventListener("click", async () => {
    await simulateAction(btn.dataset.action);
  });
});

writeLog("Portal multired cargado correctamente.");
writeLog("Diseño actual desacopla el dashboard general del módulo especial de YouTube.");