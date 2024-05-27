document.addEventListener('DOMContentLoaded', function () {
    const webcamElement = document.getElementById('webcam');
    const canvasElement = document.getElementById('canvas');
    const webcam = new Webcam(webcamElement, 'environment', canvasElement);
    const resultElement = document.getElementById('result');
    const startButton = document.getElementById('start-btn');
    const captureButton = document.getElementById('capture-btn');
    const retryButton = document.getElementById('retry-btn');
    const newObjectButton = document.getElementById('new-object-btn');
    const objectNameElement = document.getElementById('object-name');
    const capturedImage = document.getElementById('captured-image');
    const startScreen = document.getElementById('start-screen');
    const cameraScreen = document.getElementById('camera-screen');
    const resultScreen = document.getElementById('result-screen');
    let net;

    async function loadModel() {
        net = await ml5.imageClassifier('MobileNet');
        console.log("Model loaded!");
    }

    startButton.addEventListener('click', () => {
        startScreen.classList.add('hidden');
        cameraScreen.classList.remove('hidden');
        startCamera();
    });

    captureButton.addEventListener('click', () => {
        classifyImage();
    });

    retryButton.addEventListener('click', () => {
        resetCamera();
    });

    newObjectButton.addEventListener('click', () => {
        resetCamera();
    });

    function startCamera() {
        webcam.start()
            .then(result => {
                console.log("Webcam started");
                captureButton.classList.remove('hidden');
                retryButton.classList.add('hidden');
            })
            .catch(err => {
                console.error("Error starting webcam:", err);
            });
    }

    async function classifyImage() {
        console.log("Capturing image...");
        const picture = webcam.snap();
        const image = canvasElement;

        try {
            const results = await net.classify(image);
            console.log("Classification results:", results);
            objectNameElement.innerText = results[0].label;
            capturedImage.src = canvasElement.toDataURL();
            cameraScreen.classList.add('hidden');
            resultScreen.classList.remove('hidden');
        } catch (error) {
            console.error("Error during classification:", error);
        }
    }

    function resetCamera() {
        resultScreen.classList.add('hidden');
        cameraScreen.classList.remove('hidden');
        startCamera();
    }

    loadModel();
});