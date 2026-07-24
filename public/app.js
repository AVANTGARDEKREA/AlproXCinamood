document.addEventListener('DOMContentLoaded', () => {
    // 1. Alle HTML-Elemente holen
    const webcam = document.getElementById('webcam');
    const resultImg = document.getElementById('result-img');
    const startScreen = document.getElementById('start-screen');
    const startBtn = document.getElementById('start-btn');
    const captureBtn = document.getElementById('capture-btn');
    const loadingContainer = document.getElementById('loading-container');
    const loadingText = document.getElementById('loading-text');
    const resultControls = document.getElementById('result-controls');
    const restartBtn = document.getElementById('restart-btn');
    const downloadBtn = document.getElementById('download-btn');

    // ... (Variablen und Lade-Nachrichten bleiben gleich) ...

    // --- KORREKTUR: Die Download-Logik wurde in einen eigenen Event-Listener ausgelagert ---
    downloadBtn.addEventListener('click', async (event) => {
        event.preventDefault(); // Verhindert, dass der Link normal navigiert

        // Überprüfen, ob eine Bild-URL vorhanden ist
        const imageUrl = resultImg.src;
        if (!imageUrl || imageUrl.startsWith('data:')) { // Funktioniert nicht mit dem lokalen Standbild
            alert("Es gibt noch kein generiertes Bild zum Herunterladen.");
            return;
        }

        // Informiere den Nutzer
        const originalText = downloadBtn.textContent;
        downloadBtn.textContent = "Lade...";
        downloadBtn.style.pointerEvents = 'none'; // Verhindert Doppelklicks

        try {
            // 1. Lade die Bilddaten von der Krea-URL
            const response = await fetch(imageUrl);
            // 2. Wandle die Daten in einen "Blob" um (eine Art rohe Datei)
            const blob = await response.blob();
            // 3. Erstelle eine temporäre, lokale URL für diese Datei
            const objectUrl = URL.createObjectURL(blob);

            // 4. Erstelle ein unsichtbares Link-Element, um den Download auszulösen
            const tempLink = document.createElement('a');
            tempLink.href = objectUrl;
            tempLink.download = 'My-Cloudie.png'; // Der Dateiname
            document.body.appendChild(tempLink); // Füge es zum Dokument hinzu
            tempLink.click(); // Klicke den Link programmatisch
            document.body.removeChild(tempLink); // Entferne das unsichtbare Element
            
            // 5. Gib die temporäre URL wieder frei, um Speicher zu sparen
            URL.revokeObjectURL(objectUrl);

        } catch (error) {
            console.error("Download-Fehler:", error);
            alert("Der Download konnte nicht gestartet werden.");
        } finally {
            // Setze den Button-Text zurück
            downloadBtn.textContent = originalText;
            downloadBtn.style.pointerEvents = 'auto';
        }
    });


    // --- Der Rest der app.js bleibt größtenteils unverändert ---

    const showResultScreen = (imageUrl) => {
        resultImg.src = imageUrl;
        resultImg.classList.remove('hidden', 'blurred');
        loadingContainer.classList.add('hidden');
        resultControls.classList.remove('hidden');
        // Wir müssen hier nichts mehr für den Download-Button tun,
        // da er jetzt seinen eigenen Event-Listener hat.
    };
    
    // Die restlichen Funktionen bleiben exakt wie in der vorherigen Version
    const showStartScreen = () => {
        startScreen.classList.remove('hidden');
        webcam.classList.add('hidden');
        resultImg.classList.add('hidden');
        captureBtn.classList.add('hidden');
        loadingContainer.classList.add('hidden');
        resultControls.classList.add('hidden');
        
        if (webcam.srcObject) {
            webcam.srcObject.getTracks().forEach(track => track.stop());
            webcam.srcObject = null;
        }
    };

    const startCameraAndShowView = async () => {
        startScreen.classList.add('hidden');
        webcam.classList.remove('hidden');
        captureBtn.classList.remove('hidden');
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
            webcam.srcObject = stream;
            await webcam.play();
        } catch (err) {
            alert("Kamera-Fehler: Bitte erlaube den Kamerazugriff und lade die Seite neu.");
            showStartScreen();
        }
    };

    startBtn.addEventListener('click', startCameraAndShowView);
    restartBtn.addEventListener('click', showStartScreen);

    captureBtn.addEventListener('click', async () => {
        // Diese Funktion bleibt exakt wie in der letzten Version
        const canvas = document.createElement('canvas');
        canvas.width = webcam.videoWidth;
        canvas.height = webcam.videoHeight;
        canvas.getContext('2d').drawImage(webcam, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        
        resultImg.src = imageDataUrl;
        resultImg.classList.remove('hidden');
        resultImg.classList.add('blurred');
        webcam.classList.add('hidden');
        captureBtn.classList.add('hidden');
        loadingContainer.classList.remove('hidden');

        let messageIndex = 0;
        let messageInterval;
        const loadingMessages = ["Kontaktiere die Cloud-Geister...", "Male ein paar Wolken...", "Bringe die Pixel zum Schweben...", "Mische Himmelblau an...", "Fast fertig..."];
        loadingText.textContent = loadingMessages[messageIndex];
        messageInterval = setInterval(() => {
            messageIndex = (messageIndex + 1) % loadingMessages.length;
            loadingText.textContent = loadingMessages[messageIndex];
        }, 2000);

        try {
            const response = await fetch('/api/transform', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: imageDataUrl }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || errorData.message);
            }
            const result = await response.json();
            
            showResultScreen(result.url);
        } catch (error) {
            alert(`Ein Fehler ist aufgetreten: ${error.message}`);
            showStartScreen();
        } finally {
            clearInterval(messageInterval);
        }
    });

    // App initialisieren
    showStartScreen();
});
