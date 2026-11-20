/* =========================================
   PRINCE OS — CORE RUNTIME v3
   ========================================= */


/* ---------- ELEMENTS ---------- */

const clockEl = document.getElementById("clock");
const dateEl = document.getElementById("date");
const networkEl = document.getElementById("network");
const batteryEl = document.getElementById("battery");


/* ---------- CLOCK / DATE / NETWORK ---------- */

function updateSystemStatus() {
    const now = new Date();

    if (clockEl) {
        clockEl.textContent = now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    if (dateEl) {
        dateEl.textContent = now.toLocaleDateString([], {
            weekday: "long",
            month: "short",
            day: "numeric"
        });
    }

    if (networkEl) {
        const online = navigator.onLine;
        networkEl.textContent = online ? "ONLINE" : "OFFLINE";
        networkEl.style.color = online ? "" : "#e06c5b";
    }
}

updateSystemStatus();
setInterval(updateSystemStatus, 1000);
window.addEventListener("online", updateSystemStatus);
window.addEventListener("offline", updateSystemStatus);


/* ---------- TIME-AWARE GREETING ---------- */

(function greet() {
    const hour = new Date().getHours();

    let greeting = "Good evening";
    if (hour < 12) greeting = "Good morning";
    else if (hour < 17) greeting = "Good afternoon";

    const eyebrow = document.querySelector(".eyebrow");
    if (eyebrow) {
        eyebrow.textContent = greeting.toUpperCase() + " — WELCOME BACK";
    }
})();


/* ---------- BATTERY ---------- */

function setBatteryFallback() {
    if (batteryEl) batteryEl.textContent = "N/A";
}

if ("getBattery" in navigator) {
    navigator.getBattery().then(battery => {

        function updateBattery() {
            if (batteryEl) {
                batteryEl.textContent =
                    Math.round(battery.level * 100) + "%";
            }
        }

        updateBattery();
        battery.addEventListener("levelchange", updateBattery);

    }).catch(setBatteryFallback);
} else {
    setBatteryFallback();
}


/* ---------- WEATHER (Open-Meteo — no API key) ---------- */

const WEATHER_CODES = {
    0:  ["Clear sky", "☀"],
    1:  ["Mostly clear", "🌤"],
    2:  ["Partly cloudy", "⛅"],
    3:  ["Overcast", "☁"],
    45: ["Fog", "🌫"],
    48: ["Rime fog", "🌫"],
    51: ["Light drizzle", "🌦"],
    53: ["Drizzle", "🌦"],
    55: ["Heavy drizzle", "🌧"],
    61: ["Light rain", "🌧"],
    63: ["Rain", "🌧"],
    65: ["Heavy rain", "🌧"],
    71: ["Light snow", "🌨"],
    73: ["Snow", "🌨"],
    75: ["Heavy snow", "❄"],
    80: ["Showers", "🌦"],
    81: ["Showers", "🌧"],
    82: ["Violent showers", "⛈"],
    95: ["Thunderstorm", "⛈"],
    96: ["Storm + hail", "⛈"],
    99: ["Storm + hail", "⛈"]
};

let lastWeatherText = "Weather unavailable";

function renderWeather(code, temp, wind) {
    const match = WEATHER_CODES[code] || ["Unknown", "🌡"];

    document.getElementById("weatherIcon").textContent = match[1];
    document.getElementById("weatherTemp").textContent =
        Math.round(temp) + "°C";
    document.getElementById("weatherDesc").textContent = match[0];
    document.getElementById("weatherWind").textContent =
        "Wind " + Math.round(wind) + " km/h";

    lastWeatherText = match[0] + ", " + Math.round(temp) + "°C";
}

function loadWeather(latitude, longitude) {
    const url =
        "https://api.open-meteo.com/v1/forecast" +
        "?latitude=" + latitude +
        "&longitude=" + longitude +
        "&current=temperature_2m,weather_code,wind_speed_10m";

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error("Weather fetch failed");
            return response.json();
        })
        .then(data => {
            const current = data.current;

            document.getElementById("weatherLoc").textContent =
                "● LIVE";
            document.getElementById("weatherLoc").style.color =
                "#8fbd65";

            renderWeather(
                current.weather_code,
                current.temperature_2m,
                current.wind_speed_10m
            );
        })
        .catch(() => {
            document.getElementById("weatherDesc").textContent =
                "Weather unavailable";
            document.getElementById("weatherLoc").textContent =
                "ERROR";
        });
}

function initWeather() {
    if (!navigator.geolocation) {
        document.getElementById("weatherDesc").textContent =
            "Geolocation not supported";
        document.getElementById("weatherLoc").textContent = "N/A";
        return;
    }

    navigator.geolocation.getCurrentPosition(
        position => {
            loadWeather(
                position.coords.latitude,
                position.coords.longitude
            );
        },
        () => {
            document.getElementById("weatherDesc").textContent =
                "Location access denied";
            document.getElementById("weatherLoc").textContent =
                "OFF";
        },
        { timeout: 10000 }
    );
}

initWeather();

// Refresh weather every 10 minutes
setInterval(() => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            loadWeather(
                position.coords.latitude,
                position.coords.longitude
            );
        });
    }
}, 600000);


/* ---------- PWA INSTALL ---------- */

let deferredInstallPrompt = null;
const installBtn = document.getElementById("installBtn");

window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    if (installBtn) installBtn.hidden = false;
});

if (installBtn) {
    installBtn.addEventListener("click", async () => {
        if (!deferredInstallPrompt) return;

        deferredInstallPrompt.prompt();
        await deferredInstallPrompt.userChoice;

        deferredInstallPrompt = null;
        installBtn.hidden = true;
    });
}

window.addEventListener("appinstalled", () => {
    if (installBtn) installBtn.hidden = true;
});


/* ---------- COMMAND CENTER ---------- */

const commandInput = document.getElementById("commandInput");
const commandButton = document.getElementById("commandButton");
const commandOutput = document.getElementById("commandOutput");

const SHORTCUTS = {
    "github": "https://github.com/princeuntouchable01",
    "portfolio": "https://github.com/princeuntouchable01/TECH_PRO_PORTFOLIO-.git",
    "tp-ai": "https://github.com/princeuntouchable01/TP-AI.git",
    "tpai": "https://github.com/princeuntouchable01/TP-AI.git",
    "projects": "https://github.com/princeuntouchable01/Weather_Generator.git",
    "weather": "https://github.com/princeuntouchable01/Weather_Generator.git"
};

function printOutput(text) {
    commandOutput.textContent = text;
}

function runCommand() {
    const command = commandInput.value.trim();

    if (!command) {
        printOutput("Please enter a command.");
        return;
    }

    const lower = command.toLowerCase();

    // help
    if (lower === "help") {
        printOutput(
            "Commands: github, portfolio, tp-ai, projects, " +
            "time, date, weather, google <query>, youtube <query>"
        );
        return;
    }

    // time / date
    if (lower === "time") {
        printOutput(
            "Current time: " +
            new Date().toLocaleTimeString()
        );
        return;
    }

    if (lower === "date") {
        printOutput(
            "Today is " +
            new Date().toLocaleDateString([], {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            })
        );
        return;
    }

    if (lower === "weather") {
        printOutput("Current weather: " + lastWeatherText);
        return;
    }

    // shortcut links
    if (SHORTCUTS[lower]) {
        window.open(SHORTCUTS[lower], "_blank", "noopener");
        printOutput("Opening " + lower + "...");
        return;
    }

    // search commands
    if (lower.startsWith("google ")) {
        const query = command.substring(7).trim();

        if (query) {
            window.open(
                "https://www.google.com/search?q=" +
                encodeURIComponent(query),
                "_blank",
                "noopener"
            );
            printOutput("Searching Google for: " + query);
            return;
        }
    }

    if (lower.startsWith("youtube ")) {
        const query = command.substring(8).trim();

        if (query) {
            window.open(
                "https://www.youtube.com/results?search_query=" +
                encodeURIComponent(query),
                "_blank",
                "noopener"
            );
            printOutput("Searching YouTube for: " + query);
            return;
        }
    }

    printOutput(
        'Unknown command. Type "help" to see all commands.'
    );
}

commandButton.addEventListener("click", runCommand);

commandInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        runCommand();
    }
});
