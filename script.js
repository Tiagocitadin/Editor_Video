// Seleção de elementos HTML
const videoInput = document.getElementById("videoInput");
const videoElement = document.getElementById("videoElement");
const videoCanvas = document.getElementById("videoCanvas");
const textInput = document.getElementById("textInput");
const fontSizeInput = document.getElementById("fontSize");
const fontColorInput = document.getElementById("fontColor");
const fontFamilyInput = document.getElementById("fontFamily");
const startButton = document.getElementById("startButton");
const exportButton = document.getElementById("exportButton");
const playButton = document.getElementById("playButton");
const pauseButton = document.getElementById("pauseButton");
const stopButton = document.getElementById("stopButton");

const context = videoCanvas.getContext("2d");
let userText = "";
let fontSize = 30;
let fontColor = "#ffffff";
let fontFamily = "Arial";
let mediaRecorder;
let recordedChunks = [];

// Variáveis para posicionar o texto
let textX = 150;
let textY = 850;
let isDraggingText = false;
let offsetX = 0;
let offsetY = 0;

// Carregar o vídeo
videoInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        const videoURL = URL.createObjectURL(file);
        videoElement.src = videoURL;
        videoElement.addEventListener("loadedmetadata", () => {
            videoCanvas.width = videoElement.videoWidth;
            videoCanvas.height = videoElement.videoHeight;
        });
    }
});

// Atualizar o texto, tamanho da fonte, cor e tipo de fonte
textInput.addEventListener("input", (event) => {
    userText = event.target.value;
    drawTextOnVideo();
});

fontSizeInput.addEventListener("input", (event) => {
    fontSize = event.target.value;
    drawTextOnVideo();
});

fontColorInput.addEventListener("input", (event) => {
    fontColor = event.target.value;
    drawTextOnVideo();
});

fontFamilyInput.addEventListener("change", (event) => {
    fontFamily = event.target.value;
    drawTextOnVideo();
});

// Eventos para arrastar o texto
videoCanvas.addEventListener("mousedown", (event) => {
    const rect = videoCanvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Definir a área de clique ao redor do texto
    context.font = `${fontSize}px ${fontFamily}`;
    const textWidth = context.measureText(userText).width;
    const textHeight = fontSize;

    // Verificar se o clique está dentro da área do texto
    if (
        mouseX >= textX - textWidth / 2 &&
        mouseX <= textX + textWidth / 2 &&
        mouseY >= textY - textHeight / 2 &&
        mouseY <= textY + textHeight / 2
    ) {
        isDraggingText = true;
        offsetX = mouseX - textX;
        offsetY = mouseY - textY;
    }
});

videoCanvas.addEventListener("mousemove", (event) => {
    if (isDraggingText) {
        const rect = videoCanvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // Atualizar a posição do texto
        textX = mouseX - offsetX;
        textY = mouseY - offsetY;

        drawTextOnVideo(); // Redesenhar para atualizar a posição do texto
    }
});

videoCanvas.addEventListener("mouseup", () => {
    isDraggingText = false;
});

videoCanvas.addEventListener("mouseleave", () => {
    isDraggingText = false;
});

// Função para renderizar o texto no vídeo
function drawTextOnVideo() {
    context.clearRect(0, 0, videoCanvas.width, videoCanvas.height);
    context.drawImage(videoElement, 0, 0, videoCanvas.width, videoCanvas.height);

    // Configurar o estilo do texto
    context.fillStyle = fontColor;
    context.font = `${fontSize}px ${fontFamily}`;
    context.textAlign = "center";
    context.fillText(userText, textX, textY);

    if (!videoElement.paused && !videoElement.ended) {
        requestAnimationFrame(drawTextOnVideo);
    }
}

// Iniciar a gravação e renderização do vídeo
startButton.addEventListener("click", () => {
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
        a.download = "video-com-texto.webm";
        a.click();
    };

    mediaRecorder.start();
    videoElement.play();
    requestAnimationFrame(drawTextOnVideo);
});

// Exportar o vídeo gravado
exportButton.addEventListener("click", () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
    }
});

// Controle de Play, Pause e Stop
playButton.addEventListener("click", () => videoElement.play());
pauseButton.addEventListener("click", () => videoElement.pause());
stopButton.addEventListener("click", () => {
    videoElement.pause();
    videoElement.currentTime = 0;
});
