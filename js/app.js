let currentPhotoIndex = 0;

let capturedPhotos = [];


// =====================================================
// SCREEN
// =====================================================

function showScreen(screenId) {

    document
        .querySelectorAll(".screen")
        .forEach(screen => {

            screen.classList.remove("active");

        });


    const screen =
        document.getElementById(screenId);


    if (screen) {

        screen.classList.add("active");

    }

}


// =====================================================
// TEMPLATE RENDER
// =====================================================

function renderTemplates() {

    const container =
        document.getElementById("templateList");


    if (!container) {
        return;
    }


    container.innerHTML = "";


    templates.forEach(template => {

        const card =
            document.createElement("div");


        card.className =
            "template-card";


        // Jangan akses selectedTemplate.id
        // kalau selectedTemplate masih null
        if (
            selectedTemplate &&
            template.id === selectedTemplate.id
        ) {

            card.classList.add("selected");

        }


        // =================================================
        // MINI TEMPLATE PREVIEW
        // =================================================

        const mini =
            document.createElement("div");


        mini.className =
            "template-mini";


        template.frames.forEach(frame => {

            const miniFrame =
                document.createElement("div");


            miniFrame.className =
                "template-mini-frame";


            miniFrame.style.left =
                (
                    frame.x /
                    template.width *
                    100
                ) + "%";


            miniFrame.style.top =
                (
                    frame.y /
                    template.height *
                    100
                ) + "%";


            miniFrame.style.width =
                (
                    frame.width /
                    template.width *
                    100
                ) + "%";


            miniFrame.style.height =
                (
                    frame.height /
                    template.height *
                    100
                ) + "%";


            mini.appendChild(
                miniFrame
            );

        });


        card.appendChild(
            mini
        );


        // =================================================
        // TEMPLATE NAME
        // =================================================

        const title =
            document.createElement("h3");


        title.textContent =
            template.name;


        card.appendChild(
            title
        );


        // =================================================
        // DESCRIPTION
        // =================================================

        const description =
            document.createElement("p");


        description.textContent =
            template.description;


        card.appendChild(
            description
        );


        // =================================================
        // SELECT TEMPLATE
        // =================================================

        card.addEventListener(
            "click",
            () => {

                selectedTemplate =
                    template;


                console.log(
                    "Template dipilih:",
                    selectedTemplate.name
                );


                renderTemplates();


                const continueButton =
                    document.getElementById(
                        "continueTemplateButton"
                    );


                if (continueButton) {

                    continueButton.disabled =
                        false;

                }

            }
        );


        container.appendChild(
            card
        );

    });

}


// =====================================================
// START
// =====================================================

const startButton =
    document.getElementById(
        "startButton"
    );


if (startButton) {

    startButton.addEventListener(
        "click",
        () => {

            console.log("MULAI");

            renderTemplates();

            showScreen(
                "templateScreen"
            );

        }
    );

}


// =====================================================
// BACK HOME
// =====================================================

const backHomeButton =
    document.getElementById(
        "backHomeButton"
    );


if (backHomeButton) {

    backHomeButton.addEventListener(
        "click",
        () => {

            selectedTemplate =
                null;


            const continueButton =
                document.getElementById(
                    "continueTemplateButton"
                );


            if (continueButton) {

                continueButton.disabled =
                    true;

            }


            showScreen(
                "homeScreen"
            );

        }
    );

}


// =====================================================
// CONTINUE TEMPLATE
// =====================================================

const continueTemplateButton =
    document.getElementById(
        "continueTemplateButton"
    );


if (continueTemplateButton) {

    continueTemplateButton.addEventListener(
        "click",
        async () => {

            if (!selectedTemplate) {

                alert(
                    "Silakan pilih template terlebih dahulu."
                );

                return;

            }


            currentPhotoIndex = 0;

            capturedPhotos = [];


            try {

                await startCamera();

                showScreen(
                    "cameraScreen"
                );

                takeNextPhoto();

            } catch (error) {

                console.error(
                    error
                );


                alert(
                    "Kamera tidak dapat digunakan. Pastikan izin kamera sudah diberikan."
                );

            }

        }
    );

}


// =====================================================
// TAKE NEXT PHOTO
// =====================================================

async function takeNextPhoto() {

    if (!selectedTemplate) {
        return;
    }


    const totalPhotos =
        selectedTemplate.frames.length;


    const counter =
        document.getElementById(
            "photoCounter"
        );


    if (counter) {

        counter.textContent =
            `FOTO ${currentPhotoIndex + 1} / ${totalPhotos}`;

    }


    const instruction =
        document.getElementById(
            "cameraInstruction"
        );


    if (instruction) {

        instruction.textContent =
            `Bersiap untuk foto ${currentPhotoIndex + 1}...`;

    }


    const photo =
        await captureMoment(
            selectedTemplate.countdown
        );


    capturedPhotos[
        currentPhotoIndex
    ] = photo;


    showPhotoPreview(
        photo
    );

}


// =====================================================
// PHOTO PREVIEW
// =====================================================

function showPhotoPreview(photo) {

    const canvas =
        document.getElementById(
            "photoPreviewCanvas"
        );


    if (!canvas || !photo) {
        return;
    }


    canvas.width =
        photo.width;


    canvas.height =
        photo.height;


    const ctx =
        canvas.getContext("2d");


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    ctx.drawImage(
        photo,
        0,
        0
    );


    const photoNumber =
        document.getElementById(
            "previewPhotoNumber"
        );


    if (photoNumber) {

        photoNumber.textContent =
            `Foto ${currentPhotoIndex + 1}`;

    }


    const isLastPhoto =
        currentPhotoIndex >=
        selectedTemplate.frames.length - 1;


    const nextButton =
        document.getElementById(
            "nextPhotoButton"
        );


    if (nextButton) {

        nextButton.textContent =
            isLastPhoto
                ? "LANJUT KE EDITOR"
                : "LANJUT";

    }


    showScreen(
        "previewScreen"
    );

}


// =====================================================
// RETAKE PHOTO
// =====================================================

const retakePhotoButton =
    document.getElementById(
        "retakePhotoButton"
    );


if (retakePhotoButton) {

    retakePhotoButton.addEventListener(
        "click",
        async () => {

            try {

                await startCamera();

                showScreen(
                    "cameraScreen"
                );

                takeNextPhoto();

            } catch (error) {

                console.error(
                    error
                );

            }

        }
    );

}


// =====================================================
// NEXT PHOTO
// =====================================================

const nextPhotoButton =
    document.getElementById(
        "nextPhotoButton"
    );


if (nextPhotoButton) {

    nextPhotoButton.addEventListener(
        "click",
        async () => {

            if (!selectedTemplate) {
                return;
            }


            const lastPhoto =
                currentPhotoIndex >=
                selectedTemplate.frames.length - 1;


            if (lastPhoto) {

                finishPhotoSession();

                return;

            }


            currentPhotoIndex++;


            try {

                await startCamera();

                showScreen(
                    "cameraScreen"
                );

                takeNextPhoto();

            } catch (error) {

                console.error(
                    error
                );

            }

        }
    );

}


// =====================================================
// FINISH PHOTO SESSION
// =====================================================

function finishPhotoSession() {

    if (
        typeof stopCamera ===
        "function"
    ) {

        stopCamera();

    }


    if (
        typeof initializeEditor ===
        "function"
    ) {

        initializeEditor();

    }


    if (
        typeof renderEditor ===
        "function"
    ) {

        renderEditor();

    }


    showScreen(
        "editorScreen"
    );

}


// =====================================================
// RETAKE ALL
// =====================================================

const retakeAllButton =
    document.getElementById(
        "retakeAllButton"
    );


if (retakeAllButton) {

    retakeAllButton.addEventListener(
        "click",
        async () => {

            currentPhotoIndex = 0;

            capturedPhotos = [];


            try {

                await startCamera();

                showScreen(
                    "cameraScreen"
                );

                takeNextPhoto();

            } catch (error) {

                console.error(
                    error
                );

            }

        }
    );

}


// =====================================================
// GENERATE
// =====================================================

const generateButton =
    document.getElementById(
        "generateButton"
    );


if (generateButton) {

    generateButton.addEventListener(
        "click",
        async () => {

            if (
                typeof generateAllMedia ===
                "function"
            ) {

                await generateAllMedia();

            }

        }
    );

}


// =====================================================
// BACK TO EDITOR
// =====================================================

const backToEditorButton =
    document.getElementById(
        "backToEditorButton"
    );


if (backToEditorButton) {

    backToEditorButton.addEventListener(
        "click",
        () => {

            showScreen(
                "editorScreen"
            );

        }
    );

}


// =====================================================
// SAVE
// =====================================================

const saveAllButton =
    document.getElementById(
        "saveAllButton"
    );


if (saveAllButton) {

    saveAllButton.addEventListener(
        "click",
        async () => {

            if (
                typeof downloadAllMedia ===
                "function"
            ) {

                await downloadAllMedia();

            }

        }
    );

}


// =====================================================
// PRINT
// =====================================================

const printButton =
    document.getElementById(
        "printButton"
    );


if (printButton) {

    printButton.addEventListener(
        "click",
        () => {

            if (
                typeof printFinalPhoto ===
                "function"
            ) {

                printFinalPhoto();

            }

        }
    );

}


// =====================================================
// EMAIL MODAL
// =====================================================

const emailModal =
    document.getElementById(
        "emailModal"
    );


const emailButton =
    document.getElementById(
        "emailButton"
    );


const closeEmailModal =
    document.getElementById(
        "closeEmailModal"
    );


if (emailButton) {

    emailButton.addEventListener(
        "click",
        () => {

            if (emailModal) {

                emailModal.classList.add(
                    "active"
                );

            }


            const emailInput =
                document.getElementById(
                    "customerEmail"
                );


            if (emailInput) {

                emailInput.focus();

            }

        }
    );

}


// CLOSE EMAIL MODAL

if (closeEmailModal) {

    closeEmailModal.addEventListener(
        "click",
        () => {

            if (emailModal) {

                emailModal.classList.remove(
                    "active"
                );

            }

        }
    );

}


// CLICK OUTSIDE

if (emailModal) {

    emailModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                emailModal
            ) {

                emailModal.classList.remove(
                    "active"
                );

            }

        }
    );

}


// ESC

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            emailModal
        ) {

            emailModal.classList.remove(
                "active"
            );

        }

    }
);


// =====================================================
// RESET PHOTOBOOTH
// =====================================================

function resetPhotobooth() {

    console.log(
        "Reset photobooth"
    );


    // ---------------------------------------------
    // STOP CAMERA
    // ---------------------------------------------

    if (
        typeof stopCamera ===
        "function"
    ) {

        stopCamera();

    }


    const video =
        document.getElementById(
            "cameraVideo"
        );


    if (video) {

        video.pause();

        video.srcObject = null;

    }


    // ---------------------------------------------
    // RESET FOTO
    // ---------------------------------------------

    capturedPhotos = [];

    window.capturedPhotos = [];

    currentPhotoIndex = 0;


    // ---------------------------------------------
    // RESET TEMPLATE
    // ---------------------------------------------

    selectedTemplate = null;


    // ---------------------------------------------
    // RESET EDITOR
    // ---------------------------------------------

    if (
        typeof photoSettings !==
        "undefined" &&
        Array.isArray(photoSettings)
    ) {

        photoSettings.length = 0;

    }


    if (
        typeof currentFrame !==
        "undefined"
    ) {

        currentFrame = 0;

    }


    // ---------------------------------------------
    // RESET TOMBOL LANJUT
    // ---------------------------------------------

    if (continueTemplateButton) {

        continueTemplateButton.disabled =
            true;

    }


    // ---------------------------------------------
    // RESET EMAIL
    // ---------------------------------------------

    if (emailModal) {

        emailModal.classList.remove(
            "active"
        );

    }


    const customerEmail =
        document.getElementById(
            "customerEmail"
        );


    const emailStatus =
        document.getElementById(
            "emailStatus"
        );


    if (customerEmail) {

        customerEmail.value = "";

    }


    if (emailStatus) {

        emailStatus.textContent = "";

    }


    // ---------------------------------------------
    // RESET CAMERA UI
    // ---------------------------------------------

    const countdown =
        document.getElementById(
            "countdown"
        );


    if (countdown) {

        countdown.textContent =
            "3";

    }


    const instruction =
        document.getElementById(
            "cameraInstruction"
        );


    if (instruction) {

        instruction.textContent =
            "Bersiap untuk foto...";

    }


    const counter =
        document.getElementById(
            "photoCounter"
        );


    if (counter) {

        counter.textContent =
            "FOTO 1";

    }


    // ---------------------------------------------
    // KEMBALI KE HOME
    // ---------------------------------------------

    showScreen(
        "homeScreen"
    );


    console.log(
        "Photobooth siap digunakan kembali"
    );

}


// =====================================================
// SELESAI
// =====================================================

const finishButton =
    document.getElementById(
        "finishButton"
    );


if (finishButton) {

    finishButton.addEventListener(
        "click",
        () => {

            resetPhotobooth();

        }
    );

}


// =====================================================
// INITIAL SCREEN
// =====================================================

showScreen(
    "homeScreen"
);