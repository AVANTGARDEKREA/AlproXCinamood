import { Krea } from "@krea-ai/sdk";

export default async function handler(req, res) {
  // 1. Notwendige Daten aus der Anfrage und den Umgebungsvariablen holen
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }


  
  const { image } = req.body; // Dies ist die dynamische Data-URI vom Frontend

  
  
  const apiKey = process.env.KREA_API_KEY; // Der API-Schlüssel von Vercel

  if (!image || !apiKey) {
    return res.status(400).json({ message: 'Bilddaten oder API-Schlüssel fehlen.' });
  }

  // 2. Krea SDK initialisieren
  const krea = new Krea({ apiKey });

  try {
    // 3. 'krea.subscribe' exakt nach Ihrer Vorlage aufrufen
    const result = await krea.subscribe("image/bytedance/seedream-5-lite", {
      input: {
        // Parameter aus Ihrer Vorlage
        prompt: "A selfie of one or more persons depending on the input image in a beige room, brown barista coffee art swirls surrounding them, highly detailed, cinematic lighting",
        width: 1080,
        height: 1920,
        seed: 1337,

        // WICHTIG: Die neue 'style_images'-Struktur, um das Bild zu übergeben.
        // Die dynamische URL vom Frontend wird hier eingesetzt.
        style_images: [   {
        "url": "https://app-uploads.krea.ai/5c91f552-dafd-4b37-9e57-aab881291032/1784715139925-logo.png",
        "strength": 1
      },
          {
            "url": image, // Hier wird die dynamische Data-URI eingesetzt
            strength: 1
          }
        ]
      }
    });

    
    // 4. Ergebnis verarbeiten und zurücksenden
    if (result.data?.urls?.[0]) {
      res.status(200).json({ url: result.data.urls[0] });
    } else {
      console.error('Krea SDK hat keine gültigen Daten zurückgegeben:', result);
      throw new Error('Krea SDK hat keine gültige Bild-URL zurückgegeben.');
    }

  } catch (error) {
    // Detaillierte Fehlerbehandlung für das Debugging
    console.error('Krea SDK Fehler:', error);
    let detailedErrorMessage = error.message;
    if (typeof error === 'object') {
        detailedErrorMessage = JSON.stringify(error);
    }
    
    res.status(500).json({ 
        message: 'Ein Fehler ist bei der Bildgenerierung aufgetreten.', 
        details: detailedErrorMessage 
    });
  }
}
