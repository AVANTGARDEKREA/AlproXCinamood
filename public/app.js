document.addEventListener('DOMContentLoaded', () => {
    // 1. Alle HTML-Elemente holen, inklusive des neuen Download-Buttons
    const webcam = document.getElementById('webcam');
    const resultImg = document.getElementById('result-img');
    const startScreen = document.getElementById('start-screen');
    const startBtn = document.getElementById('start-btn');
    const captureBtn = document.getElementById('capture-btn');
    const loadingContainer = document.getElementById('loading-container');
    const loadingText = document.getElementById('loading-text');
    const resultControls = document.getElementById('result-controls');
    const restartBtn = document.getElementById('restart-btn');
    const downloadBtn = document.getElementById('download-btn'); // NEU

    // ... (Variablen und Lade-Nachrichten bleiben gleich) ...

    /**
     * Zeigt die Ergebnis-Ansicht mit dem generierten Bild.
     */
    const showResultScreen = (imageUrl) => {
        resultImg.src = imageUrl;
        resultImg.classList.remove('hidden', 'blurred');
        loadingContainer.classList.add('hidden');
        resultControls.classList.remove('hidden');

        // --- NEU: Download-Button funktionsfähig machen ---
        // Weisen Sie dem Button die Bild-URL zu
        downloadBtn.href = imageUrl;
        // Geben Sie der heruntergeladenen Datei einen Namen
        downloadBtn.download = 'My-Cloudie.png'; 
    };

    // --- Der Rest der app.js bleibt unverändert ---

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
            
            showResultScreen(result.url); // Diese Funktion wird jetzt den Download-Button vorbereiten
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
