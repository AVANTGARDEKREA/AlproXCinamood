// In /api/download-proxy.js

// 1. Das Bild wird in den Arbeitsspeicher des Servers geladen (nicht auf die Festplatte)
const imageBuffer = await imageResponse.buffer();

// 2. Die Daten werden direkt an den Browser des Nutzers "gestreamt"
//    mit Anweisungen, den Download zu starten.
res.setHeader('Content-Type', 'image/png');
res.setHeader('Content-Disposition', 'attachment; filename="My-Cloudie.png"');
res.send(imageBuffer);
