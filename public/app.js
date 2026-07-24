document.addEventListener('DOMContentLoaded', () => {
    // 1. Alle HTML-Elemente am Anfang holen
    const webcam = document.getElementById('webcam');
    const resultImg = document.getElementById('result-img');
    const startScreen = document.getElementById('start-screen');
    const startBtn = document.getElementById('start-btn');
    const captureBtn = document.getElementById('capture-btn');
    const loadingContainer = document.getElementById('loading-container');
    const loadingText = document.getElementById('loading-text');
    const resultControls = document.getElementById('result-controls');
    const restartBtn = document.getElementById('restart-btn');
    //const downloadBtn = document.getElementById('download-btn');

    let isLoading = false; // Verhindert Doppelklicks
    let messageInterval;
    const loadingMessages = [
        "Kontaktiere die Cloud-Geister...",
        "Male ein paar Wolken...",
        "Bringe die Pixel zum Schweben...",
        "Mische Himmelblau an...",
        "Fast fertig..."
    ];

    // 2. Funktionen zur Steuerung der App-Zustände

    const showStartScreen = () => {
        isLoading = false;
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
        startScreen.classList.add('hidden'); // Wichtig: Blendet den Startbildschirm aus
        webcam.classList.remove('hidden');
        startBtn.classList.add('hidden');
        captureBtn.classList.remove('hidden');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
            webcam.srcObject = stream;
            await webcam.play();
        } catch (err) {
            alert("Kamera-Fehler: Bitte erlaube den Kamerazugriff.");
            showStartScreen();
        }
    };

    const showResultScreen = (imageUrl) => {
        resultImg.src = imageUrl;
        resultImg.classList.remove('hidden', 'blurred');
        loadingContainer.classList.add('hidden');
        resultControls.classList.remove('hidden');
    };

    // 3. Event-Listener

    startBtn.addEventListener('click', () => {
        if (isLoading) return;
        startCameraAndShowView();
    });

    restartBtn.addEventListener('click', () => {
        if (isLoading) return;
        showStartScreen();
        startBtn.classList.remove('hidden');
    });

    /*
    downloadBtn.addEventListener('click', (event) => {
        event.preventDefault();
        const imageUrl = resultImg.src;
        if (!imageUrl || imageUrl.startsWith('data:')) return;
        const downloadUrl = `/api/download-proxy?url=${encodeURIComponent(imageUrl)}`;
        window.open(downloadUrl, '_blank');
    });
    */

    captureBtn.addEventListener('click', async () => {
        if (isLoading) return;
        isLoading = true;

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
                const errorText = await response.text();
                throw new Error(errorText.substring(0, 150));
            }
            const result = await response.json();
            showResultScreen(result.url);
        } catch (error) {
            alert(`Ein Fehler ist aufgetreten: ${error.message}`);
            showStartScreen();
        } finally {
            isLoading = false;
            clearInterval(messageInterval);
        }
    });

    // 4. App initialisieren
    showStartScreen();
});
