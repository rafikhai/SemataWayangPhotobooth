import { handleUpload } from "@vercel/blob/client";


export default async function handler(request) {

    if (request.method !== "POST") {

        return new Response(
            JSON.stringify({
                error: "Method not allowed"
            }),
            {
                status: 405,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }


    try {

        const body =
            await request.json();


        const jsonResponse =
            await handleUpload({

                body,

                request,


                onBeforeGenerateToken:
                    async (
                        pathname,
                        clientPayload
                    ) => {

                        return {

                            /*
                             * File yang boleh diupload.
                             */

                            allowedContentTypes: [

                                "image/jpeg",

                                "image/gif",

                                "video/webm"
                            ],


                            /*
                             * Setiap upload mendapatkan
                             * nama unik.
                             */

                            addRandomSuffix: true,


                            /*
                             * Data tambahan dari browser.
                             */

                            tokenPayload:
                                clientPayload || ""
                        };
                    },


                onUploadCompleted:
                    async ({
                        blob,
                        tokenPayload
                    }) => {

                        /*
                         * Untuk sementara tidak perlu
                         * menyimpan database.
                         *
                         * File sudah berada di
                         * Vercel Blob.
                         */

                        console.log(
                            "Upload selesai:",
                            blob.url
                        );

                    }

            });


        return new Response(
            JSON.stringify(
                jsonResponse
            ),
            {
                status: 200,
                headers: {
                    "Content-Type":
                        "application/json"
                }
            }
        );


    } catch (error) {

        console.error(
            "Upload error:",
            error
        );


        return new Response(
            JSON.stringify({
                error:
                    error instanceof Error
                        ? error.message
                        : String(error)
            }),
            {
                status: 400,
                headers: {
                    "Content-Type":
                        "application/json"
                }
            }
        );
    }
}