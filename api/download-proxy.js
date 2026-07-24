// Ersetzen Sie den bestehenden 'downloadBtn' Event-Listener

downloadBtn.addEventListener('click', (event) => {
    event.preventDefault(); // Verhindert, dass der Link normal navigiert

    const imageUrl = resultImg.src;
    if (!imageUrl || imageUrl.startsWith('data:')) {
        alert("Es gibt noch kein generiertes Bild zum Herunterladen.");
        return;
    }
    
    // --- NEUE, ROBUSTE DOWNLOAD-LOGIK ---
    // Wir erstellen eine URL zu unserem eigenen Backend-Proxy
    // und übergeben die Krea-Bild-URL als Parameter.
    const downloadUrl = `/api/download-proxy?url=${encodeURIComponent(imageUrl)}`;
    
    // Wir öffnen diese URL. Der Browser wird den Download automatisch starten,
    // da unser Backend die richtigen "Content-Disposition"-Header sendet.
    window.open(downloadUrl, '_blank');
});

// Der Rest Ihrer app.js-Datei bleibt unverändert.
