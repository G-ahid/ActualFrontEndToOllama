const input     = document.getElementById("mainInput");
const stat      = document.getElementById("statusIndicator");
const responses = document.getElementById("responses");

function SetStatus(_stat = "Ready") {
    stat.innerText = _stat
}

(async () => {
    if (await CheckIsConnected()) {
        SetStatus();
    } else {
        SetStatus("AI is not accessible!");
    }
})();

input.addEventListener("keydown", async k => {
    if (k.key == "Enter") {
        SetStatus("Waiting for response...");
        input.disabled = true;

        const response = document.createElement("p");
        response.className = "response";
        responses.appendChild(response);

        await sendPrompt(input.value, (chunk) => {
            const previous = responses.lastChild.dataset.raw || "";
            const fullText = previous + chunk;
            responses.lastChild.dataset.raw = fullText; // store raw text
            responses.lastChild.innerHTML = marked.parse(fullText);
        });
        
        input.value = "";
        input.disabled = false;
        input.focus();
        SetStatus();
    }
});