// Seleção de elementos HTML
const videoInput = document.getElementById("videoInput");
const videoElement = document.getElementById("videoElement");
const videoCanvas = document.getElementById("videoCanvas");
const draggableText = document.getElementById("draggableText");
const fontSizeInput = document.getElementById("fontSize");
const fontColorInput = document.getElementById("fontColor");
const fontFamilyInput = document.getElementById("fontFamily");
const backgroundColorInput = document.getElementById("backgroundColor");
const startButton = document.getElementById("startButton");
const exportButton = document.getElementById("exportButton");

const context = videoCanvas.getContext("2d");
let mediaRecorder;
let recordedChunks = [];

// Variáveis para arrastar o texto
let isDragging = false;
let startX, startY, initialX, initialY;
let textX = 100, textY = 100;

// Carregar o vídeo
videoInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        const videoURL = URL.createObjectURL(file);
        videoElement.src = videoURL;
        videoElement.addEventListener("loadedmetadata", () => {
            videoCanvas.width = videoElement.videoWidth;
            videoCanvas.height = videoElement.videoHeight;
            drawTextOnVideo();
        });
    }
});

// Eventos de arraste para o texto
draggableText.addEventListener("mousedown", (event) => {
    isDragging = true;
    startX = event.clientX;
    startY = event.clientY;
    initialX = draggableText.offsetLeft;
    initialY = draggableText.offsetTop;
});

document.addEventListener("mousemove", (event) => {
    if (isDragging) {
        const dx = event.clientX - startX;
        const dy = event.clientY - startY;
        draggableText.style.left = `${initialX + dx}px`;
        draggableText.style.top = `${initialY + dy}px`;
        textX = draggableText.offsetLeft + draggableText.clientWidth / 2;
        textY = draggableText.offsetTop + draggableText.clientHeight / 2;
        drawTextOnVideo();
    }
});

document.addEventListener("mouseup", () => {
    isDragging = false;
});

// Atualizar o estilo do texto
fontSizeInput.addEventListener("input", () => {
    draggableText.style.fontSize = `${fontSizeInput.value}px`;
    drawTextOnVideo();
});

fontColorInput.addEventListener("input", () => {
    draggableText.style.color = fontColorInput.value;
    drawTextOnVideo();
});

fontFamilyInput.addEventListener("change", () => {
    draggableText.style.fontFamily = fontFamilyInput.value;
    drawTextOnVideo();
});

backgroundColorInput.addEventListener("input", () => {
    draggableText.style.backgroundColor = backgroundColorInput.value;
    drawTextOnVideo();
});

// Função para renderizar o texto no vídeo
function drawTextOnVideo() {
    draggableText.style.visibility = "none";

    context.clearRect(0, 0, videoCanvas.width, videoCanvas.height);
    context.drawImage(videoElement, 0, 0, videoCanvas.width, videoCanvas.height);

    // Configurar o estilo do texto
    const fontSize = fontSizeInput.value;
    const fontColor = fontColorInput.value;
    const fontFamily = fontFamilyInput.value;
    const backgroundColor = backgroundColorInput.value;

    // Adicionar fundo ao texto
    context.fillStyle = backgroundColor;
    const textWidth = context.measureText(draggableText.textContent).width;
    const textHeight = parseInt(fontSize, 10);
    context.fillRect(textX - textWidth / 2 - 10, textY - textHeight, textWidth + 20, textHeight + 10);

    // Adicionar o texto
    context.fillStyle = fontColor;
    context.font = `${fontSize}px ${fontFamily}`;
    context.textAlign = "center";
    context.fillText(draggableText.textContent, textX, textY);

    draggableText.style.visibility = "visible";

    if (!videoElement.paused && !videoElement.ended) {
        requestAnimationFrame(drawTextOnVideo);
    }
}

// Iniciar a gravação
startButton.addEventListener("click", () => {
    draggableText.style.display = "none";
    const videoStream = videoCanvas.captureStream(30);
    const audioStream = videoElement.captureStream().getAudioTracks();

    audioStream.forEach((track) => videoStream.addTrack(track));

    mediaRecorder = new MediaRecorder(videoStream, { mimeType: "video/webm; codecs=vp9" });
    recordedChunks = [];

    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };

    mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "video-editado-com-som.webm";
        a.click();
    };

    mediaRecorder.start();
    videoElement.play();
    requestAnimationFrame(drawTextOnVideo);
});

// Exportar o vídeo
exportButton.addEventListener("click", () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
    }
});
