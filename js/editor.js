let currentFrame = 0;

let photoSettings = [];

let overlayImage = null;


/* =========================================
   INITIALIZE EDITOR
========================================= */

function initializeEditor() {

    currentFrame = 0;

    photoSettings =
        selectedTemplate.frames.map(
            () => ({
                zoom: 1,
                x: 0,
                y: 0
            })
        );

    loadTemplateOverlay();

    renderFrameSelector();

    renderEditor();

    updateEditorControls();
}


/* =========================================
   LOAD OVERLAY
========================================= */

function loadTemplateOverlay() {

    overlayImage = null;

    if (!selectedTemplate.overlay) {
        return;
    }

    const image =
        new Image();

    image.onload = () => {

        overlayImage =
            image;

        renderEditor();
    };

    image.onerror = () => {

        console.error(
            "Gagal memuat template:",
            selectedTemplate.overlay
        );
    };

    image.src =
        selectedTemplate.overlay;
}


/* =========================================
   WAIT OVERLAY
========================================= */

function waitForTemplateOverlay() {

    return new Promise(
        resolve => {

            if (
                !selectedTemplate ||
                !selectedTemplate.overlay
            ) {
                resolve();
                return;
            }

            if (overlayImage) {
                resolve();
                return;
            }

            const image =
                new Image();

            image.onload = () => {

                overlayImage =
                    image;

                resolve();
            };

            image.onerror = () => {

                console.error(
                    "Gagal memuat overlay:",
                    selectedTemplate.overlay
                );

                resolve();
            };

            image.src =
                selectedTemplate.overlay;
        }
    );
}


/* =========================================
   FRAME SELECTOR
========================================= */

function renderFrameSelector() {

    const container =
        document.getElementById(
            "frameSelector"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    selectedTemplate.frames.forEach(
        (_, index) => {

            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            button.className =
                "frame-button";

            button.textContent =
                `Foto ${index + 1}`;

            if (
                index === currentFrame
            ) {
                button.classList.add(
                    "active"
                );
            }

            button.addEventListener(
                "click",
                () => {

                    currentFrame =
                        index;

                    renderFrameSelector();

                    updateEditorControls();

                    renderEditor();
                }
            );

            container.appendChild(
                button
            );
        }
    );
}


/* =========================================
   DRAW PHOTO
========================================= */

function drawPhotoCover(
    ctx,
    image,
    frame,
    settings
) {

    if (
        !image ||
        !frame ||
        !settings
    ) {
        return;
    }

    const frameRatio =
        frame.width /
        frame.height;

    const imageRatio =
        image.width /
        image.height;

    let drawWidth;
    let drawHeight;


    if (
        imageRatio >
        frameRatio
    ) {

        drawHeight =
            frame.height *
            settings.zoom;

        drawWidth =
            drawHeight *
            imageRatio;

    } else {

        drawWidth =
            frame.width *
            settings.zoom;

        drawHeight =
            drawWidth /
            imageRatio;
    }


    const offsetX =
        (
            frame.width -
            drawWidth
        ) / 2 +
        settings.x *
        frame.width *
        0.5;


    const offsetY =
        (
            frame.height -
            drawHeight
        ) / 2 +
        settings.y *
        frame.height *
        0.5;


    ctx.save();

    ctx.beginPath();

    ctx.rect(
        frame.x,
        frame.y,
        frame.width,
        frame.height
    );

    ctx.clip();


    ctx.drawImage(
        image,

        frame.x +
        offsetX,

        frame.y +
        offsetY,

        drawWidth,
        drawHeight
    );

    ctx.restore();
}


/* =========================================
   DRAW OVERLAY
========================================= */

function drawTemplateOverlay(ctx) {

    if (!overlayImage) {
        return;
    }

    ctx.drawImage(
        overlayImage,

        0,
        0,

        selectedTemplate.width,
        selectedTemplate.height
    );
}


/* =========================================
   FOOTER
========================================= */

function drawTemplateFooter(ctx) {

    /*
     * Kalau sudah menggunakan PNG,
     * footer biasanya sudah ada di desain.
     */

    if (
        selectedTemplate.overlay
    ) {
        return;
    }

    const footer =
        selectedTemplate.footer;

    if (!footer) {
        return;
    }

    ctx.fillStyle =
        "#111111";

    ctx.font =
        `700 ${footer.fontSize}px Arial`;

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";

    ctx.fillText(
        footer.text,
        footer.x,
        footer.y
    );
}


/* =========================================
   RENDER EDITOR
========================================= */

function renderEditor() {

    const canvas =
        document.getElementById(
            "editorCanvas"
        );

    if (
        !canvas ||
        !selectedTemplate
    ) {
        return;
    }


    canvas.width =
        selectedTemplate.width;

    canvas.height =
        selectedTemplate.height;


    const ctx =
        canvas.getContext("2d");


    /* BACKGROUND */

    ctx.fillStyle =
        selectedTemplate.background ||
        "#ffffff";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /* PHOTOS */

    selectedTemplate.frames.forEach(
        (frame, index) => {

            const photo =
                capturedPhotos[index];

            if (!photo) {
                return;
            }

            drawPhotoCover(
                ctx,
                photo,
                frame,
                photoSettings[index]
            );
        }
    );


    /* OVERLAY */

    drawTemplateOverlay(ctx);


    /* FOOTER */

    drawTemplateFooter(ctx);
}


/* =========================================
   UPDATE CONTROL
========================================= */

function updateEditorControls() {

    if (
        !photoSettings.length
    ) {
        return;
    }

    const settings =
        photoSettings[currentFrame];


    const zoomSlider =
        document.getElementById(
            "zoomSlider"
        );

    const positionXSlider =
        document.getElementById(
            "positionXSlider"
        );

    const positionYSlider =
        document.getElementById(
            "positionYSlider"
        );


    if (zoomSlider) {
        zoomSlider.value =
            settings.zoom;
    }

    if (positionXSlider) {
        positionXSlider.value =
            settings.x;
    }

    if (positionYSlider) {
        positionYSlider.value =
            settings.y;
    }
}


/* =========================================
   ZOOM
========================================= */

const zoomSlider =
    document.getElementById(
        "zoomSlider"
    );

if (zoomSlider) {

    zoomSlider.addEventListener(
        "input",
        event => {

            if (
                !photoSettings[currentFrame]
            ) {
                return;
            }

            photoSettings[
                currentFrame
            ].zoom =
                Number(
                    event.target.value
                );

            renderEditor();
        }
    );
}


/* =========================================
   POSITION X
========================================= */

const positionXSlider =
    document.getElementById(
        "positionXSlider"
    );

if (positionXSlider) {

    positionXSlider.addEventListener(
        "input",
        event => {

            if (
                !photoSettings[currentFrame]
            ) {
                return;
            }

            photoSettings[
                currentFrame
            ].x =
                Number(
                    event.target.value
                );

            renderEditor();
        }
    );
}


/* =========================================
   POSITION Y
========================================= */

const positionYSlider =
    document.getElementById(
        "positionYSlider"
    );

if (positionYSlider) {

    positionYSlider.addEventListener(
        "input",
        event => {

            if (
                !photoSettings[currentFrame]
            ) {
                return;
            }

            photoSettings[
                currentFrame
            ].y =
                Number(
                    event.target.value
                );

            renderEditor();
        }
    );
}
