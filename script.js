/* =========================================
   PRINCE OS v4.0
   CORE SYSTEM ENGINE
========================================= */

"use strict";


/* =========================================
   1. SYSTEM CONFIGURATION
========================================= */

const CONFIG = {
    version: "4.0",
    storage: {
        theme: "princeOS_theme",
        notes: "princeOS_notes",
        tasks: "princeOS_tasks"
    }
};


/* =========================================
   2. DOM HELPERS
========================================= */

const $ = (selector) => document.querySelector(selector);

const $$ = (selector) => document.querySelectorAll(selector);


/* =========================================
   3. NAVIGATION ENGINE
========================================= */

function navigateTo(viewName) {

    const target = $(`#view-${viewName}`);

    if (!target) return;

    // Hide all views

    $$(".view").forEach(view => {
        view.classList.remove("active");
    });

    // Show selected view

    target.classList.add("active");

    // Update navigation buttons

    $$(".nav-item").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.view === viewName
        );

    });

    // Save last visited section

    localStorage.setItem(
        "princeOS_lastView",
        viewName
    );

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// Navigation listeners

$$("[data-view]").forEach(button => {

    button.addEventListener("click", () => {

        navigateTo(button.dataset.view);

    });

});


$$("[data-go]").forEach(button => {

    button.addEventListener("click", () => {

        navigateTo(button.dataset.go);

    });

});


/* =========================================
   4. CLOCK AND DATE ENGINE
========================================= */

function updateClock() {

    const now = new Date();

    const clock = $("#clock");
    const date = $("#date");
    const greeting = $("#greeting");

    if (clock) {

        clock.textContent = now.toLocaleTimeString(
            "en-GB",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    }

    if (date) {

        date.textContent = now.toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

    }

    if (greeting) {

        const hour = now.getHours();

        let message = "WELCOME BACK";

        if (hour < 12) {
            message = "GOOD MORNING";
        } else if (hour < 17) {
            message = "GOOD AFTERNOON";
        } else {
            message = "GOOD EVENING";
        }

        greeting.textContent = message;

    }

}

updateClock();

setInterval(updateClock, 1000);


/* =========================================
   5. ADVANCED BATTERY MONITOR
========================================= */

async function initializeBattery() {

    const batteryTop = $("#battery");
    const batteryCard = $("#batteryCard");

    function showBattery(value) {
        if (batteryTop) {
            batteryTop.textContent = value;
        }

        if (batteryCard) {
            batteryCard.textContent = value;
        }
    }

    if (!navigator.getBattery) {
        showBattery("Unavailable");
        return;
    }

    try {

        const battery = await navigator.getBattery();

        function updateBattery() {

            const percentage = Math.round(
                battery.level * 100
            );

            const charging = battery.charging;

            let icon = charging ? "⚡" : "🔋";

            showBattery(`${icon} ${percentage}%`);

        }

        updateBattery();

        battery.addEventListener(
            "levelchange",
            updateBattery
        );

        battery.addEventListener(
            "chargingchange",
            updateBattery
        );

    } catch (error) {

        console.warn("Battery API unavailable:", error);

        showBattery("Unavailable");

    }

}

initializeBattery();


/* =========================================
   6. NETWORK MONITOR
========================================= */

function updateNetwork() {

    const online = navigator.onLine;

    const network = $("#network");
    const networkCard = $("#networkCard");

    const status = online
        ? "ONLINE"
        : "OFFLINE";

    if (network) {
        network.textContent = status;
    }

    if (networkCard) {
        networkCard.textContent = status;
    }

}

window.addEventListener(
    "online",
    updateNetwork
);

window.addEventListener(
    "offline",
    updateNetwork
);

updateNetwork();


/* =========================================
   7. THEME ENGINE
========================================= */

function applyTheme(theme) {

    const allowedThemes = [
        "gold",
        "platinum",
        "sapphire",
        "amethyst",
        "emerald"
    ];

    if (!allowedThemes.includes(theme)) {
        theme = "gold";
    }

    document.documentElement.dataset.theme = theme;

    localStorage.setItem(
        CONFIG.storage.theme,
        theme
    );

    $$(".theme-swatch").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.theme === theme
        );

    });

}


// Theme button listeners

$$(".theme-swatch").forEach(button => {

    button.addEventListener("click", () => {

        applyTheme(button.dataset.theme);

    });

});


// Restore saved theme

applyTheme(
    localStorage.getItem(CONFIG.storage.theme) || "gold"
);


/* =========================================
   8. NOTES ENGINE
========================================= */

const notesInput = $("#notesInput");
const saveNotes = $("#saveNotes");
const notesStatus = $("#notesStatus");

if (notesInput) {

    notesInput.value =
        localStorage.getItem(CONFIG.storage.notes) || "";

}

if (saveNotes) {

    saveNotes.addEventListener("click", () => {

        localStorage.setItem(
            CONFIG.storage.notes,
            notesInput.value
        );

        if (notesStatus) {

            notesStatus.textContent =
                "✓ Notes saved successfully.";

        }

    });

}


// Automatic note saving

if (notesInput) {

    notesInput.addEventListener("input", () => {

        localStorage.setItem(
            CONFIG.storage.notes,
            notesInput.value
        );

        if (notesStatus) {
            notesStatus.textContent = "Saving...";
        }

    });

}


/* =========================================
   9. TASK MANAGER
========================================= */

let tasks = [];

try {

    tasks = JSON.parse(
        localStorage.getItem(CONFIG.storage.tasks) || "[]"
    );

    if (!Array.isArray(tasks)) {
        tasks = [];
    }

} catch (error) {

    tasks = [];

}


const taskInput = $("#taskInput");
const addTaskButton = $("#addTask");
const taskList = $("#taskList");


function saveTasks() {

    localStorage.setItem(
        CONFIG.storage.tasks,
        JSON.stringify(tasks)
    );

}


function renderTasks() {

    if (!taskList) return;

    taskList.innerHTML = "";

    if (tasks.length === 0) {

        taskList.innerHTML = `
            <p style="color:var(--muted);font-size:12px;">
                No tasks yet. Add your first task!
            </p>
        `;

        return;

    }

    tasks.forEach(task => {

        const item = document.createElement("div");

        item.className = "task-item";

        if (task.completed) {
            item.classList.add("completed");
        }

        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.checked = task.completed;

        checkbox.addEventListener("change", () => {

            task.completed = checkbox.checked;

            saveTasks();
            renderTasks();

        });


        const label = document.createElement("span");

        label.textContent = task.text;


        const deleteButton = document.createElement("button");

        deleteButton.className = "delete-task";
        deleteButton.textContent = "×";

        deleteButton.setAttribute(
            "aria-label",
            "Delete task"
        );

        deleteButton.addEventListener("click", () => {

            tasks = tasks.filter(
                current => current.id !== task.id
            );

            saveTasks();
            renderTasks();

        });


        item.append(
            checkbox,
            label,
            deleteButton
        );

        taskList.appendChild(item);

    });

}


function createTask() {

    const text = taskInput.value.trim();

    if (!text) return;

    tasks.push({

        id: Date.now(),

        text,

        completed: false

    });

    taskInput.value = "";

    saveTasks();
    renderTasks();

}


if (addTaskButton) {

    addTaskButton.addEventListener(
        "click",
        createTask
    );

}


if (taskInput) {

    taskInput.addEventListener("keydown", event => {

        if (event.key === "Enter") {
            createTask();
        }

    });

}


renderTasks();


/* =========================================
   10. WEATHER ENGINE
========================================= */

async function loadWeather(latitude, longitude) {

    const temperature = $("#weatherTemp");
    const description = $("#weatherDesc");
    const wind = $("#weatherWind");
    const location = $("#weatherLoc");
    const icon = $("#weatherIcon");

    try {

        const url =
            `https://api.open-meteo.com/v1/forecast` +
            `?latitude=${latitude}` +
            `&longitude=${longitude}` +
            `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m` +
            `&timezone=auto`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Weather request failed");
        }

        const data = await response.json();

        const current = data.current;

        const weatherCodes = {

            0: ["Clear sky", "☀"],
            1: ["Mainly clear", "🌤"],
            2: ["Partly cloudy", "⛅"],
            3: ["Overcast", "☁"],
            45: ["Foggy", "🌫"],
            48: ["Depositing rime fog", "🌫"],
            51: ["Light drizzle", "🌦"],
            53: ["Moderate drizzle", "🌦"],
            55: ["Dense drizzle", "🌧"],
            61: ["Light rain", "🌧"],
            63: ["Moderate rain", "🌧"],
            65: ["Heavy rain", "🌧"],
            71: ["Light snow", "🌨"],
            73: ["Moderate snow", "🌨"],
            75: ["Heavy snow", "❄"],
            80: ["Rain showers", "🌦"],
            81: ["Moderate showers", "🌧"],
            82: ["Heavy showers", "⛈"],
            95: ["Thunderstorm", "⛈"]
        };

        const result = weatherCodes[current.weather_code]
            || ["Unknown conditions", "🌡"];

        if (temperature) {
            temperature.textContent =
                `${Math.round(current.temperature_2m)}°C`;
        }

        if (description) {
            description.textContent = result[0];
        }

        if (icon) {
            icon.textContent = result[1];
        }

        if (wind) {
            wind.textContent =
                `Wind ${current.wind_speed_10m} km/h`;
        }

        if (location) {
            location.textContent = "LOCAL WEATHER";
        }

    } catch (error) {

        if (description) {
            description.textContent =
                "Weather temporarily unavailable.";
        }

        console.error(error);

    }

}


function initializeWeather() {

    if (!navigator.geolocation) {

        $("#weatherDesc").textContent =
            "Location unavailable.";

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

            $("#weatherDesc").textContent =
                "Location permission required.";

            $("#weatherLoc").textContent =
                "LOCATION DISABLED";

        },

        {
            timeout: 10000,
            maximumAge: 600000
        }

    );

}

initializeWeather();


/* =========================================
   11. COMMAND CENTRE
========================================= */

const commandInput = $("#commandInput");
const commandButton = $("#commandButton");
const commandOutput = $("#commandOutput");


function executeCommand() {

    if (!commandInput || !commandOutput) return;

    const command = commandInput.value
        .trim()
        .toLowerCase();

    if (!command) return;

    let output = "Unknown command. Type help for commands.";

    if (command === "help") {

        output =
            "Commands: help, time, date, github, portfolio, weather, apps, home, tasks, workspace, settings, status.";

    }

    else if (command === "time") {

        output = new Date().toLocaleTimeString();

    }

    else if (command === "date") {

        output = new Date().toDateString();

    }

    else if (command === "github") {

        window.open(
            "https://github.com/princeuntouchable01",
            "_blank",
            "noopener"
        );

        output = "Opening GitHub.";

    }

    else if (command === "portfolio") {

        window.open(
            "https://prince-port.lovable.app",
            "_blank",
            "noopener"
        );

        output = "Opening portfolio.";

    }

    else if (command === "weather") {

        output = "Weather information is displayed on Home.";

    }

    else if (command === "apps" || command === "open apps") {

        navigateTo("apps");

        output = "Applications opened.";

    }

    else if (command === "home" || command === "open home") {

        navigateTo("home");

        output = "Home opened.";

    }

    else if (command === "tasks" || command === "show tasks") {

        navigateTo("tasks");

        output = "Task manager opened.";

    }

    else if (
        command === "workspace" ||
        command === "open workspace"
    ) {

        navigateTo("workspace");

        output = "Workspace opened.";

    }

    else if (
        command === "settings" ||
        command === "open settings"
    ) {

        navigateTo("settings");

        output = "Settings opened.";

    }

    else if (command === "status" || command === "system status") {

        output = navigator.onLine
            ? "PRINCE OS is online and operational."
            : "PRINCE OS is currently offline.";

    }

    else if (command.startsWith("google ")) {

        const query = command.slice(7);

        window.open(
            `https://www.google.com/search?q=${encodeURIComponent(query)}`,
            "_blank",
            "noopener"
        );

        output = "Searching Google.";

    }

    else if (command.startsWith("youtube ")) {

        const query = command.slice(8);

        window.open(
            `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
            "_blank",
            "noopener"
        );

        output = "Searching YouTube.";

    }

    commandOutput.textContent = output;

    commandInput.value = "";

}


if (commandButton) {

    commandButton.addEventListener(
        "click",
        executeCommand
    );

}


if (commandInput) {

    commandInput.addEventListener("keydown", event => {

        if (event.key === "Enter") {
            executeCommand();
        }

    });

}


/* =========================================
   12. SYSTEM INITIALIZATION
========================================= */

function initializeSystem() {

    console.log(
        `%c PRINCE OS v${CONFIG.version} `,
        "background:#D6AD35;color:#08090d;padding:8px;font-weight:bold;"
    );

    console.log(
        "System initialized successfully."
    );

    const lastView = localStorage.getItem(
        "princeOS_lastView"
    );

    if (lastView && $(`#view-${lastView}`)) {

        navigateTo(lastView);

    }

}

initializeSystem();

// INITIALIZE LUCIDE ICONS
if (window.lucide) {
    lucide.createIcons();
}

/* =================================
   PRINCE OS — APP MANAGER ENGINE
================================= */

const INSTALLED_APPS_KEY = "princeOS_installedApps";

function getInstalledApps() {
    try {
        const apps = JSON.parse(
            localStorage.getItem(INSTALLED_APPS_KEY) || "[]"
        );

        return Array.isArray(apps) ? apps : [];
    } catch (error) {
        console.error("App loading error:", error);
        return [];
    }
}

function saveInstalledApps(apps) {
    localStorage.setItem(
        INSTALLED_APPS_KEY,
        JSON.stringify(apps)
    );
}

function setAppStatus(message) {
    const status = document.getElementById("installAppStatus");

    if (status) {
        status.textContent = message;
    }
}

function renderInstalledApps() {
    const grid = document.getElementById("installedAppsGrid");
    const count = document.getElementById("installedAppCount");

    if (!grid || !count) return;

    const apps = getInstalledApps();

    grid.replaceChildren();
    count.textContent = `${apps.length} APPS`;

    apps.forEach(app => {
        const card = document.createElement("div");
        card.className = "app-card installed-app-card";

        const icon = document.createElement("i");
        icon.setAttribute("data-lucide", app.icon || "app-window");
        icon.className = "app-card-icon";

        const name = document.createElement("strong");
        name.textContent = app.name;

        const description = document.createElement("small");
        description.textContent =
            app.description || "Installed application";

        const launchButton = document.createElement("button");
        launchButton.type = "button";
        launchButton.textContent = "LAUNCH";

        launchButton.addEventListener("click", () => {
            window.open(
                app.url,
                "_blank",
                "noopener,noreferrer"
            );
        });

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.textContent = "UNINSTALL";

        removeButton.addEventListener("click", () => {
            const updatedApps = getInstalledApps().filter(
                item => item.id !== app.id
            );

            saveInstalledApps(updatedApps);
            renderInstalledApps();
            setAppStatus(`${app.name} uninstalled.`);
        });

        card.append(
            icon,
            name,
            description,
            launchButton,
            removeButton
        );

        grid.appendChild(card);
    });

    if (window.lucide) {
        lucide.createIcons();
    }
}

function initializeAppManager() {
    const form = document.getElementById("installAppForm");

    if (!form) return;

    form.addEventListener("submit", event => {
        event.preventDefault();

        const name = document.getElementById("newAppName").value.trim();
        const rawUrl = document.getElementById("newAppUrl").value.trim();
        const description = document.getElementById("newAppDescription").value.trim();
        const requestedIcon = document.getElementById("newAppIcon").value.trim();

        let parsedUrl;

        try {
            parsedUrl = new URL(rawUrl);
        } catch {
            setAppStatus("Enter a valid website address.");
            return;
        }

        if (!["https:", "http:"].includes(parsedUrl.protocol)) {
            setAppStatus("Only HTTP and HTTPS websites are allowed.");
            return;
        }

        if (!name) {
            setAppStatus("Enter an application name.");
            return;
        }

        const apps = getInstalledApps();

        const duplicate = apps.some(app =>
            app.name.toLowerCase() === name.toLowerCase() ||
            app.url === parsedUrl.href
        );

        if (duplicate) {
            setAppStatus("This application is already installed.");
            return;
        }

        const validIcon = /^[a-z0-9-]{1,30}$/i.test(requestedIcon)
            ? requestedIcon
            : "app-window";

        const newApp = {
            id: window.crypto?.randomUUID
                ? window.crypto.randomUUID()
                : `${Date.now()}-${Math.random()}`,
            name,
            url: parsedUrl.href,
            description,
            icon: validIcon,
            installedAt: new Date().toISOString()
        };

        apps.push(newApp);
        saveInstalledApps(apps);

        form.reset();

        setAppStatus(`${name} installed successfully!`);
        renderInstalledApps();
    });

    renderInstalledApps();
}

initializeAppManager();

/* =========================================
   PRINCE OS v4.2 — FILE MANAGER ENGINE
========================================= */

const FILE_DB_NAME = "PrinceOS_FileSystem";
const FILE_STORE = "files";

let fileDatabase = null;
let activeFileFilter = "all";

// OPEN DATABASE

function openFileDatabase() {
    return new Promise((resolve, reject) => {

        const request = indexedDB.open(FILE_DB_NAME, 1);

        request.onupgradeneeded = event => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains(FILE_STORE)) {
                db.createObjectStore(FILE_STORE, {
                    keyPath: "id"
                });
            }
        };

        request.onsuccess = event => {
            fileDatabase = event.target.result;
            resolve(fileDatabase);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

// DATABASE TRANSACTION

function fileTransaction(mode, action) {
    return new Promise((resolve, reject) => {

        const transaction = fileDatabase.transaction(
            FILE_STORE,
            mode
        );

        const store = transaction.objectStore(FILE_STORE);
        const request = action(store);

        request.onsuccess = () => resolve(request.result);

        request.onerror = () => reject(request.error);
    });
}

// GET ALL FILES

async function getAllFiles() {
    return await fileTransaction("readonly", store => {
        return store.getAll();
    });
}

// SAVE FILE OR FOLDER

async function saveFileItem(item) {
    return await fileTransaction("readwrite", store => {
        return store.put(item);
    });
}

// DELETE FILE OR FOLDER

async function deleteFileItem(id) {
    return await fileTransaction("readwrite", store => {
        return store.delete(id);
    });
}

// STATUS MESSAGE

function setFileStatus(message) {
    const status = document.getElementById("fileManagerStatus");

    if (status) {
        status.textContent = message;
    }
}

// GENERATE ID

function generateFileId() {
    return window.crypto?.randomUUID
        ? window.crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
}

// FILE SIZE FORMAT

function formatFileSize(bytes) {

    if (bytes < 1024) return `${bytes} B`;

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// DETERMINE FILE CATEGORY

function getFileCategory(item) {

    if (item.type === "folder") return "folders";

    if (item.mime?.startsWith("image/")) {
        return "images";
    }

    return "documents";
}

// FILE ICON

function getFileIcon(item) {

    if (item.type === "folder") return "folder";

    if (item.mime?.startsWith("image/")) return "image";

    if (item.mime?.includes("pdf")) return "file-text";

    return "file";
}

// RENDER FILE LIST

async function renderFileList() {

    const fileList = document.getElementById("fileList");
    const fileCount = document.getElementById("fileCount");

    if (!fileList || !fileCount || !fileDatabase) return;

    try {

        const files = await getAllFiles();

        const search = document
            .getElementById("fileSearch")
            .value.toLowerCase()
            .trim();

        const filteredFiles = files.filter(item => {

            const matchesSearch = item.name
                .toLowerCase()
                .includes(search);

            const matchesCategory =
                activeFileFilter === "all" ||
                getFileCategory(item) === activeFileFilter;

            return matchesSearch && matchesCategory;
        });

        fileCount.textContent = `${files.length} ITEMS`;

        fileList.replaceChildren();

        if (filteredFiles.length === 0) {

            const empty = document.createElement("p");

            empty.className = "file-empty";

            empty.textContent = files.length === 0
                ? "Your file library is empty. Upload a file or create a folder to begin."
                : "No matching items found.";

            fileList.appendChild(empty);

            return;
        }

        filteredFiles.sort((a, b) => {

            if (a.type === "folder" && b.type !== "folder") return -1;
            if (a.type !== "folder" && b.type === "folder") return 1;

            return a.name.localeCompare(b.name);
        });

        filteredFiles.forEach(item => {

            const row = document.createElement("div");
            row.className = "file-row";

            const nameArea = document.createElement("div");
            nameArea.className = "file-name-area";

            const icon = document.createElement("i");
            icon.setAttribute("data-lucide", getFileIcon(item));

            const name = document.createElement("strong");
            name.textContent = item.name;

            nameArea.append(icon, name);

            const type = document.createElement("span");
            type.className = "file-type";
            type.textContent = item.type === "folder"
                ? "FOLDER"
                : formatFileSize(item.size || 0);

            
const actions = document.createElement("div");
actions.className = "file-actions";

const isImage = item.type !== "folder" && (
    (item.mime || item.blob?.type || "").startsWith("image/") ||
    /\.(png|jpe?g|gif|webp|bmp|svg|avif)$/i.test(item.name)
);

if (isImage) {
    const previewButton = document.createElement("button");
    previewButton.textContent = "VIEW";

    previewButton.addEventListener("click", () => {
        openImagePreview(item);
    });

    actions.appendChild(previewButton);
}

const renameButton = document.createElement("button");
renameButton.textContent = "RENAME";

renameButton.addEventListener("click", async () => {

    const newName = prompt("Enter the new name:", item.name);

    if (!newName || !newName.trim()) return;

    item.name = newName.trim();

    await saveFileItem(item);

    setFileStatus("Item renamed successfully.");

    renderFileList();
});

const deleteButton = document.createElement("button");
deleteButton.textContent = "DELETE";

deleteButton.addEventListener("click", async () => {

    if (!confirm(`Delete ${item.name}?`)) return;

    await deleteFileItem(item.id);

    setFileStatus("Item deleted.");

    renderFileList();
});

actions.append(renameButton, deleteButton);

            row.append(nameArea, type, actions);

            fileList.appendChild(row);
        });

        if (window.lucide) {
            lucide.createIcons();
        }

    } catch (error) {

        console.error("File rendering error:", error);

        setFileStatus("Could not display your files.");
    }
}

// CREATE FOLDER

async function createFileFolder() {

    const name = prompt("Enter folder name:");

    if (!name || !name.trim()) return;

    const folder = {
        id: generateFileId(),
        name: name.trim(),
        type: "folder",
        createdAt: new Date().toISOString()
    };

    await saveFileItem(folder);

    setFileStatus(`${folder.name} created successfully.`);

    renderFileList();
}

// UPLOAD FILES

async function uploadFiles(event) {

    const selectedFiles = Array.from(event.target.files);

    if (!selectedFiles.length) return;

    try {

        for (const file of selectedFiles) {

            const item = {
                id: generateFileId(),
                name: file.name,
                type: "file",
                mime: file.type || "application/octet-stream",
                size: file.size,
                blob: file,
                createdAt: new Date().toISOString()
            };

            await saveFileItem(item);
        }

        setFileStatus(
            `${selectedFiles.length} file(s) uploaded successfully.`
        );

        event.target.value = "";

        renderFileList();

    } catch (error) {

        console.error("Upload error:", error);

        setFileStatus(
            "Upload failed. Browser storage may be full or unavailable."
        );
    }
}

// FILTER BUTTONS

document.querySelectorAll(".file-filter").forEach(button => {

    button.addEventListener("click", () => {

        activeFileFilter = button.dataset.filter;

        document.querySelectorAll(".file-filter").forEach(filter => {
            filter.classList.remove("active");
        });

        button.classList.add("active");

        renderFileList();
    });
});

// SEARCH

document.getElementById("fileSearch")?.addEventListener(
    "input",
    renderFileList
);

// CREATE FOLDER BUTTON

document.getElementById("createFolderBtn")?.addEventListener(
    "click",
    createFileFolder
);

// UPLOAD BUTTON

document.getElementById("fileUpload")?.addEventListener(
    "change",
    uploadFiles
);

// INITIALIZE FILE MANAGER

async function initializeFileManager() {

    try {

        await openFileDatabase();

        await renderFileList();

        console.log("PRINCE OS File Manager initialized.");

    } catch (error) {

        console.error("File Manager initialization failed:", error);

        setFileStatus(
            "File storage could not initialize in this browser."
        );
    }
}

initializeFileManager();

/* =========================================
   PRINCE OS v4.3 — IMAGE PREVIEW ENGINE
========================================= */

let activePreviewUrl = null;

function openImagePreview(item) {

    const modal = document.getElementById("filePreviewModal");
    const image = document.getElementById("previewImage");
    const title = document.getElementById("previewFileName");
    const details = document.getElementById("previewFileDetails");

    if (!modal || !image || !item.blob) {
        console.error("Image preview unavailable.");
        return;
    }

    if (activePreviewUrl) {
        URL.revokeObjectURL(activePreviewUrl);
    }

    activePreviewUrl = URL.createObjectURL(item.blob);

    image.src = activePreviewUrl;
    title.textContent = item.name;
    details.textContent = formatFileSize(item.size || 0);

    modal.classList.add("active");

    if (window.lucide) {
        lucide.createIcons();
    }
}

function closeImagePreview() {

    const modal = document.getElementById("filePreviewModal");
    const image = document.getElementById("previewImage");

    modal.classList.remove("active");
    image.src = "";

    if (activePreviewUrl) {
        URL.revokeObjectURL(activePreviewUrl);
        activePreviewUrl = null;
    }
}

document.getElementById("closeFilePreview")
    ?.addEventListener("click", closeImagePreview);

document.getElementById("filePreviewModal")
    ?.addEventListener("click", event => {

        if (event.target.id === "filePreviewModal") {
            closeImagePreview();
        }
    });

document.addEventListener("keydown", event => {

    if (event.key === "Escape") {
        closeImagePreview();
    }
});

/* END OF PRINCE OS FILE MANAGER */