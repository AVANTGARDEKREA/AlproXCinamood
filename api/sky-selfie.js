export default async function handler(req, res) {
    // Nur POST-Anfragen erlauben
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed. Verwende POST.' });
    }

    try {
        const { image } = req.body; // Base64-Bild vom Frontend

        if (!image) {
            return res.status(400).json({ error: 'Kein Bild empfangen.' });
        }

        // Krea API Key aus den Umgebungsvariablen (wird in Vercel hinterlegt)
        const apiKey = process.env.KREA_API_KEY;
        if (!apiKey) {
            console.error("KREA_API_KEY ist nicht in den Umgebungsvariablen definiert.");
            return res.status(500).json({ error: 'Server-Konfigurationsfehler: API Key fehlt.' });
        }

        console.log("Sende Anfrage an Krea API...");

        // API Call zu Krea
        // Hinweis: Passe den Endpoint und das Payload-Format an die offizielle Krea API-Dokumentation an.
        const response = await fetch('https://api.krea.ai/v1/image-generation/img2img', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image: image,
                prompt: "A professional selfie of a person high up in the blue sky, floating among fluffy white clouds, bright sunny day, highly detailed, cinematic lighting, masterpiece",
                negative_prompt: "blurry, deformed face, bad anatomy, ugly, dark background, night, indoor",
                strength: 0.35, // Stärke der Bildveränderung (0.3 - 0.4)
                width: 1024,
                height: 1024,
                guidance_scale: 7.5
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Krea API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const outputImageUrl = data.output_url || (data.images && data.images[0]);

        if (!outputImageUrl) {
            throw new Error("Kein Ausgabebild von der API erhalten.");
        }

        // Erfolgreiche Antwort zurückgeben
        return res.status(200).json({ success: true, imageUrl: outputImageUrl });

    } catch (error) {
        console.error("Fehler im Serverless-Endpoint:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
