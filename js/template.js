let templates = [];

let selectedTemplate = null;


/* =========================================
   LOAD TEMPLATE DARI JSON
========================================= */

async function loadTemplates() {
    try {
        const response = await fetch(
            "assets/templates/templates.json"
        );

        if (!response.ok) {
            throw new Error(
                `HTTP error ${response.status}`
            );
        }

        templates = await response.json();

        /*
         * Tambahkan path lengkap untuk gambar template.
         */
        templates = templates.map(template => {

            if (template.image) {
                template.overlay =
                    "assets/templates/" +
                    template.image;
            } else {
                template.overlay = null;
            }

            return template;
        });

        console.log(
            "Template berhasil dimuat:",
            templates
        );

        return templates;

    } catch (error) {

        console.error(
            "Gagal memuat templates.json:",
            error
        );

        templates = [];

        alert(
            "Template tidak dapat dimuat. Pastikan aplikasi dijalankan melalui server lokal."
        );

        return [];
    }
}
