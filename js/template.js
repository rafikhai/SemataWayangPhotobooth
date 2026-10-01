const templates = [

    {
        id: "classic-3",

        name: "Classic 3",

        description: "3 foto",

        width: 1200,
        height: 1800,

        background: "#ffffff",

        countdown: 3,

        frames: [

            {
                x: 100,
                y: 100,
                width: 1000,
                height: 450
            },

            {
                x: 100,
                y: 650,
                width: 1000,
                height: 450
            },

            {
                x: 100,
                y: 1200,
                width: 1000,
                height: 450
            }

        ],

        footer: {
            text: "SEMATA WAYANG",
            x: 600,
            y: 1740,
            fontSize: 36
        }
    },


    {
        id: "classic-2",

        name: "Classic 2",

        description: "2 foto",

        width: 1200,
        height: 1800,

        background: "#ffffff",

        countdown: 3,

        frames: [

            {
                x: 100,
                y: 250,
                width: 1000,
                height: 550
            },

            {
                x: 100,
                y: 1000,
                width: 1000,
                height: 550
            }

        ],

        footer: {
            text: "SEMATA WAYANG",
            x: 600,
            y: 1740,
            fontSize: 36
        }
    }

];

let selectedTemplate = templates[0];

