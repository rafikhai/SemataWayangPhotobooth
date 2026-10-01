const nodemailer = require("nodemailer");


module.exports = async function handler(
    req,
    res
) {

    if (req.method !== "POST") {

        return res.status(405).json({

            message:
                "Method not allowed."

        });

    }


    try {

        const {
            email,
            files
        } = req.body;


        if (!email) {

            return res.status(400).json({

                message:
                    "Email penerima wajib diisi."

            });

        }


        if (
            !files ||
            !Array.isArray(files)
        ) {

            return res.status(400).json({

                message:
                    "File tidak ditemukan."

            });

        }


        /*
         * Gmail SMTP
         */

        const transporter =
            nodemailer.createTransport({

                service: "gmail",

                auth: {

                    user:
                        process.env.GMAIL_USER,

                    pass:
                        process.env.GMAIL_APP_PASSWORD

                }

            });


        const attachments =
            files

                .filter(file =>
                    file.content
                )

                .map(file => ({

                    filename:
                        file.filename,

                    content:
                        Buffer.from(
                            file.content,
                            "base64"
                        ),

                    contentType:
                        file.contentType

                }));


        await transporter.sendMail({

            from:
                `"Semata Wayang Photobooth" <${process.env.GMAIL_USER}>`,

            to:
                email,

            subject:
                "Your Semata Wayang Photobooth Photos 📸",

            text:
                "Terima kasih sudah menggunakan Semata Wayang Photobooth. Berikut hasil fotomu.",

            html: `

                <div
                    style="
                        font-family:Arial,sans-serif;
                        line-height:1.6;
                    "
                >

                    <h2>
                        Your Photos Are Ready 📸
                    </h2>

                    <p>
                        Terima kasih sudah menggunakan
                        Semata Wayang Photobooth.
                    </p>

                    <p>
                        Kami lampirkan hasil fotomu
                        dalam 3 format:
                    </p>

                    <ul>

                        <li>JPG</li>

                        <li>GIF</li>

                        <li>Video</li>

                    </ul>

                    <p>
                        Semata Wayang
                    </p>

                </div>

            `,

            attachments

        });


        return res.status(200).json({

            success: true,

            message:
                "Email berhasil dikirim."

        });


    } catch (error) {

        console.error(error);


        return res.status(500).json({

            success: false,

            message:
                "Gagal mengirim email."

        });

    }

};