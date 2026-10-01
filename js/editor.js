let currentFrame = 0;

let photoSettings = [];


/* =====================================================
   INITIALIZE
===================================================== */

function initializeEditor() {

    currentFrame = 0;

    photoSettings =
        selectedTemplate.frames.map(() => ({
            zoom: 1,
            x: 0,
            y: 0
        }));

    renderFrameSelector();

    renderEditor();

    updateEditorControls();
}


/* =====================================================
   FRAME SELECTOR
===================================================== */

function renderFrameSelector() {

    const container =
        document.getElementById(
            "frameSelector"
        );

    container.innerHTML = "";


    selectedTemplate.frames.forEach(
        (_, index) => {

            const button =
                document.createElement("button");

            button.type = "button";

            button.className =
                "frame-button";

            button.textContent =
                `Foto ${index + 1}`;

            if (index === currentFrame) {
                button.classList.add("active");
            }

            button.addEventListener(
                "click",
                () => {

                    currentFrame = index;

                    renderFrameSelector();

                    updateEditorControls();

                    renderEditor();

                }
            );

            container.appendChild(button);

        }
    );
}


/* =====================================================
   DRAW PHOTO COVER
===================================================== */

function drawPhotoCover(
    ctx,
    image,
    frame,
    settings
) {

    const frameRatio =
        frame.width /
        frame.height;

    const imageRatio =
        image.width /
        image.height;


    let drawWidth;
    let drawHeight;


    if (imageRatio > frameRatio) {

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
        ) / 2
        +
        settings.x *
        frame.width *
        0.5;


    const offsetY =
        (
            frame.height -
            drawHeight
        ) / 2
        +
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

        frame.x + offsetX,
        frame.y + offsetY,

        drawWidth,
        drawHeight
    );

    ctx.restore();
}


/* =====================================================
   RENDER EDITOR
===================================================== */

function renderEditor() {

    const canvas =
        document.getElementById(
            "editorCanvas"
        );

    canvas.width =
        selectedTemplate.width;

    canvas.height =
        selectedTemplate.height;


    const ctx =
        canvas.getContext("2d");


    /*
       Background
    */

    ctx.fillStyle =
        selectedTemplate.background;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /*
       Photos
    */

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


    /*
       Footer
    */

    const footer =
        selectedTemplate.footer;

    if (footer) {

        ctx.fillStyle = "#111111";

        ctx.font =
            `700 ${footer.fontSize}px Arial`;

        ctx.textAlign = "center";

        ctx.textBaseline = "middle";

        ctx.fillText(
            footer.text,
            footer.x,
            footer.y
        );
    }
}


/* =====================================================
   CONTROLS
===================================================== */

function updateEditorControls() {

    const settings =
        photoSettings[currentFrame];

    document.getElementById(
        "zoomSlider"
    ).value = settings.zoom;

    document.getElementById(
        "positionXSlider"
    ).value = settings.x;

    document.getElementById(
        "positionYSlider"
    ).value = settings.y;
}


/* =====================================================
   EVENTS
===================================================== */

document
    .getElementById("zoomSlider")
    .addEventListener(
        "input",
        event => {

            photoSettings[
                currentFrame
            ].zoom =
                Number(event.target.value);

            renderEditor();
        }
    );


document
    .getElementById("positionXSlider")
    .addEventListener(
        "input",
        event => {

            photoSettings[
                currentFrame
            ].x =
                Number(event.target.value);

            renderEditor();
        }
    );


document
    .getElementById("positionYSlider")
    .addEventListener(
        "input",
        event => {

            photoSettings[
                currentFrame
            ].y =
                Number(event.target.value);

            renderEditor();
        }
    );