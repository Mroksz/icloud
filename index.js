require("dotenv").config();

const fs = require("node:fs");
const path = require("node:path");

const {
    Client,
    EmbedBuilder,
    ActivityType,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    GatewayIntentBits,
    PermissionsBitField,
    REST,
    Routes,
    SlashCommandBuilder
} = require("discord.js");
const {
    MYSTERY_CASES,
    createMysteryEmbed,
    createMysteryButtons
} = require("./mystery-game");
const {
    characters: AKINATOR_ADDITIONAL_CHARACTERS,
    questions: AKINATOR_ADDITIONAL_QUESTIONS,
    categoryNames: AKINATOR_CATEGORY_NAMES
} = require("./akinator-data");

// ===============================
// CONFIGURACIÓN
// ===============================

const TOKEN = process.env.DISCORD_TOKEN;
const CHAT_CHANNEL_ID = "1530770440992194643";
const COMMAND_LOG_CHANNEL_ID = "1557996473151651861";
const COMMUNITY_CHANNEL_ID = "1558002369848016966";
const BOT_PRESENTATION_CHANNEL_ID = "1558385288877842453";
const SUGGESTIONS_CHANNEL_ID = "1558400450301005924";
const BOT_INVITE_URL = "https://discord.com/oauth2/authorize?client_id=1554656981502005268&permissions=8&integration_type=0&scope=bot";
const BOT_PRESENTATION_IMAGE_URL = "https://cdn.discordapp.com/attachments/1531765941665398835/1558394743619059792/dd78b88c8f36d58fccde936067e339ee_1.PNG?ex=6acb47b4&is=6ac9f634&hm=c49d272e7b9d6d6d453be996bfcc07ccb8a5338d2598c7aef2a218b7011b02ff";
const FUNNY_ROLE_ID = "1531550671285784770";
const TWITCH_STREAM_URL = "https://www.twitch.tv/soyja_20";
const MIN_FUNNY_MESSAGE_DELAY = 3 * 60 * 60 * 1000;
const MAX_FUNNY_MESSAGE_DELAY = 5 * 60 * 60 * 1000;
const FUNNY_MESSAGES = [
    "Mi cerebro abrió 37 pestañas y ahora ninguna sabe de dónde viene la música.",
    "Hoy iba a ser productivo, pero mi cama presentó una contraoferta irresistible.",
    "No estoy procrastinando; estoy dejando que las ideas maduren en otra habitación.",
    "Mi última neurona pidió vacaciones y no dejó suplente.",
    "Fui a buscar motivación y volví con hambre.",
    "Tengo un plan perfecto. Solo falta recordar cuál era.",
    "Mi nivel de energía está en modo ahorro, como el celular al 2%.",
    "Si pensar contara como ejercicio, ya habría terminado la rutina de hoy.",
    "Mi calendario dice que hoy toca brillar; le voy a pedir que lo reprograme.",
    "Abrí la nevera por tercera vez, por si la cena había aparecido por actualización.",
    "Estoy en decadencia, pero al menos la caída tiene buena iluminación.",
    "Mi productividad y yo estamos en una relación a distancia.",
    "Hoy hice una lista de pendientes y ya me cansé de verla.",
    "El entusiasmo llegó, vio mis pendientes y se fue sin despedirse.",
    "Tengo sueño acumulado para abrir una sucursal.",
    "Mi fuerza de voluntad está cargando; tiempo estimado: desconocido.",
    "Quise ordenar mi vida y terminé ordenando los iconos del escritorio.",
    "Mi yo del futuro acaba de rechazar otra tarea que le dejé.",
    "El lunes me prometió cambios y ya estamos negociando otra vez.",
    "Mi cerebro puso una canción en repetición y olvidó el resto del día.",
    "Estoy a una notificación de cerrar todo y convertirme en leyenda local.",
    "Hoy avancé muchísimo: ahora sé exactamente qué cosas no hice.",
    "La motivación está en línea, pero no responde mis mensajes.",
    "Mi rutina saludable empieza mañana desde hace varias semanas.",
    "Me levanté con energía y la gasté buscando dónde había dejado el celular.",
    "Mi escritorio tiene capas históricas de decisiones para después.",
    "Quise tomar las riendas del día, pero el día iba en otra dirección.",
    "Tengo tantas pestañas abiertas que mi navegador ya necesita terapia.",
    "Mi plan de hoy era simple; luego aparecí yo para complicarlo.",
    "La alarma sonó y ambos decidimos que todavía no era nuestro momento.",
    "Estoy ahorrando energía para una ocasión especial que nunca especificaron.",
    "Mi lista de tareas ya tiene más temporadas que una serie larga.",
    "Me iba a concentrar, pero un pensamiento secundario pidió el micrófono.",
    "Hoy mi gran logro fue recordar por qué entré a esta habitación.",
    "El café no arregla mis problemas, pero hace que los lea más rápido.",
    "Mi paciencia salió un momento y dejó el estado en no molestar.",
    "Estoy tan organizado que perdí la lista donde anoté cómo organizarme.",
    "Quise descansar cinco minutos y desperté en el siguiente capítulo.",
    "El modo adulto está instalado, pero todavía no encuentro dónde se abre.",
    "Mi cerebro aceptó los términos y condiciones sin leer la parte de madrugar.",
    "Hoy voy lento, pero con una confianza que no está respaldada por los hechos."
];

const ECONOMY_FILE = path.join(__dirname, "economy.json");
const ROLE_ASSIGNMENTS_FILE = path.join(__dirname, "role_assignments.json");
const CONNECTED_CHANNELS_FILE = path.join(__dirname, "connected_channels.json");
const GUILD_SETTINGS_FILE = path.join(__dirname, "guild_settings.json");
const CHAT_XP_COOLDOWN = 60 * 1000;
const AUTOMOD_SPAM_WINDOW_MS = 7000;
const AUTOMOD_SPAM_MESSAGE_LIMIT = 5;
const AUTOMOD_WARNING_COOLDOWN_MS = 10000;
const STARTING_BALANCE = 1000;
const MINIMUM_BET = 10;
const CRYSTAL_BRIDGE_ENTRY_FEE = 100;
const CRYSTAL_BRIDGE_STAGES = 8;
const CRYSTAL_BRIDGE_STAGE_REWARD = 100;
const WORK_KIT_PRICE = 300;
const WORK_KIT_USES = 3;
const WORK_KIT_BONUS_MULTIPLIER = 1.5;
const CRYSTAL_PASS_PRICE = 500;
const MYSTERY_REWARD = 300;
const MYSTERY_REWARD_COOLDOWN = 60 * 60 * 1000;
const MINE_TOOL_USES = 10;
const EXPEDITION_ENTRY_FEE = 100;
const EXPEDITION_STAGES = 5;
const WORK_COOLDOWN = 60 * 60 * 1000;
const STEAL_COOLDOWN = 3 * 60 * 60 * 1000;
const PESO_FORMATTER = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
});
const RED_ROULETTE_NUMBERS = new Set([
    1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36
]);
const WORK_JOBS = [
    { name: "repartidor de tacos", minimum: 120, maximum: 280 },
    { name: "mecánico de naves espaciales", minimum: 180, maximum: 360 },
    { name: "probador de sillas", minimum: 90, maximum: 220 },
    { name: "guardia del último tamal", minimum: 150, maximum: 320 },
    { name: "traductor de maullidos", minimum: 110, maximum: 300 },
    { name: "cazador de bugs", minimum: 200, maximum: 400 }
];
const SHOP_ITEMS = {
    kit_trabajo: {
        name: "Kit de trabajo",
        price: WORK_KIT_PRICE,
        description: `Aumenta 50% las ganancias de tus próximos ${WORK_KIT_USES} turnos de /trabajar.`
    },
    pase_cristal: {
        name: "Pase de cristal",
        price: CRYSTAL_PASS_PRICE,
        description: "Te salva de una caída en una partida de /puente."
    },
    madera: {
        name: "Madera",
        price: 20,
        description: "Material para fabricar herramientas. Receta del pico de madera: 3 maderas y 2 palos."
    },
    palo: {
        name: "Palo",
        price: 12,
        description: "Material para fabricar herramientas; todos los picos necesitan 2 palos."
    },
    piedra: {
        name: "Piedra",
        price: 40,
        description: "Material para fabricar un pico de piedra."
    },
    hierro: {
        name: "Lingote de hierro",
        price: 120,
        description: "Material para fabricar un pico de hierro."
    },
    diamante: {
        name: "Diamante",
        price: 400,
        description: "Material raro para fabricar el pico más potente."
    }
};
const MINING_MATERIALS = ["madera", "palo", "piedra", "hierro", "diamante"];
const MINING_ORES = {
    piedra: { name: "Piedra", price: 10 },
    carbon: { name: "Carbón", price: 25 },
    cobre: { name: "Cobre", price: 50 },
    hierro: { name: "Mineral de hierro", price: 100 },
    diamante: { name: "Diamante", price: 350 }
};
const PICKAXES = {
    madera: { name: "Pico de madera", tier: 1, recipe: { madera: 3, palo: 2 } },
    piedra: { name: "Pico de piedra", tier: 2, recipe: { piedra: 3, palo: 2 } },
    hierro: { name: "Pico de hierro", tier: 3, recipe: { hierro: 3, palo: 2 } },
    diamante: { name: "Pico de diamante", tier: 4, recipe: { diamante: 3, palo: 2 } }
};
const MINING_DROPS = {
    madera: [
        { ore: "piedra", chance: 0.4, minimum: 1, maximum: 3 },
        { ore: "carbon", chance: 0.4, minimum: 1, maximum: 3 },
        { ore: "cobre", chance: 0.2, minimum: 1, maximum: 2 }
    ],
    piedra: [
        { ore: "piedra", chance: 0.2, minimum: 1, maximum: 3 },
        { ore: "carbon", chance: 0.35, minimum: 1, maximum: 3 },
        { ore: "cobre", chance: 0.3, minimum: 1, maximum: 3 },
        { ore: "hierro", chance: 0.15, minimum: 1, maximum: 2 }
    ],
    hierro: [
        { ore: "piedra", chance: 0.1, minimum: 1, maximum: 3 },
        { ore: "carbon", chance: 0.2, minimum: 1, maximum: 3 },
        { ore: "cobre", chance: 0.25, minimum: 1, maximum: 3 },
        { ore: "hierro", chance: 0.35, minimum: 1, maximum: 3 },
        { ore: "diamante", chance: 0.1, minimum: 1, maximum: 1 }
    ],
    diamante: [
        { ore: "piedra", chance: 0.05, minimum: 1, maximum: 3 },
        { ore: "carbon", chance: 0.15, minimum: 1, maximum: 3 },
        { ore: "cobre", chance: 0.15, minimum: 1, maximum: 3 },
        { ore: "hierro", chance: 0.25, minimum: 1, maximum: 3 },
        { ore: "diamante", chance: 0.4, minimum: 1, maximum: 2 }
    ]
};
const ENTERTAINMENT_CHALLENGES = [
    "Describe tu día como si fuera el tráiler de una película épica.",
    "Inventa un nombre de superhéroe para la persona que escribió antes que tú.",
    "Resume tu serie favorita usando solo cinco palabras.",
    "Escribe una excusa absurda para llegar tarde a una reunión con extraterrestres.",
    "Dale un título dramático a la última comida que tuviste.",
    "Inventa un eslogan para vender una piedra con mucha confianza.",
    "Describe al bot como si fuera un jefe final de videojuego.",
    "Cuenta qué poder inútil elegirías y cómo lo usarías para ganar dinero.",
    "Inventa una nueva regla ridícula para este servidor.",
    "Escribe una profecía sobre quién mandará el próximo mensaje.",
    "Crea un nombre de banda usando el clima de hoy y el último objeto que viste.",
    "Explica por qué los calcetines desaparecidos están organizando una rebelión."
];
const SILLY_POWERS = [
    { power: "Encontrar cualquier objeto perdido", drawback: "pero solo después de comprar un reemplazo." },
    { power: "Hablar con las palomas", drawback: "aunque todas te piden que les debas dinero." },
    { power: "Teletransportarte", drawback: "pero apareces siempre a dos metros de donde querías." },
    { power: "Leer la mente", drawback: "pero solo escuchas la canción que alguien tiene pegada." },
    { power: "Detener el tiempo", drawback: "pero tú también te quedas congelado." },
    { power: "Convertir agua en café", drawback: "pero únicamente café descafeinado y tibio." },
    { power: "Controlar el clima", drawback: "pero solo dentro de una habitación pequeña." },
    { power: "Correr a velocidad supersónica", drawback: "pero solo cuando vas tarde al baño." },
    { power: "Entender a los animales", drawback: "y todos quieren que les arregles sus problemas." },
    { power: "Hacer aparecer comida", drawback: "pero siempre es una sola aceituna." }
];
const SILLY_EXCUSES = [
    "No llegué tarde: el reloj se adelantó para sorprenderme.",
    "Mi alarma sonó, pero el comité de almohadas rechazó la propuesta.",
    "Un pato me miró con demasiada intensidad y tuve que replantearme el día.",
    "Salí a tiempo, pero mi sombra tomó una ruta alternativa.",
    "El Wi-Fi me pidió ayuda emocional y no pude dejarlo así.",
    "Mi yo del futuro me dijo que no viniera. Parecía convincente.",
    "Me detuvo una reunión urgente de mis calcetines desaparecidos.",
    "El café todavía no había terminado de cargar.",
    "Tuve que esperar a que mi planta terminara de contarme un chisme.",
    "Un portal interdimensional apareció en la cocina. Era el refrigerador, pero igual."
];
const VILLAIN_NAMES = [
    "El Conde del Wi-Fi Lento",
    "Doctora Migaja",
    "El Misterioso Señor Calcetín",
    "La Sombra del Refrigerador",
    "Capitán Spoiler",
    "La Reina del Lunes"
];
const VILLAIN_PLANS = [
    "reemplazar todos los semáforos por ruletas",
    "esconder el botón de posponer la alarma",
    "cambiar todas las cucharas por tenedores",
    "hacer que cada canción termine justo antes del coro",
    "ponerle contraseña a todas las puertas automáticas",
    "convencer a los gatos de que las 4 a. m. es hora de karaoke"
];
const VILLAIN_WEAKNESSES = [
    "un video de perritos",
    "una siesta de veinte minutos",
    "un sándwich perfectamente preparado",
    "que le digan «buen trabajo»",
    "un chiste malo contado con mucha confianza",
    "una oferta de dos por uno"
];
const JOKES = [
    "¿Qué hace una abeja en el gimnasio? ¡Zum-ba!",
    "¿Cuál es el colmo de un jardinero? Que siempre lo dejen plantado.",
    "¿Qué le dijo un techo a otro? Techo de menos.",
    "¿Por qué el libro de matemáticas estaba triste? Porque tenía demasiados problemas.",
    "¿Qué hace una computadora cuando tiene frío? Cierra Windows.",
    "¿Cómo se despiden los químicos? Ácido un placer.",
    "¿Qué le dijo una impresora a otra? ¿Esa hoja es tuya o es impresión mía?",
    "¿Cuál es el café más peligroso? El ex-preso.",
    "¿Qué hace un pez mago? Nada por aquí, nada por allá.",
    "¿Por qué la escoba estaba feliz? Porque iba barriendo en la vida.",
    "¿Qué le dijo el cero al ocho? ¡Qué bonito cinturón!",
    "¿Cómo se llama el campeón de buceo japonés? Tokofondo.",
    "¿Qué hace una vaca con los ojos cerrados? Leche concentrada.",
    "¿Cuál es el animal más antiguo? La cebra, porque está en blanco y negro.",
    "¿Qué le dice una iguana a su hermana gemela? Somos iguanitas.",
    "¿Por qué el tomate se puso rojo? Porque vio a la ensalada desnuda.",
    "¿Qué hace un lápiz en una fiesta? Saca punta al ambiente.",
    "¿Cuál es el último animal que subió al arca? El del-fin.",
    "¿Qué le dijo una pared a otra? Nos vemos en la esquina.",
    "¿Por qué fue el ordenador al médico? Porque tenía un virus.",
    "¿Qué hace una caja en el gimnasio? ¡Caja fuerte!",
    "¿Qué le dijo el mar a la playa? Nada, solo hizo una ola."
];
const ORACLE_OPENERS = [
    "Las estrellas consultaron el chat y dicen:",
    "Mi bola mágica hizo una pausa dramática y responde:",
    "El consejo de las neuronas votó por:",
    "Un cuervo con Wi-Fi me acaba de susurrar:",
    "El destino revisó tu pregunta y contestó:"
];
const ORACLE_ANSWERS = [
    "Sí, pero no olvides llevar un plan B y algo para picar.",
    "Todo apunta a que sí... especialmente si dejas de preguntarle a un bot.",
    "No por ahora. El universo está actualizando sus términos y condiciones.",
    "Las señales son confusas: vuelve a preguntar después de una siesta.",
    "Definitivamente sí. Una paloma estadística lo confirmó.",
    "Mejor no. Hasta mi última neurona levantó una ceja.",
    "Hay posibilidades, pero tendrás que dar el primer paso.",
    "El destino dice que depende de cuánto café haya disponible.",
    "Ni sí ni no: la respuesta está escondida detrás del próximo meme.",
    "La respuesta es sí, con un 73% de confianza y 100% de dramatismo."
];
const AKINATOR_THINKING_TIME = 5 * 1000;
const AKINATOR_BASE_CHARACTERS = [
    { name: "Goku", wiki: "Goku", traits: ["anime", "male", "alien", "powers", "martial-arts", "animated"] },
    { name: "Naruto Uzumaki", wiki: "Naruto Uzumaki", traits: ["anime", "male", "human", "powers", "ninja", "animated"] },
    { name: "Monkey D. Luffy", wiki: "Monkey D. Luffy", traits: ["anime", "male", "human", "powers", "pirate", "animated"] },
    { name: "Saitama", wiki: "Saitama (One-Punch Man)", traits: ["anime", "male", "human", "powers", "martial-arts", "animated"] },
    { name: "Tanjiro Kamado", wiki: "Tanjiro Kamado", traits: ["anime", "male", "human", "sword", "animated"] },
    { name: "Pikachu", wiki: "Pikachu", traits: ["game", "nintendo", "animal", "yellow", "powers", "animated", "pokemon"] },
    { name: "Mario", wiki: "Mario", traits: ["game", "nintendo", "male", "human", "plumber", "animated", "mario"] },
    { name: "Sonic", wiki: "Sonic the Hedgehog", traits: ["game", "animal", "blue", "powers", "animated", "sonic"] },
    { name: "Link", wiki: "Link (The Legend of Zelda)", traits: ["game", "nintendo", "male", "human", "sword", "animated", "zelda"] },
    { name: "Zelda", wiki: "Princess Zelda", traits: ["game", "nintendo", "female", "human", "powers", "sword", "animated", "zelda"] },
    { name: "Batman", wiki: "Batman", traits: ["comic", "hero", "male", "human", "mask", "weapon", "animated"] },
    { name: "Superman", wiki: "Superman", traits: ["comic", "hero", "male", "alien", "powers", "animated"] },
    { name: "Spider-Man", wiki: "Spider-Man", traits: ["comic", "hero", "male", "human", "mask", "powers", "animated"] },
    { name: "Iron Man", wiki: "Iron Man", traits: ["comic", "hero", "male", "human", "mask", "weapon"] },
    { name: "Darth Vader", wiki: "Darth Vader", traits: ["movie", "villain", "male", "human", "mask", "weapon", "space", "powers"] },
    { name: "Harry Potter", wiki: "Harry Potter (character)", traits: ["movie", "male", "human", "wizard", "powers", "glasses"] },
    { name: "Shrek", wiki: "Shrek", traits: ["movie", "male", "animal", "animated"] },
    { name: "Elsa", wiki: "Elsa (Frozen)", traits: ["movie", "female", "human", "powers", "animated"] },
    { name: "Bob Esponja", wiki: "SpongeBob SquarePants (character)", traits: ["tv", "male", "animal", "yellow", "underwater", "animated"] },
    { name: "Homero Simpson", wiki: "Homer Simpson", traits: ["tv", "male", "human", "animated"] },
    { name: "Rick Sanchez", wiki: "Rick Sanchez", traits: ["tv", "male", "human", "glasses", "space", "animated"] },
    { name: "Freddy Fazbear", wiki: "Freddy Fazbear", traits: ["game", "animal", "villain", "mask", "horror"] },
    { name: "Steve", wiki: "Steve (Minecraft)", traits: ["game", "male", "human", "weapon"] },
    { name: "Kratos", wiki: "Kratos (God of War)", traits: ["game", "male", "human", "powers", "weapon", "sword"] },
    { name: "Master Chief", wiki: "Master Chief (Halo)", traits: ["game", "male", "human", "mask", "weapon", "space"] },
    { name: "Lara Croft", wiki: "Lara Croft", traits: ["game", "female", "human", "weapon"] },
    { name: "Luigi", wiki: "Luigi", traits: ["game", "nintendo", "male", "human", "plumber", "animated"] },
    { name: "Yoshi", wiki: "Yoshi", traits: ["game", "nintendo", "animal", "animated"] },
    { name: "Calamardo", wiki: "Squidward Tentacles", traits: ["tv", "male", "animal", "underwater", "animated"] },
    { name: "Deadpool", wiki: "Deadpool", traits: ["comic", "hero", "male", "human", "mask", "powers", "weapon"] },
    { name: "Wonder Woman", wiki: "Wonder Woman", traits: ["comic", "hero", "female", "human", "powers", "weapon", "sword"] },
    { name: "Joker", wiki: "Joker (character)", traits: ["comic", "villain", "male", "human"] },
    { name: "Wednesday Addams", wiki: "Wednesday Addams", traits: ["tv", "female", "human", "powers"] },
    { name: "Groot", wiki: "Groot", traits: ["comic", "hero", "male", "animal", "powers", "space", "marvel"] },
    { name: "Stitch", wiki: "Stitch (Lilo & Stitch)", traits: ["movie", "animal", "blue", "powers", "space", "animated", "disney"] },
    { name: "Mewtwo", wiki: "Mewtwo", traits: ["game", "nintendo", "animal", "powers", "animated", "pokemon"] },
    { name: "Capitán América", wiki: "Captain America", traits: ["comic", "hero", "male", "human", "weapon", "marvel"] },
    { name: "Vegeta", wiki: "Vegeta", traits: ["anime", "male", "alien", "powers", "martial-arts", "animated", "dragon-ball"] },
    { name: "Gohan", wiki: "Gohan", traits: ["anime", "male", "human", "alien", "powers", "martial-arts", "animated", "dragon-ball"] },
    { name: "Bulma", wiki: "Bulma", traits: ["anime", "female", "human", "animated", "dragon-ball"] },
    { name: "Frieza", wiki: "Frieza", traits: ["anime", "male", "alien", "villain", "powers", "animated", "dragon-ball"] },
    { name: "Broly", wiki: "Broly", traits: ["anime", "male", "alien", "powers", "martial-arts", "animated", "dragon-ball"] },
    { name: "Sakura Haruno", wiki: "Sakura Haruno", traits: ["anime", "female", "human", "powers", "ninja", "animated", "naruto"] },
    { name: "Sasuke Uchiha", wiki: "Sasuke Uchiha", traits: ["anime", "male", "human", "powers", "ninja", "sword", "animated", "naruto"] },
    { name: "Kakashi Hatake", wiki: "Kakashi Hatake", traits: ["anime", "male", "human", "powers", "ninja", "mask", "animated", "naruto"] },
    { name: "Itachi Uchiha", wiki: "Itachi Uchiha", traits: ["anime", "male", "human", "powers", "ninja", "animated", "naruto"] },
    { name: "Madara Uchiha", wiki: "Madara Uchiha", traits: ["anime", "male", "human", "villain", "powers", "ninja", "animated", "naruto"] },
    { name: "Roronoa Zoro", wiki: "Roronoa Zoro", traits: ["anime", "male", "human", "sword", "pirate", "animated", "one-piece"] },
    { name: "Nami", wiki: "Nami (One Piece)", traits: ["anime", "female", "human", "pirate", "animated", "one-piece"] },
    { name: "Sanji", wiki: "Sanji (One Piece)", traits: ["anime", "male", "human", "pirate", "martial-arts", "animated", "one-piece"] },
    { name: "Tony Tony Chopper", wiki: "Tony Tony Chopper", traits: ["anime", "male", "animal", "powers", "pirate", "animated", "one-piece"] },
    { name: "Portgas D. Ace", wiki: "Portgas D. Ace", traits: ["anime", "male", "human", "powers", "pirate", "animated", "one-piece"] },
    { name: "Shanks", wiki: "Shanks (One Piece)", traits: ["anime", "male", "human", "powers", "pirate", "sword", "animated", "one-piece"] },
    { name: "Nezuko Kamado", wiki: "Nezuko Kamado", traits: ["anime", "female", "human", "powers", "sword", "animated", "demon-slayer"] },
    { name: "Zenitsu Agatsuma", wiki: "Zenitsu Agatsuma", traits: ["anime", "male", "human", "sword", "animated", "demon-slayer"] },
    { name: "Inosuke Hashibira", wiki: "Inosuke Hashibira", traits: ["anime", "male", "human", "animal", "sword", "mask", "animated", "demon-slayer"] },
    { name: "Kyojuro Rengoku", wiki: "Kyojuro Rengoku", traits: ["anime", "male", "human", "sword", "animated", "demon-slayer"] },
    { name: "Gojo Satoru", wiki: "Satoru Gojo", traits: ["anime", "male", "human", "powers", "glasses", "animated", "jujutsu-kaisen"] },
    { name: "Yuji Itadori", wiki: "Yuji Itadori", traits: ["anime", "male", "human", "powers", "martial-arts", "animated", "jujutsu-kaisen"] },
    { name: "Sukuna", wiki: "Ryomen Sukuna", traits: ["anime", "male", "villain", "powers", "animated", "jujutsu-kaisen"] },
    { name: "Eren Yeager", wiki: "Eren Yeager", traits: ["anime", "male", "human", "powers", "animated", "attack-on-titan"] },
    { name: "Mikasa Ackerman", wiki: "Mikasa Ackerman", traits: ["anime", "female", "human", "weapon", "animated", "attack-on-titan"] },
    { name: "Light Yagami", wiki: "Light Yagami", traits: ["anime", "male", "human", "villain", "glasses", "animated", "death-note"] },
    { name: "L (Death Note)", wiki: "L (character)", traits: ["anime", "male", "human", "glasses", "animated", "death-note"] },
    { name: "Sailor Moon", wiki: "Sailor Moon (character)", traits: ["anime", "female", "human", "powers", "animated", "sailor-moon"] },
    { name: "Izuku Midoriya", wiki: "Izuku Midoriya", traits: ["anime", "male", "human", "hero", "powers", "animated", "my-hero-academia"] },
    { name: "Ochaco Uraraka", wiki: "Ochaco Uraraka", traits: ["anime", "female", "human", "hero", "powers", "animated", "my-hero-academia"] },
    { name: "Ichigo Kurosaki", wiki: "Ichigo Kurosaki", traits: ["anime", "male", "human", "powers", "sword", "animated", "bleach"] },
    { name: "Anya Forger", wiki: "Anya Forger", traits: ["anime", "female", "human", "powers", "animated", "spy-x-family"] },
    { name: "Rem", wiki: "Rem (Re:Zero)", traits: ["anime", "female", "human", "powers", "animated", "re-zero"] },
    { name: "Asuka Langley Soryu", wiki: "Asuka Langley Soryu", traits: ["anime", "female", "human", "animated", "neon-genesis-evangelion"] },
    { name: "Totoro", wiki: "Totoro", traits: ["movie", "animal", "powers", "animated", "studio-ghibli"] },
    { name: "Kiki", wiki: "Kiki's Delivery Service", traits: ["movie", "female", "human", "wizard", "animated", "studio-ghibli"] },
    { name: "Ponyo", wiki: "Ponyo", traits: ["movie", "female", "animal", "powers", "underwater", "animated", "studio-ghibli"] },
    { name: "Doraemon", wiki: "Doraemon", traits: ["anime", "male", "animal", "robot", "blue", "animated"] },
    { name: "Inuyasha", wiki: "Inuyasha", traits: ["anime", "male", "animal", "powers", "sword", "animated"] },
    { name: "Donkey Kong", wiki: "Donkey Kong (character)", traits: ["game", "nintendo", "animal", "animated"] },
    { name: "Princess Peach", wiki: "Princess Peach", traits: ["game", "nintendo", "female", "human", "princess", "animated", "mario"] },
    { name: "Bowser", wiki: "Bowser (character)", traits: ["game", "nintendo", "male", "animal", "villain", "animated", "mario"] },
    { name: "Wario", wiki: "Wario", traits: ["game", "nintendo", "male", "human", "animated", "mario"] },
    { name: "Toad", wiki: "Toad (Nintendo)", traits: ["game", "nintendo", "male", "animated", "mario"] },
    { name: "Shadow the Hedgehog", wiki: "Shadow the Hedgehog", traits: ["game", "male", "animal", "powers", "animated", "sonic"] },
    { name: "Tails", wiki: "Miles Tails Prower", traits: ["game", "male", "animal", "animated", "sonic"] },
    { name: "Knuckles the Echidna", wiki: "Knuckles the Echidna", traits: ["game", "male", "animal", "powers", "animated", "sonic"] },
    { name: "Samus Aran", wiki: "Samus Aran", traits: ["game", "nintendo", "female", "human", "mask", "weapon", "space"] },
    { name: "Kirby", wiki: "Kirby (character)", traits: ["game", "nintendo", "animal", "pink", "powers", "animated"] },
    { name: "Ganondorf", wiki: "Ganondorf", traits: ["game", "nintendo", "male", "villain", "powers", "sword", "animated", "zelda"] },
    { name: "Solid Snake", wiki: "Solid Snake", traits: ["game", "male", "human", "mask", "weapon"] },
    { name: "Cloud Strife", wiki: "Cloud Strife", traits: ["game", "male", "human", "sword", "animated"] },
    { name: "Sephiroth", wiki: "Sephiroth (Final Fantasy)", traits: ["game", "male", "villain", "powers", "sword", "animated"] },
    { name: "Aloy", wiki: "Aloy", traits: ["game", "female", "human", "weapon"] },
    { name: "Geralt de Rivia", wiki: "Geralt of Rivia", traits: ["game", "male", "human", "powers", "sword", "wizard"] },
    { name: "Jill Valentine", wiki: "Jill Valentine", traits: ["game", "female", "human", "weapon", "horror"] },
    { name: "Leon S. Kennedy", wiki: "Leon S. Kennedy", traits: ["game", "male", "human", "weapon", "horror"] },
    { name: "Creeper", wiki: "Creeper (Minecraft)", traits: ["game", "animal", "villain", "green", "animated", "minecraft"] },
    { name: "Enderman", wiki: "Enderman", traits: ["game", "animal", "villain", "powers", "space", "minecraft"] },
    { name: "Lloyd", wiki: "Lloyd Garmadon", traits: ["tv", "male", "human", "powers", "ninja", "animated", "ninjago"] },
    { name: "Optimus Prime", wiki: "Optimus Prime", traits: ["movie", "male", "robot", "hero", "weapon", "space", "transformers"] },
    { name: "Bumblebee", wiki: "Bumblebee (Transformers)", traits: ["movie", "male", "robot", "hero", "yellow", "transformers"] },
    { name: "Buzz Lightyear", wiki: "Buzz Lightyear", traits: ["movie", "male", "human", "hero", "space", "animated", "toy-story", "disney"] },
    { name: "Woody", wiki: "Woody (Toy Story)", traits: ["movie", "male", "human", "hero", "animated", "toy-story", "disney"] },
    { name: "Rayo McQueen", wiki: "Lightning McQueen", traits: ["movie", "male", "vehicle", "red", "animated", "cars", "disney"] },
    { name: "Mickey Mouse", wiki: "Mickey Mouse", traits: ["tv", "male", "animal", "black", "animated", "disney"] },
    { name: "Donald Duck", wiki: "Donald Duck", traits: ["tv", "male", "animal", "animated", "disney"] },
    { name: "Minnie Mouse", wiki: "Minnie Mouse", traits: ["tv", "female", "animal", "animated", "disney"] },
    { name: "Rapunzel", wiki: "Rapunzel (Tangled)", traits: ["movie", "female", "human", "princess", "powers", "animated", "disney"] },
    { name: "Moana", wiki: "Moana (Disney character)", traits: ["movie", "female", "human", "hero", "animated", "disney"] },
    { name: "Mulan", wiki: "Mulan (Disney character)", traits: ["movie", "female", "human", "weapon", "animated", "disney"] },
    { name: "Simba", wiki: "Simba", traits: ["movie", "male", "animal", "king", "animated", "disney"] },
    { name: "Genio", wiki: "Genie (Aladdin)", traits: ["movie", "male", "powers", "blue", "animated", "disney"] },
    { name: "WALL-E", wiki: "WALL-E (character)", traits: ["movie", "robot", "male", "space", "animated", "pixar"] },
    { name: "Alegría", wiki: "Joy (Inside Out)", traits: ["movie", "female", "powers", "animated", "pixar"] },
    { name: "Gru", wiki: "Gru (Despicable Me)", traits: ["movie", "male", "human", "villain", "animated"] },
    { name: "Minion", wiki: "Minions (Despicable Me)", traits: ["movie", "animal", "yellow", "animated"] },
    { name: "Po", wiki: "Po (Kung Fu Panda)", traits: ["movie", "male", "animal", "martial-arts", "animated"] },
    { name: "Hipo", wiki: "Hiccup Horrendous Haddock III", traits: ["movie", "male", "human", "animated"] },
    { name: "Chimuelo", wiki: "Toothless (How to Train Your Dragon)", traits: ["movie", "animal", "black", "powers", "animated"] },
    { name: "Fiona", wiki: "Princess Fiona", traits: ["movie", "female", "animal", "princess", "animated"] },
    { name: "Burro", wiki: "Donkey (Shrek)", traits: ["movie", "male", "animal", "animated"] },
    { name: "Jack Sparrow", wiki: "Jack Sparrow", traits: ["movie", "male", "human", "pirate", "weapon"] },
    { name: "Indiana Jones", wiki: "Indiana Jones", traits: ["movie", "male", "human", "hero", "weapon"] },
    { name: "James Bond", wiki: "James Bond", traits: ["movie", "male", "human", "weapon"] },
    { name: "John Wick", wiki: "John Wick", traits: ["movie", "male", "human", "weapon"] },
    { name: "Rocky Balboa", wiki: "Rocky Balboa", traits: ["movie", "male", "human", "martial-arts"] },
    { name: "Terminator", wiki: "Terminator (character)", traits: ["movie", "male", "robot", "villain", "weapon"] },
    { name: "The Joker (DC)", wiki: "Joker (character)", traits: ["movie", "comic", "male", "human", "villain", "dc"] },
    { name: "Harley Quinn", wiki: "Harley Quinn", traits: ["comic", "female", "human", "villain", "weapon", "dc"] },
    { name: "Flash", wiki: "Flash (DC Comics character)", traits: ["comic", "male", "human", "hero", "powers", "dc"] },
    { name: "Aquaman", wiki: "Aquaman", traits: ["comic", "male", "human", "hero", "powers", "underwater", "dc"] },
    { name: "Green Lantern", wiki: "Green Lantern", traits: ["comic", "male", "human", "hero", "powers", "space", "dc"] },
    { name: "Thor", wiki: "Thor (Marvel Comics)", traits: ["comic", "male", "hero", "powers", "weapon", "marvel"] },
    { name: "Hulk", wiki: "Hulk", traits: ["comic", "male", "hero", "powers", "green", "marvel"] },
    { name: "Black Widow", wiki: "Black Widow (Natasha Romanova)", traits: ["comic", "female", "human", "hero", "weapon", "marvel"] },
    { name: "Black Panther", wiki: "Black Panther (character)", traits: ["comic", "male", "human", "hero", "mask", "marvel"] },
    { name: "Loki", wiki: "Loki (Marvel Comics)", traits: ["comic", "male", "villain", "powers", "wizard", "marvel"] },
    { name: "Thanos", wiki: "Thanos", traits: ["comic", "male", "villain", "alien", "powers", "space", "marvel"] },
    { name: "Wolverine", wiki: "Wolverine (character)", traits: ["comic", "male", "hero", "powers", "claws", "marvel"] },
    { name: "Doctor Strange", wiki: "Doctor Strange", traits: ["comic", "male", "human", "hero", "wizard", "powers", "marvel"] },
    { name: "Scarlet Witch", wiki: "Scarlet Witch", traits: ["comic", "female", "hero", "wizard", "powers", "marvel"] },
    { name: "Jinx", wiki: "Jinx (League of Legends)", traits: ["game", "female", "human", "weapon", "animated"] },
    { name: "Eleven", wiki: "Eleven (Stranger Things)", traits: ["tv", "female", "human", "powers"] },
    { name: "Dustin Henderson", wiki: "Dustin Henderson", traits: ["tv", "male", "human"] },
    { name: "Walter White", wiki: "Walter White (Breaking Bad)", traits: ["tv", "male", "human", "villain", "glasses"] },
    { name: "Jesse Pinkman", wiki: "Jesse Pinkman", traits: ["tv", "male", "human"] },
    { name: "Daenerys Targaryen", wiki: "Daenerys Targaryen", traits: ["tv", "female", "human", "queen", "powers"] },
    { name: "Jon Snow", wiki: "Jon Snow (character)", traits: ["tv", "male", "human", "sword"] },
    { name: "Arya Stark", wiki: "Arya Stark", traits: ["tv", "female", "human", "sword"] },
    { name: "Sherlock Holmes", wiki: "Sherlock Holmes", traits: ["tv", "male", "human", "detective"] },
    { name: "Dr. House", wiki: "Gregory House", traits: ["tv", "male", "human"] },
    { name: "Ted Lasso", wiki: "Ted Lasso", traits: ["tv", "male", "human"] },
    { name: "Morty Smith", wiki: "Morty Smith", traits: ["tv", "male", "human", "space", "animated"] },
    { name: "Stewie Griffin", wiki: "Stewie Griffin", traits: ["tv", "male", "human", "animated"] },
    { name: "Peter Griffin", wiki: "Peter Griffin", traits: ["tv", "male", "human", "animated"] },
    { name: "Bart Simpson", wiki: "Bart Simpson", traits: ["tv", "male", "human", "animated"] },
    { name: "Lisa Simpson", wiki: "Lisa Simpson", traits: ["tv", "female", "human", "animated"] },
    { name: "Marge Simpson", wiki: "Marge Simpson", traits: ["tv", "female", "human", "animated"] },
    { name: "Tom", wiki: "Tom Cat", traits: ["tv", "male", "animal", "animated"] },
    { name: "Jerry", wiki: "Jerry Mouse", traits: ["tv", "male", "animal", "animated"] },
    { name: "Pato Lucas", wiki: "Daffy Duck", traits: ["tv", "male", "animal", "animated"] },
    { name: "Bugs Bunny", wiki: "Bugs Bunny", traits: ["tv", "male", "animal", "animated"] },
    { name: "Peppa Pig", wiki: "Peppa Pig", traits: ["tv", "female", "animal", "animated"] },
    { name: "Bluey", wiki: "Bluey (2018 TV series)", traits: ["tv", "female", "animal", "blue", "animated"] },
    { name: "Aang", wiki: "Aang", traits: ["tv", "male", "human", "powers", "animated", "avatar"] },
    { name: "Zuko", wiki: "Zuko", traits: ["tv", "male", "human", "powers", "animated", "avatar"] },
    { name: "Katara", wiki: "Katara", traits: ["tv", "female", "human", "powers", "animated", "avatar"] },
    { name: "Darth Maul", wiki: "Darth Maul", traits: ["movie", "male", "villain", "powers", "sword", "space", "star-wars"] },
    { name: "Yoda", wiki: "Yoda", traits: ["movie", "male", "alien", "powers", "wizard", "space", "star-wars"] },
    { name: "Grogu", wiki: "Grogu", traits: ["tv", "male", "alien", "powers", "space", "star-wars"] },
    { name: "Obi-Wan Kenobi", wiki: "Obi-Wan Kenobi", traits: ["movie", "male", "human", "hero", "powers", "sword", "space", "star-wars"] },
    { name: "Leia Organa", wiki: "Leia Organa", traits: ["movie", "female", "human", "hero", "weapon", "space", "star-wars"] },
    { name: "Luke Skywalker", wiki: "Luke Skywalker", traits: ["movie", "male", "human", "hero", "powers", "sword", "space", "star-wars"] },
    { name: "Hermione Granger", wiki: "Hermione Granger", traits: ["movie", "female", "human", "wizard", "powers", "glasses", "harry-potter"] },
    { name: "Ron Weasley", wiki: "Ron Weasley", traits: ["movie", "male", "human", "wizard", "powers", "harry-potter"] },
    { name: "Lord Voldemort", wiki: "Lord Voldemort", traits: ["movie", "male", "human", "villain", "wizard", "powers", "harry-potter"] },
    { name: "Dobby", wiki: "Dobby (Harry Potter)", traits: ["movie", "male", "animal", "wizard", "powers", "harry-potter"] },
    { name: "Katniss Everdeen", wiki: "Katniss Everdeen", traits: ["movie", "female", "human", "hero", "weapon"] },
    { name: "Pennywise", wiki: "Pennywise", traits: ["movie", "villain", "powers", "horror"] },
    { name: "Chucky", wiki: "Chucky (Child's Play)", traits: ["movie", "male", "villain", "toy", "horror"] },
    { name: "Jason Voorhees", wiki: "Jason Voorhees", traits: ["movie", "male", "villain", "mask", "weapon", "horror"] },
    { name: "Freddy Krueger", wiki: "Freddy Krueger", traits: ["movie", "male", "villain", "powers", "weapon", "horror"] },
    { name: "Godzilla", wiki: "Godzilla", traits: ["movie", "animal", "powers", "underwater"] },
    { name: "King Kong", wiki: "King Kong", traits: ["movie", "animal", "powers"] },
    { name: "Barbie", wiki: "Barbie", traits: ["movie", "female", "human", "toy"] },
    { name: "Ken", wiki: "Ken (doll)", traits: ["movie", "male", "human", "toy"] },
    { name: "Mr. Bean", wiki: "Mr. Bean", traits: ["tv", "male", "human"] },
    { name: "Among Us Crewmate", wiki: "Among Us", traits: ["game", "alien", "animated"] }
];
const AKINATOR_CHARACTERS = [
    ...AKINATOR_BASE_CHARACTERS.map(character => ({
        ...character,
        dataCategory: character.traits.includes("game") ? "game" : "fiction",
        category: character.traits.includes("game")
            ? AKINATOR_CATEGORY_NAMES.game
            : "personaje ficticio",
        traits: [
            ...character.traits,
            "kind-fiction",
            ...(character.traits.includes("game") ? ["kind-game"] : [])
        ]
    })),
    ...AKINATOR_ADDITIONAL_CHARACTERS.map(character => ({
        ...character,
        dataCategory: character.category,
        category: AKINATOR_CATEGORY_NAMES[character.category]
    }))
].reduce((characters, character) => {
    const existingCharacter = characters.find(
        existing => existing.name.toLocaleLowerCase("es")
            === character.name.toLocaleLowerCase("es")
    );

    if (existingCharacter) {
        existingCharacter.traits = [
            ...new Set([...existingCharacter.traits, ...character.traits])
        ];
        existingCharacter.category = character.category;
        existingCharacter.dataCategory = character.dataCategory;
        existingCharacter.wiki = character.wiki;
    } else {
        characters.push(character);
    }

    return characters;
}, []);
const AKINATOR_QUESTIONS = [
    { trait: "anime", text: "¿Tu personaje viene del anime o manga?" },
    { trait: "game", text: "¿Tu personaje aparece principalmente en videojuegos?" },
    { trait: "nintendo", text: "¿Está relacionado con Nintendo?" },
    { trait: "comic", text: "¿Tu personaje viene de un cómic?" },
    { trait: "hero", text: "¿Es considerado un héroe o superhéroe?" },
    { trait: "villain", text: "¿Es un villano?" },
    { trait: "movie", text: "¿Aparece en una película?" },
    { trait: "tv", text: "¿Aparece en una serie de televisión?" },
    { trait: "male", text: "¿Es hombre?" },
    { trait: "female", text: "¿Es mujer?" },
    { trait: "human", text: "¿Es humano?" },
    { trait: "animal", text: "¿Es un animal o criatura?" },
    { trait: "alien", text: "¿Es extraterrestre?" },
    { trait: "powers", text: "¿Tiene poderes o habilidades sobrenaturales?" },
    { trait: "mask", text: "¿Suele llevar máscara o casco?" },
    { trait: "weapon", text: "¿Usa armas?" },
    { trait: "wizard", text: "¿Es mago o usa magia?" },
    { trait: "sword", text: "¿Usa una espada?" },
    { trait: "yellow", text: "¿Es de color amarillo?" },
    { trait: "blue", text: "¿Es de color azul?" },
    { trait: "space", text: "¿Sus historias ocurren en el espacio?" },
    { trait: "underwater", text: "¿Vive bajo el agua?" },
    { trait: "pirate", text: "¿Es pirata?" },
    { trait: "ninja", text: "¿Es ninja?" },
    { trait: "plumber", text: "¿Es plomero?" },
    { trait: "glasses", text: "¿Usa gafas?" },
    { trait: "horror", text: "¿Viene de un juego o historia de terror?" },
    { trait: "animated", text: "¿Es un personaje animado?" },
    { trait: "martial-arts", text: "¿Es experto en artes marciales?" },
    { trait: "robot", text: "¿Es un robot o una máquina con personalidad?" },
    { trait: "vehicle", text: "¿Es un vehículo con personalidad propia?" },
    { trait: "princess", text: "¿Es una princesa?" },
    { trait: "king", text: "¿Es un rey?" },
    { trait: "queen", text: "¿Es una reina?" },
    { trait: "detective", text: "¿Es detective o investigador?" },
    { trait: "toy", text: "¿Es un juguete o muñeco?" },
    { trait: "pink", text: "¿Su color más característico es el rosa?" },
    { trait: "green", text: "¿Su color más característico es el verde?" },
    { trait: "red", text: "¿Su color más característico es el rojo?" },
    { trait: "black", text: "¿Su color más característico es el negro?" },
    { trait: "claws", text: "¿Tiene garras como arma o característica?" },
    { trait: "marvel", text: "¿Pertenece al universo Marvel?" },
    { trait: "dc", text: "¿Pertenece al universo DC?" },
    { trait: "disney", text: "¿Aparece en una película o serie de Disney?" },
    { trait: "pixar", text: "¿Aparece en una película de Pixar?" },
    { trait: "toy-story", text: "¿Es de Toy Story?" },
    { trait: "cars", text: "¿Es del universo de Cars?" },
    { trait: "transformers", text: "¿Es un Transformer?" },
    { trait: "minecraft", text: "¿Es del universo de Minecraft?" },
    { trait: "mario", text: "¿Es del universo de Mario?" },
    { trait: "sonic", text: "¿Es del universo de Sonic?" },
    { trait: "zelda", text: "¿Es del universo de The Legend of Zelda?" },
    { trait: "pokemon", text: "¿Es del universo de Pokémon?" },
    { trait: "dragon-ball", text: "¿Es del universo de Dragon Ball?" },
    { trait: "naruto", text: "¿Es del universo de Naruto?" },
    { trait: "one-piece", text: "¿Es del universo de One Piece?" },
    { trait: "demon-slayer", text: "¿Es del universo de Demon Slayer?" },
    { trait: "jujutsu-kaisen", text: "¿Es del universo de Jujutsu Kaisen?" },
    { trait: "attack-on-titan", text: "¿Es del universo de Attack on Titan?" },
    { trait: "death-note", text: "¿Es del universo de Death Note?" },
    { trait: "sailor-moon", text: "¿Es del universo de Sailor Moon?" },
    { trait: "my-hero-academia", text: "¿Es del universo de My Hero Academia?" },
    { trait: "bleach", text: "¿Es del universo de Bleach?" },
    { trait: "spy-x-family", text: "¿Es del universo de Spy × Family?" },
    { trait: "re-zero", text: "¿Es del universo de Re:Zero?" },
    { trait: "neon-genesis-evangelion", text: "¿Es del universo de Evangelion?" },
    { trait: "studio-ghibli", text: "¿Aparece en una película de Studio Ghibli?" },
    { trait: "ninjago", text: "¿Es del universo de Ninjago?" },
    { trait: "avatar", text: "¿Es del universo de Avatar: La leyenda de Aang?" },
    { trait: "star-wars", text: "¿Es del universo de Star Wars?" },
    { trait: "harry-potter", text: "¿Es del universo de Harry Potter?" },
    ...AKINATOR_ADDITIONAL_QUESTIONS
];

const WIKIDATA_PROPERTIES_BY_CATEGORY = {
    sport: ["P19", "P20", "P27", "P39", "P69", "P101", "P102", "P106", "P166", "P569", "P570", "P800", "P937", "P1412"],
    actor: ["P19", "P20", "P27", "P39", "P69", "P101", "P102", "P106", "P166", "P569", "P570", "P800", "P937", "P1412"],
    philosopher: ["P19", "P20", "P27", "P39", "P69", "P101", "P102", "P106", "P166", "P569", "P570", "P800", "P937", "P1412"],
    ruler: ["P19", "P20", "P27", "P39", "P69", "P101", "P102", "P106", "P166", "P569", "P570", "P800", "P937", "P1412"],
    scientist: ["P19", "P20", "P27", "P39", "P69", "P101", "P102", "P106", "P166", "P569", "P570", "P800", "P937", "P1412"],
    youtuber: ["P19", "P20", "P27", "P39", "P69", "P101", "P102", "P106", "P166", "P569", "P570", "P800", "P937", "P1412"],
    city: ["P17", "P36", "P131", "P571"],
    food: ["P495", "P279", "P186", "P2576"],
    film: ["P495", "P136", "P57", "P58", "P86", "P161", "P179", "P364", "P840"],
    fiction: ["P19", "P39", "P106", "P1080", "P1441", "P166", "P170"],
    game: ["P19", "P39", "P106", "P1080", "P1441", "P166", "P170"]
};
const WIKIDATA_PROPERTY_QUESTIONS = {
    P17: ["¿Se encuentra en {value}?", "¿Está situada en {value}?", "¿Pertenece al país de {value}?"],
    P19: ["¿Nació en {value}?", "¿Su lugar de nacimiento fue {value}?", "¿Sus orígenes están en {value}?"],
    P20: ["¿Murió en {value}?", "¿El lugar de su fallecimiento fue {value}?"],
    P27: ["¿Tiene ciudadanía de {value}?", "¿Es ciudadano/a de {value}?", "¿Se le asocia con {value} por su nacionalidad?"],
    P36: ["¿Es la capital de {value}?", "¿Es sede de gobierno de {value}?"],
    P39: ["¿Ocupó el cargo de {value}?", "¿Tuvo un puesto oficial como {value}?", "¿Desempeñó la función de {value}?"],
    P57: ["¿La dirigió {value}?", "¿Su director o directora fue {value}?"],
    P58: ["¿El guion fue escrito por {value}?", "¿Participó {value} como guionista?"],
    P69: ["¿Estudió en {value}?", "¿Asistió a {value}?", "¿Se formó en {value}?"],
    P86: ["¿Su música estuvo a cargo de {value}?", "¿La banda sonora fue compuesta por {value}?"],
    P101: ["¿Su campo principal es {value}?", "¿Se especializó en {value}?", "¿Trabajó principalmente en {value}?"],
    P102: ["¿Estuvo afiliado/a al partido {value}?", "¿Formó parte de {value}?"],
    P106: ["¿Se le conoce por su ocupación como {value}?", "¿Su profesión es {value}?", "¿Trabajó como {value}?"],
    P1080: ["¿Pertenece al universo de ficción {value}?", "¿Su historia forma parte de {value}?", "¿Fue creado/a para el mundo de {value}?"],
    P131: ["¿Pertenece administrativamente a {value}?", "¿Está dentro de {value}?", "¿Forma parte del territorio de {value}?"],
    P136: ["¿Su género es {value}?", "¿Se clasifica dentro del género {value}?", "¿Pertenece al género cinematográfico {value}?"],
    P1441: ["¿Aparece en la obra {value}?", "¿Forma parte de {value}?", "¿Se presenta en {value}?"],
    P161: ["¿Participa {value} en su reparto?", "¿Actúa {value} en esta película?", "¿Comparte elenco con {value}?"],
    P166: ["¿Recibió el reconocimiento {value}?", "¿Ganó o recibió {value}?", "¿Fue premiado/a con {value}?"],
    P170: ["¿Fue creado/a por {value}?", "¿Su creador/a es {value}?", "¿La idea original pertenece a {value}?"],
    P179: ["¿Forma parte de la saga {value}?", "¿Pertenece a la serie de películas {value}?"],
    P186: ["¿Se elabora con {value}?", "¿Uno de sus ingredientes o materiales es {value}?", "¿Contiene {value}?"],
    P2576: ["¿Pertenece a la cocina {value}?", "¿Es típico/a de la gastronomía {value}?"],
    P279: ["¿Es un tipo de {value}?", "¿Pertenece al grupo de {value}?", "¿Se clasifica como {value}?"],
    P364: ["¿Su idioma original es {value}?", "¿Se filmó originalmente en {value}?"],
    P495: ["¿Se originó en {value}?", "¿Su país de origen es {value}?", "¿Nació como obra o producto de {value}?"],
    P569: ["¿Nació en el año {value}?", "¿Su nacimiento fue en {value}?"],
    P570: ["¿Murió en el año {value}?", "¿Su fallecimiento fue en {value}?"],
    P571: ["¿Se fundó o estableció en {value}?", "¿Su origen se remonta a {value}?"],
    P800: ["¿Se le reconoce por la obra {value}?", "¿Es conocido/a por {value}?", "¿Su trabajo destacado incluye {value}?"],
    P840: ["¿La historia ocurre en {value}?", "¿Su escenario principal es {value}?"],
    P937: ["¿Trabajó en {value}?", "¿Desarrolló allí parte de su carrera?", "¿Ejerció su profesión en {value}?"],
    P1412: ["¿Hablaba o utilizaba {value}?", "¿Se comunicaba en {value}?", "¿Conocía el idioma {value}?"]
};
const WIKIDATA_FACT_CACHE = new Map();
const WIKIDATA_FACT_CACHE_TTL = 24 * 60 * 60 * 1000;
const WIKIDATA_FACT_QUERY_LIMIT = 2400;

function normalizeAkinatorName(name) {

    return name.toLocaleLowerCase("es").trim();
}

function formatAkinatorWikidataValue(propertyId, rawValue) {

    if (typeof rawValue !== "string") return null;

    const value = rawValue.trim();
    if (!value) return null;

    if (["P569", "P570", "P571"].includes(propertyId)) {
        const dateMatch = value.match(/^([+-])(\d{1,6})-/);
        if (dateMatch) {
            const year = Number(dateMatch[2]);
            return dateMatch[1] === "-"
                ? `${year} a. C.`
                : `${year}`;
        }
    }

    return value.length <= 100 ? value : null;
}

async function loadAkinatorWikidataFacts(characters) {

    const now = Date.now();
    const uncachedCharacters = characters.filter(character => {
        const cached = WIKIDATA_FACT_CACHE.get(normalizeAkinatorName(character.name));
        return !cached || now - cached.cachedAt >= WIKIDATA_FACT_CACHE_TTL;
    });

    const batches = [];
    for (let index = 0; index < uncachedCharacters.length; index += 80) {
        batches.push(uncachedCharacters.slice(index, index + 80));
    }

    let nextBatchIndex = 0;
    const workers = Array.from(
        { length: Math.min(2, batches.length) },
        async () => {
            while (nextBatchIndex < batches.length) {
                const batch = batches[nextBatchIndex++];
                const propertyIds = [...new Set(batch.flatMap(character =>
                    WIKIDATA_PROPERTIES_BY_CATEGORY[character.dataCategory] || []
                ))];

                if (propertyIds.length === 0) continue;

                const names = [...new Set(batch.map(character => character.name))];
                const nameValues = names.flatMap(name =>
                    ["en", "es"].map(language =>
                        `${JSON.stringify(name)}@${language}`
                    )
                ).join(" ");
                const query = `
                    SELECT ?name ?property ?value ?valueLabel WHERE {
                        VALUES ?name { ${nameValues} }
                        ?item rdfs:label ?name .
                        FILTER(LANG(?name) = "en" || LANG(?name) = "es")
                        VALUES ?property { ${propertyIds.map(id => `wdt:${id}`).join(" ")} }
                        ?item ?property ?value .
                        SERVICE wikibase:label {
                            bd:serviceParam wikibase:language "es,en".
                        }
                    }
                    LIMIT ${WIKIDATA_FACT_QUERY_LIMIT}
                `;
                const response = await fetch(
                    "https://query.wikidata.org/sparql",
                    {
                        method: "POST",
                        headers: {
                            Accept: "application/sparql-results+json",
                            "Content-Type": "application/x-www-form-urlencoded",
                            "User-Agent": "SoymrDiscordBot/1.0 (Akinator)"
                        },
                        body: new URLSearchParams({ query }).toString(),
                        signal: AbortSignal.timeout(10000)
                    }
                );

                if (!response.ok) {
                    throw new Error(`Wikidata respondió con HTTP ${response.status}.`);
                }

                const result = await response.json();
                const factsByName = new Map();
                const countsByName = new Map();
                const matchedNames = new Set();

                for (const binding of result.results.bindings) {
                    const name = normalizeAkinatorName(binding.name.value);
                    matchedNames.add(name);
                    const propertyMatch = binding.property.value.match(/P\d+$/);
                    const value = formatAkinatorWikidataValue(
                        propertyMatch?.[0],
                        binding.valueLabel?.value || binding.value?.value
                    );

                    if (!propertyMatch || !value) continue;

                    if (!factsByName.has(name)) factsByName.set(name, []);
                    const facts = factsByName.get(name);
                    const propertyId = propertyMatch[0];
                    const propertyCountKey = `${name}:${propertyId}`;
                    const propertyCount = countsByName.get(propertyCountKey) || 0;

                    if (
                        propertyCount >= 6
                        || facts.some(fact =>
                            fact.propertyId === propertyId
                            && fact.value.toLocaleLowerCase("es")
                                === value.toLocaleLowerCase("es")
                        )
                    ) continue;

                    facts.push({ propertyId, value });
                    countsByName.set(propertyCountKey, propertyCount + 1);
                }

                for (const character of batch) {
                    const name = normalizeAkinatorName(character.name);
                    const completeProperties = result.results.bindings.length
                        < WIKIDATA_FACT_QUERY_LIMIT
                        && matchedNames.has(name)
                        ? (WIKIDATA_PROPERTIES_BY_CATEGORY[character.dataCategory] || [])
                            .filter(propertyId =>
                                (countsByName.get(`${name}:${propertyId}`) || 0) < 6
                            )
                        : [];

                    WIKIDATA_FACT_CACHE.set(name, {
                        cachedAt: now,
                        facts: factsByName.get(name) || [],
                        completeProperties
                    });
                }
            }
        }
    );

    await Promise.all(workers);

    const questionsByTrait = new Map();

    for (const character of characters) {
        const cached = WIKIDATA_FACT_CACHE.get(normalizeAkinatorName(character.name));
        character.knownFactProperties = new Set(
            cached?.completeProperties || []
        );

        for (const fact of cached?.facts || []) {
            const trait = `wd:${fact.propertyId}:${fact.value.toLocaleLowerCase("es")}`;
            character.traits.push(trait);

            if (questionsByTrait.has(trait)) continue;

            const templates = WIKIDATA_PROPERTY_QUESTIONS[fact.propertyId];
            if (!templates) continue;

            questionsByTrait.set(trait, {
                trait,
                factProperty: fact.propertyId,
                text: pickRandomMessage(templates).replace("{value}", fact.value)
            });
        }
    }

    return [...questionsByTrait.values()];
}

function loadEconomyData() {

    if (!fs.existsSync(ECONOMY_FILE)) return {};

    const data = JSON.parse(fs.readFileSync(ECONOMY_FILE, "utf8"));

    if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new Error("El archivo de economía no contiene un objeto válido.");
    }

    return data;
}

let economyData = loadEconomyData();

function saveEconomyData() {

    const temporaryFile = `${ECONOMY_FILE}.tmp`;
    fs.writeFileSync(temporaryFile, JSON.stringify(economyData, null, 2), "utf8");
    fs.renameSync(temporaryFile, ECONOMY_FILE);
}

function getEconomyAccount(guildId, userId) {

    if (!economyData[guildId] || typeof economyData[guildId] !== "object") {
        economyData[guildId] = {};
    }

    if (!economyData[guildId][userId]) {
        economyData[guildId][userId] = {
            balance: STARTING_BALANCE,
            lastWorkAt: 0,
            lastStealAt: 0,
            lastMysteryRewardAt: 0,
            inventory: {
                workKitUses: 0,
                crystalPasses: 0,
                materials: {},
                ores: {},
                pickaxe: null,
                pickaxeUses: 0
            }
        };
        saveEconomyData();
    }

    const account = economyData[guildId][userId];
    if (!account.inventory || typeof account.inventory !== "object") account.inventory = {};
    if (!Number.isSafeInteger(account.inventory.workKitUses) || account.inventory.workKitUses < 0) {
        account.inventory.workKitUses = 0;
    }
    if (!Number.isFinite(account.lastMysteryRewardAt) || account.lastMysteryRewardAt < 0) {
        account.lastMysteryRewardAt = 0;
    }
    if (!Number.isSafeInteger(account.inventory.crystalPasses) || account.inventory.crystalPasses < 0) {
        account.inventory.crystalPasses = 0;
    }
    if (!account.inventory.materials || typeof account.inventory.materials !== "object") {
        account.inventory.materials = {};
    }
    for (const material of MINING_MATERIALS) {
        if (!Number.isSafeInteger(account.inventory.materials[material]) || account.inventory.materials[material] < 0) {
            account.inventory.materials[material] = 0;
        }
    }
    if (!account.inventory.ores || typeof account.inventory.ores !== "object") {
        account.inventory.ores = {};
    }
    for (const ore of Object.keys(MINING_ORES)) {
        if (!Number.isSafeInteger(account.inventory.ores[ore]) || account.inventory.ores[ore] < 0) {
            account.inventory.ores[ore] = 0;
        }
    }
    if (!Object.prototype.hasOwnProperty.call(PICKAXES, account.inventory.pickaxe)) {
        account.inventory.pickaxe = null;
        account.inventory.pickaxeUses = 0;
    }
    if (!Number.isSafeInteger(account.inventory.pickaxeUses) || account.inventory.pickaxeUses < 0) {
        account.inventory.pickaxeUses = 0;
    }

    return account;
}

function loadGuildSettings() {

    if (!fs.existsSync(GUILD_SETTINGS_FILE)) return {};

    const data = JSON.parse(fs.readFileSync(GUILD_SETTINGS_FILE, "utf8"));

    if (
        !data
        || typeof data !== "object"
        || Array.isArray(data)
        || Object.entries(data).some(([guildId, settings]) =>
            !/^\d+$/.test(guildId)
            || !settings
            || typeof settings !== "object"
            || (settings.gifRepliesEnabled !== undefined && typeof settings.gifRepliesEnabled !== "boolean")
            || typeof settings.chatStatsEnabled !== "boolean"
            || (settings.automodEnabled !== undefined && typeof settings.automodEnabled !== "boolean")
            || !settings.users
            || typeof settings.users !== "object"
            || Array.isArray(settings.users)
            || (settings.counter !== undefined && (
                !settings.counter
                || typeof settings.counter !== "object"
                || Array.isArray(settings.counter)
                || !(settings.counter.channelId === null || /^\d+$/.test(settings.counter.channelId))
                || !Number.isSafeInteger(settings.counter.value)
                || settings.counter.value < 0
            ))
            || Object.entries(settings.users).some(([userId, stats]) =>
                !/^\d+$/.test(userId)
                || !stats
                || !Number.isSafeInteger(stats.messages)
                || stats.messages < 0
                || !Number.isSafeInteger(stats.xp)
                || stats.xp < 0
                || !Number.isFinite(stats.lastXpAt)
            )
        )
    ) {
        throw new Error("El archivo de configuración de servidores no contiene datos válidos.");
    }

    return data;
}

let guildSettings = loadGuildSettings();
let guildSettingsSaveTimer = null;
const automodMessageTimestamps = new Map();
const automodLastWarningAt = new Map();

function persistGuildSettings() {

    const temporaryFile = `${GUILD_SETTINGS_FILE}.tmp`;
    fs.writeFileSync(temporaryFile, JSON.stringify(guildSettings, null, 2), "utf8");
    fs.renameSync(temporaryFile, GUILD_SETTINGS_FILE);
}

function saveGuildSettings() {

    if (guildSettingsSaveTimer) {
        clearTimeout(guildSettingsSaveTimer);
        guildSettingsSaveTimer = null;
    }

    persistGuildSettings();
}

function scheduleGuildSettingsSave() {

    if (guildSettingsSaveTimer) return;

    guildSettingsSaveTimer = setTimeout(() => {
        guildSettingsSaveTimer = null;

        try {
            persistGuildSettings();
        } catch (error) {
            console.error("No pude guardar las estadísticas del chat:", error);
        }
    }, 5000);
    guildSettingsSaveTimer.unref();
}

function getGuildSettings(guildId) {

    if (!guildSettings[guildId]) {
        guildSettings[guildId] = {
            chatStatsEnabled: false,
            automodEnabled: false,
            users: {},
            counter: {
                channelId: null,
                value: 0
            }
        };
    }

    if (!guildSettings[guildId].counter) {
        guildSettings[guildId].counter = {
            channelId: null,
            value: 0
        };
    }

    if (typeof guildSettings[guildId].automodEnabled !== "boolean") {
        guildSettings[guildId].automodEnabled = false;
    }

    return guildSettings[guildId];
}

function recordChatMessage(message) {

    const settings = getGuildSettings(message.guild.id);
    if (!settings.chatStatsEnabled) return;

    const stats = settings.users[message.author.id] || {
        messages: 0,
        xp: 0,
        lastXpAt: 0
    };
    const previousLevel = getChatLevel(stats.xp);
    stats.messages++;

    const now = Date.now();
    if (now - stats.lastXpAt >= CHAT_XP_COOLDOWN) {
        stats.xp += Math.floor(Math.random() * 11) + 15;
        stats.lastXpAt = now;
    }

    settings.users[message.author.id] = stats;

    const newLevel = getChatLevel(stats.xp);
    if (newLevel > previousLevel) {
        void message.channel.send(
            `🎉 ¡${message.author} subió al **nivel ${newLevel}** en este servidor!`
        ).catch(error => {
            console.error("No pude anunciar la subida de nivel:", error);
        });
    }

    scheduleGuildSettingsSave();
}

function getChatLevel(xp) {

    return Math.floor(Math.sqrt(xp / 100));
}

function getChatLevelProgress(xp) {

    const level = getChatLevel(xp);
    const currentLevelXp = level ** 2 * 100;
    const nextLevelXp = (level + 1) ** 2 * 100;

    return {
        level,
        current: xp - currentLevelXp,
        required: nextLevelXp - currentLevelXp
    };
}

function createChatLeaderboardEmbed(guild, rankingType) {

    const settings = getGuildSettings(guild.id);
    const entries = Object.entries(settings.users)
        .sort(([, first], [, second]) => rankingType === "messages"
            ? second.messages - first.messages || second.xp - first.xp
            : second.xp - first.xp || second.messages - first.messages
        )
        .slice(0, 10);
    const description = entries.length
        ? entries.map(([userId, stats], index) => {
            const level = getChatLevel(stats.xp);
            const score = rankingType === "messages"
                ? `**${stats.messages.toLocaleString("es-MX")}** mensajes · nivel ${level}`
                : `nivel **${level}** · ${stats.xp.toLocaleString("es-MX")} XP`;

            return `**${index + 1}.** <@${userId}> — ${score}`;
        }).join("\n")
        : "Aún no hay mensajes registrados en este servidor.";

    return new EmbedBuilder()
        .setColor(0x2f9e8f)
        .setTitle(rankingType === "messages" ? `💬 Top de chat · ${guild.name}` : `🏆 Top de niveles · ${guild.name}`)
        .setDescription(description)
        .setFooter({ text: "Cada servidor tiene sus propias estadísticas." });
}

function loadConnectedChannels() {

    if (!fs.existsSync(CONNECTED_CHANNELS_FILE)) return {};

    const data = JSON.parse(fs.readFileSync(CONNECTED_CHANNELS_FILE, "utf8"));

    if (
        !data
        || typeof data !== "object"
        || Array.isArray(data)
        || Object.entries(data).some(([guildId, channelId]) =>
            !/^\d+$/.test(guildId) || typeof channelId !== "string" || !/^\d+$/.test(channelId)
        )
    ) {
        throw new Error("El archivo de canales conectados no contiene datos válidos.");
    }

    return data;
}

let connectedChannels = loadConnectedChannels();

function saveConnectedChannels() {

    const temporaryFile = `${CONNECTED_CHANNELS_FILE}.tmp`;
    fs.writeFileSync(temporaryFile, JSON.stringify(connectedChannels, null, 2), "utf8");
    fs.renameSync(temporaryFile, CONNECTED_CHANNELS_FILE);
}

function loadRoleAssignments() {

    if (!fs.existsSync(ROLE_ASSIGNMENTS_FILE)) return [];

    const data = JSON.parse(fs.readFileSync(ROLE_ASSIGNMENTS_FILE, "utf8"));

    if (
        !Array.isArray(data)
        || data.some(assignment =>
            !assignment
            || typeof assignment !== "object"
            || typeof assignment.guildId !== "string"
            || typeof assignment.userId !== "string"
            || typeof assignment.roleId !== "string"
            || !Number.isFinite(assignment.expiresAt)
        )
    ) {
        throw new Error("El archivo de roles temporales no contiene datos válidos.");
    }

    return data;
}

function saveRoleAssignments() {

    const temporaryFile = `${ROLE_ASSIGNMENTS_FILE}.tmp`;
    fs.writeFileSync(temporaryFile, JSON.stringify(roleAssignments, null, 2), "utf8");
    fs.renameSync(temporaryFile, ROLE_ASSIGNMENTS_FILE);
}

let roleAssignments = loadRoleAssignments();
const roleExpirationTimers = new Map();

function getRoleAssignmentKey(assignment) {

    return `${assignment.guildId}:${assignment.userId}:${assignment.roleId}`;
}

function scheduleRoleExpiration(assignment) {

    const key = getRoleAssignmentKey(assignment);
    const previousTimer = roleExpirationTimers.get(key);

    if (previousTimer) clearTimeout(previousTimer);

    const remaining = assignment.expiresAt - Date.now();
    const timer = setTimeout(async () => {

        if (Date.now() < assignment.expiresAt) {
            scheduleRoleExpiration(assignment);
            return;
        }

        try {
            const guild = await client.guilds.fetch(assignment.guildId);
            const member = await guild.members.fetch(assignment.userId);
            const role = await guild.roles.fetch(assignment.roleId);

            if (role && member.roles.cache.has(role.id)) {
                await member.roles.remove(role, "Terminó la duración del rol temporal");
            }

            roleAssignments = roleAssignments.filter(
                savedAssignment => getRoleAssignmentKey(savedAssignment) !== key
            );
            saveRoleAssignments();
            roleExpirationTimers.delete(key);
        } catch (error) {
            if ([10004, 10007, 10011].includes(error.code)) {
                roleAssignments = roleAssignments.filter(
                    savedAssignment => getRoleAssignmentKey(savedAssignment) !== key
                );
                saveRoleAssignments();
                roleExpirationTimers.delete(key);
                return;
            }

            console.error(`No pude retirar el rol temporal ${assignment.roleId}:`, error);
            const retryTimer = setTimeout(
                () => scheduleRoleExpiration(assignment),
                60 * 1000
            );
            roleExpirationTimers.set(key, retryTimer);
        }

    }, Math.min(Math.max(remaining, 0), 2 ** 31 - 1));

    roleExpirationTimers.set(key, timer);
}

function scheduleSavedRoleExpirations() {

    for (const assignment of roleAssignments) {
        scheduleRoleExpiration(assignment);
    }
}

function formatPesos(amount) {

    return PESO_FORMATTER.format(amount);
}

function createEconomyEmbed(title, description, color = 0x2f9e8f) {

    return new EmbedBuilder()
        .setColor(color)
        .setTitle(title)
        .setDescription(description)
        .setFooter({ text: "Economía del servidor · Pesos mexicanos" });
}

async function replyEconomyError(interaction, description) {

    return interaction.reply({
        embeds: [createEconomyEmbed("⚠️ No se pudo completar", description, 0xd97706)],
        ephemeral: true
    });
}

function createBridgeEmbed(crossedStages, status, account) {
    const progress = Array.from({ length: CRYSTAL_BRIDGE_STAGES }, (_, index) =>
        index < crossedStages ? "✅" : index === crossedStages ? "🔹" : "▫️"
    ).join(" ");
    const cashout = CRYSTAL_BRIDGE_ENTRY_FEE + crossedStages * CRYSTAL_BRIDGE_STAGE_REWARD;

    return createEconomyEmbed(
        "🌉 Puente de cristal",
        [
            `**Tramo:** ${Math.min(crossedStages + 1, CRYSTAL_BRIDGE_STAGES)} / ${CRYSTAL_BRIDGE_STAGES}`,
            progress,
            `**Cobro seguro ahora:** ${formatPesos(cashout)} (incluye tu entrada)`,
            `**Pases de cristal:** ${account.inventory.crystalPasses}`,
            status,
            "Elige izquierda o derecha. Cada acierto añade $100 al cobro; caer sin pase te hace perder la entrada de $100."
        ].join("\n"),
        0x4387c4
    );
}

function createBridgeButtons(gameId, crossedStages, disabled = false) {
    return [
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`bridge-${gameId}-left`)
                .setLabel("⬅️ Izquierda")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(disabled),
            new ButtonBuilder()
                .setCustomId(`bridge-${gameId}-right`)
                .setLabel("Derecha ➡️")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(disabled),
            new ButtonBuilder()
                .setCustomId(`bridge-${gameId}-finish`)
                .setLabel(crossedStages ? "Cobrar y finalizar" : "Finalizar")
                .setStyle(ButtonStyle.Success)
                .setDisabled(disabled)
        )
    ];
}

const EXPEDITION_ROUTES = [
    { id: "sendero", label: "🌲 Sendero seguro", risk: 0.12, reward: 70 },
    { id: "cueva", label: "🪨 Cueva profunda", risk: 0.3, reward: 130 },
    { id: "ruinas", label: "🏛️ Ruinas antiguas", risk: 0.5, reward: 220 }
];

function createExpeditionEmbed(stage, loot, status) {
    const progress = Array.from({ length: EXPEDITION_STAGES }, (_, index) =>
        index < stage ? "✅" : index === stage ? "🔹" : "▫️"
    ).join(" ");
    const payout = EXPEDITION_ENTRY_FEE + loot;
    return createEconomyEmbed(
        "🧭 Expedición: tierras perdidas",
        [
            `**Zona:** ${Math.min(stage + 1, EXPEDITION_STAGES)} / ${EXPEDITION_STAGES}`,
            progress,
            `**Botín acumulado:** ${formatPesos(loot)}`,
            `**Cobro seguro si regresas:** ${formatPesos(payout)} (incluye tu entrada)`,
            status,
            `**Rutas disponibles:**\n${EXPEDITION_ROUTES.map(route =>
                `${route.label}: ${Math.round(route.risk * 100)}% de riesgo · premio ${formatPesos(route.reward * (stage + 1))}`
            ).join("\n")}`,
            "Elige una ruta por zona. Las rutas más peligrosas dan más botín; si caes, pierdes la entrada y todo el botín sin cobrar."
        ].join("\n"),
        0x378b72
    );
}

function createExpeditionButtons(gameId, disabled = false) {
    return [
        new ActionRowBuilder().addComponents(
            ...EXPEDITION_ROUTES.map(route =>
                new ButtonBuilder()
                    .setCustomId(`expedition-${gameId}-${route.id}`)
                    .setLabel(route.label)
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(disabled)
            ),
            new ButtonBuilder()
                .setCustomId(`expedition-${gameId}-return`)
                .setLabel("🏕️ Regresar y cobrar")
                .setStyle(ButtonStyle.Success)
                .setDisabled(disabled)
        )
    ];
}

async function startExpedition(interaction) {
    const account = getEconomyAccount(interaction.guild.id, interaction.user.id);
    if (account.balance < EXPEDITION_ENTRY_FEE) {
        await replyEconomyError(interaction, `Necesitas ${formatPesos(EXPEDITION_ENTRY_FEE)} para entrar; tienes ${formatPesos(account.balance)}.`);
        return;
    }

    const oldBalance = account.balance;
    account.balance -= EXPEDITION_ENTRY_FEE;
    try {
        saveEconomyData();
    } catch (error) {
        account.balance = oldBalance;
        console.error("No pude cobrar la entrada de la expedición:", error);
        await replyEconomyError(interaction, "No se pudo iniciar la expedición ni cobrar la entrada.");
        return;
    }

    const gameId = interaction.id;
    let stage = 0;
    let loot = 0;
    let processing = false;
    let settled = false;
    let gameMessage;
    const settle = payout => {
        if (settled) return false;
        const balanceBeforePayout = account.balance;
        account.balance += payout;
        try {
            saveEconomyData();
            settled = true;
            return true;
        } catch (error) {
            account.balance = balanceBeforePayout;
            console.error("No pude guardar el resultado de la expedición:", error);
            return false;
        }
    };

    try {
        await interaction.reply({
            embeds: [createExpeditionEmbed(
                stage,
                loot,
                `La expedición cuesta ${formatPesos(EXPEDITION_ENTRY_FEE)}. Completa ${EXPEDITION_STAGES} zonas o regresa con el botín acumulado.`
            )],
            components: createExpeditionButtons(gameId)
        });
        gameMessage = await interaction.fetchReply();
    } catch (error) {
        console.error("No pude publicar la expedición:", error);
        const refunded = settle(EXPEDITION_ENTRY_FEE);
        const message = refunded
            ? "❌ No pude abrir la expedición; tu entrada fue devuelta."
            : "❌ No pude abrir la expedición ni devolver tu entrada automáticamente. Contacta a un administrador.";
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({
                content: message,
                embeds: [],
                components: createExpeditionButtons(gameId, true)
            }).catch(editError =>
                console.error("No pude actualizar el inicio de la expedición:", editError)
            );
        } else {
            await interaction.reply({ content: message, ephemeral: true }).catch(replyError =>
                console.error("No pude informar del error de la expedición:", replyError)
            );
        }
        return;
    }

    const collector = gameMessage.createMessageComponentCollector({
        time: 180000,
        filter: buttonInteraction =>
            buttonInteraction.customId.startsWith(`expedition-${gameId}-`)
    });
    collector.on("collect", async buttonInteraction => {
        if (buttonInteraction.user.id !== interaction.user.id) {
            await buttonInteraction.reply({
                content: "Esta expedición pertenece a quien la inició.",
                ephemeral: true
            });
            return;
        }
        if (processing || settled) {
            await buttonInteraction.deferUpdate();
            return;
        }
        processing = true;
        try {
            const routeId = buttonInteraction.customId.slice(`expedition-${gameId}-`.length);
            if (routeId === "return") {
                const payout = EXPEDITION_ENTRY_FEE + loot;
                if (!settle(payout)) {
                    await buttonInteraction.reply({
                        content: "❌ No pude guardar el cobro; la expedición sigue activa.",
                        ephemeral: true
                    });
                    return;
                }
                collector.stop("returned");
                await buttonInteraction.update({
                    embeds: [createEconomyEmbed(
                        "🏕️ Expedición completada",
                        `Regresaste con **${formatPesos(loot)}** de botín y recuperaste tu entrada. Cobro total: **${formatPesos(payout)}**.\nSaldo: **${formatPesos(account.balance)}**`
                    )],
                    components: createExpeditionButtons(gameId, true)
                });
                return;
            }

            const route = EXPEDITION_ROUTES.find(candidate => candidate.id === routeId);
            if (!route) {
                await buttonInteraction.reply({
                    content: "❌ Esa ruta no existe.",
                    ephemeral: true
                });
                return;
            }

            await buttonInteraction.deferUpdate();
            collector.resetTimer();
            if (Math.random() < route.risk) {
                settled = true;
                collector.stop("lost");
                await gameMessage.edit({
                    embeds: [createEconomyEmbed(
                        "🪤 ¡La expedición salió mal!",
                        `La ruta **${route.label}** resultó peligrosa. Perdiste la entrada de **${formatPesos(EXPEDITION_ENTRY_FEE)}** y el botín sin cobrar (**${formatPesos(loot)}**).\nSaldo: **${formatPesos(account.balance)}**. Puedes intentarlo de nuevo con \`/expedicion\`.`,
                        0xc2413b
                    )],
                    components: createExpeditionButtons(gameId, true)
                });
                return;
            }

            const reward = route.reward * (stage + 1);
            loot += reward;
            stage++;
            if (stage === EXPEDITION_STAGES) {
                const payout = EXPEDITION_ENTRY_FEE + loot;
                if (!settle(payout)) {
                    await buttonInteraction.followUp({
                        content: "❌ No pude guardar el premio. Contacta a un administrador antes de iniciar otra expedición.",
                        ephemeral: true
                    });
                    collector.stop("error");
                    return;
                }
                collector.stop("returned");
                await gameMessage.edit({
                    embeds: [createEconomyEmbed(
                        "🏆 ¡Expedición conquistada!",
                        `Completaste las cinco zonas y regresaste con **${formatPesos(loot)}** de botín. Cobro total: **${formatPesos(payout)}**.\nSaldo: **${formatPesos(account.balance)}**`
                    )],
                    components: createExpeditionButtons(gameId, true)
                });
                return;
            }

            await gameMessage.edit({
                embeds: [createExpeditionEmbed(
                    stage,
                    loot,
                    `✅ Sobreviviste a **${route.label}** y hallaste **${formatPesos(reward)}**. ¿Qué ruta tomarás ahora?`
                )],
                components: createExpeditionButtons(gameId)
            });
        } catch (error) {
            console.error("Falló una ronda de la expedición:", error);
            const message = "❌ Ocurrió un error al procesar la ruta. Si la partida quedó bloqueada, contacta a un administrador.";
            const notify = buttonInteraction.deferred || buttonInteraction.replied
                ? buttonInteraction.followUp({ content: message, ephemeral: true })
                : buttonInteraction.reply({ content: message, ephemeral: true });
            await notify.catch(replyError =>
                console.error("No pude mostrar el error de la expedición:", replyError)
            );
        } finally {
            processing = false;
        }
    });

    collector.on("end", async (_, reason) => {
        if (settled) return;
        const payout = EXPEDITION_ENTRY_FEE + loot;
        if (settle(payout)) {
            await gameMessage.edit({
                embeds: [createEconomyEmbed(
                    "⌛ Expedición cerrada",
                    `La expedición terminó por inactividad. Se guardó tu botín y se devolvió la entrada: **${formatPesos(payout)}**.\nSaldo: **${formatPesos(account.balance)}**`
                )],
                components: createExpeditionButtons(gameId, true)
            }).catch(error => console.error("No pude cerrar la expedición:", error));
        } else {
            console.error(`No pude cerrar la expedición ${gameId} (motivo: ${reason}).`);
            await gameMessage.edit({
                embeds: [createEconomyEmbed(
                    "⚠️ No se pudo cerrar la expedición",
                    "No pude guardar tu cobro. Contacta a un administrador y no inicies otra expedición.",
                    0xd97706
                )],
                components: createExpeditionButtons(gameId, true)
            }).catch(error => console.error("No pude mostrar el error al cerrar la expedición:", error));
        }
    });
}

async function handleShopCommand(interaction) {
    const commandName = interaction.commandName;
    if (!["tienda", "comprar", "inventario", "fabricar", "picar", "vender"].includes(commandName)) return false;

    if (!interaction.guild) {
        await replyEconomyError(interaction, "La tienda solo está disponible dentro de un servidor.");
        return true;
    }

    const account = getEconomyAccount(interaction.guild.id, interaction.user.id);

    if (commandName === "tienda") {
        await interaction.reply({
            embeds: [createEconomyEmbed(
                "🛒 Tienda de iCloud",
                Object.entries(SHOP_ITEMS).map(([id, item]) =>
                    `**${item.name}** · ${formatPesos(item.price)}\n${item.description}\nCompra con \`/comprar objeto:${id} cantidad:1\`.`
                ).join("\n\n")
            )]
        });
        return true;
    }

    if (commandName === "inventario") {
        await interaction.reply({
            embeds: [createEconomyEmbed(
                `🎒 Inventario de ${interaction.user.username}`,
                [
                    `**Usos de kit de trabajo:** ${account.inventory.workKitUses}`,
                    `**Pases de cristal:** ${account.inventory.crystalPasses}`,
                    `**Materiales:** ${MINING_MATERIALS.map(material =>
                        `${SHOP_ITEMS[material].name}: ${account.inventory.materials[material]}`
                    ).join(" · ")}`,
                    `**Minerales:** ${Object.entries(MINING_ORES).map(([ore, data]) =>
                        `${data.name}: ${account.inventory.ores[ore]}`
                    ).join(" · ")}`,
                    `**Pico equipado:** ${account.inventory.pickaxe
                        ? `${PICKAXES[account.inventory.pickaxe].name} (${account.inventory.pickaxeUses}/${MINE_TOOL_USES} usos)`
                        : "ninguno"}`,
                    "Usa `/fabricar` para crear picos, `/picar` para minar y `/vender` para convertir minerales en pesos."
                ].join("\n")
            )]
        });
        return true;
    }

    const snapshotInventory = () => ({
        ...account.inventory,
        materials: { ...account.inventory.materials },
        ores: { ...account.inventory.ores }
    });
    const restoreInventory = snapshot => {
        account.inventory = snapshot;
    };

    if (commandName === "comprar") {
        const itemId = interaction.options.getString("objeto", true);
        const item = SHOP_ITEMS[itemId];
        const quantity = interaction.options.getInteger("cantidad") || 1;
        if (!item) {
            await replyEconomyError(interaction, "Ese objeto no existe en la tienda.");
            return true;
        }
        const totalPrice = item.price * quantity;
        if (account.balance < totalPrice) {
            await replyEconomyError(interaction, `Necesitas ${formatPesos(totalPrice)} y tienes ${formatPesos(account.balance)}.`);
            return true;
        }

        const oldBalance = account.balance;
        const oldInventory = snapshotInventory();
        account.balance -= totalPrice;
        if (itemId === "kit_trabajo") account.inventory.workKitUses += WORK_KIT_USES * quantity;
        else if (itemId === "pase_cristal") account.inventory.crystalPasses += quantity;
        else account.inventory.materials[itemId] += quantity;

        try {
            saveEconomyData();
        } catch (error) {
            account.balance = oldBalance;
            restoreInventory(oldInventory);
            console.error("No pude guardar la compra de la tienda:", error);
            await replyEconomyError(interaction, "No se pudo guardar tu compra. No se te cobró; inténtalo de nuevo.");
            return true;
        }

        await interaction.reply({
            embeds: [createEconomyEmbed(
                "✅ Compra completada",
                `Compraste **${quantity} × ${item.name}** por ${formatPesos(totalPrice)}.\nSaldo: **${formatPesos(account.balance)}**\nUsa \`/inventario\` para consultar tus objetos.`
            )]
        });
        return true;
    }

    if (commandName === "fabricar") {
        const pickaxeId = interaction.options.getString("pico", true);
        const pickaxe = PICKAXES[pickaxeId];
        const currentPickaxe = PICKAXES[account.inventory.pickaxe];
        if (
            currentPickaxe
            && currentPickaxe.tier >= pickaxe.tier
            && account.inventory.pickaxeUses > 0
        ) {
            await replyEconomyError(interaction, `Ya tienes un **${currentPickaxe.name}** con usos restantes. Gástalo antes de fabricar otro.`);
            return true;
        }
        const missing = Object.entries(pickaxe.recipe)
            .filter(([material, amount]) => account.inventory.materials[material] < amount)
            .map(([material, amount]) =>
                `${amount - account.inventory.materials[material]} ${SHOP_ITEMS[material].name}`
            );
        if (missing.length) {
            await replyEconomyError(
                interaction,
                `Te faltan materiales para fabricar **${pickaxe.name}**: ${missing.join(", ")}. Consulta \`/tienda\` y \`/inventario\`.`
            );
            return true;
        }

        const oldInventory = snapshotInventory();
        for (const [material, amount] of Object.entries(pickaxe.recipe)) {
            account.inventory.materials[material] -= amount;
        }
        account.inventory.pickaxe = pickaxeId;
        account.inventory.pickaxeUses = MINE_TOOL_USES;
        try {
            saveEconomyData();
        } catch (error) {
            restoreInventory(oldInventory);
            console.error("No pude guardar la fabricación del pico:", error);
            await replyEconomyError(interaction, "No se pudo guardar la fabricación; no se gastaron tus materiales.");
            return true;
        }

        await interaction.reply({
            embeds: [createEconomyEmbed(
                "🛠️ ¡Pico fabricado!",
                `Fabricaste **${pickaxe.name}** con **${Object.entries(pickaxe.recipe)
                    .map(([material, amount]) => `${amount} ${SHOP_ITEMS[material].name}`)
                    .join(" y ")}**.\nTiene **${MINE_TOOL_USES} usos**. Usa \`/picar\` para buscar minerales.`
            )]
        });
        return true;
    }

    if (commandName === "picar") {
        const pickaxeId = account.inventory.pickaxe;
        const pickaxe = PICKAXES[pickaxeId];
        if (!pickaxe || account.inventory.pickaxeUses < 1) {
            await replyEconomyError(interaction, "No tienes un pico con usos disponibles. Compra materiales en `/tienda` y fabrica uno con `/fabricar`.");
            return true;
        }

        const table = MINING_DROPS[pickaxeId];
        let roll = Math.random();
        let drop = table[table.length - 1];
        for (const candidate of table) {
            roll -= candidate.chance;
            if (roll < 0) {
                drop = candidate;
                break;
            }
        }
        const quantity = Math.floor(Math.random() * (drop.maximum - drop.minimum + 1)) + drop.minimum;
        const oldInventory = snapshotInventory();
        account.inventory.pickaxeUses--;
        account.inventory.ores[drop.ore] += quantity;
        try {
            saveEconomyData();
        } catch (error) {
            restoreInventory(oldInventory);
            console.error("No pude guardar los minerales extraídos:", error);
            await replyEconomyError(interaction, "No se pudo guardar la minería; no se gastó el uso del pico.");
            return true;
        }

        await interaction.reply({
            embeds: [createEconomyEmbed(
                "⛏️ ¡Mineral encontrado!",
                `Usaste **${pickaxe.name}** y encontraste **${quantity} × ${MINING_ORES[drop.ore].name}**.\n` +
                `Durabilidad: **${account.inventory.pickaxeUses}/${MINE_TOOL_USES} usos**.\n` +
                `Precio de venta actual: **${formatPesos(MINING_ORES[drop.ore].price * quantity)}**. Usa \`/vender\` para convertir tus minerales en pesos.`
            )]
        });
        return true;
    }

    const sale = Object.entries(account.inventory.ores).reduce(
        (total, [ore, quantity]) => total + quantity * MINING_ORES[ore].price,
        0
    );
    if (sale <= 0) {
        await replyEconomyError(interaction, "No tienes minerales para vender. Fabrica un pico y usa `/picar`.");
        return true;
    }
    const oldBalance = account.balance;
    const oldOres = { ...account.inventory.ores };
    account.balance += sale;
    for (const ore of Object.keys(account.inventory.ores)) {
        account.inventory.ores[ore] = 0;
    }
    try {
        saveEconomyData();
    } catch (error) {
        account.balance = oldBalance;
        account.inventory.ores = oldOres;
        console.error("No pude guardar la venta de minerales:", error);
        await replyEconomyError(interaction, "No se pudo guardar la venta; conservas tus minerales.");
        return true;
    }
    await interaction.reply({
        embeds: [createEconomyEmbed(
            "💰 Minerales vendidos",
            `Convertiste tus minerales en **${formatPesos(sale)}**.\nSaldo: **${formatPesos(account.balance)}**`
        )]
    });
    return true;
}

async function handleAdministratorTools(interaction) {
    if (!["anuncio", "ajustarsaldo"].includes(interaction.commandName)) return false;

    if (!interaction.guild) {
        await interaction.reply({
            content: "❌ Este comando solo funciona dentro de un servidor.",
            ephemeral: true
        });
        return true;
    }
    if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
        await interaction.reply({
            content: "❌ Solo los administradores pueden usar este comando.",
            ephemeral: true
        });
        return true;
    }

    if (interaction.commandName === "anuncio") {
        const channel = interaction.options.getChannel("canal", true);
        if (
            !channel.isTextBased()
            || typeof channel.send !== "function"
            || channel.guildId !== interaction.guildId
        ) {
            await interaction.reply({
                content: "❌ Elige un canal de texto de este mismo servidor.",
                ephemeral: true
            });
            return true;
        }

        try {
            const announcement = new EmbedBuilder()
                .setColor(0x7656d6)
                .setTitle("📢 Anuncio")
                .setDescription(interaction.options.getString("mensaje", true))
                .setFooter({ text: `Publicado por ${interaction.user.username}` })
                .setTimestamp();
            await interaction.deferReply({ ephemeral: true });
            await channel.send({
                embeds: [announcement],
                allowedMentions: { parse: [] }
            });
            await interaction.editReply(`✅ Anuncio publicado en ${channel}.`);
        } catch (error) {
            console.error("No pude publicar el anuncio:", error);
            const errorMessage = "❌ No pude enviar el anuncio. Revisa los permisos del bot en el canal.";
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply(errorMessage);
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
        return true;
    }

    const targetUser = interaction.options.getUser("usuario", true);
    const adjustment = interaction.options.getInteger("cantidad", true);
    if (targetUser.bot || adjustment === 0) {
        await interaction.reply({
            content: "❌ Elige un usuario que no sea bot y una cantidad distinta de cero.",
            ephemeral: true
        });
        return true;
    }

    const account = getEconomyAccount(interaction.guild.id, targetUser.id);
    if (account.balance + adjustment < 0) {
        await interaction.reply({
            content: `❌ El saldo no puede quedar negativo. El usuario tiene ${formatPesos(account.balance)}.`,
            ephemeral: true
        });
        return true;
    }
    const previousBalance = account.balance;
    account.balance += adjustment;
    try {
        saveEconomyData();
    } catch (error) {
        account.balance = previousBalance;
        console.error("No pude guardar el ajuste de saldo:", error);
        await interaction.reply({
            content: "❌ No se pudo guardar el cambio; el saldo no fue modificado.",
            ephemeral: true
        });
        return true;
    }

    await interaction.reply({
        embeds: [createEconomyEmbed(
            "🧾 Saldo actualizado",
            `Se ${adjustment > 0 ? "añadieron" : "retiraron"} **${formatPesos(Math.abs(adjustment))}** a ${targetUser}.\nSaldo actual: **${formatPesos(account.balance)}**`,
            0x7656d6
        )],
        ephemeral: true,
        allowedMentions: { parse: [] }
    });
    return true;
}

async function startCrystalBridge(interaction) {
    const account = getEconomyAccount(interaction.guild.id, interaction.user.id);
    if (account.balance < CRYSTAL_BRIDGE_ENTRY_FEE) {
        await replyEconomyError(interaction, `Necesitas ${formatPesos(CRYSTAL_BRIDGE_ENTRY_FEE)} para entrar; tienes ${formatPesos(account.balance)}.`);
        return;
    }

    const oldBalance = account.balance;
    account.balance -= CRYSTAL_BRIDGE_ENTRY_FEE;
    try {
        saveEconomyData();
    } catch (error) {
        account.balance = oldBalance;
        console.error("No pude cobrar la entrada del Puente de cristal:", error);
        await replyEconomyError(interaction, "No se pudo iniciar la partida ni cobrar la entrada. Inténtalo de nuevo.");
        return;
    }

    const gameId = interaction.id;
    let crossedStages = 0;
    let processing = false;
    let settled = false;
    let gameMessage;

    const settle = payout => {
        if (settled) return false;
        const balanceBeforePayout = account.balance;
        account.balance += payout;
        try {
            saveEconomyData();
            settled = true;
            return true;
        } catch (error) {
            account.balance = balanceBeforePayout;
            console.error("No pude guardar el resultado del Puente de cristal:", error);
            return false;
        }
    };

    try {
        await interaction.reply({
            embeds: [createBridgeEmbed(0, "Cruza los ocho tramos o finaliza para recuperar tu entrada.", account)],
            components: createBridgeButtons(gameId, 0)
        });
        gameMessage = await interaction.fetchReply();
    } catch (error) {
        console.error("No pude publicar la partida del Puente de cristal:", error);
        const refunded = settle(CRYSTAL_BRIDGE_ENTRY_FEE);
        const message = refunded
            ? "❌ No pude abrir la partida; tu entrada fue devuelta."
            : "❌ No pude abrir la partida ni devolver la entrada automáticamente. Contacta a un administrador.";
        try {
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({
                    embeds: [createEconomyEmbed("⚠️ Partida no disponible", message, 0xd97706)],
                    components: createBridgeButtons(gameId, 0, true)
                }).catch(editError => console.error("No pude cerrar el mensaje inicial del Puente:", editError));
                await interaction.followUp({ content: message, ephemeral: true });
            } else {
                await interaction.reply({ content: message, ephemeral: true });
            }
        } catch (replyError) {
            console.error("No pude informar el error al iniciar el Puente:", replyError);
        }
        return;
    }
    const collector = gameMessage.createMessageComponentCollector({
        time: 120000,
        filter: buttonInteraction => buttonInteraction.customId.startsWith(`bridge-${gameId}-`)
    });

    collector.on("collect", async buttonInteraction => {
        if (buttonInteraction.user.id !== interaction.user.id) {
            await buttonInteraction.reply({
                content: "Esta partida del Puente de cristal pertenece a quien la inició.",
                ephemeral: true
            });
            return;
        }
        if (processing || settled) {
            await buttonInteraction.deferUpdate();
            return;
        }

        processing = true;
        try {
            const action = buttonInteraction.customId.split("-").at(-1);
            if (action === "finish") {
                const payout = crossedStages
                    ? CRYSTAL_BRIDGE_ENTRY_FEE + crossedStages * CRYSTAL_BRIDGE_STAGE_REWARD
                    : CRYSTAL_BRIDGE_ENTRY_FEE;
                if (!settle(payout)) {
                    await buttonInteraction.reply({
                        content: "❌ No pude guardar el cobro. Tu partida sigue activa; inténtalo otra vez.",
                        ephemeral: true
                    });
                    return;
                }
                collector.stop("finished");
                await buttonInteraction.update({
                    embeds: [createEconomyEmbed(
                        "🏁 Partida finalizada",
                        `Cobraste **${formatPesos(payout)}**${crossedStages ? ` por superar ${crossedStages} tramo(s)` : "; recuperaste tu entrada"}.\nSaldo: **${formatPesos(account.balance)}**`
                    )],
                    components: createBridgeButtons(gameId, crossedStages, true)
                });
                return;
            }

            await buttonInteraction.deferUpdate();
            const safeSide = Math.random() < 0.5 ? "left" : "right";
            if (action !== safeSide) {
                if (account.inventory.crystalPasses > 0) {
                    account.inventory.crystalPasses--;
                    try {
                        saveEconomyData();
                    } catch (error) {
                        account.inventory.crystalPasses++;
                        console.error("No pude guardar el uso del pase de cristal:", error);
                        await buttonInteraction.followUp({
                            content: "❌ No pude guardar el uso del pase; no se consumió y la partida sigue activa.",
                            ephemeral: true
                        });
                        return;
                    }
                    crossedStages++;
                    if (crossedStages === CRYSTAL_BRIDGE_STAGES) {
                        const payout = CRYSTAL_BRIDGE_ENTRY_FEE + crossedStages * CRYSTAL_BRIDGE_STAGE_REWARD;
                        if (!settle(payout)) {
                            await buttonInteraction.followUp({
                                content: "❌ No pude guardar el premio. Contacta a un administrador antes de iniciar otra partida.",
                                ephemeral: true
                            });
                            collector.stop("error");
                            return;
                        }
                        collector.stop("finished");
                        await gameMessage.edit({
                            embeds: [createEconomyEmbed(
                                "🏆 ¡Puente superado!",
                                `Tu pase te salvó y cruzaste los ocho tramos. Cobraste **${formatPesos(payout)}**.\nSaldo: **${formatPesos(account.balance)}**`
                            )],
                            components: createBridgeButtons(gameId, crossedStages, true)
                        });
                        return;
                    }
                    await gameMessage.edit({
                        embeds: [createBridgeEmbed(crossedStages, "🛡️ El pase de cristal te salvó: avanzaste, pero ya no tienes otro pase.", account)],
                        components: createBridgeButtons(gameId, crossedStages)
                    });
                    return;
                }

                settled = true;
                collector.stop("fell");
                await gameMessage.edit({
                    embeds: [createEconomyEmbed(
                        "💥 ¡Caíste del puente!",
                        `Elegiste el cristal equivocado y perdiste la entrada de **${formatPesos(CRYSTAL_BRIDGE_ENTRY_FEE)}**.\nSaldo: **${formatPesos(account.balance)}**. Compra un pase en \`/tienda\` para salvar una caída en otra partida.`,
                        0xc2413b
                    )],
                    components: createBridgeButtons(gameId, crossedStages, true)
                });
                return;
            }

            crossedStages++;
            if (crossedStages === CRYSTAL_BRIDGE_STAGES) {
                const payout = CRYSTAL_BRIDGE_ENTRY_FEE + crossedStages * CRYSTAL_BRIDGE_STAGE_REWARD;
                if (!settle(payout)) {
                    await buttonInteraction.followUp({
                        content: "❌ No pude guardar el premio. Contacta a un administrador antes de iniciar otra partida.",
                        ephemeral: true
                    });
                    collector.stop("error");
                    return;
                }
                collector.stop("finished");
                await gameMessage.edit({
                    embeds: [createEconomyEmbed(
                        "🏆 ¡Puente superado!",
                        `Cruzaste los ocho tramos y cobraste **${formatPesos(payout)}**.\nSaldo: **${formatPesos(account.balance)}**`
                    )],
                    components: createBridgeButtons(gameId, crossedStages, true)
                });
                return;
            }

            await gameMessage.edit({
                embeds: [createBridgeEmbed(crossedStages, "✅ ¡Tramo seguro! Sigue adelante o cobra y finaliza.", account)],
                components: createBridgeButtons(gameId, crossedStages)
            });
        } catch (error) {
            console.error("Falló una ronda del Puente de cristal:", error);
            const errorMessage = "❌ Ocurrió un error al procesar tu jugada. Si la partida quedó bloqueada, contacta a un administrador.";
            const notify = buttonInteraction.deferred || buttonInteraction.replied
                ? buttonInteraction.followUp({ content: errorMessage, ephemeral: true })
                : buttonInteraction.reply({ content: errorMessage, ephemeral: true });
            await notify.catch(replyError => console.error("No pude mostrar el error del Puente:", replyError));
        } finally {
            processing = false;
        }
    });

    collector.on("end", async (_, reason) => {
        if (settled) return;
        const payout = CRYSTAL_BRIDGE_ENTRY_FEE + crossedStages * CRYSTAL_BRIDGE_STAGE_REWARD;
        if (settle(payout)) {
            const title = reason === "time"
                ? "⌛ Puente cerrado por inactividad"
                : "⚠️ Partida del Puente cerrada";
            await gameMessage.edit({
                embeds: [createEconomyEmbed(
                    title,
                    `Se guardó tu progreso y recibiste **${formatPesos(payout)}** (incluye la entrada y el valor de los tramos superados).\nSaldo: **${formatPesos(account.balance)}**`
                )],
                components: createBridgeButtons(gameId, crossedStages, true)
            }).catch(error => console.error("No pude cerrar la partida del Puente:", error));
        } else {
            console.error(`No pude devolver la entrada de la partida del Puente de cristal ${gameId}.`);
            await gameMessage.edit({
                embeds: [createEconomyEmbed(
                    "⚠️ No se pudo cerrar la partida",
                    "No pude guardar la devolución de la entrada. No vuelvas a iniciar otra partida y contacta a un administrador.",
                    0xd97706
                )],
                components: createBridgeButtons(gameId, crossedStages, true)
            }).catch(error => console.error("No pude mostrar el error al cerrar el Puente:", error));
        }
    });
}

async function handleEconomyCommand(interaction) {

    const economyCommands = ["saldo", "trabajar", "ruleta", "apostar", "robar", "top", "puente", "expedicion"];

    if (!economyCommands.includes(interaction.commandName)) return false;

    if (!interaction.guild) {
        await replyEconomyError(interaction, "La economía solo está disponible dentro de un servidor.");
        return true;
    }

    const guildId = interaction.guild.id;
    const userId = interaction.user.id;

    if (interaction.commandName === "puente") {
        await startCrystalBridge(interaction);
        return true;
    }
    if (interaction.commandName === "expedicion") {
        await startExpedition(interaction);
        return true;
    }

    if (interaction.commandName === "saldo") {

        const target = interaction.options.getUser("usuario") || interaction.user;
        const account = getEconomyAccount(guildId, target.id);

        await interaction.reply({
            embeds: [createEconomyEmbed(
                `👛 Cartera de ${target.username}`,
                `**Saldo:** ${formatPesos(account.balance)}\nSigue trabajando para llenar esa cartera. 💸`
            )],
            allowedMentions: { parse: [] }
        });
        return true;
    }

    if (interaction.commandName === "trabajar") {

        const account = getEconomyAccount(guildId, userId);
        const now = Date.now();
        const remaining = WORK_COOLDOWN - (now - account.lastWorkAt);

        if (remaining > 0) {
            await replyEconomyError(interaction, `Ya terminaste tu turno. Vuelve en **${Math.ceil(remaining / 60000)} min**. 🕒`);
            return true;
        }

        const job = pickRandomMessage(WORK_JOBS);
        const baseEarnings = Math.floor(Math.random() * (job.maximum - job.minimum + 1)) + job.minimum;
        const usedWorkKit = account.inventory.workKitUses > 0;
        const earnings = usedWorkKit
            ? Math.floor(baseEarnings * WORK_KIT_BONUS_MULTIPLIER)
            : baseEarnings;
        const previousState = {
            balance: account.balance,
            lastWorkAt: account.lastWorkAt,
            workKitUses: account.inventory.workKitUses
        };
        account.balance += earnings;
        account.lastWorkAt = now;
        if (usedWorkKit) account.inventory.workKitUses--;
        try {
            saveEconomyData();
        } catch (error) {
            account.balance = previousState.balance;
            account.lastWorkAt = previousState.lastWorkAt;
            account.inventory.workKitUses = previousState.workKitUses;
            console.error("No pude guardar el resultado del turno:", error);
            await replyEconomyError(interaction, "No se pudo guardar tu turno; no recibiste el dinero ni se gastó un kit.");
            return true;
        }

        await interaction.reply({
            embeds: [createEconomyEmbed(
                "🧰 Turno terminado",
                `Trabajaste como **${job.name}** y ganaste **${formatPesos(earnings)}**${usedWorkKit ? " (incluye el bono del kit de trabajo)" : ""}.\n` +
                `💰 Nuevo saldo: **${formatPesos(account.balance)}**`
            )]
        });
        return true;
    }

    if (interaction.commandName === "ruleta" || interaction.commandName === "apostar") {

        const account = getEconomyAccount(guildId, userId);
        const bet = interaction.options.getInteger("apuesta", true);

        if (bet < MINIMUM_BET) {
            await replyEconomyError(interaction, `La apuesta mínima es **${formatPesos(MINIMUM_BET)}**.`);
            return true;
        }

        if (bet > account.balance) {
            await replyEconomyError(interaction, `No tienes suficiente. Tu saldo es **${formatPesos(account.balance)}**.`);
            return true;
        }

        account.balance -= bet;

        if (interaction.commandName === "ruleta") {

            const chosenColor = interaction.options.getString("color", true);
            const number = Math.floor(Math.random() * 37);
            const landedColor = number === 0
                ? "verde"
                : RED_ROULETTE_NUMBERS.has(number)
                    ? "rojo"
                    : "negro";
            const won = chosenColor === landedColor;
            const payout = won ? bet * (landedColor === "verde" ? 14 : 2) : 0;
            account.balance += payout;
            saveEconomyData();

            await interaction.reply({
                embeds: [createEconomyEmbed(
                    won ? "🎉 ¡La ruleta pagó!" : "🎰 La casa ganó esta vez",
                    `Salió **${number} ${landedColor}**. Elegiste **${chosenColor}**.\n` +
                    (won
                        ? `Ganancia neta: **${formatPesos(payout - bet)}**. 💵\n`
                        : `Perdiste **${formatPesos(bet)}**. 🍀\n`) +
                    `👛 Saldo: **${formatPesos(account.balance)}**`,
                    won ? 0x2f9e8f : 0xc2413b
                )]
            });
            return true;
        }

        const chosenSide = interaction.options.getString("lado", true);
        const landedSide = Math.random() < 0.5 ? "cara" : "cruz";
        const won = chosenSide === landedSide;
        const payout = won ? bet * 2 : 0;
        account.balance += payout;
        saveEconomyData();

        await interaction.reply({
            embeds: [createEconomyEmbed(
                won ? "🪙 ¡Ganaste la apuesta!" : "🪙 Esta vez ganó la moneda",
                `Salió **${landedSide}** y elegiste **${chosenSide}**.\n` +
                (won
                    ? `Ganancia neta: **${formatPesos(bet)}**. 💸\n`
                    : `Perdiste **${formatPesos(bet)}**.\n`) +
                `👛 Saldo: **${formatPesos(account.balance)}**`,
                won ? 0x2f9e8f : 0xc2413b
            )]
        });
        return true;
    }

    if (interaction.commandName === "robar") {

        const targetUser = interaction.options.getUser("usuario", true);

        if (targetUser.id === userId) {
            await replyEconomyError(interaction, "No puedes robarte a ti mismo. Tu cartera ya está bastante nerviosa. 😅");
            return true;
        }

        if (targetUser.bot) {
            await replyEconomyError(interaction, "Los bots no llevan cartera... todavía. 🤖");
            return true;
        }

        const thief = getEconomyAccount(guildId, userId);
        const target = getEconomyAccount(guildId, targetUser.id);
        const now = Date.now();
        const remaining = STEAL_COOLDOWN - (now - thief.lastStealAt);

        if (remaining > 0) {
            await replyEconomyError(interaction, `La policía aún te vigila. Inténtalo en **${Math.ceil(remaining / 60000)} min**. 🚨`);
            return true;
        }

        if (target.balance < 1) {
            await replyEconomyError(interaction, "Esa cartera está vacía. Busca un objetivo con más suerte. 👛");
            return true;
        }

        thief.lastStealAt = now;

        if (Math.random() < 0.4) {
            const percentage = 0.05 + Math.random() * 0.1;
            const stolen = Math.min(target.balance, Math.max(1, Math.floor(target.balance * percentage)));
            target.balance -= stolen;
            thief.balance += stolen;
            saveEconomyData();

            await interaction.reply({
                embeds: [createEconomyEmbed(
                    "🥷 ¡Golpe exitoso!",
                    `Le robaste **${formatPesos(stolen)}** a ${targetUser}.\n` +
                    `👛 Tu saldo: **${formatPesos(thief.balance)}** · ${targetUser}: **${formatPesos(target.balance)}**`
                )],
                allowedMentions: { parse: [] }
            });
        } else {
            const fine = Math.min(thief.balance, Math.max(10, Math.floor(thief.balance * 0.1)));
            thief.balance -= fine;
            saveEconomyData();

            await interaction.reply({
                embeds: [createEconomyEmbed(
                    "🚨 ¡Te atraparon!",
                    `El robo falló y pagaste una multa de **${formatPesos(fine)}**.\n` +
                    `Probabilidad de éxito: **40%**. Saldo: **${formatPesos(thief.balance)}**. 😬`,
                    0xc2413b
                )]
            });
        }
        return true;
    }

    if (interaction.commandName === "top") {

        const accounts = Object.entries(economyData[guildId] || {})
            .filter(([, account]) => Number.isSafeInteger(account.balance) && account.balance >= 0)
            .sort((first, second) => second[1].balance - first[1].balance)
            .slice(0, 10);
        const leaderboard = accounts.length
            ? accounts.map(([id, account], index) =>
                `**${index + 1}.** <@${id}> · ${formatPesos(account.balance)}`
            ).join("\n")
            : "Todavía no hay cuentas. Usa `/trabajar` para inaugurar la economía. 🧰";

        await interaction.reply({
            embeds: [createEconomyEmbed("🏆 Top 10 · Mayores fortunas", leaderboard)],
            allowedMentions: { parse: [] }
        });
        return true;
    }

    return false;
}

// ===============================
// CLIENTE
// ===============================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const PERSONALITY_GUILD_ID = "1530770439704674344";
const BOT_REPLY_GIF_URLS = [
    "https://tenor.com/view/andrew-r-personality-likes-about-self-cv-gif-15418064",
    "https://klipy.com/gifs/clown-9",
    "https://tenor.com/view/angry-chinese-man-with-gun-shoot-pew-pow-gun-chinese-man-anger-gif-18651737",
    "https://klipy.com/gifs/santi-santiagogimenez",
    "https://tenor.com/view/tralalero-tralala-tung-tung-tung-sahur-brainrot-gif-14723192941540813594",
    "https://tenor.com/view/old-man-spray-paint-bug-eye-man-gif-21526624",
    "https://klipy.com/gifs/brick-wall-talking-to-wall",
    "https://cdn.discordapp.com/attachments/1436825169699012608/1490011781693964348/ezgif-395a166e2e34663d.gif?ex=6ac9b25b&is=6ac860db&hm=75611bfc33c53406629b36f1ab1ec71d54ea3d9508fae3820b387224561131b3&",
    "https://tenor.com/view/brotherjona-floomf-ryan-garcia-talking-to-monkey-gif-3486165354949704924",
    "https://cdn.discordapp.com/attachments/852263444802699325/1450029816203055177/q_harias.gif?ex=6ac94340&is=6ac7f1c0&hm=45f8425ab8709e2242d6da73ee48f499d24c224db21765db3ade4d020280c5f1&",
    "https://tenor.com/view/patrick-star-chewing-spongebob-eating-unimpressed-gif-11619313",
    "https://tenor.com/view/job-job-application-jobless-gif-2757097081210871087",
    "https://klipy.com/gifs/ryan-garcia-gervonta-davis"
];
const BOT_REPLY_DELAY = 3 * 1000;
const BOT_REPLY_MESSAGES = [
    "Soy adorable, pero igual malo >:D",
    "Me mencionaste; ya puedes proceder con tu solicitud y tus disculpas.",
    "No soy malo, solo estoy en mi arco de villano.",
    "Estoy hecho de código, café imaginario y malas decisiones.",
    "Te leo. Mi abogado robot recomienda que seas amable.",
    "Atendiendo... primero debo fingir que no vi eso.",
    "Claro que sí. Aunque mi última neurona está en una reunión.",
    "Soy un bot de alto rendimiento... en teoría."
];
const BOT_MENTION_MESSAGES = [
    "Soy adorable, ¿a que sí?",
    "Soy interesante... aunque me menciones solo para comprobarlo."
];
const WELCOME_EMOJIS = [
    "<:emoji_5:1531191935354536018>",
    "<:emoji_17:1531194038676357140>",
    "<:sunglas:1531564951049732107>"
];
const BOT_GIF_REPLY_EMOJIS = [
    "<:emoji_30:1531561367834853416>",
    "<:emoji_16:1531194004333396049>",
    "<:emoji_28:1531561292672925707>",
    "<:emoji_32:1531561562555285504>",
    "<:dog_laughing_at_you:1531566496038518794>",
    "<:agent:1531565321079488685>"
];
const WELCOME_MESSAGES = [
    (memberId, emoji) => `${emoji} ¡Bienvenido, <@${memberId}>! El caos ya tiene refuerzos.`,
    (memberId, emoji) => `¡Llegó <@${memberId}>! Ponte cómodo; el bot ya estaba hablando solo. ${emoji}`,
    (memberId, emoji) => `${emoji} ¡Bienvenido a bordo, <@${memberId}>! La cordura es opcional y el caos viene incluido.`,
    (memberId, emoji) => `¡Se sumó <@${memberId}>! Ahora somos oficialmente más que los errores del bot. ${emoji}`,
    (memberId, emoji) => `${emoji} ¡Hola, <@${memberId}>! Si el bot te saluda primero, no significa que sepa lo que hace.`
];

function pickRandomMessage(messages) {

    return messages[Math.floor(Math.random() * messages.length)];
}

function getBotReplyType(message) {
    const content = message.content
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    const shouldSendGif = [
        /\bcalla\b/,
        /\bduerman\s+al\s+bot\b/,
        /\btienes\s+down\b/,
        /\bbajen\s+el\s+sueldo\b/,
        /\bque\s+te\s+apaguen\b/
    ].some(pattern => pattern.test(content));

    if (shouldSendGif) return "gif";

    const mentionsBot = message.mentions.has(message.client.user)
        || message.mentions.users.has(message.client.user.id)
        || message.mentions.repliedUser?.id === message.client.user.id
        || new RegExp(`\\b(bot|robot)\\b|<@!?${message.client.user.id}>`).test(content);

    return mentionsBot ? "mention" : null;
}

// ===============================
// COMANDOS
// ===============================

let commands = [

    new SlashCommandBuilder()
        .setName("saldo")
        .setDescription("Consulta tu cartera o la de otra persona.")
        .addUserOption(option =>
            option
                .setName("usuario")
                .setDescription("Persona cuya cartera quieres consultar.")
                .setRequired(false)
        ),

    new SlashCommandBuilder()
        .setName("trabajar")
        .setDescription("Trabaja en un empleo aleatorio y cobra tu sueldo."),

    new SlashCommandBuilder()
        .setName("ruleta")
        .setDescription("Apuesta pesos al rojo, negro o verde en la ruleta.")
        .addIntegerOption(option =>
            option
                .setName("apuesta")
                .setDescription("Cantidad de pesos a apostar.")
                .setRequired(true)
                .setMinValue(MINIMUM_BET)
                .setMaxValue(1000000)
        )
        .addStringOption(option =>
            option
                .setName("color")
                .setDescription("Color al que quieres apostar.")
                .setRequired(true)
                .addChoices(
                    { name: "Rojo", value: "rojo" },
                    { name: "Negro", value: "negro" },
                    { name: "Verde (0)", value: "verde" }
                )
        ),

    new SlashCommandBuilder()
        .setName("apostar")
        .setDescription("Apuesta a cara o cruz y duplica tu apuesta si aciertas.")
        .addIntegerOption(option =>
            option
                .setName("apuesta")
                .setDescription("Cantidad de pesos a apostar.")
                .setRequired(true)
                .setMinValue(MINIMUM_BET)
                .setMaxValue(1000000)
        )
        .addStringOption(option =>
            option
                .setName("lado")
                .setDescription("Elige cara o cruz.")
                .setRequired(true)
                .addChoices(
                    { name: "Cara", value: "cara" },
                    { name: "Cruz", value: "cruz" }
                )
        ),

    new SlashCommandBuilder()
        .setName("robar")
        .setDescription("Intenta robar entre el 5% y 15% de una cartera.")
        .addUserOption(option =>
            option
                .setName("usuario")
                .setDescription("Persona a quien intentas robar.")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("top")
        .setDescription("Muestra las 10 mayores fortunas del servidor."),

    new SlashCommandBuilder()
        .setName("puente")
        .setDescription("Cruza el Puente de cristal por una entrada fija de $100."),

    new SlashCommandBuilder()
        .setName("expedicion")
        .setDescription("Explora rutas cada vez más arriesgadas y cobra antes de caer."),

    new SlashCommandBuilder()
        .setName("tienda")
        .setDescription("Consulta los objetos que puedes comprar con tu saldo."),

    new SlashCommandBuilder()
        .setName("comprar")
        .setDescription("Compra un objeto para mejorar tu economía.")
        .addStringOption(option =>
            option
                .setName("objeto")
                .setDescription("Objeto que quieres comprar.")
                .setRequired(true)
                .addChoices(
                    { name: "Kit de trabajo ($300)", value: "kit_trabajo" },
                    { name: "Pase de cristal ($500)", value: "pase_cristal" },
                    { name: "Madera ($20)", value: "madera" },
                    { name: "Palo ($12)", value: "palo" },
                    { name: "Piedra ($40)", value: "piedra" },
                    { name: "Lingote de hierro ($120)", value: "hierro" },
                    { name: "Diamante ($400)", value: "diamante" }
                )
        )
        .addIntegerOption(option =>
            option
                .setName("cantidad")
                .setDescription("Unidades a comprar (1 a 64).")
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(64)
        ),

    new SlashCommandBuilder()
        .setName("inventario")
        .setDescription("Consulta tus objetos y usos disponibles."),

    new SlashCommandBuilder()
        .setName("fabricar")
        .setDescription("Fabrica un pico con los materiales de tu inventario.")
        .addStringOption(option =>
            option
                .setName("pico")
                .setDescription("Herramienta que quieres fabricar.")
                .setRequired(true)
                .addChoices(
                    { name: "Pico de madera", value: "madera" },
                    { name: "Pico de piedra", value: "piedra" },
                    { name: "Pico de hierro", value: "hierro" },
                    { name: "Pico de diamante", value: "diamante" }
                )
        ),

    new SlashCommandBuilder()
        .setName("picar")
        .setDescription("Pica minerales con el pico que tengas equipado."),

    new SlashCommandBuilder()
        .setName("vender")
        .setDescription("Vende todos los minerales extraídos a cambio de pesos."),

    new SlashCommandBuilder()
        .setName("ajustarsaldo")
        .setDescription("Suma o resta pesos de la cartera de un usuario.")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addUserOption(option =>
            option
                .setName("usuario")
                .setDescription("Usuario cuya cartera se actualizará.")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName("cantidad")
                .setDescription("Cantidad positiva para sumar o negativa para restar.")
                .setRequired(true)
                .setMinValue(-1000000)
                .setMaxValue(1000000)
        ),

    new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Comprueba si el bot está funcionando."),

    new SlashCommandBuilder()
        .setName("contador")
        .setDescription("Configura el canal de conteo para este servidor.")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addChannelOption(option =>
            option
                .setName("canal")
                .setDescription("Canal donde la comunidad contará en orden.")
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
        ),

    new SlashCommandBuilder()
        .setName("anuncio")
        .setDescription("Publica un anuncio en un canal de este servidor.")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addChannelOption(option =>
            option
                .setName("canal")
                .setDescription("Canal donde se publicará el anuncio.")
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        )
        .addStringOption(option =>
            option
                .setName("mensaje")
                .setDescription("Contenido del anuncio.")
                .setRequired(true)
                .setMaxLength(1800)
        ),

    new SlashCommandBuilder()
        .setName("chiste")
        .setDescription("Cuenta un chiste aleatorio de iCloud."),

    new SlashCommandBuilder()
        .setName("moneda")
        .setDescription("Lanza una moneda virtual: cara o cruz."),

    new SlashCommandBuilder()
        .setName("dado")
        .setDescription("Lanza un dado con la cantidad de caras que elijas.")
        .addIntegerOption(option =>
            option
                .setName("caras")
                .setDescription("Número de caras del dado (2 a 100).")
                .setRequired(false)
                .setMinValue(2)
                .setMaxValue(100)
        ),

    new SlashCommandBuilder()
        .setName("avatar")
        .setDescription("Muestra el avatar de una persona.")
        .addUserOption(option =>
            option
                .setName("usuario")
                .setDescription("Persona cuyo avatar quieres ver; por defecto, tú.")
                .setRequired(false)
        ),

    new SlashCommandBuilder()
        .setName("servidor")
        .setDescription("Muestra información de este servidor."),

    new SlashCommandBuilder()
        .setName("help")
        .setDescription("Muestra los comandos del bot organizados por categorías."),

    new SlashCommandBuilder()
        .setName("sugerencia")
        .setDescription("Envía una sugerencia para mejorar iCloud.")
        .addStringOption(option =>
            option
                .setName("idea")
                .setDescription("Cuéntanos qué te gustaría mejorar o agregar.")
                .setRequired(true)
                .setMinLength(1)
                .setMaxLength(1500)
        ),

    new SlashCommandBuilder()
        .setName("gato")
        .setDescription("Juega tres en raya contra el bot o contra otra persona.")
        .addUserOption(option =>
            option
                .setName("oponente")
                .setDescription("Persona contra la que quieres jugar; vacío para jugar contra el bot.")
                .setRequired(false)
        ),

    new SlashCommandBuilder()
        .setName("akinator")
        .setDescription("Piensa en alguien o algo y responde hasta que Akinator adivine."),

    new SlashCommandBuilder()
        .setName("misterio")
        .setDescription("Investiga un caso, reúne pistas y descubre quién fue."),

    new SlashCommandBuilder()
        .setName("chatstats")
        .setDescription("Activa o desactiva niveles y estadísticas del chat en este servidor.")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addBooleanOption(option =>
            option
                .setName("activado")
                .setDescription("Elige si quieres registrar mensajes y experiencia.")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("automod")
        .setDescription("Activa o desactiva el filtro automático del servidor.")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addBooleanOption(option =>
            option
                .setName("activado")
                .setDescription("Filtra spam, invitaciones de Discord y exceso de menciones.")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("nivel")
        .setDescription("Consulta tu nivel de chat o el de otra persona.")
        .addUserOption(option =>
            option
                .setName("usuario")
                .setDescription("Persona cuyo nivel quieres consultar.")
                .setRequired(false)
        ),

    new SlashCommandBuilder()
        .setName("topchat")
        .setDescription("Muestra quién ha escrito más en este servidor."),

    new SlashCommandBuilder()
        .setName("topniveles")
        .setDescription("Muestra el ranking de niveles de este servidor."),

    new SlashCommandBuilder()
        .setName("reto")
        .setDescription("Recibe un reto creativo del bot y cámbialo con un botón."),

    new SlashCommandBuilder()
        .setName("oraculo")
        .setDescription("Consulta al oráculo caótico de iCloud.")
        .addStringOption(option =>
            option
                .setName("pregunta")
                .setDescription("Pregunta de sí o no para el oráculo.")
                .setRequired(true)
                .setMaxLength(300)
        ),

    new SlashCommandBuilder()
        .setName("superpoder")
        .setDescription("Descubre tu superpoder inútil y su ridículo efecto secundario."),

    new SlashCommandBuilder()
        .setName("excusa")
        .setDescription("Genera una excusa completamente absurda."),

    new SlashCommandBuilder()
        .setName("villano")
        .setDescription("Crea tu identidad de villano, plan maestro y punto débil."),

    new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Elimina mensajes.")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages)
        .addIntegerOption(option =>
            option
                .setName("cantidad")
                .setDescription("Cantidad de mensajes a eliminar")
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)
        ),

    new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Expulsa a un usuario.")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.KickMembers)
        .addUserOption(option =>
            option
                .setName("usuario")
                .setDescription("Usuario que será expulsado")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("razon")
                .setDescription("Razón de la expulsión")
                .setRequired(false)
        ),

    new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Banea a un usuario.")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers)
        .addUserOption(option =>
            option
                .setName("usuario")
                .setDescription("Usuario que será baneado")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("razon")
                .setDescription("Razón del ban")
                .setRequired(false)
        ),

    new SlashCommandBuilder()
        .setName("timeout")
        .setDescription("Aplica timeout a un usuario.")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers)
        .addUserOption(option =>
            option
                .setName("usuario")
                .setDescription("Usuario")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName("minutos")
                .setDescription("Duración en minutos")
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(1440)
        )
        .addStringOption(option =>
            option
                .setName("razon")
                .setDescription("Razón")
                .setRequired(false)
        ),

    new SlashCommandBuilder()
        .setName("darrol")
        .setDescription("Asigna un rol a una persona, opcionalmente por tiempo.")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addUserOption(option =>
            option
                .setName("usuario")
                .setDescription("Persona que recibirá el rol.")
                .setRequired(true)
        )
        .addRoleOption(option =>
            option
                .setName("rol")
                .setDescription("Rol que se asignará.")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName("minutos")
                .setDescription("Duración en minutos; omítelo para asignar el rol permanentemente.")
                .setRequired(false)
                .setMinValue(1)
        ),

    new SlashCommandBuilder()
        .setName("conectar")
        .setDescription("Conecta un canal de este servidor al chat comunitario.")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addChannelOption(option =>
            option
                .setName("canal")
                .setDescription("Canal de texto que se conectará al chat comunitario.")
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        ),

    new SlashCommandBuilder()
        .setName("presentacion")
        .setDescription("Publica la presentación de iCloud con sus comandos destacados.")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)

].map(command => command.toJSON());

// ===============================
// REGISTRAR COMANDOS
// ===============================

const rest = new REST({ version: "10" }).setToken(TOKEN);
let presentationPublishing = false;

async function registerCommands() {

    try {

        console.log("Registrando comandos...");

        const commandScopes = [
            {
                listRoute: Routes.applicationCommands(client.user.id),
                deleteRoute: commandId =>
                    Routes.applicationCommand(client.user.id, commandId)
            },
            ...[...client.guilds.cache.values()].map(guild => ({
                listRoute: Routes.applicationGuildCommands(
                    client.user.id,
                    guild.id
                ),
                deleteRoute: commandId =>
                    Routes.applicationGuildCommand(
                        client.user.id,
                        guild.id,
                        commandId
                    )
            }))
        ];

        for (const scope of commandScopes) {
            const registeredCommands = await rest.get(scope.listRoute);

            for (const command of registeredCommands) {
                if (!["8ball", "ppt", "personajes483", "gifrespuestas"].includes(command.name)) continue;

                await rest.delete(scope.deleteRoute(command.id));
                console.log(`Comando obsoleto /${command.name} eliminado (${command.id}).`);
            }
        }

        for (const guild of client.guilds.cache.values()) {

            await rest.put(
                Routes.applicationGuildCommands(
                    client.user.id,
                    guild.id
                ),
                {
                    body: commands
                }
            );

        }

        console.log("Comandos registrados.");

    } catch (error) {

        console.error(error);

    }

}

function scheduleFunnyMessage() {

    const delay = Math.floor(
        Math.random() * (MAX_FUNNY_MESSAGE_DELAY - MIN_FUNNY_MESSAGE_DELAY + 1)
    ) + MIN_FUNNY_MESSAGE_DELAY;

    setTimeout(async () => {

        try {

            const channel = await client.channels.fetch(CHAT_CHANNEL_ID);

            if (!channel?.isTextBased()) {
                throw new Error("El canal configurado no existe o no admite mensajes.");
            }

            const phrase = FUNNY_MESSAGES[
                Math.floor(Math.random() * FUNNY_MESSAGES.length)
            ];

            await channel.send({
                content: `<@&${FUNNY_ROLE_ID}> ${phrase}`,
                allowedMentions: {
                    parse: [],
                    roles: [FUNNY_ROLE_ID]
                }
            });

        } catch (error) {

            console.error("No pude enviar el mensaje automático:", error);

        } finally {

            scheduleFunnyMessage();

        }

    }, delay);

}

const HELP_PAGES = [
    {
        title: "✨ Bienvenido a iCloud",
        description: [
            "Soy **iCloud**, tu compañero para juegos, entretenimiento y comunidad en Discord. Usa los botones de abajo para elegir qué quieres hacer:",
            "💰 **Economía** · gana y administra tus pesos.",
            "🎮 **Juegos** · juega, resuelve misterios y prueba retos.",
            "🛡️ **Moderación** · herramientas para el equipo del servidor.",
            "🌐 **Comunidad** · crea alianzas entre servidores y envía sugerencias.",
            "¡Elige una categoría para descubrir sus comandos!"
        ].join("\n\n"),
        image: BOT_PRESENTATION_IMAGE_URL
    },
    {
        title: "💰 Economía · Pesos mexicanos",
        description: [
            "`/saldo [usuario]` Consulta tu cartera. Las cuentas nuevas empiezan con $1,000 MXN.",
            "`/trabajar` Cobra por un empleo aleatorio. Tiene 1 hora de espera; el kit aumenta tus ganancias durante tres turnos.",
            "`/ruleta apuesta color` Apuesta al rojo, negro o verde; verde paga 14x.",
            "`/apostar apuesta lado` Juega cara o cruz; acertar devuelve 2x.",
            "`/robar usuario` Tienes 40% de éxito; si fallas, pagas una multa. Espera 3 horas entre intentos.",
            "`/top` Mira las 10 mayores fortunas de este servidor.",
            "`/puente` Paga $100 para cruzar ocho tramos; cada acierto aumenta el cobro en $100. Puedes finalizar cuando quieras; caer sin pase hace perder la entrada.",
            "`/expedicion` Elige entre rutas seguras o peligrosas en cinco zonas; regresa para cobrar tu entrada y el botín acumulado.",
            "`/tienda` Consulta mejoras y materiales para minar: madera, palos, piedra, hierro y diamantes.",
            "`/comprar objeto [cantidad]` Compra mejoras o materiales para fabricar picos.",
            "`/fabricar pico` Usa materiales para fabricar un pico de madera, piedra, hierro o diamante.",
            "`/picar` Gasta un uso de tu pico para extraer minerales; los picos mejores encuentran minerales de mayor valor.",
            "`/vender` Convierte todos tus minerales en pesos.",
            "`/inventario` Consulta tus mejoras, materiales, minerales y la durabilidad del pico.",
            "`/ajustarsaldo usuario cantidad` Suma o resta saldo a un usuario. Solo administradores."
        ].join("\n\n")
    },
    {
        title: "🎮 Juegos y utilidades",
        description: [
            "`/gato [oponente]` Juega tres en raya contra el bot o una persona.",
            "`/akinator` Piensa en alguien o algo y responde hasta que Akinator adivine.",
            "`/misterio` Investiga un caso y gana $300 al resolverlo correctamente; hay un tiempo de espera de una hora entre premios.",
            "`/oraculo pregunta` Pregúntale al oráculo caótico de iCloud.",
            "`/reto` Recibe un reto creativo y pide otro con el botón.",
            "`/superpoder` Descubre un poder absurdo con un efecto secundario peor.",
            "`/excusa` Consigue una excusa disparatada para cualquier situación.",
            "`/villano` Genera tu nombre, plan maestro y debilidad secreta.",
            "`/chiste` Cuenta uno de más de veinte chistes aleatorios.",
            "`/moneda` Lanza una moneda virtual.",
            "`/dado [caras]` Lanza un dado de 2 a 100 caras.",
            "`/avatar [usuario]` Muestra el avatar de una persona.",
            "`/servidor` Muestra información de este servidor.",
            "`/nivel [usuario]` Consulta el nivel y progreso de chat en este servidor.",
            "`/topniveles` Mira el ranking de niveles de este servidor.",
            "`/topchat` Mira quién ha escrito más en este servidor.",
            "`/ping` Comprueba la latencia del bot.",
            "`/help` Abre esta guía."
        ].join("\n\n")
    },
    {
        title: "🛡️ Moderación",
        description: [
            "Estos comandos requieren permisos de Discord. Los administradores también tienen acceso.",
            "`/clear cantidad` Elimina de 1 a 100 mensajes. Requiere Gestionar mensajes.",
            "`/kick usuario [razon]` Expulsa a una persona. Requiere Expulsar miembros.",
            "`/ban usuario [razon]` Banea a una persona. Requiere Banear miembros.",
            "`/timeout usuario minutos [razon]` Aplica un timeout. Requiere Moderar miembros.",
            "`/automod activado` Filtra spam, invitaciones de Discord y más de 5 menciones; borra el mensaje y avisa, sin timeout ni ban. Requiere que el bot pueda gestionar mensajes. Solo administradores.",
        ].join("\n\n")
    },
    {
        title: "🌐 Comunidad y configuración",
        description: [
            "`/conectar canal` Enlaza el canal elegido con los demás canales conectados de otros servidores. Un administrador de cada servidor debe configurarlo; los mensajes se comparten entre todos.",
            "`/sugerencia idea` Envía una idea al equipo de iCloud para que la revise.",
            "`/anuncio canal mensaje` Publica un anuncio en un canal de este servidor. Solo administradores.",
            "`/contador canal` Configura un canal para contar números en orden. Solo administradores.",
            "`/chatstats activado` Activa o desactiva niveles y estadísticas del chat. Solo administradores.",
            "`/darrol usuario rol [minutos]` Asigna un rol; sin minutos es permanente. Solo administradores.",
            "`/presentacion` Publica la presentación de iCloud en su canal configurado. Solo administradores."
        ].join("\n\n")
    }
];

function createHelpEmbed(pageIndex) {

    const page = HELP_PAGES[pageIndex];

    const embed = new EmbedBuilder()
        .setColor(0x7656d6)
        .setAuthor({
            name: "iCloud · Centro de ayuda",
            iconURL: client.user.displayAvatarURL()
        })
        .setTitle(page.title)
        .setDescription(`${page.description}\n\nSelecciona una categoría con los botones para explorar los comandos.`)
        .setFooter({ text: `Categoría ${pageIndex + 1} de ${HELP_PAGES.length} · Esta guía está disponible cuando la necesites` });

    if (page.image) {
        embed.setImage(page.image);
    }

    return embed;

}

function createHelpButtons(pageIndex, interactionId, disabled = false) {

    return [
        new ActionRowBuilder().addComponents(
            ...HELP_PAGES.map((page, index) =>
                new ButtonBuilder()
                    .setCustomId(`help-${interactionId}-category-${index}`)
                    .setLabel(page.title)
                    .setStyle(index === pageIndex ? ButtonStyle.Primary : ButtonStyle.Secondary)
                    .setDisabled(disabled)
            )
        )
    ];

}

// ===============================
// BOT ENCENDIDO
// ===============================

client.once("ready", async () => {

    console.log("--------------------------------");
    console.log(`Bot conectado como ${client.user.tag}`);
    console.log(`Servidores: ${client.guilds.cache.size}`);
    console.log("--------------------------------");

    updateBotPresence();
    scheduleSavedRoleExpirations();

    scheduleFunnyMessage();
    await registerCommands();

});

function updateBotPresence() {
    const totalUsers = client.guilds.cache.reduce(
        (total, guild) => total + guild.memberCount,
        0
    );

    client.user.setPresence({
        activities: [
            {
                name: "Soyja_20 en directo",
                type: ActivityType.Streaming,
                url: TWITCH_STREAM_URL
            },
            {
                name: "Custom Status",
                state: `${totalUsers.toLocaleString("es-MX")} usuarios en total`,
                type: ActivityType.Custom
            }
        ],
        status: "online"
    });
}

client.on("guildMemberAdd", updateBotPresence);
client.on("guildMemberRemove", updateBotPresence);
client.on("guildCreate", updateBotPresence);
client.on("guildDelete", updateBotPresence);

function createGuildWelcomeEmbed(guild) {

    return new EmbedBuilder()
        .setColor(0x7656d6)
        .setTitle("✨ ¡Gracias por invitar a iCloud! ✨")
        .setDescription(
            `¡Hola, **${guild.name}**! Estoy listo para traer juegos y diversión a esta comunidad.\n\n` +
            "Usa **/help** para ver mi presentación y elige con los botones la categoría de comandos que quieras explorar."
        )
        .addFields(
            {
                name: "🌐 Alianzas entre servidores",
                value: "Un administrador puede usar `/conectar canal` para enlazar un canal y compartir mensajes con los demás servidores conectados."
            },
            {
                name: "💡 Envía tus ideas",
                value: "Usa `/sugerencia idea` para mandar una sugerencia directamente al equipo de iCloud."
            }
        )
        .setImage(BOT_PRESENTATION_IMAGE_URL)
        .setFooter({ text: "iCloud · Diversión para toda la comunidad" });
}

async function logGuildJoin(guild) {

    const channel = await client.channels.fetch(COMMAND_LOG_CHANNEL_ID);
    if (!channel?.isTextBased() || typeof channel.send !== "function") {
        throw new Error("El canal configurado para logs no admite mensajes.");
    }

    const embed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle("➕ iCloud se unió a un servidor")
        .setDescription(`**${guild.name}**`)
        .addFields(
            {
                name: "Servidor",
                value: `\`${guild.id}\``,
                inline: true
            },
            {
                name: "Miembros",
                value: `${guild.memberCount.toLocaleString("es-MX")}`,
                inline: true
            },
            {
                name: "Propietario",
                value: guild.ownerId ? `<@${guild.ownerId}>` : "No disponible",
                inline: true
            }
        )
        .setTimestamp();
    const icon = guild.iconURL({ size: 256 });

    if (icon) embed.setThumbnail(icon);

    await channel.send({
        embeds: [embed],
        allowedMentions: { parse: [] }
    });
}

client.on("guildCreate", async guild => {

    if (!client.isReady()) return;

    try {
        await rest.put(
            Routes.applicationGuildCommands(client.user.id, guild.id),
            { body: commands }
        );
    } catch (error) {
        console.error(`No pude registrar comandos en el nuevo servidor ${guild.name}:`, error);
    }

    try {
        await logGuildJoin(guild);
    } catch (error) {
        console.error(`No pude registrar la entrada al servidor ${guild.name} en logs:`, error);
    }

    try {
        const botMember = await guild.members.fetchMe();
        const candidateChannels = [
            guild.systemChannel,
            ...guild.channels.cache
                .filter(channel =>
                    channel.type === ChannelType.GuildText
                    || channel.type === ChannelType.GuildAnnouncement
                )
                .sort((first, second) => first.rawPosition - second.rawPosition)
                .values()
        ].filter(Boolean);
        const welcomeChannel = candidateChannels.find(channel =>
            channel.isTextBased()
            && channel.permissionsFor(botMember)?.has([
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.EmbedLinks
            ])
        );

        if (!welcomeChannel) {
            console.warn(`No encontré un canal donde dar la bienvenida en ${guild.name}.`);
            return;
        }

        await welcomeChannel.send({
            embeds: [createGuildWelcomeEmbed(guild)],
            allowedMentions: { parse: [] }
        });
    } catch (error) {
        console.error(`No pude dar la bienvenida a ${guild.name}:`, error);
    }

});

client.on("guildMemberAdd", async member => {

    if (member.user.bot || member.guild.id !== PERSONALITY_GUILD_ID) return;

    try {

        const channel = await client.channels.fetch(CHAT_CHANNEL_ID);

        if (!channel?.isTextBased() || channel.guildId !== member.guild.id) {
            throw new Error("El canal de bienvenida no pertenece al servidor configurado.");
        }

        await channel.send({
            content: pickRandomMessage(WELCOME_MESSAGES)(
                member.id,
                pickRandomMessage(WELCOME_EMOJIS)
            ),
            allowedMentions: {
                parse: [],
                users: [member.id]
            }
        });

    } catch (error) {

        console.error("No pude enviar el mensaje de bienvenida:", error);

    }

});

async function handleCounterSetupCommand(interaction) {

    if (interaction.commandName !== "contador") return false;

    if (!interaction.guild) {
        await interaction.reply({
            content: "❌ Este comando solo se puede usar dentro de un servidor.",
            ephemeral: true
        });
        return true;
    }

    if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
        await interaction.reply({
            content: "❌ Solo los administradores pueden configurar el contador.",
            ephemeral: true
        });
        return true;
    }

    const selectedChannel = interaction.options.getChannel("canal", true);
    try {
        const botMember = await interaction.guild.members.fetchMe();
        if (!botMember.permissionsIn(selectedChannel).has([
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages
        ])) {
            return interaction.reply({
                content: "❌ Necesito permisos para ver y enviar mensajes en el canal seleccionado.",
                ephemeral: true
            });
        }

        const settings = getGuildSettings(interaction.guild.id);
        const previousCounter = { ...settings.counter };
        settings.counter = {
            channelId: selectedChannel.id,
            value: 0
        };

        try {
            saveGuildSettings();
        } catch (error) {
            settings.counter = previousCounter;
            throw error;
        }

        return interaction.reply({
            content: `✅ ${selectedChannel} quedó configurado para contar. La siguiente cuenta es **1**; escribe un número por mensaje.`,
            ephemeral: true
        });
    } catch (error) {
        console.error(`No pude configurar el contador en ${interaction.guild.name}:`, error);
        if (interaction.replied || interaction.deferred) {
            return interaction.followUp({
                content: "❌ No pude configurar el contador. Revisa los permisos y vuelve a intentarlo.",
                ephemeral: true
            });
        }
        return interaction.reply({
            content: "❌ No pude configurar el contador. Revisa los permisos y vuelve a intentarlo.",
            ephemeral: true
        });
    }

}

async function handleCounterMessage(message) {

    const settings = getGuildSettings(message.guild.id);
    const counter = settings.counter;
    if (!counter.channelId || message.channel.id !== counter.channelId) return false;

    const countText = message.content.trim();
    if (!/^\d+$/.test(countText)) return false;

    const submittedCount = Number(countText);
    const expectedCount = counter.value + 1;
    if (!Number.isSafeInteger(submittedCount) || submittedCount !== expectedCount) {
        try {
            await message.reply({
                content: `🔢 El contador sigue en **${counter.value}**. A la comunidad le toca escribir **${expectedCount}**.`,
                allowedMentions: { parse: [] }
            });
        } catch (error) {
            console.error(`No pude indicar el número esperado en ${message.guild.name}:`, error);
        }
        return true;
    }

    const previousValue = counter.value;
    counter.value = submittedCount;

    try {
        saveGuildSettings();
    } catch (error) {
        counter.value = previousValue;
        console.error(`No pude guardar el contador del servidor ${message.guild.name}:`, error);
        try {
            await message.reply({
                content: "❌ No pude guardar este número. Inténtalo de nuevo en un momento.",
                allowedMentions: { parse: [] }
            });
        } catch (replyError) {
            console.error("No pude notificar que el contador no se guardó:", replyError);
        }
        return true;
    }

    try {
        await message.react("✅");
    } catch (error) {
        console.error("No pude reaccionar al número correcto del contador:", error);
    }

    return true;

}

function detectAutomodViolation(message, settings) {

    const invitePattern = /(?:https?:\/\/)?(?:www\.)?(?:discord\.gg|discord(?:app)?\.com\/invite)\/[A-Za-z0-9-]+/i;
    if (invitePattern.test(message.content)) {
        return "No se permiten invitaciones a servidores de Discord.";
    }

    const mentionCount = message.mentions.users.size + message.mentions.roles.size;
    if (message.mentions.everyone || mentionCount > 5) {
        return "El mensaje excede el límite de menciones permitido (5).";
    }

    if (settings.counter.channelId !== message.channel.id) {
        const key = `${message.guild.id}:${message.author.id}`;
        const now = Date.now();
        const timestamps = (automodMessageTimestamps.get(key) || [])
            .filter(timestamp => now - timestamp < AUTOMOD_SPAM_WINDOW_MS);
        timestamps.push(now);
        automodMessageTimestamps.set(key, timestamps);

        if (automodMessageTimestamps.size > 5000) {
            for (const [userKey, userTimestamps] of automodMessageTimestamps) {
                if (!userTimestamps.length || now - userTimestamps.at(-1) >= AUTOMOD_SPAM_WINDOW_MS) {
                    automodMessageTimestamps.delete(userKey);
                }
            }
        }

        if (timestamps.length > AUTOMOD_SPAM_MESSAGE_LIMIT) {
            automodMessageTimestamps.delete(key);
            return `Se detectaron más de ${AUTOMOD_SPAM_MESSAGE_LIMIT} mensajes en ${AUTOMOD_SPAM_WINDOW_MS / 1000} segundos.`;
        }
    }

    return null;

}

async function handleAutomodMessage(message) {

    const settings = getGuildSettings(message.guild.id);
    if (!settings.automodEnabled || message.member?.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return false;
    }

    const violation = detectAutomodViolation(message, settings);
    if (!violation) return false;

    let messageDeleted = false;
    try {
        await message.delete();
        messageDeleted = true;
    } catch (error) {
        console.error(`No pude borrar un mensaje filtrado en ${message.guild.name}:`, error);
    }

    const key = `${message.guild.id}:${message.author.id}`;
    const now = Date.now();
    const lastWarningAt = automodLastWarningAt.get(key) || 0;
    if (now - lastWarningAt >= AUTOMOD_WARNING_COOLDOWN_MS) {
        automodLastWarningAt.set(key, now);

        if (automodLastWarningAt.size > 5000) {
            for (const [userKey, warningAt] of automodLastWarningAt) {
                if (now - warningAt >= AUTOMOD_WARNING_COOLDOWN_MS) {
                    automodLastWarningAt.delete(userKey);
                }
            }
        }

        try {
            const warning = await message.channel.send({
                content: messageDeleted
                    ? `⚠️ <@${message.author.id}> tu mensaje fue eliminado: ${violation}`
                    : `⚠️ <@${message.author.id}> detecté un mensaje que incumple las reglas automáticas, pero no pude borrarlo. Pide ayuda a un moderador. Motivo: ${violation}`,
                allowedMentions: { parse: [], users: [message.author.id] }
            });
            setTimeout(() => {
                void warning.delete().catch(error => {
                    console.error("No pude borrar el aviso temporal del automod:", error);
                });
            }, 7000).unref();
        } catch (error) {
            console.error(`No pude avisar al autor de un mensaje filtrado en ${message.guild.name}:`, error);
        }
    }

    return true;

}

client.on("messageCreate", async message => {

    // Ignorar bots
    if (message.author.bot) return;

    // Ignorar mensajes privados
    if (!message.guild) return;

    if (await handleAutomodMessage(message)) return;

    if (await handleCounterMessage(message)) return;

    const botReplyType = message.guild.id === PERSONALITY_GUILD_ID
        && message.channel.id === CHAT_CHANNEL_ID
        ? getBotReplyType(message)
        : null;

    if (botReplyType) {
        try {

            await relayCommunityMessage(message);
            await message.channel.sendTyping();
            await new Promise(resolve => setTimeout(resolve, BOT_REPLY_DELAY));
            if (botReplyType === "gif") {
                const gifUrl = pickRandomMessage(BOT_REPLY_GIF_URLS);
                const replyEmoji = pickRandomMessage(BOT_GIF_REPLY_EMOJIS);
                await message.channel.send(`${replyEmoji} ${pickRandomMessage(BOT_REPLY_MESSAGES)}\n${gifUrl}`);
            } else {
                await message.channel.send(
                    pickRandomMessage(BOT_MENTION_MESSAGES)
                );

                try {
                    await message.react("<:sunglas:1531564951049732107>");
                } catch (error) {
                    console.error("No pude reaccionar al mensaje que menciona al bot:", error);
                }
            }

        } catch (error) {

            console.error("No pude responder al mensaje contra el bot:", error);

        }

        recordChatMessage(message);
        return;
    }

    recordChatMessage(message);
    await relayCommunityMessage(message);

});

// ===============================
// SLASH COMMANDS
// ===============================

function rankAkinatorCharacters(answers, characters = AKINATOR_CHARACTERS) {

    const answerScores = {
        yes: [-2, 2],
        no: [2, -2],
        probably: [-1, 1],
        probably_not: [1, -1]
    };
    const ranked = characters.map(character => ({
        character,
        score: [...answers].reduce((score, [trait, answer]) => {
            const scores = answerScores[answer];
            if (!scores) return score;

            const factProperty = trait.startsWith("wd:")
                ? trait.split(":", 3)[1]
                : null;
            if (
                factProperty
                && !character.knownFactProperties?.has(factProperty)
            ) return score;

            return score + scores[Number(character.traits.includes(trait))];
        }, 0)
    }));
    const bestScore = Math.max(...ranked.map(candidate => candidate.score));

    return ranked
        .filter(candidate => candidate.score >= bestScore - 2)
        .map(candidate => candidate.character);
}

function chooseAkinatorQuestion(
    candidates,
    askedQuestions,
    additionalQuestions = []
) {

    const availableQuestions = [
        ...AKINATOR_QUESTIONS,
        ...additionalQuestions
    ].filter(
        question => !askedQuestions.has(question.trait)
            && (
                !["male", "female"].includes(question.trait)
                || candidates.every(character =>
                    character.traits.includes("male")
                    || character.traits.includes("female")
                )
            )
    );
    const scoredQuestions = [];

    for (const question of availableQuestions) {
        const relevantCandidates = question.factProperty
            ? candidates.filter(character =>
                character.knownFactProperties?.has(question.factProperty)
            )
            : candidates;
        const yesCount = relevantCandidates.filter(
            character => character.traits.includes(question.trait)
        ).length;

        if (
            yesCount === 0
            || yesCount === relevantCandidates.length
            || relevantCandidates.length < 2
        ) continue;

        const yesProbability = yesCount / relevantCandidates.length;
        const noProbability = 1 - yesProbability;
        const entropy = -(
            yesProbability * Math.log2(yesProbability)
            + noProbability * Math.log2(noProbability)
        );
        const informationGain = entropy
            * (relevantCandidates.length / candidates.length);

        scoredQuestions.push({ question, informationGain });
    }

    if (scoredQuestions.length === 0) return null;

    const bestInformationGain = Math.max(
        ...scoredQuestions.map(candidate => candidate.informationGain)
    );
    const variedQuestions = scoredQuestions
        .filter(candidate =>
            bestInformationGain - candidate.informationGain <= 0.04
        )
        .map(candidate => candidate.question);

    return pickRandomMessage(variedQuestions);
}

function recordAkinatorAnswer(state, trait, answer) {

    const oppositeTraits = {
        male: "female",
        female: "male"
    };
    const oppositeTrait = oppositeTraits[trait];

    state.askedQuestions.add(trait);
    state.answers.set(trait, answer);

    if (
        oppositeTrait
        && ["yes", "probably"].includes(answer)
        && !state.answers.has(oppositeTrait)
    ) {
        state.askedQuestions.add(oppositeTrait);
        state.answers.set(
            oppositeTrait,
            answer === "yes" ? "no" : "probably_not"
        );
    }

}

function createAkinatorButtons(
    gameId,
    disabled = false,
    canGoBack = false,
    result = false,
    finished = false
) {

    return [
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`akinator-${gameId}-yes`)
                .setLabel("Sí")
                .setStyle(ButtonStyle.Success)
                .setDisabled(disabled),
            new ButtonBuilder()
                .setCustomId(`akinator-${gameId}-no`)
                .setLabel("No")
                .setStyle(ButtonStyle.Danger)
                .setDisabled(disabled),
            new ButtonBuilder()
                .setCustomId(`akinator-${gameId}-probably`)
                .setLabel("Probablemente")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(disabled),
            new ButtonBuilder()
                .setCustomId(`akinator-${gameId}-probably_not`)
                .setLabel("Probablemente no")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(disabled),
            new ButtonBuilder()
                .setCustomId(`akinator-${gameId}-unknown`)
                .setLabel("No sé")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(disabled)
        ),
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`akinator-${gameId}-back`)
                .setLabel("← Retroceder")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(!canGoBack),
            new ButtonBuilder()
                .setCustomId(`akinator-${gameId}-restart`)
                .setLabel("Volver a jugar")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(!result),
            new ButtonBuilder()
                .setCustomId(`akinator-${gameId}-finish`)
                .setLabel("Finalizar")
                .setStyle(ButtonStyle.Danger)
                .setDisabled(finished)
        )
    ];
}

function createAkinatorThinkingEmbed() {

    return new EmbedBuilder()
        .setColor(0x7d3c98)
        .setTitle("🔮 Piensa en algo")
        .setDescription(
            `Elige en tu mente una opción de las categorías disponibles. Empezamos en **${AKINATOR_THINKING_TIME / 1000} segundos**.`
        )
        .setFooter({
            text: "La partida está por comenzar."
        });
}

function createAkinatorFinishedEmbed() {

    return new EmbedBuilder()
        .setColor(0x7d3c98)
        .setTitle("🔮 Partida finalizada")
        .setDescription("Gracias por jugar Akinator. Cuando quieras, inicia otra partida con `/akinator`.");
}

function createAkinatorQuestionEmbed(
    question,
    candidates,
    askedCount,
    wikidataUnavailable = false
) {

    const categoryCounts = candidates.reduce((counts, character) => {
        counts.set(character.category, (counts.get(character.category) || 0) + 1);
        return counts;
    }, new Map());
    const likelyCategories = [...categoryCounts]
        .sort((first, second) => second[1] - first[1])
        .slice(0, 3)
        .map(([category, count]) => `${category}: ${count}`)
        .join("\n");

    return new EmbedBuilder()
        .setColor(0x7d3c98)
        .setTitle(`🔮 Akinator · Pregunta ${askedCount + 1}`)
        .setDescription(question.text)
        .addFields({
            name: "Opciones posibles",
            value: `${candidates.length}`,
            inline: true
        }, {
            name: "Categorías probables",
            value: likelyCategories || "Varias",
            inline: true
        }, {
            name: "Respuestas",
            value: "Sí · No · Probablemente · Probablemente no · No sé"
        })
        .setFooter({
            text: wikidataUnavailable
                ? `Base local: ${AKINATOR_CHARACTERS.length} opciones · Wikidata no disponible; usando datos locales`
                : `Base local: ${AKINATOR_CHARACTERS.length} opciones · Preguntas sin límite`
        });
}

async function fetchAkinatorCharacterImage(character) {

    let lastError;

    for (const language of ["es", "en"]) {
        try {
            const response = await fetch(
                `https://${language}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(character.wiki)}`,
                {
                    headers: {
                        Accept: "application/json",
                        "User-Agent": "SoymrDiscordBot/1.0"
                    },
                    signal: AbortSignal.timeout(5000)
                }
            );

            if (!response.ok) {
                throw new Error(`Wikipedia respondió con HTTP ${response.status}.`);
            }

            const summary = await response.json();
            const originalImage = summary.originalimage?.source;
            const thumbnail = summary.thumbnail?.source;
            const imageUrl = originalImage?.toLowerCase().endsWith(".svg")
                ? thumbnail
                : originalImage || thumbnail;

            if (imageUrl) return imageUrl;

            lastError = new Error(`Wikipedia no proporcionó una imagen para ${character.name} (${language}).`);
        } catch (error) {
            lastError = error;
        }
    }

    console.error(`No pude obtener la imagen de ${character.name}:`, lastError);
    return null;
}

function createAkinatorResultEmbed(character, questionCount, imageUrl) {

    const embed = new EmbedBuilder()
        .setColor(0x7d3c98)
        .setTitle("🔮 ¡Lo adiviné!")
        .setDescription(`Estabas pensando en **${character.name}**.\n**Categoría:** ${character.category || "personaje ficticio"}`)
        .setFooter({ text: `Lo adiviné en ${questionCount} preguntas.` });

    if (imageUrl) embed.setImage(imageUrl);

    return embed;
}

function createTicTacToeRows(board, gameId, disabled = false) {

    return Array.from({ length: 3 }, (_, rowIndex) => {

        const row = new ActionRowBuilder();

        for (let columnIndex = 0; columnIndex < 3; columnIndex++) {

            const index = rowIndex * 3 + columnIndex;
            const mark = board[index];

            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`gato-${gameId}-${index}`)
                    .setLabel(mark || "·")
                    .setStyle(
                        mark === "X"
                            ? ButtonStyle.Primary
                            : mark === "O"
                                ? ButtonStyle.Danger
                                : ButtonStyle.Secondary
                    )
                    .setDisabled(disabled || Boolean(mark))
            );

        }

        return row;

    });

}

function createTicTacToeRematchRow(gameId, disabled = false) {

    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`gato-${gameId}-rematch`)
            .setLabel("Revancha")
            .setStyle(ButtonStyle.Success)
            .setDisabled(disabled)
    );

}

function getTicTacToeWinner(board) {

    const winningLines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (const [first, second, third] of winningLines) {

        if (
            board[first] &&
            board[first] === board[second] &&
            board[first] === board[third]
        ) {
            return board[first];
        }

    }

    return null;

}

function scoreTicTacToe(board, botTurn, depth = 0) {

    const winner = getTicTacToeWinner(board);

    if (winner === "O") return 10 - depth;
    if (winner === "X") return depth - 10;
    if (board.every(Boolean)) return 0;

    let bestScore = botTurn ? -Infinity : Infinity;
    const mark = botTurn ? "O" : "X";

    for (let index = 0; index < board.length; index++) {

        if (board[index]) continue;

        board[index] = mark;
        const score = scoreTicTacToe(board, !botTurn, depth + 1);
        board[index] = null;
        bestScore = botTurn
            ? Math.max(bestScore, score)
            : Math.min(bestScore, score);

    }

    return bestScore;

}

function findTicTacToeBotMove(board) {

    let bestMove = null;
    let bestScore = -Infinity;

    for (let index = 0; index < board.length; index++) {

        if (board[index]) continue;

        board[index] = "O";
        const score = scoreTicTacToe(board, false, 0);
        board[index] = null;

        if (score > bestScore) {
            bestScore = score;
            bestMove = index;
        }

    }

    return bestMove;

}

function formatCommandOption(option) {

    if (option.options?.length) {
        return option.options.map(formatCommandOption).join("\n");
    }

    const value = option.user?.tag
        || option.role?.name
        || option.channel?.name
        || option.value;

    return `• ${option.name}: ${value ?? "—"}`;
}

async function handleConnectChannelCommand(interaction) {

    if (interaction.commandName !== "conectar") return false;

    if (!interaction.guild) {
        await interaction.reply({
            content: "❌ Este comando solo se puede usar en un servidor.",
            ephemeral: true
        });
        return true;
    }

    if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
        await interaction.reply({
            content: "❌ Solo los administradores pueden conectar un canal.",
            ephemeral: true
        });
        return true;
    }

    await interaction.deferReply({ ephemeral: true });

    try {
        const guild = interaction.guild;
        const selectedChannel = interaction.options.getChannel("canal", true);

        if (selectedChannel.guildId !== guild.id) {
            return interaction.editReply("❌ El canal seleccionado debe pertenecer a este servidor.");
        }

        if (selectedChannel.id === COMMUNITY_CHANNEL_ID) {
            return interaction.editReply("❌ Ese es el canal principal; elige un canal de este servidor.");
        }

        const [botMember, mainChannel] = await Promise.all([
            guild.members.fetchMe(),
            client.channels.fetch(COMMUNITY_CHANNEL_ID)
        ]);

        const localPermissions = selectedChannel.permissionsFor(botMember);
        if (
            !selectedChannel.isTextBased()
            || !localPermissions?.has([
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages
            ])
        ) {
            return interaction.editReply(
                "❌ Necesito permisos para ver y enviar mensajes en el canal seleccionado."
            );
        }

        if (
            !mainChannel?.isTextBased()
            || !("send" in mainChannel)
        ) {
            throw new Error("El canal principal no existe o no admite mensajes.");
        }

        const mainGuild = await client.guilds.fetch(mainChannel.guildId);
        const mainBotMember = await mainGuild.members.fetchMe();
        const mainPermissions = mainChannel.permissionsFor(mainBotMember);

        if (
            !mainPermissions?.has([
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages
            ])
        ) {
            throw new Error("El bot no tiene permisos para ver y enviar mensajes en el canal principal.");
        }

        const previousChannelId = connectedChannels[guild.id];
        connectedChannels[guild.id] = selectedChannel.id;

        try {
            saveConnectedChannels();
        } catch (error) {
            if (previousChannelId) {
                connectedChannels[guild.id] = previousChannelId;
            } else {
                delete connectedChannels[guild.id];
            }
            throw error;
        }

        return interaction.editReply(
            `✅ ${selectedChannel} quedó conectado al chat comunitario. Los mensajes de este canal se compartirán en el canal principal y los demás canales conectados.`
        );
    } catch (error) {
        console.error("No pude conectar el canal al chat comunitario:", error);
        return interaction.editReply(
            "❌ No pude conectar ese canal. Revisa los permisos del bot y vuelve a intentarlo."
        );
    }

}

async function relayCommunityMessage(message) {

    const isMainChannel = message.channel.id === COMMUNITY_CHANNEL_ID;
    const connectedChannelId = connectedChannels[message.guild.id];

    if (!isMainChannel && connectedChannelId !== message.channel.id) return;

    const displayName = message.member?.displayName || message.author.username;
    const attachments = [...message.attachments.values()].map(attachment => attachment.url);
    const body = [message.content.trim(), ...attachments].filter(Boolean).join("\n");
    const prefix = `**[${message.guild.name}] ${displayName}:**\n`;
    const relayContent = `${prefix}${(body || "(mensaje sin texto)").slice(0, 1900 - prefix.length)}`;
    const destinationIds = new Set(
        Object.values(connectedChannels).filter(channelId => channelId !== message.channel.id)
    );

    if (!isMainChannel) destinationIds.add(COMMUNITY_CHANNEL_ID);

    await Promise.all([...destinationIds].map(async channelId => {
        try {
            const destination = await client.channels.fetch(channelId);

            if (!destination?.isTextBased() || !("send" in destination)) {
                throw new Error(`El canal conectado ${channelId} no admite mensajes.`);
            }

            await destination.send({
                content: relayContent,
                allowedMentions: { parse: [] }
            });
        } catch (error) {
            console.error(`No pude reenviar el mensaje al canal ${channelId}:`, error);
        }
    }));

}

async function logCommandUsage(interaction) {

    try {
        const channel = await client.channels.fetch(COMMAND_LOG_CHANNEL_ID);

        if (!channel?.isTextBased() || !("send" in channel)) {
            throw new Error("El canal configurado para logs no admite mensajes.");
        }

        const guild = interaction.guild;
        const commandPath = `/${interaction.commandName}`;
        const options = interaction.commandName === "sugerencia"
            ? "Se envió una sugerencia al canal de revisión."
            : interaction.options.data
                .map(formatCommandOption)
                .join("\n")
                .slice(0, 1024);
        const embed = new EmbedBuilder()
            .setColor(0x2f9e8f)
            .setTitle(`Uso de comando: ${commandPath}`)
            .setDescription(options || "Sin opciones.")
            .addFields(
                {
                    name: "Usuario",
                    value: `${interaction.user.tag} (<@${interaction.user.id}>)`,
                    inline: true
                },
                {
                    name: "Servidor",
                    value: guild?.name || "Mensaje directo",
                    inline: true
                },
                {
                    name: "Fecha y hora",
                    value: interaction.createdAt.toLocaleString("es-MX", {
                        dateStyle: "medium",
                        timeStyle: "medium",
                        timeZone: "America/Mexico_City"
                    }),
                    inline: false
                }
            )
            .setTimestamp(interaction.createdAt);
        const guildIcon = guild?.iconURL({ size: 256 });

        if (guildIcon) embed.setThumbnail(guildIcon);

        const components = interaction.channelId
            ? [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel("Ir al canal donde se usó")
                        .setStyle(ButtonStyle.Link)
                        .setURL(
                            `https://discord.com/channels/${guild?.id || "@me"}/${interaction.channelId}`
                        )
                )
            ]
            : [];

        await channel.send({
            embeds: [embed],
            components,
            allowedMentions: { parse: [] }
        });
    } catch (error) {
        console.error("No pude registrar el uso del comando:", error);
    }
}

const suggestionDecisionLocks = new Set();

function createSuggestionDecisionButtons(userId, disabled = false) {

    return [
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`suggestion:take:${userId}`)
                .setLabel("✅ Tomar en cuenta")
                .setStyle(ButtonStyle.Success)
                .setDisabled(disabled),
            new ButtonBuilder()
                .setCustomId(`suggestion:decline:${userId}`)
                .setLabel("❌ No tomar")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(disabled)
        )
    ];

}

async function handleSuggestionCommand(interaction) {

    if (!interaction.guild) {
        return interaction.reply({
            content: "❌ Envía sugerencias desde un servidor para que podamos incluir su nombre y su imagen.",
            ephemeral: true
        });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
        const channel = await client.channels.fetch(SUGGESTIONS_CHANNEL_ID);
        if (!channel?.isTextBased() || typeof channel.send !== "function") {
            throw new Error("El canal configurado para sugerencias no admite mensajes.");
        }

        const submittedAt = new Date();
        const suggestion = interaction.options.getString("idea", true).trim();
        if (!suggestion) {
            return interaction.editReply("Escribe una sugerencia antes de enviarla.");
        }

        const embed = new EmbedBuilder()
            .setColor(0x7656d6)
            .setAuthor({
                name: interaction.user.globalName || interaction.user.username,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setTitle("💡 Nueva sugerencia")
            .setDescription(suggestion)
            .addFields(
                {
                    name: "Usuario",
                    value: `${interaction.user.username} (<@${interaction.user.id}>)`,
                    inline: true
                },
                {
                    name: "Servidor",
                    value: interaction.guild.name,
                    inline: true
                },
                {
                    name: "Fecha y hora",
                    value: submittedAt.toLocaleString("es-MX", {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: "America/Mexico_City"
                    }),
                    inline: true
                }
            )
            .setFooter({ text: "Estado: Pendiente" })
            .setTimestamp(submittedAt);
        const guildIcon = interaction.guild.iconURL({ size: 256 });

        if (guildIcon) {
            embed.setThumbnail(guildIcon);
        }

        await channel.send({
            embeds: [embed],
            components: createSuggestionDecisionButtons(interaction.user.id),
            allowedMentions: { parse: [] }
        });

        return interaction.editReply("✅ ¡Gracias! Tu sugerencia fue enviada al equipo de iCloud para revisión.");
    } catch (error) {
        console.error("No pude enviar la sugerencia:", error);
        return interaction.editReply(
            "❌ No pude enviar tu sugerencia ahora. Inténtalo de nuevo más tarde."
        );
    }

}

async function handleSuggestionDecision(interaction) {

    const match = interaction.customId.match(/^suggestion:(take|decline):(\d{17,20})$/);
    if (!match) return;

    if (interaction.channelId !== SUGGESTIONS_CHANNEL_ID) {
        return interaction.reply({
            content: "❌ Esta acción solo se puede usar en el canal de sugerencias.",
            ephemeral: true
        });
    }

    if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({
            content: "❌ Solo los administradores pueden revisar sugerencias.",
            ephemeral: true
        });
    }

    const [, decision, userId] = match;
    const messageId = interaction.message.id;
    const currentFooter = interaction.message.embeds[0]?.footer?.text || "";

    if (!currentFooter.startsWith("Estado: Pendiente") || suggestionDecisionLocks.has(messageId)) {
        return interaction.reply({
            content: "Esta sugerencia ya fue revisada.",
            ephemeral: true
        });
    }

    suggestionDecisionLocks.add(messageId);

    try {
        await interaction.deferUpdate();

        const accepted = decision === "take";
        const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
            .setColor(accepted ? 0x2ecc71 : 0x7f8c8d)
            .setFooter({
                text: accepted ? "Estado: ✅ Tomada en cuenta" : "Estado: ❌ No tomada"
            });

        await interaction.message.edit({
            embeds: [updatedEmbed],
            components: createSuggestionDecisionButtons(userId, true)
        });

        let notificationSent = false;
        if (accepted) {
            try {
                const suggestionAuthor = await client.users.fetch(userId);
                const serverName = interaction.message.embeds[0]?.fields
                    ?.find(field => field.name === "Servidor")
                    ?.value || "tu servidor";

                const privateMessage = await suggestionAuthor.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0x7656d6)
                            .setTitle("🎉 ¡Tu sugerencia fue tomada en cuenta!")
                            .setDescription(
                                `¡Felicidades! Tu sugerencia para **${serverName}** fue seleccionada. ` +
                                "Gracias por ayudar a que iCloud siga mejorando. 💜\n\n" +
                                "```" +
                                "\nESTADO                      │ TOMADA EN CUENTA" +
                                "\nPRÓXIMAS ACTUALIZACIONES    │ Tendremos muy presente tu idea." +
                                "\n```"
                            )
                            .setFooter({ text: "¡Gracias por ser parte de la comunidad iCloud!" })
                            .setTimestamp()
                    ],
                    allowedMentions: { parse: [] }
                });
                notificationSent = true;

                try {
                    await privateMessage.react("💜");
                } catch (error) {
                    console.error(`No pude añadir la reacción de corazón al mensaje privado de sugerencia ${messageId}:`, error);
                }
            } catch (error) {
                console.error(`No pude enviar un mensaje privado al autor de la sugerencia ${messageId}:`, error);
            }
        }

        return interaction.followUp({
            content: accepted
                ? notificationSent
                    ? "✅ Sugerencia marcada como tomada en cuenta y mensaje privado enviado."
                    : "✅ Sugerencia marcada como tomada en cuenta. No fue posible enviar el mensaje privado; quizá la persona tiene los MD cerrados."
                : "Sugerencia marcada como no tomada en cuenta.",
            ephemeral: true
        });
    } catch (error) {
        console.error(`No pude actualizar la decisión de la sugerencia ${messageId}:`, error);
        if (interaction.deferred || interaction.replied) {
            return interaction.followUp({
                content: "❌ No pude guardar la decisión. Revisa los permisos del bot en este canal.",
                ephemeral: true
            });
        }
        return interaction.reply({
            content: "❌ No pude guardar la decisión. Revisa los permisos del bot en este canal.",
            ephemeral: true
        });
    } finally {
        suggestionDecisionLocks.delete(messageId);
    }

}

client.on("interactionCreate", async interaction => {

    if (interaction.isButton() && interaction.customId.startsWith("suggestion:")) {
        await handleSuggestionDecision(interaction);
        return;
    }

    if (!interaction.isChatInputCommand()) return;

    void logCommandUsage(interaction);

    if (await handleCounterSetupCommand(interaction)) return;

    if (interaction.commandName === "sugerencia") {
        return handleSuggestionCommand(interaction);
    }

    if (interaction.commandName === "presentacion") {

        if (!interaction.guild) {
            return interaction.reply({
                content: "❌ Usa este comando dentro del servidor que contiene el canal de presentación.",
                ephemeral: true
            });
        }

        if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: "❌ Solo los administradores pueden publicar la presentación.",
                ephemeral: true
            });
        }

        if (presentationPublishing) {
            return interaction.reply({
                content: "⏳ Ya se está publicando la presentación.",
                ephemeral: true
            });
        }

        presentationPublishing = true;

        try {
            await interaction.deferReply({ ephemeral: true });

            const channel = await client.channels.fetch(
                BOT_PRESENTATION_CHANNEL_ID
            );
            if (
                !channel?.isTextBased()
                || typeof channel.send !== "function"
                || channel.guildId !== interaction.guildId
            ) {
                throw new Error(
                    "El canal de presentación no existe, no admite mensajes o pertenece a otro servidor."
                );
            }

            const presentationEmbed = new EmbedBuilder()
                .setColor(0x7656d6)
                .setAuthor({ name: "iCloud · Tu nuevo compañero para Discord" })
                .setTitle("✨ ¡Dale más vida a tu servidor! ✨")
                .setDescription(
                    "Soy **iCloud**, un bot de entretenimiento y juegos para darle más vida a tu comunidad. 🔮\n\n" +
                    "Resuelve misterios, juega con tus amigos y descubre hasta dónde puede llegar Akinator.\n\n" +
                    "╭・✦・━━━━━━━━━━━━━━━━・✦・╮\n" +
                    "     DIVERSIÓN PARA TODO EL SERVER\n" +
                    "╰・✦・━━━━━━━━━━━━━━━━・✦・╯"
                )
                .addFields({
                    name: "🎮 Comandos destacados",
                    value: [
                        "```",
                        "COMANDO       │ ¿QUÉ PUEDES HACER?",
                        "──────────────┼────────────────────────",
                        "/akinator     │ Adivina lo que imaginas",
                        "/misterio     │ Investiga y resuelve casos",
                        "/gato         │ Juega tres en raya",
                        "/reto         │ Prueba un reto creativo",
                        "```"
                    ].join("\n")
                }, {
                    name: "📜 ¿Quieres conocer todos los comandos?",
                    value: "Usa **/help** para ver la lista completa y las funciones disponibles en tu servidor."
                })
                .setImage(BOT_PRESENTATION_IMAGE_URL)
                .setFooter({
                    text: "Añádeme a tu servidor y que empiece la diversión ✨"
                });

            const inviteButton = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel("➕ Agregar iCloud a mi servidor")
                    .setStyle(ButtonStyle.Link)
                    .setURL(BOT_INVITE_URL)
            );

            await channel.send({
                embeds: [presentationEmbed],
                components: [inviteButton],
                allowedMentions: { parse: [] }
            });

            return interaction.editReply(
                `✅ ¡Presentación publicada en <#${BOT_PRESENTATION_CHANNEL_ID}>! Puedes volver a usar \`/presentacion\` cuando la necesites.`
            );
        } catch (error) {
            console.error("No pude publicar la presentación del bot:", error);
            const errorMessage = "❌ No pude completar la publicación. Revisa que el bot tenga permiso para ver y enviar mensajes en el canal; el comando seguirá disponible para reintentar.";
            if (interaction.deferred || interaction.replied) {
                return interaction.editReply(errorMessage);
            }
            return interaction.reply({ content: errorMessage, ephemeral: true });
        } finally {
            presentationPublishing = false;
        }
    }

    if (await handleConnectChannelCommand(interaction)) return;

    if (await handleShopCommand(interaction)) return;

    if (await handleEconomyCommand(interaction)) return;

    if (await handleAdministratorTools(interaction)) return;

    if (interaction.commandName === "automod") {

        if (!interaction.guild) {
            return interaction.reply({
                content: "❌ Este comando solo se puede usar dentro de un servidor.",
                ephemeral: true
            });
        }

        if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: "❌ Solo los administradores pueden cambiar esta configuración.",
                ephemeral: true
            });
        }

        const enabled = interaction.options.getBoolean("activado", true);
        if (enabled) {
            try {
                const botMember = await interaction.guild.members.fetchMe();
                const permissions = botMember.permissionsIn(interaction.channel);
                if (!permissions.has([
                    PermissionsBitField.Flags.ViewChannel,
                    PermissionsBitField.Flags.SendMessages,
                    PermissionsBitField.Flags.ManageMessages
                ])) {
                    return interaction.reply({
                        content: "❌ Para activar el automod necesito Ver canal, Enviar mensajes y Gestionar mensajes en este canal. Confirma que también tenga esos permisos en los canales que quieras proteger.",
                        ephemeral: true
                    });
                }
            } catch (error) {
                console.error(`No pude comprobar permisos para automod en ${interaction.guild.name}:`, error);
                return interaction.reply({
                    content: "❌ No pude comprobar los permisos del bot. Revisa su acceso al servidor e inténtalo de nuevo.",
                    ephemeral: true
                });
            }
        }

        const settings = getGuildSettings(interaction.guild.id);
        const previousValue = settings.automodEnabled;
        settings.automodEnabled = enabled;

        try {
            saveGuildSettings();
        } catch (error) {
            settings.automodEnabled = previousValue;
            console.error(`No pude guardar la configuración de automod para ${interaction.guild.name}:`, error);
            return interaction.reply({
                content: "❌ No pude guardar el cambio. Inténtalo de nuevo.",
                ephemeral: true
            });
        }

        return interaction.reply({
            content: enabled
                ? "✅ Automod activado. Eliminaré spam (más de 5 mensajes en 7 segundos), invitaciones de Discord y mensajes con más de 5 menciones. Avisaré al autor; no aplicaré timeout ni ban."
                : "✅ Automod desactivado para este servidor.",
            ephemeral: true
        });
    }

    if (interaction.commandName === "chatstats") {

        if (!interaction.guild) {
            return interaction.reply({
                content: "❌ Este comando solo se puede usar dentro de un servidor.",
                ephemeral: true
            });
        }

        if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: "❌ Solo los administradores pueden cambiar esta configuración.",
                ephemeral: true
            });
        }

        const settings = getGuildSettings(interaction.guild.id);
        const enabled = interaction.options.getBoolean("activado", true);
        const previousValue = settings.chatStatsEnabled;
        settings.chatStatsEnabled = enabled;

        try {
            saveGuildSettings();
        } catch (error) {
            settings.chatStatsEnabled = previousValue;
            console.error("No pude guardar la configuración del servidor:", error);
            return interaction.reply({
                content: "❌ No pude guardar el cambio. Inténtalo de nuevo.",
                ephemeral: true
            });
        }

        const confirmation = enabled
            ? "✅ Activé niveles y estadísticas del chat para este servidor."
            : "✅ Desactivé el registro de chat en este servidor. Las estadísticas anteriores se conservarán.";

        return interaction.reply({ content: confirmation, ephemeral: true });
    }

    if (interaction.commandName === "nivel") {

        if (!interaction.guild) {
            return interaction.reply({
                content: "❌ Los niveles solo están disponibles en servidores.",
                ephemeral: true
            });
        }

        if (!getGuildSettings(interaction.guild.id).chatStatsEnabled) {
            return interaction.reply({
                content: "📊 Los niveles están desactivados en este servidor. Un administrador puede activarlos con `/chatstats activado:true`.",
                ephemeral: true
            });
        }

        const target = interaction.options.getUser("usuario") || interaction.user;
        const stats = getGuildSettings(interaction.guild.id).users[target.id]
            || { messages: 0, xp: 0, lastXpAt: 0 };
        const progress = getChatLevelProgress(stats.xp);
        const filledBlocks = Math.floor((progress.current / progress.required) * 10);
        const progressBar = `${"🟩".repeat(filledBlocks)}${"⬛".repeat(10 - filledBlocks)}`;
        const embed = new EmbedBuilder()
            .setColor(0x2f9e8f)
            .setTitle(`✨ Nivel de ${target.username}`)
            .setThumbnail(target.displayAvatarURL({ size: 256 }))
            .setDescription(
                `**Nivel ${progress.level}**\n${progressBar}\n` +
                `**${progress.current} / ${progress.required} XP** para el siguiente nivel`
            )
            .addFields(
                { name: "Experiencia total", value: `${stats.xp.toLocaleString("es-MX")} XP`, inline: true },
                { name: "Mensajes", value: stats.messages.toLocaleString("es-MX"), inline: true }
            );

        return interaction.reply({ embeds: [embed], allowedMentions: { parse: [] } });
    }

    if (interaction.commandName === "topchat" || interaction.commandName === "topniveles") {

        if (!interaction.guild) {
            return interaction.reply({
                content: "❌ Los rankings están disponibles dentro de un servidor.",
                ephemeral: true
            });
        }

        if (!getGuildSettings(interaction.guild.id).chatStatsEnabled) {
            return interaction.reply({
                content: "📊 Las estadísticas están desactivadas en este servidor. Un administrador puede activarlas con `/chatstats activado:true`.",
                ephemeral: true
            });
        }

        return interaction.reply({
            embeds: [createChatLeaderboardEmbed(
                interaction.guild,
                interaction.commandName === "topchat" ? "messages" : "levels"
            )],
            allowedMentions: { parse: [] }
        });
    }

    if (interaction.commandName === "reto") {

        const gameId = interaction.id;
        let challenge = pickRandomMessage(ENTERTAINMENT_CHALLENGES);
        const createChallengeEmbed = () => new EmbedBuilder()
            .setColor(0xf39c12)
            .setTitle("🎭 Reto creativo de iCloud")
            .setDescription(challenge)
            .setFooter({ text: "Solo por diversión; usa «Otro reto» si quieres cambiarlo." });
        const createChallengeButtons = disabled => [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`reto-${gameId}-otro`)
                    .setLabel("🎲 Otro reto")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(disabled),
                new ButtonBuilder()
                    .setCustomId(`reto-${gameId}-listo`)
                    .setLabel("¡Hecho!")
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(disabled)
            )
        ];

        await interaction.reply({
            embeds: [createChallengeEmbed()],
            components: createChallengeButtons(false)
        });

        const challengeMessage = await interaction.fetchReply();
        const collector = challengeMessage.createMessageComponentCollector({
            time: 90000,
            filter: buttonInteraction =>
                buttonInteraction.customId.startsWith(`reto-${gameId}-`)
        });

        collector.on("collect", async buttonInteraction => {

            if (buttonInteraction.user.id !== interaction.user.id) {
                return buttonInteraction.reply({
                    content: "Este reto pertenece a quien lo inició.",
                    ephemeral: true
                });
            }

            if (buttonInteraction.customId.endsWith("-listo")) {
                collector.stop("completed");
                return buttonInteraction.update({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0x2ecc71)
                            .setTitle("🏅 ¡Reto completado!")
                            .setDescription(`**${challenge}**\n\n¡Bien jugado!`)
                    ],
                    components: createChallengeButtons(true)
                });
            }

            const previousChallenge = challenge;
            while (challenge === previousChallenge && ENTERTAINMENT_CHALLENGES.length > 1) {
                challenge = pickRandomMessage(ENTERTAINMENT_CHALLENGES);
            }

            await buttonInteraction.update({
                embeds: [createChallengeEmbed()],
                components: createChallengeButtons(false)
            });

        });

        collector.on("end", (_, reason) => {

            if (reason === "completed") return;

            void challengeMessage.edit({
                components: createChallengeButtons(true)
            }).catch(error => {
                console.error("No pude cerrar el reto creativo:", error);
            });

        });

        return;
    }

    if (interaction.commandName === "misterio") {

        const gameId = interaction.id;
        const mystery = pickRandomMessage(MYSTERY_CASES);
        const revealedClues = new Set();
        let phase = "investigation";

        await interaction.reply({
            embeds: [createMysteryEmbed(mystery, revealedClues)],
            components: createMysteryButtons(
                gameId,
                mystery,
                revealedClues
            )
        });

        const mysteryMessage = await interaction.fetchReply();
        const collector = mysteryMessage.createMessageComponentCollector({
            time: 300000,
            filter: buttonInteraction =>
                buttonInteraction.customId.startsWith(`misterio-${gameId}-`)
        });
        let processingAction = false;

        collector.on("collect", async buttonInteraction => {

            if (processingAction) {
                return buttonInteraction.deferUpdate().catch(error => {
                    console.error("No pude confirmar una acción simultánea de misterio:", error);
                });
            }

            processingAction = true;
            const action = buttonInteraction.customId
                .slice(`misterio-${gameId}-`.length);

            try {
                if (action.startsWith("clue-")) {
                    const clueIndex = Number(action.slice("clue-".length));

                    if (
                        !Number.isInteger(clueIndex)
                        || clueIndex < 0
                        || clueIndex >= mystery.evidence.length
                    ) {
                        return buttonInteraction.reply({
                            content: "No reconocí esa pista. Inténtalo de nuevo.",
                            ephemeral: true
                        });
                    }

                    revealedClues.add(clueIndex);
                    return buttonInteraction.update({
                        embeds: [createMysteryEmbed(
                            mystery,
                            revealedClues,
                            phase
                        )],
                        components: createMysteryButtons(
                            gameId,
                            mystery,
                            revealedClues,
                            phase
                        )
                    });
                }

                if (action === "accuse") {
                    phase = "accusing";
                    return buttonInteraction.update({
                        embeds: [createMysteryEmbed(
                            mystery,
                            revealedClues,
                            phase
                        )],
                        components: createMysteryButtons(
                            gameId,
                            mystery,
                            revealedClues,
                            phase
                        )
                    });
                }

                if (action === "cancel") {
                    phase = "investigation";
                    return buttonInteraction.update({
                        embeds: [createMysteryEmbed(
                            mystery,
                            revealedClues,
                            phase
                        )],
                        components: createMysteryButtons(
                            gameId,
                            mystery,
                            revealedClues,
                            phase
                        )
                    });
                }

                if (action.startsWith("suspect-") && phase === "accusing") {
                    const suspectIndex = Number(action.slice("suspect-".length));

                    if (
                        !Number.isInteger(suspectIndex)
                        || suspectIndex < 0
                        || suspectIndex >= mystery.suspects.length
                    ) {
                        return buttonInteraction.reply({
                            content: "No reconocí a ese sospechoso. Inténtalo de nuevo.",
                            ephemeral: true
                        });
                    }

                    let rewardMessage = "";
                    if (suspectIndex === mystery.culprit) {
                        try {
                            const solverAccount = getEconomyAccount(
                                interaction.guild.id,
                                buttonInteraction.user.id
                            );
                            const now = Date.now();
                            const rewardCooldownRemaining = MYSTERY_REWARD_COOLDOWN
                                - (now - solverAccount.lastMysteryRewardAt);
                            if (rewardCooldownRemaining > 0) {
                                rewardMessage = `Este caso fue resuelto, pero ya recibiste un premio recientemente. Podrás ganar otra recompensa en ${Math.ceil(rewardCooldownRemaining / 60000)} min.`;
                            } else {
                                const oldBalance = solverAccount.balance;
                                const oldRewardAt = solverAccount.lastMysteryRewardAt;
                                solverAccount.balance += MYSTERY_REWARD;
                                solverAccount.lastMysteryRewardAt = now;
                                try {
                                    saveEconomyData();
                                    rewardMessage = `Ganaste ${formatPesos(MYSTERY_REWARD)} por resolverlo. Saldo: ${formatPesos(solverAccount.balance)}.`;
                                } catch (error) {
                                    solverAccount.balance = oldBalance;
                                    solverAccount.lastMysteryRewardAt = oldRewardAt;
                                    throw error;
                                }
                            }
                        } catch (error) {
                            console.error("No pude guardar el premio del misterio:", error);
                            rewardMessage = "El caso quedó resuelto, pero no pude guardar el premio. Contacta a un administrador.";
                        }
                    }
                    phase = "resolved";
                    collector.stop("solved");
                    return buttonInteraction.update({
                        embeds: [createMysteryEmbed(
                            mystery,
                            revealedClues,
                            phase,
                            { suspectIndex, rewardMessage }
                        )],
                        components: []
                    });
                }

                if (action === "finish") {
                    phase = "abandoned";
                    collector.stop("abandoned");
                    return buttonInteraction.update({
                        embeds: [createMysteryEmbed(
                            mystery,
                            revealedClues,
                            phase
                        )],
                        components: []
                    });
                }

                return buttonInteraction.reply({
                    content: "No reconocí esa acción del expediente.",
                    ephemeral: true
                });
            } catch (error) {
                console.error("Falló una acción del juego de misterio:", error);
                const notifyError = buttonInteraction.deferred
                    || buttonInteraction.replied
                    ? buttonInteraction.followUp.bind(buttonInteraction)
                    : buttonInteraction.reply.bind(buttonInteraction);
                await notifyError({
                    content: "No pude actualizar el expediente. Intenta pulsar el botón otra vez.",
                    ephemeral: true
                }).catch(followUpError => {
                    console.error("No pude notificar el error del misterio:", followUpError);
                });
            } finally {
                processingAction = false;
            }

        });

        collector.on("end", (_, reason) => {

            if (reason === "solved" || reason === "abandoned") return;

            void mysteryMessage.edit({
                embeds: [createMysteryEmbed(
                    mystery,
                    revealedClues,
                    "timeout"
                )],
                components: []
            }).catch(error => {
                console.error("No pude cerrar el expediente de misterio:", error);
            });

        });

        return;
    }

    if (interaction.commandName === "oraculo") {

        const question = interaction.options.getString("pregunta", true);
        const embed = new EmbedBuilder()
            .setColor(0x8e44ad)
            .setTitle("🔮 El oráculo caótico de iCloud")
            .setDescription(`**Tu pregunta:** ${question}\n\n${pickRandomMessage(ORACLE_OPENERS)}\n**${pickRandomMessage(ORACLE_ANSWERS)}**`)
            .setFooter({ text: "La profecía es solo por diversión; tú decides tu destino." });

        return interaction.reply({
            embeds: [embed],
            allowedMentions: { parse: [] }
        });
    }

    if (interaction.commandName === "superpoder") {

        const result = pickRandomMessage(SILLY_POWERS);
        const embed = new EmbedBuilder()
            .setColor(0x9b59b6)
            .setTitle("🦸 Tu superpoder totalmente oficial")
            .setDescription(
                `**Poder:** ${result.power}\n\n` +
                `**Efecto secundario:** ${result.drawback}`
            )
            .setFooter({ text: `Asignado a ${interaction.user.username} por el Departamento de Poderes Dudosos` });

        return interaction.reply({ embeds: [embed] });
    }

    if (interaction.commandName === "excusa") {

        const embed = new EmbedBuilder()
            .setColor(0xf1c40f)
            .setTitle("🫠 Generador de excusas")
            .setDescription(`> ${pickRandomMessage(SILLY_EXCUSES)}`)
            .setFooter({ text: `Excusa certificada para ${interaction.user.username} · No garantizamos que funcione` });

        return interaction.reply({ embeds: [embed] });
    }

    if (interaction.commandName === "villano") {

        const villain = pickRandomMessage(VILLAIN_NAMES);
        const plan = pickRandomMessage(VILLAIN_PLANS);
        const weakness = pickRandomMessage(VILLAIN_WEAKNESSES);
        const embed = new EmbedBuilder()
            .setColor(0x8e44ad)
            .setTitle(`😈 Informe de villano: ${villain}`)
            .addFields(
                { name: "🎯 Plan maestro", value: `Intentará ${plan}.` },
                { name: "🧀 Debilidad secreta", value: `Todo su plan se derrumba ante ${weakness}.` }
            )
            .setFooter({ text: `Identidad asignada a ${interaction.user.username} · Villanía de baja peligrosidad` });

        return interaction.reply({ embeds: [embed] });
    }

    if (interaction.commandName === "akinator") {

        const gameId = interaction.id;
        const state = {
            answers: new Map(),
            askedQuestions: new Set(),
            questionCount: 0,
            history: [],
            characters: AKINATOR_CHARACTERS.map(character => ({
                ...character,
                traits: [...character.traits]
            })),
            dynamicQuestions: [],
            wikidataUnavailable: false
        };

        await interaction.reply({
            embeds: [createAkinatorThinkingEmbed()]
        });

        const gameMessage = await interaction.fetchReply();
        void loadAkinatorWikidataFacts(state.characters)
            .then(questions => {
                state.dynamicQuestions = questions;
            })
            .catch(error => {
                state.wikidataUnavailable = true;
                console.error("No pude cargar datos de Wikidata para Akinator:", error);
            });
        let candidates = rankAkinatorCharacters(state.answers, state.characters);

        await new Promise(resolve =>
            setTimeout(resolve, AKINATOR_THINKING_TIME)
        );
        candidates = rankAkinatorCharacters(state.answers, state.characters);
        let currentQuestion = chooseAkinatorQuestion(
            state.characters,
            state.askedQuestions,
            state.dynamicQuestions
        );
        await gameMessage.edit({
            embeds: [createAkinatorQuestionEmbed(
                currentQuestion,
                candidates,
                state.questionCount,
                state.wikidataUnavailable
            )],
            components: createAkinatorButtons(gameId)
        });
        const collector = gameMessage.createMessageComponentCollector({
            time: 360000,
            filter: buttonInteraction =>
                buttonInteraction.customId.startsWith(`akinator-${gameId}-`)
        });
        let processingAnswer = false;

        collector.on("collect", async buttonInteraction => {

            if (buttonInteraction.user.id !== interaction.user.id) {
                return buttonInteraction.reply({
                    content: "Esta partida de Akinator pertenece a quien la inició.",
                    ephemeral: true
                });
            }

            if (processingAnswer) {
                await buttonInteraction.deferUpdate();
                return;
            }

            processingAnswer = true;

            try {
                await buttonInteraction.deferUpdate();
                const answer = buttonInteraction.customId.split("-").at(-1);

                if (answer === "finish") {
                    collector.stop("finished");
                    await gameMessage.edit({
                        embeds: [createAkinatorFinishedEmbed()],
                        components: createAkinatorButtons(
                            gameId,
                            true,
                            false,
                            false,
                            true
                        )
                    });
                    return;
                }

                if (answer === "restart") {
                    state.answers.clear();
                    state.askedQuestions.clear();
                    state.questionCount = 0;
                    state.history = [];
                    candidates = rankAkinatorCharacters(
                        state.answers,
                        state.characters
                    );
                    currentQuestion = chooseAkinatorQuestion(
                        state.characters,
                        state.askedQuestions,
                        state.dynamicQuestions
                    );
                    collector.resetTimer();
                    await gameMessage.edit({
                        embeds: [createAkinatorThinkingEmbed()],
                        components: createAkinatorButtons(
                            gameId,
                            true,
                            false,
                            false,
                            true
                        )
                    });
                    await new Promise(resolve =>
                        setTimeout(resolve, AKINATOR_THINKING_TIME)
                    );
                    await gameMessage.edit({
                        embeds: [createAkinatorQuestionEmbed(
                            currentQuestion,
                            candidates,
                            state.questionCount,
                            state.wikidataUnavailable
                        )],
                        components: createAkinatorButtons(gameId)
                    });
                    return;
                }

                if (answer === "back") {
                    const previousState = state.history.pop();
                    if (!previousState) return;

                    state.answers = previousState.answers;
                    state.askedQuestions = previousState.askedQuestions;
                    state.questionCount = previousState.questionCount;
                    currentQuestion = previousState.currentQuestion;
                    candidates = rankAkinatorCharacters(
                        state.answers,
                        state.characters
                    );

                    await gameMessage.edit({
                        embeds: [createAkinatorQuestionEmbed(
                            currentQuestion,
                            candidates,
                            state.questionCount,
                            state.wikidataUnavailable
                        )],
                        components: createAkinatorButtons(
                            gameId,
                            false,
                            state.history.length > 0
                        )
                    });
                    return;
                }

                state.history.push({
                    answers: new Map(state.answers),
                    askedQuestions: new Set(state.askedQuestions),
                    questionCount: state.questionCount,
                    currentQuestion
                });
                state.questionCount++;
                recordAkinatorAnswer(state, currentQuestion.trait, answer);
                collector.resetTimer();

                candidates = rankAkinatorCharacters(
                    state.answers,
                    state.characters
                );
                const nextQuestion = chooseAkinatorQuestion(
                    candidates,
                    state.askedQuestions,
                    state.dynamicQuestions
                );
                const shouldGuess = !nextQuestion;

                if (shouldGuess) {
                    const character = pickRandomMessage(candidates);
                    const imageUrl = await fetchAkinatorCharacterImage(character);
                    await gameMessage.edit({
                        embeds: [createAkinatorResultEmbed(
                            character,
                            state.questionCount,
                            imageUrl
                        )],
                        components: createAkinatorButtons(
                            gameId,
                            true,
                            state.history.length > 0,
                            true
                        )
                    });
                    return;
                }

                currentQuestion = nextQuestion;
                await gameMessage.edit({
                    embeds: [createAkinatorQuestionEmbed(
                        currentQuestion,
                        candidates,
                        state.questionCount,
                        state.wikidataUnavailable
                    )],
                    components: createAkinatorButtons(
                        gameId,
                        false,
                        state.history.length > 0
                    )
                });
            } catch (error) {
                console.error("Falló una ronda de Akinator:", error);
                collector.stop("error");
                await gameMessage.edit({
                    content: "❌ Ocurrió un error al continuar Akinator. Inténtalo de nuevo con `/akinator`.",
                    embeds: [],
                    components: createAkinatorButtons(
                        gameId,
                        true,
                        false,
                        false,
                        true
                    )
                }).catch(editError => {
                    console.error("No pude mostrar el error de Akinator:", editError);
                });
            } finally {
                processingAnswer = false;
            }

        });

        collector.on("end", (_, reason) => {

            if (
                reason === "finished"
                || reason === "guessed"
                || reason === "error"
            ) return;

            void gameMessage.edit({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x7d3c98)
                        .setTitle("🔮 Partida terminada")
                        .setDescription("Se acabó el tiempo. Inicia otra partida con `/akinator`.")
                ],
                components: createAkinatorButtons(
                    gameId,
                    true,
                    false,
                    false,
                    true
                )
            }).catch(error => {
                console.error("No pude cerrar la partida de Akinator:", error);
            });

        });

        return;
    }

    // =================================
    // PING
    // =================================

    if (interaction.commandName === "ping") {

        const latency = Date.now() - interaction.createdTimestamp;

        await interaction.reply(
            `🏓 Pong!\nLatencia: **${latency}ms**`
        );

    }

    if (interaction.commandName === "chiste") {

        const embed = new EmbedBuilder()
            .setColor(0xf1c40f)
            .setTitle("😂 Chiste aleatorio")
            .setDescription(pickRandomMessage(JOKES))
            .setFooter({ text: `Colección de ${JOKES.length} chistes · Pedido por ${interaction.user.username}` });

        return interaction.reply({ embeds: [embed] });
    }

    if (interaction.commandName === "moneda") {

        const result = Math.random() < 0.5 ? "🪙 **Cara**" : "🪙 **Cruz**";
        return interaction.reply(`La moneda cayó en ${result}.`);
    }

    if (interaction.commandName === "dado") {

        const sides = interaction.options.getInteger("caras") || 6;
        const result = Math.floor(Math.random() * sides) + 1;
        const embed = new EmbedBuilder()
            .setColor(0x3498db)
            .setTitle("🎲 Lanzamiento de dado")
            .setDescription(`Salió **${result}** en un dado de **${sides}** caras.`)
            .setFooter({ text: `Lanzado por ${interaction.user.username}` });

        return interaction.reply({ embeds: [embed] });
    }

    if (interaction.commandName === "avatar") {

        const target = interaction.options.getUser("usuario") || interaction.user;
        const avatarUrl = target.displayAvatarURL({ size: 1024 });
        const embed = new EmbedBuilder()
            .setColor(0x3498db)
            .setTitle(`🖼️ Avatar de ${target.globalName || target.username}`)
            .setImage(avatarUrl)
            .setURL(avatarUrl);

        return interaction.reply({ embeds: [embed] });
    }

    if (interaction.commandName === "servidor") {

        if (!interaction.guild) {
            return interaction.reply({
                content: "❌ Este comando solo se puede usar dentro de un servidor.",
                ephemeral: true
            });
        }

        const guild = interaction.guild;
        const embed = new EmbedBuilder()
            .setColor(0x3498db)
            .setTitle(`🏠 ${guild.name}`)
            .setDescription(`Información general de **${guild.name}**.`)
            .addFields(
                { name: "👥 Miembros", value: `${guild.memberCount.toLocaleString("es-MX")}`, inline: true },
                {
                    name: "💬 Canales de texto",
                    value: `${guild.channels.cache.filter(channel =>
                        channel.type === ChannelType.GuildText
                        || channel.type === ChannelType.GuildAnnouncement
                    ).size}`,
                    inline: true
                },
                {
                    name: "📅 Creado",
                    value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`,
                    inline: true
                }
            )
            .setFooter({ text: `ID: ${guild.id}` })
            .setTimestamp(guild.createdAt);
        const guildIcon = guild.iconURL({ size: 512 });

        if (guildIcon) embed.setThumbnail(guildIcon);

        return interaction.reply({ embeds: [embed] });
    }

    // =================================
    // AYUDA CON PAGINAS
    // =================================

    if (interaction.commandName === "help") {

        let pageIndex = 0;

        await interaction.reply({
            embeds: [createHelpEmbed(pageIndex)],
            components: createHelpButtons(pageIndex, interaction.id),
            ephemeral: true
        });

        const helpMessage = await interaction.fetchReply();
        const collector = helpMessage.createMessageComponentCollector({
            time: 120000
        });

        collector.on("collect", async buttonInteraction => {

            if (buttonInteraction.user.id !== interaction.user.id) {
                return buttonInteraction.reply({
                    content: "Esta ayuda pertenece a quien ejecutó el comando.",
                    ephemeral: true
                });
            }

            const selectedCategory = Number(buttonInteraction.customId.split("-").at(-1));
            if (
                !Number.isInteger(selectedCategory)
                || selectedCategory < 0
                || selectedCategory >= HELP_PAGES.length
            ) {
                return buttonInteraction.reply({
                    content: "No reconocí esa categoría. Vuelve a usar `/help`.",
                    ephemeral: true
                });
            }

            pageIndex = selectedCategory;

            await buttonInteraction.update({
                embeds: [createHelpEmbed(pageIndex)],
                components: createHelpButtons(pageIndex, interaction.id)
            });

        });

        collector.on("end", async () => {

            await interaction.editReply({
                components: createHelpButtons(pageIndex, interaction.id, true)
            }).catch(() => {});

        });

        return;

    }

    // =================================
    // TRES EN RAYA
    // =================================

    if (interaction.commandName === "gato") {

        const opponent = interaction.options.getUser("oponente");

        if (opponent?.id === interaction.user.id) {
            return interaction.reply({
                content: "No puedes jugar contra ti mismo.",
                ephemeral: true
            });
        }

        if (opponent?.bot) {
            return interaction.reply({
                content: "Elige a una persona o deja el oponente vacío para jugar contra el bot.",
                ephemeral: true
            });
        }

        const board = Array(9).fill(null);
        const botOpponent = !opponent;
        const playerIds = [interaction.user.id, ...(opponent ? [opponent.id] : [])];
        const playersText = `${interaction.user} (X) vs ${opponent ? `${opponent} (O)` : "el bot (O)"}`;
        const gameId = interaction.id;
        let currentPlayerId = interaction.user.id;
        let gameOver = false;

        const createContent = status => `**Tres en raya**\n${playersText}\n${status}`;

        await interaction.reply({
            content: createContent(`Turno de ${interaction.user} (X).`),
            components: createTicTacToeRows(board, gameId),
            allowedMentions: { users: playerIds }
        });

        const gameMessage = await interaction.fetchReply();
        const collector = gameMessage.createMessageComponentCollector({
            time: 180000
        });

        collector.on("collect", async buttonInteraction => {

            if (!playerIds.includes(buttonInteraction.user.id)) {
                return buttonInteraction.reply({
                    content: "No participas en esta partida.",
                    ephemeral: true
                });
            }

            if (buttonInteraction.customId === `gato-${gameId}-rematch`) {
                if (!gameOver) {
                    return buttonInteraction.reply({
                        content: "La partida todavía no termina.",
                        ephemeral: true
                    });
                }

                board.fill(null);
                gameOver = false;
                currentPlayerId = interaction.user.id;
                collector.resetTimer();

                return buttonInteraction.update({
                    content: createContent(`Turno de ${interaction.user} (X).`),
                    components: createTicTacToeRows(board, gameId),
                    allowedMentions: { users: playerIds }
                });
            }

            if (gameOver) {
                return buttonInteraction.reply({
                    content: "La partida terminó. Pulsa Revancha para jugar otra vez.",
                    ephemeral: true
                });
            }

            if (buttonInteraction.user.id !== currentPlayerId) {
                return buttonInteraction.reply({
                    content: "Espera tu turno.",
                    ephemeral: true
                });
            }

            const index = Number(buttonInteraction.customId.split("-").pop());

            if (!Number.isInteger(index) || board[index]) {
                return buttonInteraction.reply({
                    content: "Esa casilla ya está ocupada.",
                    ephemeral: true
                });
            }

            board[index] = buttonInteraction.user.id === interaction.user.id
                ? "X"
                : "O";

            let resultText = null;
            let winner = getTicTacToeWinner(board);

            if (winner) {
                const winnerText = winner === "X"
                    ? interaction.user.toString()
                    : opponent?.toString() || "el bot";
                resultText = `Ganó ${winnerText}.`;
            } else if (board.every(Boolean)) {
                resultText = "Empate.";
            } else if (botOpponent) {
                const botMove = findTicTacToeBotMove(board);

                if (botMove !== null) {
                    board[botMove] = "O";
                }

                winner = getTicTacToeWinner(board);

                if (winner === "O") {
                    resultText = "Ganó el bot.";
                } else if (board.every(Boolean)) {
                    resultText = "Empate.";
                }

            }

            gameOver = Boolean(resultText);

            if (!gameOver) {
                currentPlayerId = botOpponent
                    ? interaction.user.id
                    : buttonInteraction.user.id === interaction.user.id
                        ? opponent.id
                        : interaction.user.id;
            }

            const status = resultText || `Turno de ${currentPlayerId === interaction.user.id ? `${interaction.user} (X)` : `${opponent} (O)`}.`;

            await buttonInteraction.update({
                content: createContent(status),
                components: gameOver
                    ? [
                        ...createTicTacToeRows(board, gameId, true),
                        createTicTacToeRematchRow(gameId)
                    ]
                    : createTicTacToeRows(board, gameId),
                allowedMentions: { users: playerIds }
            });

        });

        collector.on("end", async (_, reason) => {

            if (reason !== "time") return;

            if (!gameOver) {
                gameOver = true;

                await interaction.editReply({
                    content: createContent("Partida finalizada por inactividad."),
                    components: createTicTacToeRows(board, gameId, true),
                    allowedMentions: { users: playerIds }
                }).catch(() => {});
            } else {
                await interaction.editReply({
                    components: [
                        ...createTicTacToeRows(board, gameId, true),
                        createTicTacToeRematchRow(gameId, true)
                    ]
                }).catch(() => {});
            }

        });

        return;

    }

    // =================================
    // CLEAR
    // =================================

    if (interaction.commandName === "clear") {

        if (
            !interaction.member.permissions.has(
                PermissionsBitField.Flags.ManageMessages
            )
        ) {

            return interaction.reply({
                content: "❌ No tienes permiso para hacer esto.",
                ephemeral: true
            });

        }

        const cantidad =
            interaction.options.getInteger("cantidad");

        try {

            await interaction.channel.bulkDelete(
                cantidad,
                true
            );

            await interaction.reply({
                content: `🗑️ Eliminé **${cantidad} mensajes**.`,
                ephemeral: true
            });

        } catch (error) {

            await interaction.reply({
                content:
                    "❌ No pude eliminar los mensajes.",
                ephemeral: true
            });

        }

    }

    // =================================
    // KICK
    // =================================

    if (interaction.commandName === "kick") {

        if (
            !interaction.member.permissions.has(
                PermissionsBitField.Flags.KickMembers
            )
        ) {

            return interaction.reply({
                content: "❌ No tienes permiso.",
                ephemeral: true
            });

        }

        const user =
            interaction.options.getUser("usuario");

        const reason =
            interaction.options.getString("razon") ||
            "Sin razón especificada";

        const member =
            await interaction.guild.members
                .fetch(user.id)
                .catch(() => null);

        if (!member) {

            return interaction.reply({
                content: "❌ No encontré a ese usuario.",
                ephemeral: true
            });

        }

        if (!member.kickable) {

            return interaction.reply({
                content:
                    "❌ No puedo expulsar a este usuario. Revisa la jerarquía de roles.",
                ephemeral: true
            });

        }

        await member.kick(reason);

        await interaction.reply(
            `👢 ${user} fue expulsado.\n**Razón:** ${reason}`
        );

    }

    // =================================
    // BAN
    // =================================

    if (interaction.commandName === "ban") {

        if (
            !interaction.member.permissions.has(
                PermissionsBitField.Flags.BanMembers
            )
        ) {

            return interaction.reply({
                content: "❌ No tienes permiso.",
                ephemeral: true
            });

        }

        const user =
            interaction.options.getUser("usuario");

        const reason =
            interaction.options.getString("razon") ||
            "Sin razón especificada";

        const member =
            await interaction.guild.members
                .fetch(user.id)
                .catch(() => null);

        if (!member) {

            return interaction.reply({
                content: "❌ No encontré a ese usuario.",
                ephemeral: true
            });

        }

        if (!member.bannable) {

            return interaction.reply({
                content:
                    "❌ No puedo banear a este usuario. Revisa la jerarquía de roles.",
                ephemeral: true
            });

        }

        await member.ban({
            reason: reason
        });

        await interaction.reply(
            `🔨 ${user} fue baneado.\n**Razón:** ${reason}`
        );

    }

    // =================================
    // DAR ROL
    // =================================

    if (interaction.commandName === "darrol") {

        if (!interaction.guild) {
            return interaction.reply({
                content: "❌ Este comando solo se puede usar en un servidor.",
                ephemeral: true
            });
        }

        if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: "❌ Solo los administradores pueden usar este comando.",
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true });

        const guild = interaction.guild;
        const user = interaction.options.getUser("usuario", true);
        const role = interaction.options.getRole("rol", true);
        const minutes = interaction.options.getInteger("minutos");

        try {
            await guild.members.fetchMe();
            const [member, actor] = await Promise.all([
                guild.members.fetch(user.id),
                guild.members.fetch(interaction.user.id)
            ]);

            if (role.id === guild.id || role.managed || !role.editable) {
                return interaction.editReply(
                    "❌ No puedo asignar ese rol. Revisa que el bot tenga **Gestionar roles** y que el rol esté debajo de su rol más alto."
                );
            }

            if (
                actor.id !== guild.ownerId
                && actor.roles.highest.comparePositionTo(role) <= 0
            ) {
                return interaction.editReply(
                    "❌ Solo puedes asignar roles que estén debajo de tu rol más alto."
                );
            }

            const key = getRoleAssignmentKey({
                guildId: guild.id,
                userId: user.id,
                roleId: role.id
            });
            const previousAssignments = roleAssignments;
            roleAssignments = roleAssignments.filter(
                assignment => getRoleAssignmentKey(assignment) !== key
            );

            if (minutes !== null) {
                roleAssignments.push({
                    guildId: guild.id,
                    userId: user.id,
                    roleId: role.id,
                    expiresAt: Date.now() + minutes * 60 * 1000
                });
            }

            try {
                saveRoleAssignments();
                await member.roles.add(role, `Asignado por ${interaction.user.tag}`);
            } catch (error) {
                roleAssignments = previousAssignments;
                try {
                    saveRoleAssignments();
                } catch (saveError) {
                    console.error("No pude restaurar el registro del rol temporal:", saveError);
                }
                throw error;
            }

            const existingTimer = roleExpirationTimers.get(key);
            if (existingTimer) clearTimeout(existingTimer);
            roleExpirationTimers.delete(key);

            if (minutes !== null) {
                const assignment = roleAssignments.find(
                    savedAssignment => getRoleAssignmentKey(savedAssignment) === key
                );
                scheduleRoleExpiration(assignment);
            }

            return interaction.editReply(
                minutes === null
                    ? `✅ Asigné permanentemente ${role} a ${user}.`
                    : `✅ Asigné ${role} a ${user} durante **${minutes} minutos**.`
            );
        } catch (error) {
            console.error("No pude asignar el rol solicitado:", error);
            return interaction.editReply(
                "❌ No pude asignar el rol. Verifica que la persona y el rol sigan en el servidor y que la jerarquía/permisos del bot sean correctos."
            );
        }

    }

    // =================================
    // TIMEOUT
    // =================================

    if (interaction.commandName === "timeout") {

        if (
            !interaction.member.permissions.has(
                PermissionsBitField.Flags.ModerateMembers
            )
        ) {

            return interaction.reply({
                content: "❌ No tienes permiso.",
                ephemeral: true
            });

        }

        const user =
            interaction.options.getUser("usuario");

        const minutes =
            interaction.options.getInteger("minutos");

        const reason =
            interaction.options.getString("razon") ||
            "Sin razón especificada";

        const member =
            await interaction.guild.members
                .fetch(user.id)
                .catch(() => null);

        if (!member) {

            return interaction.reply({
                content: "❌ No encontré a ese usuario.",
                ephemeral: true
            });

        }

        if (!member.moderatable) {

            return interaction.reply({
                content:
                    "❌ No puedo aplicar timeout a este usuario.",
                ephemeral: true
            });

        }

        await member.timeout(
            minutes * 60 * 1000,
            reason
        );

        await interaction.reply(
            `🔇 ${user} recibió un timeout de **${minutes} minutos**.\n**Razón:** ${reason}`
        );

    }

});

// ===============================
// ERRORES
// ===============================

client.on("error", error => {

    console.error("Discord error:", error);

});

process.on("unhandledRejection", error => {

    console.error(
        "Unhandled rejection:",
        error
    );

});

// ===============================
// LOGIN
// ===============================

client.login(TOKEN);