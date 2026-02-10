import {
    AZURE_SPEECH_KEY,
    AZURE_SPEECH_REGION,
    AZURE_SPEECH_VOICE
} from "$env/static/private";

const escapeXml = (value: string) =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&apos;");

const resolveText = async (request: Request, url: URL) => {
    const queryText = url.searchParams.get("text")?.trim();
    if (queryText) {
        return queryText;
    }

    try {
        const body = (await request.json()) as { text?: string };
        return body.text?.trim();
    } catch {
        return undefined;
    }
};

const handleTts = async (request: Request, url: URL) => {
    if (!AZURE_SPEECH_KEY || !AZURE_SPEECH_REGION) {
        return new Response("Missing speech config", { status: 500 });
    }

    const text = await resolveText(request, url);

    if (!text) {
        return new Response("Missing text", { status: 400 });
    }

    const voice = AZURE_SPEECH_VOICE || "ja-JP-NanamiNeural";
    const ssml = `<speak version='1.0' xml:lang='ja-JP'><voice name='${voice}'>${escapeXml(
        text
    )}</voice></speak>`;

    const response = await fetch(
        `https://${AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
        {
            method: "POST",
            headers: {
                "Ocp-Apim-Subscription-Key": AZURE_SPEECH_KEY,
                "Content-Type": "application/ssml+xml",
                "X-Microsoft-OutputFormat": "audio-16khz-32kbitrate-mono-mp3"
            },
            body: ssml
        }
    );

    if (!response.ok) {
        return new Response("TTS failed", { status: response.status });
    }

    const audio = await response.arrayBuffer();
    return new Response(audio, {
        headers: {
            "Content-Type": "audio/mpeg"
        }
    });
};

export const GET = async ({ request, url }) => handleTts(request, url);

export const POST = async ({ request, url }) => handleTts(request, url);
