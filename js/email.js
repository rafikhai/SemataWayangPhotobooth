async function sendEmail() {

    const emailInput =
        document.getElementById(
            "customerEmail"
        );

    const status =
        document.getElementById(
            "emailStatus"
        );

    const email =
        emailInput.value.trim();


    if (!email) {

        status.textContent =
            "Masukkan alamat email.";

        return;
    }


    if (
        !email.includes("@")
    ) {

        status.textContent =
            "Format email belum benar.";

        return;
    }


    if (
        !generatedMedia.jpgBlob ||
        !generatedMedia.gifBlob
    ) {

        status.textContent =
            "File belum siap.";

        return;
    }


    const button =
        document.getElementById(
            "sendEmailButton"
        );


    button.disabled = true;

    button.textContent =
        "MENGIRIM...";

    status.textContent =
        "Sedang mengirim file...";


    try {

        const payload = {

            email,

            jpg:
                await blobToBase64(
                    generatedMedia.jpgBlob
                ),

            gif:
                await blobToBase64(
                    generatedMedia.gifBlob
                ),

            video:
                generatedMedia.videoBlob
                    ? await blobToBase64(
                        generatedMedia.videoBlob
                    )
                    : null
        };


        const response =
            await fetch(
                "/api/send-email",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Gagal mengirim email."
            );
        }


        status.textContent =
            "Foto berhasil dikirim ✓";


        setTimeout(
            () => {

                document
                    .getElementById(
                        "emailModal"
                    )
                    .classList.remove(
                        "active"
                    );

            },
            1500
        );


    } catch (error) {

        console.error(error);

        status.textContent =
            "Email belum dapat dikirim. Backend belum aktif.";

    } finally {

        button.disabled = false;

        button.textContent =
            "KIRIM";

    }
}


/* =====================================================
   BLOB TO BASE64
===================================================== */

function blobToBase64(
    blob
) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();

            reader.onloadend =
                () => {

                    const result =
                        reader.result;

                    resolve(
                        result.split(",")[1]
                    );

                };

            reader.onerror =
                reject;

            reader.readAsDataURL(
                blob
            );

        }
    );
}


/* =====================================================
   SEND BUTTON
===================================================== */

document
    .getElementById(
        "sendEmailButton"
    )
    .addEventListener(
        "click",
        sendEmail
    );

