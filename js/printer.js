function printFinalPhoto() {

    const canvas =
        document.getElementById(
            "editorCanvas"
        );

    if (!canvas) {
        return;
    }


    const image =
        canvas.toDataURL(
            "image/jpeg",
            0.95
        );


    const printWindow =
        window.open(
            "",
            "_blank"
        );


    if (!printWindow) {

        alert(
            "Popup diblokir browser. Izinkan popup untuk mencetak."
        );

        return;
    }


    printWindow.document.write(`
        <!DOCTYPE html>

        <html>

        <head>

            <title>
                Semata Wayang
            </title>

            <style>

                @page {
                    size: 80mm auto;
                    margin: 0;
                }

                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    padding: 0;
                    background: white;
                }

                .print-container {
                    width: 80mm;
                    padding: 4mm;
                }

                img {
                    width: 72mm;
                    height: auto;
                    display: block;
                }

            </style>

        </head>

        <body>

            <div class="print-container">

                <img src="${image}">

            </div>

            <script>

                window.onload = function() {

                    window.print();

                    setTimeout(
                        function() {
                            window.close();
                        },
                        500
                    );

                };

            <\/script>

        </body>

        </html>
    `);


    printWindow.document.close();
}
