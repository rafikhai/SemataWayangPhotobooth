let generatedMedia = {

    jpgBlob: null,
    gifBlob: null,
    videoBlob: null,

    jpgUrl: null,
    gifUrl: null,
    videoUrl: null
};


/* =====================================================
   CANVAS TO BLOB
===================================================== */

function canvasToBlob(
    canvas,
    type = "image/jpeg",
    quality = 0.95
) {

    return new Promise(resolve => {

        canvas.toBlob(
            blob => resolve(blob),
            type,
            quality
        );

    });
}


/* =====================================================
   FINAL JPG
===================================================== */

async function generateJPG() {

    const canvas =
        document.getElementById(
            "editorCanvas"
        );

    return await canvasToBlob(
        canvas,
        "image/jpeg",
        0.95
    );
}


/* =====================================================
   CREATE GIF FRAME
===================================================== */

function createGifFrame(
    photo,
    photoIndex
) {

    const canvas =
        document.createElement("canvas");

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
       Selected photo fills
       its corresponding frame.
    */

    const frame =
        selectedTemplate.frames[
            photoIndex
        ];


    drawPhotoCover(
        ctx,
        photo,
        frame,
        photoSettings[photoIndex]
    );


    /*
       Add remaining frames as
       empty / white areas.
    */

    selectedTemplate.frames.forEach(
        (otherFrame, index) => {

            if (index === photoIndex) {
                return;
            }

            ctx.strokeStyle =
                "#eeeeee";

            ctx.lineWidth = 2;

            ctx.strokeRect(
                otherFrame.x,
                otherFrame.y,
                otherFrame.width,
                otherFrame.height
            );

        }
    );


    /*
       SEMATA WAYANG
    */

    const footer =
        selectedTemplate.footer;

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


    return canvas;
}


/* =====================================================
   GENERATE GIF
===================================================== */

async function generateGIF() {

    if (
        !capturedPhotos ||
        capturedPhotos.length === 0
    ) {
        return null;
    }


    if (
        typeof GIF === "undefined"
    ) {

        throw new Error(
            "GIF.js belum tersedia."
        );
    }


    const workerResponse =
        await fetch(
            "https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js"
        );


    const workerBlob =
        await workerResponse.blob();


    const workerURL =
        URL.createObjectURL(
            workerBlob
        );


    const gif =
        new GIF({

            workers: 2,

            quality: 10,

            width: 480,

            height:
                Math.round(
                    480 *
                    selectedTemplate.height /
                    selectedTemplate.width
                ),

            workerScript:
                workerURL
        });


    capturedPhotos.forEach(
        (photo, index) => {

            const frameCanvas =
                createGifFrame(
                    photo,
                    index
                );


            const smallCanvas =
                document.createElement(
                    "canvas"
                );


            smallCanvas.width =
                480;

            smallCanvas.height =
                Math.round(
                    480 *
                    selectedTemplate.height /
                    selectedTemplate.width
                );


            const smallCtx =
                smallCanvas.getContext(
                    "2d"
                );


            smallCtx.drawImage(
                frameCanvas,

                0,
                0,

                smallCanvas.width,
                smallCanvas.height
            );


            gif.addFrame(
                smallCanvas,
                {
                    delay: 800
                }
            );

        }
    );


    return new Promise(
        (resolve, reject) => {

            gif.on(
                "finished",
                blob => {

                    URL.revokeObjectURL(
                        workerURL
                    );

                    resolve(blob);

                }
            );


            gif.on(
                "abort",
                () => {

                    URL.revokeObjectURL(
                        workerURL
                    );

                    reject(
                        new Error(
                            "GIF generation dibatalkan."
                        )
                    );

                }
            );


            gif.render();

        }
    );
}


/* =====================================================
   VIDEO WITH BRANDING
===================================================== */

async function createBrandedVideo(
    videoBlob
) {

    /*
       Untuk MVP, video kamera tetap
       disimpan sebagai video WebM.

       Branding frame akan ditambahkan
       menggunakan overlay HTML/canvas
       pada tahap berikutnya.

       Untuk sekarang kita memastikan
       video hasil capture tersedia.
    */

    return videoBlob;
}


/* =====================================================
   GENERATE ALL
===================================================== */

async function generateAllMedia() {

    showGeneratingState();


    try {

        /*
           JPG
        */

        generatedMedia.jpgBlob =
            await generateJPG();


        /*
           GIF
        */

        generatedMedia.gifBlob =
            await generateGIF();


        /*
           VIDEO
        */

        if (latestVideoBlob) {

            generatedMedia.videoBlob =
                await createBrandedVideo(
                    latestVideoBlob
                );

        } else {

            generatedMedia.videoBlob =
                null;
        }


        /*
           Object URLs
        */

        if (generatedMedia.jpgUrl) {
            URL.revokeObjectURL(
                generatedMedia.jpgUrl
            );
        }

        if (generatedMedia.gifUrl) {
            URL.revokeObjectURL(
                generatedMedia.gifUrl
            );
        }

        if (generatedMedia.videoUrl) {
            URL.revokeObjectURL(
                generatedMedia.videoUrl
            );
        }


        generatedMedia.jpgUrl =
            URL.createObjectURL(
                generatedMedia.jpgBlob
            );


        generatedMedia.gifUrl =
            generatedMedia.gifBlob
                ? URL.createObjectURL(
                    generatedMedia.gifBlob
                )
                : null;


        generatedMedia.videoUrl =
            generatedMedia.videoBlob
                ? URL.createObjectURL(
                    generatedMedia.videoBlob
                )
                : null;


        /*
           Preview JPG
        */

        document.getElementById(
            "jpgPreview"
        ).src =
            generatedMedia.jpgUrl;


        /*
           Preview GIF
        */

        document.getElementById(
            "gifPreview"
        ).src =
            generatedMedia.gifUrl || "";


        /*
           Preview VIDEO
        */

        const video =
            document.getElementById(
                "videoPreview"
            );

        video.src =
            generatedMedia.videoUrl || "";

        video.load();


        /*
           Show result
        */

        showScreen(
            "resultScreen"
        );


    } catch (error) {

        console.error(error);

        alert(
            "Gagal membuat hasil. Silakan coba lagi."
        );

    } finally {

        hideGeneratingState();

    }
}


/* =====================================================
   SAVE ALL
===================================================== */

async function downloadAllMedia() {

    const timestamp =
        new Date()
            .toISOString()
            .replace(
                /[:.]/g,
                "-"
            );


    downloadBlob(
        generatedMedia.jpgBlob,
        `semata-wayang-${timestamp}.jpg`
    );


    await wait(300);


    if (generatedMedia.gifBlob) {

        downloadBlob(
            generatedMedia.gifBlob,
            `semata-wayang-${timestamp}.gif`
        );

    }


    await wait(300);


    if (generatedMedia.videoBlob) {

        downloadBlob(
            generatedMedia.videoBlob,
            `semata-wayang-${timestamp}.webm`
        );

    }
}


/* =====================================================
   DOWNLOAD
===================================================== */

function downloadBlob(
    blob,
    filename
) {

    if (!blob) {
        return;
    }

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download = filename;

    document.body.appendChild(link);

    link.click();

    link.remove();

    setTimeout(
        () => URL.revokeObjectURL(url),
        1000
    );
}


/* =====================================================
   GENERATING STATE
===================================================== */

function showGeneratingState() {

    const button =
        document.getElementById(
            "generateButton"
        );

    button.disabled = true;

    button.textContent =
        "MEMBUAT...";
}


function hideGeneratingState() {

    const button =
        document.getElementById(
            "generateButton"
        );

    button.disabled = false;

    button.textContent =
        "BUAT HASIL";
}


/* =====================================================
   WAIT
===================================================== */

function wait(ms) {

    return new Promise(resolve => {

        setTimeout(
            resolve,
            ms
        );

    });
}

