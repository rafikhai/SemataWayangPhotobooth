import { put } from "@vercel/blob";

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

        const formData =
            await request.formData();

        const file =
            formData.get("file");

        const filename =
            formData.get("filename");

        const contentType =
            formData.get("contentType");

        if (!file) {

            return new Response(
                JSON.stringify({
                    error: "File tidak ditemukan."
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

        const blob =
            await put(
                filename ||
                    file.name ||
                    `upload-${Date.now()}`,

                file,

                {
                    access: "public",

                    addRandomSuffix: true,

                    contentType:
                        contentType ||
                        file.type ||
                        "application/octet-stream"
                }
            );

        console.log(
            "Upload selesai:",
            blob.url
        );

        return new Response(
            JSON.stringify({
                url: blob.url
            }),
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
                status: 500,
                headers: {
                    "Content-Type":
                        "application/json"
                }
            }
        );
    }
}
