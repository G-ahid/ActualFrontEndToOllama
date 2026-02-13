let ready = false;
let RAW_OLLAMA_URL =  "";
let OLLAMA_URL     =  "";

async function init(callback) {
    const res = await fetch("config.json");
    const config = await res.json();
    RAW_OLLAMA_URL = config.api;
    OLLAMA_URL     =  `${RAW_OLLAMA_URL}/api/generate`;
    ready = true;
    callback(await CheckIsConnected());
}

const model_name = "smollm:135m";

async function CheckIsConnected() {
    try {
        const r = await fetch(RAW_OLLAMA_URL);
        return true;
    } catch (e) {
        console.error("Failed to check Ollama:", e);
        return false;
    }
}


async function SimplePrompt(prompt) {
    const res = await fetch(OLLAMA_URL, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
            model:  model_name,
            prompt: prompt,
            stream: false
        }),
    });

    const data = await res.json();
    return data;
}

async function sendPrompt(prompt, callback) {
    const res = await fetch(OLLAMA_URL, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
            model:  model_name,
            prompt: prompt,
            stream: true
        }),
    });
    
    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
        const { value , done } = await reader.read();
        if (done){
            break
        }
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter(Boolean);

        for (const line of lines) {
            try {
                const json = JSON.parse(line);
                if (callback) {
                    callback(json.response);
                }
            } catch (e) {
                console.warn(e);
            }
        }
    }
}