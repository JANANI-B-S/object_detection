const video = document.getElementById('video');
const outputCanvas = document.getElementById('output');
const context = outputCanvas.getContext('2d');
let model;

// Load the COCO-SSD model
async function loadModel() {
    model = await cocoSsd.load();
    console.log('Model loaded');
}

// Start video stream
async function startVideo() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true
        });
        video.srcObject = stream;
        video.play();
        video.onloadedmetadata = (e) => {
            console.log('Video metadata loaded');
            outputCanvas.width = video.videoWidth;
            outputCanvas.height = video.videoHeight;
            detectObjects();
        };
    } catch (err) {
        console.error('Error accessing webcam:', err);
    }
}

// Detect objects
async function detectObjects() {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        context.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
        const predictions = await model.detect(video);
        predictions.forEach(prediction => {
            context.beginPath();
            context.rect(prediction.bbox[0], prediction.bbox[1], prediction.bbox[2], prediction.bbox[3]);
            context.lineWidth = 2;
            context.strokeStyle = 'red';
            context.fillStyle = 'red';
            context.stroke();
            context.fillText(
                `${prediction.class} (${Math.round(prediction.score * 100)}%)`,
                prediction.bbox[0],
                prediction.bbox[1] > 10 ? prediction.bbox[1] - 5 : 10
            );
        });
    }
    requestAnimationFrame(detectObjects);
}

// Event listener for the scan button
document.getElementById('scanButton').addEventListener('click', async () => {
    await startVideo();
});

// Load the model on page load
window.onload = async () => {
    await loadModel();
};
