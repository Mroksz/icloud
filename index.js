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
const STARTING_BALANCE = 1000;
const MINIMUM_BET = 10;
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
const AKINATOR_MAX_QUESTIONS = 30;
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
            lastStealAt: 0
        };
        saveEconomyData();
    }

    return economyData[guildId][userId];
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
            || typeof settings.gifRepliesEnabled !== "boolean"
            || typeof settings.chatStatsEnabled !== "boolean"
            || !settings.users
            || typeof settings.users !== "object"
            || Array.isArray(settings.users)
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
            gifRepliesEnabled: true,
            chatStatsEnabled: false,
            users: {}
        };
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

async function handleEconomyCommand(interaction) {

    const economyCommands = ["saldo", "trabajar", "ruleta", "apostar", "robar", "top"];

    if (!economyCommands.includes(interaction.commandName)) return false;

    if (!interaction.guild) {
        await replyEconomyError(interaction, "La economía solo está disponible dentro de un servidor.");
        return true;
    }

    const guildId = interaction.guild.id;
    const userId = interaction.user.id;

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
        const earnings = Math.floor(Math.random() * (job.maximum - job.minimum + 1)) + job.minimum;
        account.balance += earnings;
        account.lastWorkAt = now;
        saveEconomyData();

        await interaction.reply({
            embeds: [createEconomyEmbed(
                "🧰 Turno terminado",
                `Trabajaste como **${job.name}** y ganaste **${formatPesos(earnings)}**.\n` +
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

const commands = [

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
        .setName("ping")
        .setDescription("Comprueba si el bot está funcionando."),

    new SlashCommandBuilder()
        .setName("help")
        .setDescription("Muestra los comandos del bot."),

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
        .setDescription("Piensa en una persona, lugar, comida, película o personaje y responde hasta 30 preguntas."),

    new SlashCommandBuilder()
        .setName("gifrespuestas")
        .setDescription("Activa o desactiva las respuestas del bot con GIF en este servidor.")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addBooleanOption(option =>
            option
                .setName("activado")
                .setDescription("Elige si el bot contestará con GIF.")
                .setRequired(true)
        ),

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
        )

].map(command => command.toJSON());

// ===============================
// REGISTRAR COMANDOS
// ===============================

const rest = new REST({ version: "10" }).setToken(TOKEN);

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
                if (!["8ball", "ppt"].includes(command.name)) continue;

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
        title: "💰 Economía · Pesos mexicanos",
        description: [
            "`/saldo [usuario]` Consulta tu cartera. Las cuentas nuevas empiezan con $1,000 MXN.",
            "`/trabajar` Cobra por un empleo aleatorio. Tiene 1 hora de espera.",
            "`/ruleta apuesta color` Apuesta al rojo, negro o verde; verde paga 14x.",
            "`/apostar apuesta lado` Juega cara o cruz; acertar devuelve 2x.",
            "`/robar usuario` Tienes 40% de éxito; si fallas, pagas una multa. Espera 3 horas entre intentos.",
            "`/top` Mira las 10 mayores fortunas de este servidor."
        ].join("\n\n")
    },
    {
        title: "🎮 Juegos y utilidades",
        description: [
            "`/gato [oponente]` Juega tres en raya contra el bot o una persona.",
            "`/akinator` Piensa en una persona, lugar, comida, película o personaje y responde hasta 30 preguntas.",
            "`/oraculo pregunta` Pregúntale al oráculo caótico de iCloud.",
            "`/reto` Recibe un reto creativo y pide otro con el botón.",
            "`/nivel [usuario]` Consulta el nivel y progreso de chat en este servidor.",
            "`/topniveles` Mira el ranking de niveles de este servidor.",
            "`/topchat` Mira quién ha escrito más en este servidor.",
            "`/ping` Comprueba la latencia del bot.",
            "`/help` Abre esta guía."
        ].join("\n\n")
    },
    {
        title: "Moderación: requiere permisos",
        description: [
            "Solo miembros con el permiso indicado pueden usar estos comandos. Los administradores también tienen acceso.",
            "`/clear cantidad` Elimina de 1 a 100 mensajes. Requiere Gestionar mensajes.",
            "`/kick usuario [razon]` Expulsa a una persona. Requiere Expulsar miembros.",
            "`/ban usuario [razon]` Banea a una persona. Requiere Banear miembros.",
            "`/timeout usuario minutos [razon]` Aplica un timeout. Requiere Moderar miembros.",
            "`/darrol usuario rol [minutos]` Asigna un rol; sin minutos es permanente. Solo administradores.",
            "`/conectar canal` Conecta un canal al chat comunitario. Solo administradores.",
            "`/gifrespuestas activado` Enciende o apaga las respuestas con GIF. Solo administradores.",
            "`/chatstats activado` Activa o desactiva niveles y estadísticas del chat. Solo administradores."
        ].join("\n\n")
    }
];

function createHelpEmbed(pageIndex) {

    const page = HELP_PAGES[pageIndex];

    return new EmbedBuilder()
        .setColor(0x2f9e8f)
        .setTitle(page.title)
        .setDescription(page.description)
        .setFooter({ text: `📖 Página ${pageIndex + 1} de ${HELP_PAGES.length}` });

}

function createHelpButtons(pageIndex, interactionId, disabled = false) {

    return [
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`help-${interactionId}-previous`)
                .setLabel("◀️ Anterior")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(disabled || pageIndex === 0),
            new ButtonBuilder()
                .setCustomId(`help-${interactionId}-next`)
                .setLabel("Siguiente ▶️")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(disabled || pageIndex === HELP_PAGES.length - 1)
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

client.on("guildCreate", async guild => {

    if (guild.id !== PERSONALITY_GUILD_ID) return;

    try {
        const botMember = await guild.members.fetchMe();
        const candidateChannels = [
            guild.systemChannel,
            ...guild.channels.cache.filter(channel => channel.isTextBased()).values()
        ].filter(Boolean);
        const welcomeChannel = candidateChannels.find(channel =>
            channel.isTextBased()
            && channel.permissionsFor(botMember)?.has([
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages
            ])
        );

        if (!welcomeChannel) {
            console.warn(`No encontré un canal donde dar la bienvenida en ${guild.name}.`);
            return;
        }

        await welcomeChannel.send({
            content: `👋 ¡Hola, **${guild.name}**! Soy **iCloud**, el bot del servidor. Usa \`/help\` para descubrir lo que puedo hacer. ¡Gracias por invitarme!`,
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

client.on("messageCreate", async message => {

    // Ignorar bots
    if (message.author.bot) return;

    // Ignorar mensajes privados
    if (!message.guild) return;

    const botReplyType = message.guild.id === PERSONALITY_GUILD_ID
        ? getBotReplyType(message)
        : null;

    if (botReplyType) {
        if (
            botReplyType === "gif"
            && !getGuildSettings(message.guild.id).gifRepliesEnabled
        ) {
            recordChatMessage(message);
            await relayCommunityMessage(message);
            return;
        }

        try {

            await relayCommunityMessage(message);
            await message.channel.sendTyping();
            await new Promise(resolve => setTimeout(resolve, BOT_REPLY_DELAY));
            if (botReplyType === "gif") {
                const gifUrl = pickRandomMessage(BOT_REPLY_GIF_URLS);
                const replyEmoji = pickRandomMessage(BOT_GIF_REPLY_EMOJIS);
                await message.channel.send(`${replyEmoji} ${pickRandomMessage(BOT_REPLY_MESSAGES)}\n${gifUrl}`);
            } else {
                const botReply = await message.channel.send(
                    pickRandomMessage(BOT_MENTION_MESSAGES)
                );

                try {
                    await botReply.react("1531564951049732107");
                } catch (error) {
                    console.error("No pude reaccionar a mi respuesta:", error);
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

function rankAkinatorCharacters(answers) {

    const answerScores = {
        yes: [-2, 2],
        no: [2, -2],
        probably: [-1, 1],
        probably_not: [1, -1]
    };
    const ranked = AKINATOR_CHARACTERS.map(character => ({
        character,
        score: [...answers].reduce((score, [trait, answer]) => {
            const scores = answerScores[answer];
            if (!scores) return score;

            return score + scores[Number(character.traits.includes(trait))];
        }, 0)
    }));
    const bestScore = Math.max(...ranked.map(candidate => candidate.score));

    return ranked
        .filter(candidate => candidate.score >= bestScore - 2)
        .map(candidate => candidate.character);
}

function chooseAkinatorQuestion(candidates, askedQuestions) {

    const availableQuestions = AKINATOR_QUESTIONS.filter(
        question => !askedQuestions.has(question.trait)
            && (
                !["male", "female"].includes(question.trait)
                || candidates.every(character =>
                    character.traits.includes("male")
                    || character.traits.includes("female")
                )
            )
    );
    let bestBalance = Infinity;
    let bestQuestions = [];

    for (const question of availableQuestions) {
        const yesCount = candidates.filter(
            character => character.traits.includes(question.trait)
        ).length;

        if (yesCount === 0 || yesCount === candidates.length) continue;

        const balance = Math.abs(candidates.length - 2 * yesCount);

        if (balance < bestBalance) {
            bestBalance = balance;
            bestQuestions = [question];
        } else if (balance === bestBalance) {
            bestQuestions.push(question);
        }
    }

    return pickRandomMessage(bestQuestions);
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

function createAkinatorButtons(gameId, disabled = false, canGoBack = false) {

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
                .setDisabled(!canGoBack)
        )
    ];
}

function createAkinatorQuestionEmbed(question, candidates, askedCount) {

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
            text: `Base local: ${AKINATOR_CHARACTERS.length} opciones · Máximo ${AKINATOR_MAX_QUESTIONS} preguntas`
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

            lastError = new Error(`No encontré una imagen para ${character.name} en Wikipedia (${language}).`);
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
        const options = interaction.options.data
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

client.on("interactionCreate", async interaction => {

    if (!interaction.isChatInputCommand()) return;

    void logCommandUsage(interaction);

    if (await handleConnectChannelCommand(interaction)) return;

    if (await handleEconomyCommand(interaction)) return;

    if (interaction.commandName === "gifrespuestas" || interaction.commandName === "chatstats") {

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
        const settingName = interaction.commandName === "gifrespuestas"
            ? "gifRepliesEnabled"
            : "chatStatsEnabled";
        const previousValue = settings[settingName];
        settings[settingName] = enabled;

        try {
            saveGuildSettings();
        } catch (error) {
            settings[settingName] = previousValue;
            console.error("No pude guardar la configuración del servidor:", error);
            return interaction.reply({
                content: "❌ No pude guardar el cambio. Inténtalo de nuevo.",
                ephemeral: true
            });
        }

        const confirmation = interaction.commandName === "gifrespuestas"
            ? enabled
                ? "✅ Activé las respuestas con GIF en este servidor."
                : "✅ Desactivé las respuestas con GIF en este servidor. Las respuestas de texto al mencionarme siguen activas."
            : enabled
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

    if (interaction.commandName === "akinator") {

        const gameId = interaction.id;
        const state = {
            answers: new Map(),
            askedQuestions: new Set(),
            questionCount: 0,
            history: []
        };
        let candidates = rankAkinatorCharacters(state.answers);
        let currentQuestion = chooseAkinatorQuestion(
            AKINATOR_CHARACTERS,
            state.askedQuestions
        );

        await interaction.reply({
            embeds: [createAkinatorQuestionEmbed(
                currentQuestion,
                candidates,
                state.questionCount
            )],
            components: createAkinatorButtons(gameId)
        });

        const gameMessage = await interaction.fetchReply();
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

                if (answer === "back") {
                    const previousState = state.history.pop();
                    if (!previousState) return;

                    state.answers = previousState.answers;
                    state.askedQuestions = previousState.askedQuestions;
                    state.questionCount = previousState.questionCount;
                    currentQuestion = previousState.currentQuestion;
                    candidates = rankAkinatorCharacters(state.answers);

                    await gameMessage.edit({
                        embeds: [createAkinatorQuestionEmbed(
                            currentQuestion,
                            candidates,
                            state.questionCount
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

                candidates = rankAkinatorCharacters(state.answers);
                const nextQuestion = chooseAkinatorQuestion(
                    candidates,
                    state.askedQuestions
                );
                const fallbackQuestion = nextQuestion || (
                    state.questionCount < AKINATOR_MAX_QUESTIONS
                        ? chooseAkinatorQuestion(
                            AKINATOR_CHARACTERS,
                            state.askedQuestions
                        )
                        : null
                );
                const shouldGuess = state.questionCount >= AKINATOR_MAX_QUESTIONS
                    || !fallbackQuestion;

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
                            state.history.length > 0
                        )
                    });
                    return;
                }

                currentQuestion = fallbackQuestion;
                await gameMessage.edit({
                    embeds: [createAkinatorQuestionEmbed(
                        currentQuestion,
                        candidates,
                        state.questionCount
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
                    components: createAkinatorButtons(gameId, true)
                }).catch(editError => {
                    console.error("No pude mostrar el error de Akinator:", editError);
                });
            } finally {
                processingAnswer = false;
            }

        });

        collector.on("end", (_, reason) => {

            if (reason === "guessed" || reason === "error") return;

            void gameMessage.edit({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x7d3c98)
                        .setTitle("🔮 Partida terminada")
                        .setDescription("Se acabó el tiempo. Inicia otra partida con `/akinator`.")
                ],
                components: createAkinatorButtons(gameId, true)
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

            pageIndex = buttonInteraction.customId.endsWith("next")
                ? Math.min(pageIndex + 1, HELP_PAGES.length - 1)
                : Math.max(pageIndex - 1, 0);

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