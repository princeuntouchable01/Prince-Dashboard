function updateClock() {
    const now = new Date();

    const time = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    const date = now.toLocaleDateString([], {
        weekday: "long",
        month: "long",
        day: "numeric"
    });

    document.getElementById("clock").textContent = time;
    document.getElementById("date").textContent = date;
}

updateClock();

setInterval(updateClock, 1000);


function updateSystemStatus() {
    // Clock
    const now = new Date();

    const time = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    const date = now.toLocaleDateString([], {
        weekday: "long",
        month: "short",
        day: "numeric"
    });

    const clock = document.getElementById("clock");
    const dateDisplay = document.getElementById("date");

    if (clock) clock.textContent = time;
    if (dateDisplay) dateDisplay.textContent = date;

    // Network
    const network = document.getElementById("network");

    if (network) {
        network.textContent = navigator.onLine
            ? "ONLINE"
            : "OFFLINE";
    }
}

// Update immediately
updateSystemStatus();

// Update clock every second
setInterval(updateSystemStatus, 1000);

// Network changes
window.addEventListener("online", updateSystemStatus);
window.addEventListener("offline", updateSystemStatus);


// Battery
if ("getBattery" in navigator) {
    navigator.getBattery().then(battery => {

        function updateBattery() {
            const batteryElement =
                document.getElementById("battery");

            if (batteryElement) {
                batteryElement.textContent =
                    Math.round(battery.level * 100) + "%";
            }
        }

        updateBattery();

        battery.addEventListener("levelchange", updateBattery);
    });
}
const commandInput = document.getElementById("commandInput");
const commandButton = document.getElementById("commandButton");
const commandOutput = document.getElementById("commandOutput");

function runCommand() {
    const command = commandInput.value.trim();

    if (!command) {
        commandOutput.textContent = "Please enter a command.";
        return;
    }

    const lowerCommand = command.toLowerCase();

    if (lowerCommand === "github") {
        window.open(
            "https://github.com/princeuntouchable01",
            "_blank"
        );

        commandOutput.textContent = "Opening GitHub...";
        return;
    }

    if (lowerCommand === "portfolio") {
        commandOutput.textContent = "Portfolio command detected.";
        return;
    }

    if (lowerCommand === "tp-ai" || lowerCommand === "tpai") {
        commandOutput.textContent = "Launching TP-AI...";
        return;
    }

    if (lowerCommand === "projects") {
        commandOutput.textContent = "Opening projects...";
        return;
    }

    if (lowerCommand.startsWith("google ")) {
        const searchQuery = command.substring(7).trim();

        if (searchQuery) {
            const url =
                "https://www.google.com/search?q=" +
                encodeURIComponent(searchQuery);

            window.open(url, "_blank");

            commandOutput.textContent =
                "Searching Google for: " + searchQuery;

            return;
        }
    }

    if (lowerCommand.startsWith("youtube ")) {
        const searchQuery = command.substring(8).trim();

        if (searchQuery) {
            const url =
                "https://www.youtube.com/results?search_query=" +
                encodeURIComponent(searchQuery);

            window.open(url, "_blank");

            commandOutput.textContent =
                "Searching YouTube for: " + searchQuery;

            return;
        }
    }

    commandOutput.textContent =
        'Unknown command. Try "google cyber security".';
}

commandButton.addEventListener("click", runCommand);

commandInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        runCommand();
    }
});