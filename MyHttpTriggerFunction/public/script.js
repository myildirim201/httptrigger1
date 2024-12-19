let scratchCount = 0;

// Canvas setup for scratch effect
const canvas = document.getElementById("scratch");
const ctx = canvas.getContext("2d");

let isDrawing = false;

// Fill the canvas with a gray "scratchable" layer
function initializeCanvas() {
    ctx.fillStyle = "#999";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Function to "scratch off" the canvas
function scratch(e) {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Clear the scratched area (reveals the base)
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();
}

// Mouse events for scratch effect
canvas.addEventListener("mousedown", () => {
    isDrawing = true;
    scratchCount++;
    console.log(`Scratch Count: ${scratchCount}`);
    sendProgress("scratch", scratchCount);
});

canvas.addEventListener("mousemove", scratch);
canvas.addEventListener("mouseup", () => (isDrawing = false));
canvas.addEventListener("mouseleave", () => (isDrawing = false));

// Send progress to SaveProgress function
function sendProgress(eventType, count = 1) {
    fetch("http://localhost:7071/api/SaveProgress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventType: eventType, count: count })
    })
    .then((response) => response.json())
    .then((data) => console.log("Progress Saved:", data))
    .catch((error) => console.error("Error saving progress:", error));
}

// Retrieve progress
function getProgress() {
    fetch("http://localhost:7071/api/RetrieveProgress")
        .then((response) => response.json())
        .then((data) => {
            alert(`Page Loads: ${data.pageLoads}, Scratch Count: ${data.scratch}`);
        })
        .catch((error) => console.error("Error retrieving progress:", error));
}

// Add a button to retrieve progress
document.addEventListener("DOMContentLoaded", () => {
    const button = document.createElement("button");
    button.textContent = "Retrieve Progress";
    button.onclick = getProgress;
    document.body.appendChild(button);

    // Initialize scratchable canvas
    initializeCanvas();
});
