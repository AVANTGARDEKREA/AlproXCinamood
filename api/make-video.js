import { Krea } from "@krea-ai/sdk";

export default async function handler(req, res) {
  // 1. Prüfung der Anfrage und der Inputs
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  
  // Wir erwarten jetzt die URL des generierten Bildes vom Frontend
  const { imageUrl } = req.body; 
  const apiKey = process.env.KREA_API_KEY;

  if (!imageUrl || !apiKey) {
    return res.status(400).json({ message: 'Bild-URL oder API-Schlüssel fehlen.' });
  }

  // 2. Krea SDK initialisieren
  const krea = new Krea({ apiKey });

  try {
    // 3. Video-Generierung exakt nach Ihrer Vorlage starten
    const result = await krea.subscribe("video/bytedance/seedance-1.0-pro", {
      input: {
        aspect_ratio: "9:16",
        duration: 5,
        resolution: "1080p",
        
        // Das generierte Bild als Referenz übergeben
        reference_images: [
          imageUrl 
        ]
      }
    });
    
    // 4. Ergebnis verarbeiten und zurücksenden
    if (result.data?.urls?.[0]) {
      res.status(200).json({ url: result.data.urls[0] });
    } else {
      console.error('Krea SDK hat keine gültige Video-URL zurückgegeben:', result);
      throw new Error('Krea SDK hat keine gültige Video-URL zurückgegeben.');
    }

  } catch (error) {
    // Detaillierte Fehlerbehandlung
    console.error('Krea SDK Fehler (Video):', error);
    let detailedErrorMessage = error.message;
    if (typeof error === 'object') {
        detailedErrorMessage = JSON.stringify(error);
    }
    
    res.status(500).json({ 
        message: 'Ein Fehler ist bei der Video-Generierung aufgetreten.', 
        details: detailedErrorMessage 
    });
  }
}
