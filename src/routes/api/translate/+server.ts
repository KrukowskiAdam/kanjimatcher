import { json } from "@sveltejs/kit";
import {
    AZURE_TRANSLATOR_ENDPOINT,
    AZURE_TRANSLATOR_KEY,
    AZURE_TRANSLATOR_REGION
} from "$env/static/private";

const endpoint = AZURE_TRANSLATOR_ENDPOINT || "https://api.cognitive.microsofttranslator.com";

export const POST = async ({ request }) => {
    if (!AZURE_TRANSLATOR_KEY || !AZURE_TRANSLATOR_REGION) {
        return json({ error: "Missing translator config" }, { status: 500 });
    }

    const body = (await request.json()) as { texts?: string[] };
    const texts = Array.isArray(body.texts) ? body.texts : [];

    if (!texts.length) {
        return json({ translations: [] });
    }

    const response = await fetch(
        `${endpoint}/translate?api-version=3.0&from=ja&to=en`,
        {
            method: "POST",
            headers: {
                "Ocp-Apim-Subscription-Key": AZURE_TRANSLATOR_KEY,
                "Ocp-Apim-Subscription-Region": AZURE_TRANSLATOR_REGION,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(texts.map((text) => ({ Text: text })))
        }
    );

    if (!response.ok) {
        return json({ error: "Translate failed" }, { status: response.status });
    }

    const data = (await response.json()) as Array<{ translations?: Array<{ text: string }> }>;
    const translations = data.map((item) => item.translations?.[0]?.text ?? "");

    return json({ translations });
};
