/* =====================================================
   VERCEL BLOB CLIENT UPLOAD
===================================================== */

let downloadSession = null;


/*
 * Upload langsung dari browser ke Vercel Blob.
 *
 * /api/upload hanya digunakan untuk
 * mendapatkan client upload token.
 */

async function uploadFileToVercel(
    blob,
    filename,
    contentType
) {

    if (!blob) {
        return null;
    }


    if (
        typeof window.vercelBlobUpload !==
        "function"
    ) {

        throw new Error(
            "Vercel Blob Client belum tersedia."
        );

    }


    console.log(
        "Upload mulai:",
        filename,
        `${(
            blob.size /
            1024 /
            1024
        ).toFixed(2)} MB`
    );


    const result =
        await window.vercelBlobUpload(

            filename,

            blob,

            {

                access: "public",

                contentType: contentType,

                handleUploadUrl:
                    "/api/upload",

                onUploadProgress:
                    progress => {

                        console.log(
                            `${filename}: ${progress.percentage}%`
                        );

                    }

            }

        );


    if (
        !result ||
        !result.url
    ) {

        throw new Error(
            "Vercel Blob tidak mengembalikan URL."
        );

    }


    console.log(
        "Upload selesai:",
        result.url
    );


    return result.url;

}

/* =====================================================
   UPLOAD ALL GENERATED MEDIA
===================================================== */

async function uploadAllGeneratedMedia() {

    if (!generatedMedia) {

        throw new Error(
            "Media belum tersedia."
        );
    }


    const timestamp =
        Date.now();


    const uploaded = {

        jpg: null,

        originals: [],

        gif: null,

        video: null
    };


    /*
     * JPG FRAME
     */

    if (
        generatedMedia.jpgBlob
    ) {

        uploaded.jpg =
            await uploadFileToVercel(

                generatedMedia.jpgBlob,

                `semata-wayang/${timestamp}/final.jpg`,

                "image/jpeg"
            );
    }


    /*
     * FOTO ASLI
     */

    if (
        generatedMedia.originalPhotoBlobs &&
        generatedMedia.originalPhotoBlobs.length
    ) {

        for (
            let i = 0;
            i <
            generatedMedia.originalPhotoBlobs.length;
            i++
        ) {

            const blob =
                generatedMedia
                    .originalPhotoBlobs[i];


            if (!blob) {
                continue;
            }


            const url =
                await uploadFileToVercel(

                    blob,

                    `semata-wayang/${timestamp}/foto-${i + 1}.jpg`,

                    "image/jpeg"
                );


            if (url) {

                uploaded.originals.push(
                    url
                );
            }
        }
    }


    /*
     * GIF
     */

    if (
        generatedMedia.gifBlob
    ) {

        uploaded.gif =
            await uploadFileToVercel(

                generatedMedia.gifBlob,

                `semata-wayang/${timestamp}/photo.gif`,

                "image/gif"
            );
    }


    /*
     * VIDEO
     */

    if (
        generatedMedia.videoBlob
    ) {

        uploaded.video =
            await uploadFileToVercel(

                generatedMedia.videoBlob,

                `semata-wayang/${timestamp}/photo.webm`,

                "video/webm"
            );
    }


    return uploaded;
}

/* =====================================================
   CREATE DOWNLOAD PAGE URL
===================================================== */

function createDownloadPageUrl(manifestUrl) {

    return (
        window.location.origin +
        "/download.html?manifest=" +
        encodeURIComponent(manifestUrl)
    );

}
/* =====================================================
   GENERATE QR CODE
===================================================== */

function generateDownloadQR(
    downloadUrl
) {

    const qrContainer =
        document.getElementById(
            "qrCode"
        );


    const status =
        document.getElementById(
            "qrDownloadStatus"
        );


    if (!qrContainer) {
        return;
    }


    qrContainer.innerHTML = "";


    if (
        typeof QRCode ===
        "undefined"
    ) {

        if (status) {

            status.textContent =
                "QR Code tidak dapat dimuat.";
        }

        return;
    }


    new QRCode(
        qrContainer,
        {

            text:
                downloadUrl,

            width:
                256,

            height:
                256,

            colorDark:
                "#111111",

            colorLight:
                "#ffffff",

            // correctLevel:
            //     QRCode.CORRECT_LEVEL_H
        }
    );


    if (status) {

        status.textContent =
            "Scan QR Code menggunakan kamera HP.";
    }
}

/* =====================================================
   GENERATE DOWNLOADQR CODE
===================================================== */
async function createDownloadQR() {

    const files =
        await uploadAllGeneratedMedia();


    if (!files) {

        throw new Error(
            "File hasil tidak tersedia untuk di-upload."
        );

    }


    /*
     * Buat manifest JSON kecil
     * yang berisi semua URL hasil upload.
     */

    const manifestBlob =
        new Blob(

            [
                JSON.stringify(files)
            ],

            {
                type: "application/json"
            }

        );


    const timestamp =
        Date.now();


    /*
     * Upload manifest ke Vercel Blob.
     */

    const manifestUrl =
        await uploadFileToVercel(

            manifestBlob,

            `semata-wayang/${timestamp}/manifest.json`,

            "application/json"

        );


    console.log(
        "Manifest URL:",
        manifestUrl
    );


    /*
     * QR hanya membawa URL manifest.
     */

    const downloadUrl =
        createDownloadPageUrl(
            manifestUrl
        );


    console.log(
        "Download URL:",
        downloadUrl
    );


    generateDownloadQR(
        downloadUrl
    );


    const status =
        document.getElementById(
            "qrDownloadStatus"
        );


    if (status) {

        status.textContent =
            "Scan QR Code ini menggunakan kamera HP.";

    }


    return downloadUrl;

}

/* =====================================================
   RESET QR
===================================================== */

function resetDownloadQR() {

    downloadSession = null;


    const qrContainer =
        document.getElementById(
            "qrCode"
        );


    const status =
        document.getElementById(
            "qrDownloadStatus"
        );


    if (qrContainer) {

        qrContainer.innerHTML =
            "";
    }


    if (status) {

        status.textContent =
            "Menyiapkan QR Code...";
    }
}

/* =====================================================
   BATAS
===================================================== */


let generatedMedia = {

    /* JPG DENGAN FRAME */
    jpgBlob: null,

    /* FOTO ASLI TANPA FRAME */
    originalPhotoBlobs: [],

    /* GIF TANPA FRAME */
    gifBlob: null,

    /* VIDEO DENGAN FRAME */
    videoBlob: null,


    jpgUrl: null,

    originalPhotoUrls: [],

    gifUrl: null,

    videoUrl: null
};


/* =====================================================
   CANVAS → BLOB
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
   GENERATE JPG WITH FRAME
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
   GENERATE ORIGINAL PHOTOS
   TANPA FRAME
===================================================== */

async function generateOriginalPhotos() {

    const photos = [];

    if (
        !capturedPhotos ||
        capturedPhotos.length === 0
    ) {

        return photos;
    }


    for (
        let i = 0;
        i < capturedPhotos.length;
        i++
    ) {

        const photo =
            capturedPhotos[i];

        if (!photo) {
            continue;
        }


        const blob =
            await canvasToBlob(
                photo,
                "image/jpeg",
                0.95
            );


        if (blob) {
            photos.push(blob);
        }
    }


    return photos;
}


/* =====================================================
   GENERATE GIF
   TANPA FRAME / TANPA TEMPLATE
===================================================== */

async function generateGIF() {

    if (
        !capturedPhotos ||
        capturedPhotos.length === 0
    ) {

        return null;
    }


    if (
        typeof GIF ===
        "undefined"
    ) {

        throw new Error(
            "GIF.js belum tersedia."
        );
    }


    /*
     * Ukuran GIF.
     *
     * Menggunakan rasio foto asli,
     * bukan rasio template.
     */

    const firstPhoto =
        capturedPhotos.find(
            photo => photo
        );


    if (!firstPhoto) {
        return null;
    }


    const gifWidth = 480;

    const gifHeight =
        Math.round(
            gifWidth *
            firstPhoto.height /
            firstPhoto.width
        );


    /*
     * Worker GIF.js
     */

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

            width: gifWidth,

            height: gifHeight,

            workerScript: workerURL
        });


    /*
     * Setiap foto menjadi satu frame GIF.
     *
     * 2 foto → foto 1 → foto 2
     *
     * 3 foto → foto 1 → foto 2 → foto 3
     */

    capturedPhotos.forEach(
        photo => {

            if (!photo) {
                return;
            }


            const canvas =
                document.createElement(
                    "canvas"
                );


            canvas.width =
                gifWidth;

            canvas.height =
                gifHeight;


            const ctx =
                canvas.getContext(
                    "2d"
                );


            /*
             * Background putih
             */

            ctx.fillStyle =
                "#ffffff";

            ctx.fillRect(
                0,
                0,
                gifWidth,
                gifHeight
            );


            /*
             * Foto memenuhi canvas.
             */

            drawImageContain(
                ctx,
                photo,
                0,
                0,
                gifWidth,
                gifHeight
            );


            gif.addFrame(
                canvas,
                {
                    delay: 800,

                    copy: true
                }
            );
        }
    );


    return new Promise(
        (
            resolve,
            reject
        ) => {

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
   DRAW IMAGE CONTAIN
===================================================== */

function drawImageContain(
    ctx,
    image,
    x,
    y,
    width,
    height
) {

    const imageRatio =
        image.width /
        image.height;

    const boxRatio =
        width /
        height;


    let drawWidth;
    let drawHeight;


    if (
        imageRatio >
        boxRatio
    ) {

        drawWidth =
            width;

        drawHeight =
            width /
            imageRatio;

    } else {

        drawHeight =
            height;

        drawWidth =
            height *
            imageRatio;
    }


    const drawX =
        x +
        (
            width -
            drawWidth
        ) /
        2;


    const drawY =
        y +
        (
            height -
            drawHeight
        ) /
        2;


    ctx.drawImage(
        image,
        drawX,
        drawY,
        drawWidth,
        drawHeight
    );
}


/* =====================================================
   LOAD VIDEO ELEMENT
===================================================== */

function loadVideoFromBlob(
    blob
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const video =
                document.createElement(
                    "video"
                );


            const url =
                URL.createObjectURL(
                    blob
                );


            video.src =
                url;

            video.muted =
                true;

            video.playsInline =
                true;

            video.preload =
                "auto";


            video.onloadedmetadata =
                () => {

                    resolve({
                        video,
                        url
                    });
                };


            video.onerror =
                () => {

                    URL.revokeObjectURL(
                        url
                    );

                    reject(
                        new Error(
                            "Video tidak dapat dimuat."
                        )
                    );
                };


            video.load();
        }
    );
}


/* =====================================================
   DRAW VIDEO COVER
===================================================== */

function drawVideoCover(
    ctx,
    video,
    frame,
    settings
) {

    if (
        !video ||
        !frame
    ) {

        return;
    }


    /*
     * Ukuran video asli
     */

    const sourceWidth =
        video.videoWidth ||
        1280;

    const sourceHeight =
        video.videoHeight ||
        720;


    /*
     * COVER
     */

    const sourceRatio =
        sourceWidth /
        sourceHeight;

    const frameRatio =
        frame.width /
        frame.height;


    let cropWidth =
        sourceWidth;

    let cropHeight =
        sourceHeight;


    let cropX = 0;
    let cropY = 0;


    if (
        sourceRatio >
        frameRatio
    ) {

        cropWidth =
            sourceHeight *
            frameRatio;

        cropX =
            (
                sourceWidth -
                cropWidth
            ) /
            2;

    } else {

        cropHeight =
            sourceWidth /
            frameRatio;

        cropY =
            (
                sourceHeight -
                cropHeight
            ) /
            2;
    }


    /*
     * Zoom
     */

    const zoom =
        settings &&
        settings.zoom
            ? settings.zoom
            : 1;


    const zoomCropWidth =
        cropWidth /
        zoom;


    const zoomCropHeight =
        cropHeight /
        zoom;


    cropX +=
        (
            cropWidth -
            zoomCropWidth
        ) /
        2;


    cropY +=
        (
            cropHeight -
            zoomCropHeight
        ) /
        2;


    /*
     * Position X/Y
     */

    const positionX =
        settings &&
        typeof settings.x === "number"
            ? settings.x
            : 0;


    const positionY =
        settings &&
        typeof settings.y === "number"
            ? settings.y
            : 0;


    cropX +=
        positionX *
        (
            cropWidth -
            zoomCropWidth
        );


    cropY +=
        positionY *
        (
            cropHeight -
            zoomCropHeight
        );


    /*
     * Mirror video kembali
     * agar sama dengan foto hasil kamera.
     */

    ctx.save();

    ctx.translate(
        frame.x +
        frame.width,
        frame.y
    );

    ctx.scale(
        -1,
        1
    );


    ctx.drawImage(
        video,

        cropX,
        cropY,
        zoomCropWidth,
        zoomCropHeight,

        0,
        0,
        frame.width,
        frame.height
    );


    ctx.restore();
}


/* =====================================================
   GENERATE VIDEO WITH TEMPLATE
===================================================== */

async function createBrandedVideo() {

    if (
        !capturedVideos ||
        capturedVideos.length === 0
    ) {

        return null;
    }


    if (!selectedTemplate) {
        return null;
    }


    /*
     * Pastikan overlay sudah tersedia.
     */

    await waitForTemplateOverlay();


    /*
     * Load semua video.
     */

    const loadedVideos = [];


    for (
        let i = 0;
        i < capturedVideos.length;
        i++
    ) {

        const blob =
            capturedVideos[i];


        if (!blob) {
            continue;
        }


        const loaded =
            await loadVideoFromBlob(
                blob
            );


        loadedVideos.push({
            index: i,
            video: loaded.video,
            url: loaded.url
        });
    }


    if (
        loadedVideos.length === 0
    ) {

        return null;
    }


    /*
     * Ukuran output video.
     *
     * 600 x proporsional
     * supaya file tidak terlalu berat.
     */

    const videoWidth = 600;

    const videoHeight =
        Math.round(
            videoWidth *
            selectedTemplate.height /
            selectedTemplate.width
        );


    const canvas =
        document.createElement(
            "canvas"
        );


    canvas.width =
        videoWidth;

    canvas.height =
        videoHeight;


    const ctx =
        canvas.getContext(
            "2d"
        );


    /*
     * Canvas stream.
     */

    const canvasStream =
        canvas.captureStream(30);


    /*
     * Kita tidak memasukkan audio kamera
     * karena video terdiri dari beberapa
     * rekaman yang dimainkan bersamaan.
     */

    const mimeType =
        getSupportedMimeType();


    if (!mimeType) {

        loadedVideos.forEach(
            item => {

                URL.revokeObjectURL(
                    item.url
                );
            }
        );

        throw new Error(
            "Browser tidak mendukung format video."
        );
    }


    const recorder =
        new MediaRecorder(
            canvasStream,
            {
                mimeType
            }
        );


    const chunks = [];


    recorder.ondataavailable =
        event => {

            if (
                event.data &&
                event.data.size > 0
            ) {

                chunks.push(
                    event.data
                );
            }
        };


    /*
     * Tentukan durasi video.
     *
     * Menggunakan durasi terpanjang
     * dari seluruh rekaman.
     */

    let duration = 0;


    loadedVideos.forEach(
        item => {

            if (
                item.video.duration &&
                isFinite(
                    item.video.duration
                )
            ) {

                duration =
                    Math.max(
                        duration,
                        item.video.duration
                    );
            }
        }
    );


    /*
     * Kalau browser belum memberikan
     * durasi yang valid, gunakan 5.3 detik.
     */

    if (
        !duration ||
        !isFinite(duration)
    ) {

        duration = 5.3;
    }


    /*
     * Siapkan semua video.
     */

    for (
        const item of loadedVideos
    ) {

        item.video.currentTime = 0;

        item.video.muted = true;

        item.video.playsInline = true;

        try {

            await item.video.play();

        } catch (error) {

            console.warn(
                "Video tidak dapat autoplay:",
                error
            );
        }
    }


    /*
     * Rekam canvas.
     */

    recorder.start();


    const startTime =
        performance.now();


    /*
     * Render loop.
     */

    await new Promise(resolve => {

        function renderFrame() {

            const elapsed =
                (
                    performance.now() -
                    startTime
                ) /
                1000;


            /*
             * Background.
             */

            ctx.fillStyle =
                selectedTemplate.background ||
                "#ffffff";

            ctx.fillRect(
                0,
                0,
                canvas.width,
                canvas.height
            );


            /*
             * Scale dari template asli
             * ke ukuran video.
             */

            const scaleX =
                videoWidth /
                selectedTemplate.width;

            const scaleY =
                videoHeight /
                selectedTemplate.height;


            /*
             * Gambar setiap video
             * ke frame masing-masing.
             */

            loadedVideos.forEach(
                item => {

                    const frame =
                        selectedTemplate.frames[
                            item.index
                        ];


                    if (!frame) {
                        return;
                    }


                    const settings =
                        photoSettings &&
                        photoSettings[
                            item.index
                        ]
                            ? photoSettings[
                                item.index
                            ]
                            : null;


                    /*
                     * Simpan transform.
                     */

                    ctx.save();


                    ctx.scale(
                        scaleX,
                        scaleY
                    );


                    drawVideoCover(
                        ctx,
                        item.video,
                        frame,
                        settings
                    );


                    ctx.restore();
                }
            );


            /*
             * FRAME / OVERLAY
             */

            if (overlayImage) {

                ctx.drawImage(
                    overlayImage,

                    0,
                    0,

                    videoWidth,
                    videoHeight
                );
            }


            /*
             * Untuk template tanpa overlay,
             * tambahkan frame kosong / garis.
             */

            if (
                !selectedTemplate.overlay
            ) {

                selectedTemplate.frames.forEach(
                    frame => {

                        ctx.save();

                        ctx.scale(
                            scaleX,
                            scaleY
                        );


                        ctx.strokeStyle =
                            "#eeeeee";

                        ctx.lineWidth =
                            2;


                        ctx.strokeRect(
                            frame.x,
                            frame.y,
                            frame.width,
                            frame.height
                        );


                        ctx.restore();
                    }
                );


                /*
                 * Footer
                 */

                const footer =
                    selectedTemplate.footer;


                if (footer) {

                    ctx.save();

                    ctx.scale(
                        scaleX,
                        scaleY
                    );


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


                    ctx.restore();
                }
            }


            /*
             * Lanjut render.
             */

            if (
                elapsed <
                duration
            ) {

                requestAnimationFrame(
                    renderFrame
                );

            } else {

                resolve();
            }
        }


        renderFrame();
    });


    /*
     * Stop recorder.
     */

    const videoBlob =
        await new Promise(resolve => {

            recorder.onstop =
                () => {

                    resolve(
                        new Blob(
                            chunks,
                            {
                                type:
                                    recorder.mimeType ||
                                    "video/webm"
                            }
                        )
                    );
                };


            recorder.stop();
        });


    /*
     * Stop video.
     */

    loadedVideos.forEach(
        item => {

            item.video.pause();

            URL.revokeObjectURL(
                item.url
            );
        }
    );


    canvasStream
        .getTracks()
        .forEach(track => {
            track.stop();
        });


    return videoBlob;
}


/* =====================================================
   GENERATE ALL MEDIA
===================================================== */

async function generateAllMedia() {

    showGeneratingState();


    try {

        await waitForTemplateOverlay();


        if (
            typeof renderEditor ===
            "function"
        ) {

            renderEditor();
        }


        /*
         * JPG DENGAN FRAME
         */

        generatedMedia.jpgBlob =
            await generateJPG();


        /*
         * FOTO ASLI TANPA FRAME
         */

        generatedMedia.originalPhotoBlobs =
            await generateOriginalPhotos();


        /*
         * GIF TANPA FRAME
         */

        generatedMedia.gifBlob =
            await generateGIF();


        /*
         * VIDEO DENGAN FRAME
         */

        generatedMedia.videoBlob =
            await createBrandedVideo();


        /*
         * REVOKE OLD URL
         */

        if (
            generatedMedia.jpgUrl
        ) {

            URL.revokeObjectURL(
                generatedMedia.jpgUrl
            );
        }


        if (
            generatedMedia.gifUrl
        ) {

            URL.revokeObjectURL(
                generatedMedia.gifUrl
            );
        }


        if (
            generatedMedia.videoUrl
        ) {

            URL.revokeObjectURL(
                generatedMedia.videoUrl
            );
        }


        generatedMedia.originalPhotoUrls
            .forEach(url => {

                URL.revokeObjectURL(
                    url
                );

            });


        /*
         * CREATE URL JPG
         */

        generatedMedia.jpgUrl =
            generatedMedia.jpgBlob
                ? URL.createObjectURL(
                    generatedMedia.jpgBlob
                )
                : null;


        /*
         * CREATE URL FOTO ASLI
         */

        generatedMedia.originalPhotoUrls =
            generatedMedia.originalPhotoBlobs
                .map(blob =>
                    URL.createObjectURL(
                        blob
                    )
                );


        /*
         * CREATE URL GIF
         */

        generatedMedia.gifUrl =
            generatedMedia.gifBlob
                ? URL.createObjectURL(
                    generatedMedia.gifBlob
                )
                : null;


        /*
         * CREATE URL VIDEO
         */

        generatedMedia.videoUrl =
            generatedMedia.videoBlob
                ? URL.createObjectURL(
                    generatedMedia.videoBlob
                )
                : null;


        /*
         * JPG PREVIEW
         */

        const jpgPreview =
            document.getElementById(
                "jpgPreview"
            );


        if (jpgPreview) {

            jpgPreview.src =
                generatedMedia.jpgUrl ||
                "";
        }


        /*
         * ORIGINAL PHOTO PREVIEW
         */

        const originalPreview =
            document.getElementById(
                "originalPhotoPreview"
            );


        if (originalPreview) {

            originalPreview.src =
                generatedMedia.originalPhotoUrls[0] ||
                "";
        }


        /*
         * GIF PREVIEW
         */

        const gifPreview =
            document.getElementById(
                "gifPreview"
            );


        if (gifPreview) {

            gifPreview.src =
                generatedMedia.gifUrl ||
                "";
        }


        /*
         * VIDEO PREVIEW
         */

        const video =
            document.getElementById(
                "videoPreview"
            );


        if (video) {

            video.src =
                generatedMedia.videoUrl ||
                "";

            video.load();

            video.play().catch(
                () => {}
            );
        }


        showScreen(
            "resultScreen"
        );
         /*
         * Upload hasil ke Vercel Blob
         * lalu buat QR Code.
         */

        try {

            await createDownloadQR();

        } catch (uploadError) {

            console.error(
                "QR upload error:",
                uploadError
            );
            alert(
                "Hasil foto sudah dibuat, tetapi QR download gagal dibuat. Pastikan koneksi internet tersedia."
            );
        }

    } catch (error) {

        console.error(
            error
        );


        alert(
            "Gagal membuat hasil. Silakan coba lagi."
        );


    } finally {

        hideGeneratingState();
    }
}


/* =====================================================
   DOWNLOAD ALL MEDIA
===================================================== */

async function downloadAllMedia() {

    const timestamp =
        new Date()
            .toISOString()
            .replace(
                /[:.]/g,
                "-"
            );


    /*
     * JPG DENGAN FRAME
     */

    downloadBlob(
        generatedMedia.jpgBlob,
        `semata-wayang-${timestamp}-frame.jpg`
    );


    await wait(300);


    /*
     * FOTO ASLI TANPA FRAME
     */

    if (
        generatedMedia.originalPhotoBlobs &&
        generatedMedia.originalPhotoBlobs.length
    ) {

        for (
            let i = 0;
            i <
            generatedMedia.originalPhotoBlobs.length;
            i++
        ) {

            downloadBlob(
                generatedMedia.originalPhotoBlobs[i],
                `semata-wayang-${timestamp}-foto-${i + 1}.jpg`
            );


            await wait(300);
        }
    }


    /*
     * GIF
     */

    if (
        generatedMedia.gifBlob
    ) {

        await wait(300);


        downloadBlob(
            generatedMedia.gifBlob,
            `semata-wayang-${timestamp}.gif`
        );
    }


    /*
     * VIDEO
     */

    if (
        generatedMedia.videoBlob
    ) {

        await wait(300);


        downloadBlob(
            generatedMedia.videoBlob,
            `semata-wayang-${timestamp}.webm`
        );
    }
}


/* =====================================================
   DOWNLOAD BLOB
===================================================== */

function downloadBlob(
    blob,
    filename
) {

    if (!blob) {
        return;
    }


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;

    link.download =
        filename;


    document.body.appendChild(
        link
    );


    link.click();

    link.remove();


    setTimeout(
        () => {

            URL.revokeObjectURL(
                url
            );

        },
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


    if (!button) {
        return;
    }


    button.disabled =
        true;


    button.textContent =
        "MEMBUAT...";
}


function hideGeneratingState() {

    const button =
        document.getElementById(
            "generateButton"
        );


    if (!button) {
        return;
    }


    button.disabled =
        false;


    button.textContent =
        "BUAT HASIL";
}


/* =====================================================
   WAIT
===================================================== */

function wait(ms) {

    return new Promise(
        resolve => {

            setTimeout(
                resolve,
                ms
            );

        }
    );
}



// let generatedMedia = {
//     jpgBlob: null,
//     gifBlob: null,
//     videoBlob: null,

//     jpgUrl: null,
//     gifUrl: null,
//     videoUrl: null
// };


// /* =========================================
//    CANVAS → BLOB
// ========================================= */

// function canvasToBlob(
//     canvas,
//     type = "image/jpeg",
//     quality = 0.95
// ) {

//     return new Promise(
//         resolve => {

//             canvas.toBlob(
//                 blob =>
//                     resolve(blob),
//                 type,
//                 quality
//             );
//         }
//     );
// }


// /* =========================================
//    GENERATE JPG
// ========================================= */

// async function generateJPG() {

//     const canvas =
//         document.getElementById(
//             "editorCanvas"
//         );

//     return await canvasToBlob(
//         canvas,
//         "image/jpeg",
//         0.95
//     );
// }


// /* =========================================
//    CREATE GIF FRAME
// ========================================= */

// function createGifFrame(
//     photo,
//     photoIndex
// ) {

//     const canvas =
//         document.createElement(
//             "canvas"
//         );

//     canvas.width =
//         selectedTemplate.width;

//     canvas.height =
//         selectedTemplate.height;


//     const ctx =
//         canvas.getContext("2d");


//     /* BACKGROUND */

//     ctx.fillStyle =
//         selectedTemplate.background ||
//         "#ffffff";

//     ctx.fillRect(
//         0,
//         0,
//         canvas.width,
//         canvas.height
//     );


//     /* PHOTO */

//     const frame =
//         selectedTemplate.frames[
//             photoIndex
//         ];

//     if (
//         photo &&
//         frame
//     ) {

//         drawPhotoCover(
//             ctx,
//             photo,
//             frame,
//             photoSettings[
//                 photoIndex
//             ]
//         );
//     }


//     /*
//      * Untuk template tanpa overlay,
//      * tampilkan frame kosong lainnya.
//      */

//     if (
//         !selectedTemplate.overlay
//     ) {

//         selectedTemplate.frames.forEach(
//             (otherFrame, index) => {

//                 if (
//                     index ===
//                     photoIndex
//                 ) {
//                     return;
//                 }

//                 ctx.strokeStyle =
//                     "#eeeeee";

//                 ctx.lineWidth =
//                     2;

//                 ctx.strokeRect(
//                     otherFrame.x,
//                     otherFrame.y,
//                     otherFrame.width,
//                     otherFrame.height
//                 );
//             }
//         );
//     }


//     /* OVERLAY */

//     if (overlayImage) {

//         ctx.drawImage(
//             overlayImage,

//             0,
//             0,

//             selectedTemplate.width,
//             selectedTemplate.height
//         );
//     }


//     /* FOOTER */

//     if (
//         !selectedTemplate.overlay
//     ) {

//         const footer =
//             selectedTemplate.footer;

//         if (footer) {

//             ctx.fillStyle =
//                 "#111111";

//             ctx.font =
//                 `700 ${footer.fontSize}px Arial`;

//             ctx.textAlign =
//                 "center";

//             ctx.textBaseline =
//                 "middle";

//             ctx.fillText(
//                 footer.text,
//                 footer.x,
//                 footer.y
//             );
//         }
//     }


//     return canvas;
// }


// /* =========================================
//    GENERATE GIF
// ========================================= */

// async function generateGIF() {

//     if (
//         !capturedPhotos ||
//         capturedPhotos.length === 0
//     ) {
//         return null;
//     }


//     if (
//         typeof GIF ===
//         "undefined"
//     ) {

//         throw new Error(
//             "GIF.js belum tersedia."
//         );
//     }


//     await waitForTemplateOverlay();


//     const workerResponse =
//         await fetch(
//             "https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js"
//         );


//     const workerBlob =
//         await workerResponse.blob();


//     const workerURL =
//         URL.createObjectURL(
//             workerBlob
//         );


//     const gifWidth = 480;

//     const gifHeight =
//         Math.round(
//             gifWidth *
//             selectedTemplate.height /
//             selectedTemplate.width
//         );


//     const gif =
//         new GIF({
//             workers: 2,
//             quality: 10,
//             width: gifWidth,
//             height: gifHeight,
//             workerScript: workerURL
//         });


//     /*
//      * Setiap foto menjadi satu frame GIF.
//      *
//      * Jadi otomatis:
//      *
//      * 2 foto → 2 frame GIF
//      * 3 foto → 3 frame GIF
//      * 4 foto → 4 frame GIF
//      */

//     capturedPhotos.forEach(
//         (photo, index) => {

//             const frameCanvas =
//                 createGifFrame(
//                     photo,
//                     index
//                 );


//             const smallCanvas =
//                 document.createElement(
//                     "canvas"
//                 );

//             smallCanvas.width =
//                 gifWidth;

//             smallCanvas.height =
//                 gifHeight;


//             const smallCtx =
//                 smallCanvas.getContext(
//                     "2d"
//                 );


//             smallCtx.drawImage(
//                 frameCanvas,

//                 0,
//                 0,

//                 gifWidth,
//                 gifHeight
//             );


//             gif.addFrame(
//                 smallCanvas,
//                 {
//                     delay: 800,
//                     copy: true
//                 }
//             );
//         }
//     );


//     return new Promise(
//         (
//             resolve,
//             reject
//         ) => {

//             gif.on(
//                 "finished",
//                 blob => {

//                     URL.revokeObjectURL(
//                         workerURL
//                     );

//                     resolve(blob);
//                 }
//             );


//             gif.on(
//                 "abort",
//                 () => {

//                     URL.revokeObjectURL(
//                         workerURL
//                     );

//                     reject(
//                         new Error(
//                             "GIF generation dibatalkan."
//                         )
//                     );
//                 }
//             );


//             gif.render();
//         }
//     );
// }


// /* =========================================
//    VIDEO
// ========================================= */

// async function createBrandedVideo(
//     videoBlob
// ) {
//     return videoBlob;
// }


// /* =========================================
//    GENERATE ALL
// ========================================= */

// async function generateAllMedia() {

//     showGeneratingState();

//     try {

//         await waitForTemplateOverlay();


//         if (
//             typeof renderEditor ===
//             "function"
//         ) {

//             renderEditor();
//         }


//         /* JPG */

//         generatedMedia.jpgBlob =
//             await generateJPG();


//         /* GIF */

//         generatedMedia.gifBlob =
//             await generateGIF();


//         /* VIDEO */

//         if (
//             typeof latestVideoBlob !==
//             "undefined" &&
//             latestVideoBlob
//         ) {

//             generatedMedia.videoBlob =
//                 await createBrandedVideo(
//                     latestVideoBlob
//                 );

//         } else {

//             generatedMedia.videoBlob =
//                 null;
//         }


//         /* REVOKE OLD URL */

//         if (
//             generatedMedia.jpgUrl
//         ) {

//             URL.revokeObjectURL(
//                 generatedMedia.jpgUrl
//             );
//         }

//         if (
//             generatedMedia.gifUrl
//         ) {

//             URL.revokeObjectURL(
//                 generatedMedia.gifUrl
//             );
//         }

//         if (
//             generatedMedia.videoUrl
//         ) {

//             URL.revokeObjectURL(
//                 generatedMedia.videoUrl
//             );
//         }


//         /* CREATE URL */

//         generatedMedia.jpgUrl =
//             URL.createObjectURL(
//                 generatedMedia.jpgBlob
//             );


//         generatedMedia.gifUrl =
//             generatedMedia.gifBlob
//                 ? URL.createObjectURL(
//                     generatedMedia.gifBlob
//                 )
//                 : null;


//         generatedMedia.videoUrl =
//             generatedMedia.videoBlob
//                 ? URL.createObjectURL(
//                     generatedMedia.videoBlob
//                 )
//                 : null;


//         /* JPG PREVIEW */

//         const jpgPreview =
//             document.getElementById(
//                 "jpgPreview"
//             );

//         if (jpgPreview) {

//             jpgPreview.src =
//                 generatedMedia.jpgUrl;
//         }


//         /* GIF PREVIEW */

//         const gifPreview =
//             document.getElementById(
//                 "gifPreview"
//             );

//         if (gifPreview) {

//             gifPreview.src =
//                 generatedMedia.gifUrl ||
//                 "";
//         }


//         /* VIDEO PREVIEW */

//         const video =
//             document.getElementById(
//                 "videoPreview"
//             );

//         if (video) {

//             video.src =
//                 generatedMedia.videoUrl ||
//                 "";

//             video.load();
//         }


//         showScreen(
//             "resultScreen"
//         );


//     } catch (error) {

//         console.error(
//             error
//         );

//         alert(
//             "Gagal membuat hasil. Silakan coba lagi."
//         );


//     } finally {

//         hideGeneratingState();
//     }
// }


// /* =========================================
//    DOWNLOAD
// ========================================= */

// async function downloadAllMedia() {

//     const timestamp =
//         new Date()
//             .toISOString()
//             .replace(
//                 /[:.]/g,
//                 "-"
//             );


//     downloadBlob(
//         generatedMedia.jpgBlob,
//         `semata-wayang-${timestamp}.jpg`
//     );


//     await wait(300);


//     if (
//         generatedMedia.gifBlob
//     ) {

//         downloadBlob(
//             generatedMedia.gifBlob,
//             `semata-wayang-${timestamp}.gif`
//         );
//     }


//     await wait(300);


//     if (
//         generatedMedia.videoBlob
//     ) {

//         downloadBlob(
//             generatedMedia.videoBlob,
//             `semata-wayang-${timestamp}.webm`
//         );
//     }
// }


// /* =========================================
//    DOWNLOAD BLOB
// ========================================= */

// function downloadBlob(
//     blob,
//     filename
// ) {

//     if (!blob) {
//         return;
//     }


//     const url =
//         URL.createObjectURL(
//             blob
//         );


//     const link =
//         document.createElement(
//             "a"
//         );


//     link.href =
//         url;

//     link.download =
//         filename;


//     document.body.appendChild(
//         link
//     );


//     link.click();

//     link.remove();


//     setTimeout(
//         () => {

//             URL.revokeObjectURL(
//                 url
//             );

//         },
//         1000
//     );
// }


// /* =========================================
//    GENERATING STATE
// ========================================= */

// function showGeneratingState() {

//     const button =
//         document.getElementById(
//             "generateButton"
//         );

//     if (!button) {
//         return;
//     }

//     button.disabled =
//         true;

//     button.textContent =
//         "MEMBUAT...";
// }


// function hideGeneratingState() {

//     const button =
//         document.getElementById(
//             "generateButton"
//         );

//     if (!button) {
//         return;
//     }

//     button.disabled =
//         false;

//     button.textContent =
//         "BUAT HASIL";
// }


// /* =========================================
//    WAIT
// ========================================= */

// function wait(ms) {

//     return new Promise(
//         resolve => {

//             setTimeout(
//                 resolve,
//                 ms
//             );
//         }
//     );
// }
