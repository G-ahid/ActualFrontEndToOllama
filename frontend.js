const input     = document.getElementById("mainInput");
const stat      = document.getElementById("statusIndicator");
const responses = document.getElementById("responses");

status_interval_id = null
function SetStatus(_stat = "Ready", animate = true) {
    clearInterval(status_interval_id);
    stat.innerText = _stat;
    if (_stat != "Ready" && animate) {
        i = 0;
        status_interval_id = setInterval(() => {
            stat.innerText = _stat + ".".repeat(i);
            i += 1;
            if (i > 3){
                i = 0;
            }
        }, 500);
    }
}

SetStatus("Trying to reach API");
input.disabled = true;
init(connected => {
    if (connected) {
        SetStatus();
        input.disabled = false;
        input.focus();
    } else {
        SetStatus("AI is down", false);
        input.placeholder = "Unable to chat with ai for now.";
    }
});

input.addEventListener("keydown", async k => {
    if (k.key == "Enter") {
        SetStatus("Waiting for response");
        input.disabled = true;

        const response = document.createElement("p");
        response.className = "response";
        responses.appendChild(response);

        let fw = false; // Fist word
        await sendPrompt(input.value, (chunk) => {
            const previous = responses.lastChild.dataset.raw || "";
            const fullText = previous + chunk;
            responses.lastChild.dataset.raw = fullText; // store raw text
            responses.lastChild.innerHTML = marked.parse(fullText);
            if (!fw) {
                SetStatus("AI is responding",false);
            }
            fw = true;
        });
        
        input.value = "";
        input.disabled = false;
        input.focus();
        SetStatus();
    }
});