let videoStream = null;

let latestVideoBlob = null;

let latestGifFrames = [];

let mediaRecorder = null;

let recordedChunks = [];

/*
 * Menyimpan video dari setiap pengambilan foto.
 *
 * Contoh:
 * 2 foto → [video1, video2]
 * 3 foto → [video1, video2, video3]
 */
let capturedVideos = [];


/* =====================================================
   CAMERA
===================================================== */

async function startCamera() {

    try {

        videoStream =
            await navigator.mediaDevices.getUserMedia({
                video: {
                    width: {
                        ideal: 1920
                    },

                    height: {
                        ideal: 1080
                    },

                    facingMode: "user"
                },

                audio: true
            });

        const video =
            document.getElementById("cameraVideo");

        video.srcObject = videoStream;

        await video.play();

    } catch (error) {

        console.error(error);

        alert(
            "Kamera tidak dapat digunakan. Pastikan browser memiliki izin kamera."
        );

        throw error;
    }
}


/* =====================================================
   STOP CAMERA
===================================================== */

function stopCamera() {

    if (!videoStream) {
        return;
    }

    videoStream
        .getTracks()
        .forEach(track => track.stop());

    videoStream = null;
}


/* =====================================================
   MIME TYPE
===================================================== */

function getSupportedMimeType() {

    const types = [

        "video/webm;codecs=vp9,opus",

        "video/webm;codecs=vp8,opus",

        "video/webm"
    ];

    return types.find(type =>
        MediaRecorder.isTypeSupported(type)
    ) || "";
}


/* =====================================================
   CAPTURE PHOTO
===================================================== */

function capturePhoto() {

    const video =
        document.getElementById("cameraVideo");

    const canvas =
        document.createElement("canvas");

    canvas.width =
        video.videoWidth || 1280;

    canvas.height =
        video.videoHeight || 720;

    const ctx =
        canvas.getContext("2d");

    /*
     * Mirror hasil kamera agar sama
     * dengan tampilan preview.
     */

    ctx.save();

    ctx.translate(canvas.width, 0);

    ctx.scale(-1, 1);

    ctx.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.restore();

    return canvas;
}


/* =====================================================
   CAPTURE VIDEO
===================================================== */

function startRecording() {

    recordedChunks = [];

    const mimeType =
        getSupportedMimeType();

    if (!mimeType) {
        return false;
    }

    if (!videoStream) {
        return false;
    }

    try {

        mediaRecorder =
            new MediaRecorder(
                videoStream,
                {
                    mimeType
                }
            );


        mediaRecorder.ondataavailable =
            event => {

                if (event.data.size > 0) {

                    recordedChunks.push(
                        event.data
                    );
                }
            };


        mediaRecorder.start();

        return true;

    } catch (error) {

        console.error(error);

        return false;
    }
}


/* =====================================================
   STOP RECORDING
===================================================== */

function stopRecording() {

    return new Promise(resolve => {

        if (
            !mediaRecorder ||
            mediaRecorder.state === "inactive"
        ) {

            resolve(null);

            return;
        }


        mediaRecorder.onstop = () => {

            latestVideoBlob =
                new Blob(
                    recordedChunks,
                    {
                        type:
                            mediaRecorder.mimeType ||
                            "video/webm"
                    }
                );


            resolve(
                latestVideoBlob
            );
        };


        mediaRecorder.stop();

    });
}


/* =====================================================
   CAPTURE MOMENT
===================================================== */

async function captureMoment(
    seconds = 3
) {

    latestGifFrames = [];


    /*
     * Mulai merekam video untuk foto ini.
     */

    const recordingStarted =
        startRecording();


    const countdownElement =
        document.getElementById(
            "countdown"
        );


    /*
     * Ambil frame berkala.
     *
     * Ini tetap disimpan untuk kebutuhan
     * jika nantinya ingin membuat animasi lain.
     */

    const frameInterval =
        setInterval(() => {

            try {

                const frame =
                    capturePhoto();

                latestGifFrames.push(
                    frame
                );

            } catch (error) {

                console.error(error);
            }

        }, 250);


    /*
     * COUNTDOWN
     */

    for (
        let i = seconds;
        i > 0;
        i--
    ) {

        countdownElement.textContent = i;

        await wait(1000);
    }


    countdownElement.textContent = "";


    /*
     * SHUTTER PHOTO
     */

    const photo =
        capturePhoto();


    /*
     * Beri sedikit waktu setelah shutter
     * agar video juga memiliki gerakan.
     */

    await wait(300);


    clearInterval(
        frameInterval
    );


    /*
     * Stop video recording.
     */

    if (recordingStarted) {

        const videoBlob =
            await stopRecording();


        /*
         * Simpan video berdasarkan urutan
         * foto yang sedang diambil.
         */

        if (videoBlob) {

            capturedVideos[
                currentPhotoIndex
            ] = videoBlob;
        }
    }


    return photo;
}


/* =====================================================
   RESET CAPTURED VIDEOS
===================================================== */

function resetCapturedVideos() {

    capturedVideos = [];

    latestVideoBlob = null;
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



// let videoStream = null;

// let latestVideoBlob = null;

// let latestGifFrames = [];

// let mediaRecorder = null;

// let recordedChunks = [];


// /* =====================================================
//    CAMERA
// ===================================================== */

// async function startCamera() {

//     try {

//         videoStream =
//             await navigator.mediaDevices.getUserMedia({
//                 video: {
//                     width: {
//                         ideal: 1920
//                     },

//                     height: {
//                         ideal: 1080
//                     },

//                     facingMode: "user"
//                 },

//                 audio: true
//             });

//         const video =
//             document.getElementById("cameraVideo");

//         video.srcObject = videoStream;

//         await video.play();

//     } catch (error) {

//         console.error(error);

//         alert(
//             "Kamera tidak dapat digunakan. Pastikan browser memiliki izin kamera."
//         );
//     }
// }


// function stopCamera() {

//     if (!videoStream) {
//         return;
//     }

//     videoStream
//         .getTracks()
//         .forEach(track => track.stop());

//     videoStream = null;
// }


// /* =====================================================
//    MIME TYPE
// ===================================================== */

// function getSupportedMimeType() {

//     const types = [

//         "video/webm;codecs=vp9,opus",

//         "video/webm;codecs=vp8,opus",

//         "video/webm"
//     ];

//     return types.find(type =>
//         MediaRecorder.isTypeSupported(type)
//     ) || "";
// }


// /* =====================================================
//    CAPTURE PHOTO
// ===================================================== */

// function capturePhoto() {

//     const video =
//         document.getElementById("cameraVideo");

//     const canvas =
//         document.createElement("canvas");

//     canvas.width =
//         video.videoWidth || 1280;

//     canvas.height =
//         video.videoHeight || 720;

//     const ctx =
//         canvas.getContext("2d");

//     ctx.save();

//     ctx.translate(canvas.width, 0);

//     ctx.scale(-1, 1);

//     ctx.drawImage(
//         video,
//         0,
//         0,
//         canvas.width,
//         canvas.height
//     );

//     ctx.restore();

//     return canvas;
// }


// /* =====================================================
//    CAPTURE VIDEO
// ===================================================== */

// function startRecording() {

//     recordedChunks = [];

//     const mimeType =
//         getSupportedMimeType();

//     if (!mimeType) {
//         return false;
//     }

//     try {

//         mediaRecorder =
//             new MediaRecorder(
//                 videoStream,
//                 {
//                     mimeType
//                 }
//             );

//         mediaRecorder.ondataavailable =
//             event => {

//                 if (event.data.size > 0) {
//                     recordedChunks.push(
//                         event.data
//                     );
//                 }

//             };

//         mediaRecorder.start();

//         return true;

//     } catch (error) {

//         console.error(error);

//         return false;
//     }
// }


// function stopRecording() {

//     return new Promise(resolve => {

//         if (
//             !mediaRecorder ||
//             mediaRecorder.state === "inactive"
//         ) {

//             resolve(null);

//             return;
//         }

//         mediaRecorder.onstop = () => {

//             latestVideoBlob =
//                 new Blob(
//                     recordedChunks,
//                     {
//                         type:
//                             mediaRecorder.mimeType ||
//                             "video/webm"
//                     }
//                 );

//             resolve(
//                 latestVideoBlob
//             );
//         };

//         mediaRecorder.stop();

//     });
// }


// /* =====================================================
//    CAPTURE MOMENT
// ===================================================== */

// async function captureMoment(
//     seconds = 3
// ) {

//     latestGifFrames = [];

//     startRecording();


//     const countdownElement =
//         document.getElementById("countdown");


//     /*
//        Capture video frames continuously
//        for GIF generation.
//     */

//     const frameInterval =
//         setInterval(() => {

//             try {

//                 const frame =
//                     capturePhoto();

//                 latestGifFrames.push(frame);

//             } catch (error) {

//                 console.error(error);

//             }

//         }, 250);


//     /*
//        Countdown
//     */

//     for (
//         let i = seconds;
//         i > 0;
//         i--
//     ) {

//         countdownElement.textContent = i;

//         await wait(1000);
//     }


//     countdownElement.textContent = "";


//     /*
//        Capture shutter photo
//     */

//     const photo =
//         capturePhoto();


//     /*
//        Keep recording a short moment
//        around shutter.
//     */

//     await wait(300);


//     clearInterval(frameInterval);


//     await stopRecording();


//     return photo;
// }


// /* =====================================================
//    WAIT
// ===================================================== */

// function wait(ms) {

//     return new Promise(resolve => {

//         setTimeout(
//             resolve,
//             ms
//         );

//     });
// }
