const debug = true;

let RAW_OLLAMA_URL =  "";
let OLLAMA_URL     =  "";

if (debug) {
    const OLLAMA_PORT = 11434;
    RAW_OLLAMA_URL =  `http://${window.location.hostname}:${OLLAMA_PORT}`;
    OLLAMA_URL     =  `${RAW_OLLAMA_URL}/api/generate`;
}else {
    (async () => {
            const res = await fetch("config.json");
            const config = await res.json();
            RAW_OLLAMA_URL = config.api;
            OLLAMA_URL     =  `${RAW_OLLAMA_URL}/api/generate`;
    })();
}

const model_name = "deepseek-r1:1.5b";

async function CheckIsConnected() {
    try {
        const res = await fetch(RAW_OLLAMA_URL);
        const text = await res.text();
        console.log(text);
        return text === "Ollama is running";;
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