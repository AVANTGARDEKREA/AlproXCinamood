document.addEventListener('DOMContentLoaded', () => {
    // Alle Elemente holen
    const webcam = document.getElementById('webcam');
    const resultImg = document.getElementById('result-img');
    const startScreen = document.getElementById('start-screen');
    const startBtn = document.getElementById('start-btn');
    const captureBtn = document.getElementById('capture-btn');
    const loadingContainer = document.getElementById('loading-container');
    const loadingText = document.getElementById('loading-text');
    const resultControls = document.getElementById('result-controls');
    const restartBtn = document.getElementById('restart-btn');

    const loadingMessages = [
        "Contact the Coffee Cloud ...",
        "Initialize Alpro Barista Limited Edition ...",
        "Keep it rolling...",
        "Delicious Mode on ...",
        "Almost ready ..."     
        "Implement Cinnamon flavour ...",
        "Load deliciously realistic physics ...",
        "Roll with it ...",
        "Loading cooperation Alpro x Cinnamood ...",
        "Almost ready ..."
    ];
    let messageInterval;

    // Funktion, um den Start/Splash-Screen anzuzeigen
    const showStartScreen = () => {
        // Blende alles aus, außer dem Startbildschirm
        startScreen.classList.remove('hidden');
        webcam.classList.add('hidden');
        resultImg.classList.add('hidden');
        captureBtn.classList.add('hidden');
        loadingContainer.classList.add('hidden');
        resultControls.classList.add('hidden');
        startBtn.classList.remove('hidden');
        
        // Kamerastream stoppen, falls er läuft
        if (webcam.srcObject) {
            webcam.srcObject.getTracks().forEach(track => track.stop());
        }
    };

    // Funktion, um die scharfe Kamera-Ansicht zu starten
    // WIRD JETZT VOM START-BUTTON AUFGERUFEN
    const startCameraAndShowView = async () => {
        // UI für Kamera-Ansicht vorbereiten
        startScreen.classList.add('hidden');
        webcam.classList.remove('hidden');
        webcam.classList.remove('blurred'); // Sicherstellen, dass die Kamera scharf ist
        captureBtn.classList.remove('hidden');
        startBtn.classList.add('hidden');
        
        // Erst jetzt die Kamera anfordern
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
            webcam.srcObject = stream;
            await webcam.play();
        } catch (err) {
            alert("Kamera-Fehler: Bitte erlaube den Kamerazugriff und lade die Seite neu.");
            showStartScreen(); // Bei Fehler zurück zum Start
        }
    };

    // Event-Listener für den "Create your Cloudie"-Button
    startBtn.addEventListener('click', startCameraAndShowView);

    // Event-Listener für den "Neues Selfie"-Button
    restartBtn.addEventListener('click', showStartScreen);

    // Klick auf den Aufnahme-Button (Logik bleibt gleich)
    captureBtn.addEventListener('click', async () => {
        const canvas = document.createElement('canvas');
        canvas.width = webcam.videoWidth;
        canvas.height = webcam.videoHeight;
        canvas.getContext('2d').drawImage(webcam, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        
        // Lade-Ansicht anzeigen
        resultImg.src = imageDataUrl;
        resultImg.classList.remove('hidden');
        resultImg.classList.add('blurred');
        webcam.classList.add('hidden');
        captureBtn.classList.add('hidden');
        loadingContainer.classList.remove('hidden');
        startBtn.classList.add('hidden');

        let messageIndex = 0;
        loadingText.textContent = loadingMessages[messageIndex];
        messageInterval = setInterval(() => {
            messageIndex = (messageIndex + 1) % loadingMessages.length;
            loadingText.textContent = loadingMessages[messageIndex];
        }, 2000);

        // Bild verarbeiten
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

            // Ergebnis-Ansicht anzeigen
            resultImg.src = result.url;
            resultImg.classList.remove('blurred');
            loadingContainer.classList.add('hidden');
            resultControls.classList.remove('hidden');

        } catch (error) {
            alert(`Ein Fehler ist aufgetreten: ${error.message}`);
            showStartScreen();
        } finally {
            clearInterval(messageInterval);
        }
    });

    // App initialisieren, indem der Splash-Screen gezeigt wird
    showStartScreen();
});
