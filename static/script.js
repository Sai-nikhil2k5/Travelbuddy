let currentThreadId = localStorage.getItem("travel_thread_id") || null;
let latestAnswerMarkdown = "";
let selectedPersona = "duo";
let loadingInterval = null;

// Companion Persona Descriptions
const personaMessages = {
    duo: `"I'm <strong>Hazel</strong>! I handle flight routes, daily itineraries, and detail checks. And I'm <strong>Barnaby</strong>! I find the coziest stays, local treats, and budget hacks. Tell us your trip dreams below!"`,
    hazel: `"Hazel active 🐰: <em>'I'll double check every flight connection, baggage rule, and daily schedule for maximum travel efficiency!'</em>"`,
    barnaby: `"Barnaby active 🐻: <em>'Leave the cozy cafe spots, street food markets, and smart budget tricks to me!'</em>"`
};

// Loading step messages
const loadingSteps = [
    { title: "Hazel is scanning flight routes... ✈️", sub: "Checking live availability and best connection times..." },
    { title: "Barnaby is inspecting cozy stays... 🏨", sub: "Finding comfortable hotels with top value and location scores..." },
    { title: "Mapping out daily adventures... 🗺️", sub: "Balancing sightseeing, relaxation, and local food spots..." },
    { title: "Putting together your Travel Scrapbook... 📖", sub: "Finalizing itinerary notes and packing guidelines..." }
];

// Initialize DOM events on load
document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("userInput");
    const charCount = document.getElementById("charCount");

    if (input) {
        input.addEventListener("input", () => {
            const count = input.value.length;
            if (charCount) {
                charCount.textContent = `${count} chars`;
            }
        });
    }
});

// Switch persona guide
function selectPersona(persona) {
    selectedPersona = persona;
    const buttons = document.querySelectorAll(".persona-btn");
    buttons.forEach(btn => {
        if (btn.dataset.persona === persona) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    const speechText = document.getElementById("companionSpeechText");
    if (speechText && personaMessages[persona]) {
        speechText.innerHTML = personaMessages[persona];
    }
}

// Quick Prompt Handler
function setPrompt(text) {
    const input = document.getElementById("userInput");
    if (input) {
        input.value = text;
        input.focus();
        const charCount = document.getElementById("charCount");
        if (charCount) {
            charCount.textContent = `${text.length} chars`;
        }
    }
}

// Control Loading State
function setLoading(isLoading) {
    const sendBtn = document.getElementById("sendBtn");
    const btnText = document.getElementById("btnText");
    const btnLoader = document.getElementById("btnLoader");
    const loadingSection = document.getElementById("loadingSection");
    const loadingTitle = document.getElementById("loadingStepTitle");
    const loadingSub = document.getElementById("loadingStepSub");

    if (sendBtn) sendBtn.disabled = isLoading;

    if (isLoading) {
        if (btnText) btnText.classList.add("hidden");
        if (btnLoader) btnLoader.classList.remove("hidden");
        if (loadingSection) loadingSection.classList.remove("hidden");

        let stepIndex = 0;
        if (loadingTitle && loadingSub) {
            loadingTitle.textContent = loadingSteps[0].title;
            loadingSub.textContent = loadingSteps[0].sub;
        }

        loadingInterval = setInterval(() => {
            stepIndex = (stepIndex + 1) % loadingSteps.length;
            if (loadingTitle && loadingSub) {
                loadingTitle.textContent = loadingSteps[stepIndex].title;
                loadingSub.textContent = loadingSteps[stepIndex].sub;
            }
        }, 2800);

    } else {
        if (btnText) btnText.classList.remove("hidden");
        if (btnLoader) btnLoader.classList.add("hidden");
        if (loadingSection) loadingSection.classList.add("hidden");
        if (loadingInterval) clearInterval(loadingInterval);
    }
}

function showError(message) {
    const errorBox = document.getElementById("errorBox");
    const errorText = document.getElementById("errorText");

    if (errorBox && errorText) {
        errorText.textContent = message;
        errorBox.classList.remove("hidden");
    }
}

function hideError() {
    const errorBox = document.getElementById("errorBox");
    if (errorBox) {
        errorBox.classList.add("hidden");
    }
}

// Tab Switcher logic
function switchTab(tabName) {
    const tabs = document.querySelectorAll(".tab-btn");
    tabs.forEach(tab => tab.classList.remove("active"));

    const contents = document.querySelectorAll(".tab-content");
    contents.forEach(content => content.classList.add("hidden"));

    if (tabName === "itinerary") {
        document.querySelector(".tab-btn:nth-child(1)")?.classList.add("active");
        document.getElementById("tabItinerary")?.classList.remove("hidden");
    } else if (tabName === "checklist") {
        document.querySelector(".tab-btn:nth-child(2)")?.classList.add("active");
        document.getElementById("tabChecklist")?.classList.remove("hidden");
    } else if (tabName === "notes") {
        document.querySelector(".tab-btn:nth-child(3)")?.classList.add("active");
        document.getElementById("tabNotes")?.classList.remove("hidden");
    }
}

// Show Result Plan
function showResult(answer, threadId) {
    latestAnswerMarkdown = answer;

    const resultSection = document.getElementById("resultSection");
    const resultBox = document.getElementById("resultBox");
    const threadInfo = document.getElementById("threadInfo");

    if (resultBox) {
        if (typeof marked !== "undefined") {
            resultBox.innerHTML = marked.parse(answer);
        } else {
            resultBox.innerText = answer;
        }
    }

    if (threadInfo) {
        threadInfo.textContent = `Thread ID: ${threadId}`;
    }

    if (resultSection) {
        resultSection.classList.remove("hidden");
        switchTab("itinerary");
        resultSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}

// Main Send Message Function
async function sendMessage() {
    hideError();

    const input = document.getElementById("userInput");
    let message = input.value.trim();

    if (!message) {
        showError("Please enter your travel request first! Hazel and Barnaby are waiting to help.");
        return;
    }

    // Append persona preference note if specific guide selected
    if (selectedPersona === "hazel") {
        message = `[Guide Preference: Hazel (Focus on flights, transit connections, day schedules and detailed timings)] ${message}`;
    } else if (selectedPersona === "barnaby") {
        message = `[Guide Preference: Barnaby (Focus on budget friendliness, cozy cafes, street food and relaxed vibes)] ${message}`;
    }

    setLoading(true);

    try {
        const response = await fetch("/api/travel", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message,
                thread_id: currentThreadId
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || "Something went wrong generating your trip plan.");
        }

        currentThreadId = data.thread_id;
        localStorage.setItem("travel_thread_id", currentThreadId);

        showResult(data.answer, data.thread_id);

    } catch (error) {
        showError(error.message);
    } finally {
        setLoading(false);
    }
}

// Copy Markdown Text
function copyResult() {
    const resultBox = document.getElementById("resultBox");
    if (!resultBox || !resultBox.innerText) return;

    navigator.clipboard.writeText(resultBox.innerText)
        .then(() => {
            const copyBtn = document.querySelector(".copy-btn");
            if (copyBtn) {
                const oldHtml = copyBtn.innerHTML;
                copyBtn.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
                setTimeout(() => {
                    copyBtn.innerHTML = oldHtml;
                }, 1800);
            }
        })
        .catch(() => {
            showError("Could not copy itinerary text.");
        });
}

// Download PDF Journal
function downloadPDF() {
    const pdfContent = document.getElementById("pdfContent");

    if (!latestAnswerMarkdown || !pdfContent) {
        showError("No travel plan available to download yet.");
        return;
    }

    const downloadBtn = document.querySelector(".download-btn");
    const oldHtml = downloadBtn ? downloadBtn.innerHTML : "";

    if (downloadBtn) {
        downloadBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Generating PDF...`;
        downloadBtn.disabled = true;
    }

    const options = {
        margin: 0.4,
        filename: "TravelBuddy-Cozy-Trip-Plan.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#FFFDF9" },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] }
    };

    html2pdf()
        .set(options)
        .from(pdfContent)
        .save()
        .then(() => {
            if (downloadBtn) {
                downloadBtn.innerHTML = oldHtml;
                downloadBtn.disabled = false;
            }
        })
        .catch(() => {
            if (downloadBtn) {
                downloadBtn.innerHTML = oldHtml;
                downloadBtn.disabled = false;
            }
            showError("Could not generate PDF download.");
        });
}

// Shortcut listener for Ctrl + Enter
document.addEventListener("keydown", function (event) {
    if (event.ctrlKey && event.key === "Enter") {
        sendMessage();
    }
});