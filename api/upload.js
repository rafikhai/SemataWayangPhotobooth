import { handleUpload } from "@vercel/blob/client";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const body = req.body;

        const jsonResponse = await handleUpload({
            body,
            request: req,

            onBeforeGenerateToken: async (pathname, clientPayload) => {
                return {
                    allowedContentTypes: [
                        "image/jpeg",
                        "image/gif",
                        "video/webm"
                    ],
                    addRandomSuffix: true,
                    tokenPayload: clientPayload || ""
                };
            },

            onUploadCompleted: async ({ blob }) => {
                console.log("Blob upload completed:", blob.url);
            }
        });

        return res.status(200).json(jsonResponse);

    } catch (error) {
        console.error("BLOB ERROR:", error);

        return res.status(500).json({
            error: error instanceof Error
                ? error.message
                : String(error)
        });
    }
}

// import { handleUpload } from "@vercel/blob/client";

// export default async function handler(request) {
//     try {
//         if (request.method !== "POST") {
//             return new Response(
//                 JSON.stringify({
//                     error: "Method not allowed"
//                 }),
//                 {
//                     status: 405,
//                     headers: {
//                         "Content-Type": "application/json"
//                     }
//                 }
//             );
//         }

//         const body = await request.json();

//         const jsonResponse = await handleUpload({
//             body,
//             request,

//             onBeforeGenerateToken: async (
//                 pathname,
//                 clientPayload
//             ) => {
//                 return {
//                     allowedContentTypes: [
//                         "image/jpeg",
//                         "image/gif",
//                         "video/webm"
//                     ],
//                     addRandomSuffix: true,
//                     tokenPayload: clientPayload || ""
//                 };
//             },

//             onUploadCompleted: async ({
//                 blob,
//                 tokenPayload
//             }) => {
//                 console.log(
//                     "Blob upload completed:",
//                     blob.url
//                 );
//             }
//         });

//         return new Response(
//             JSON.stringify(jsonResponse),
//             {
//                 status: 200,
//                 headers: {
//                     "Content-Type": "application/json"
//                 }
//             }
//         );

//     } catch (error) {
//         console.error("BLOB ERROR:", error);

//         return new Response(
//             JSON.stringify({
//                 error: error instanceof Error
//                     ? error.message
//                     : String(error)
//             }),
//             {
//                 status: 500,
//                 headers: {
//                     "Content-Type": "application/json"
//                 }
//             }
//         );
//     }
// }






// import { handleUpload } from "@vercel/blob/client";

// export default async function handler(request) {

//     if (request.method !== "POST") {

//         return new Response(
//             JSON.stringify({
//                 error: "Method not allowed"
//             }),
//             {
//                 status: 405,
//                 headers: {
//                     "Content-Type": "application/json"
//                 }
//             }
//         );
//     }

//     try {

//         const body =
//             await request.json();


//         const jsonResponse =
//             await handleUpload({

//                 body,

//                 request,

//                 onBeforeGenerateToken:
//                     async (
//                         pathname,
//                         clientPayload
//                     ) => {

//                         console.log(
//                             "Generating Blob token:",
//                             pathname
//                         );

//                         return {

//                             allowedContentTypes: [
//                                 "image/jpeg",
//                                 "image/gif",
//                                 "video/webm"
//                             ],

//                             addRandomSuffix:
//                                 true,

//                             tokenPayload:
//                                 clientPayload || ""
//                         };
//                     },

//                 onUploadCompleted:
//                     async ({
//                         blob,
//                         tokenPayload
//                     }) => {

//                         console.log(
//                             "Blob upload completed:",
//                             blob.url
//                         );
//                     }
//             });


//         return new Response(
//             JSON.stringify(
//                 jsonResponse
//             ),
//             {
//                 status: 200,
//                 headers: {
//                     "Content-Type":
//                         "application/json"
//                 }
//             }
//         );

//     } catch (error) {

//         console.error(
//             "Blob upload error:",
//             error
//         );

//         return new Response(
//             JSON.stringify({
//                 error:
//                     error instanceof Error
//                         ? error.message
//                         : String(error)
//             }),
//             {
//                 status: 400,
//                 headers: {
//                     "Content-Type":
//                         "application/json"
//                 }
//             }
//         );
//     }
// }
