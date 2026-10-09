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
    GatewayIntentBits,
    PermissionsBitField,
    REST,
    Routes,
    SlashCommandBuilder
} = require("discord.js");

// ===============================
// CONFIGURACIÓN
// ===============================

const TOKEN = process.env.DISCORD_TOKEN;
const CHAT_CHANNEL_ID = "1530770440992194643";
const FUNNY_ROLE_ID = "1531550671285784770";
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

// Tiempo mínimo entre mensajes
const MESSAGE_COOLDOWN = 5000;

// Cuántas infracciones antes de timeout
const MAX_WARNINGS = 3;

// Duración del timeout
const TIMEOUT_DURATION = 60 * 1000;

// Máximo de mensajes iguales consecutivos
const MAX_DUPLICATE_MESSAGES = 3;

const ECONOMY_FILE = path.join(__dirname, "economy.json");
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

// ===============================
// MEMORIA DEL ANTI-SPAM
// ===============================

const userCooldowns = new Map();
const userWarnings = new Map();
const userLastMessages = new Map();

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
const WELCOME_MESSAGES = [
    memberId => `¡Bienvenido, <@${memberId}>! El caos ya tiene refuerzos.`,
    memberId => `¡Llegó <@${memberId}>! Ponte cómodo; el bot ya estaba hablando solo.`,
    memberId => `¡Bienvenido a bordo, <@${memberId}>! La cordura es opcional y el caos viene incluido.`,
    memberId => `¡Se sumó <@${memberId}>! Ahora somos oficialmente más que los errores del bot.`,
    memberId => `¡Hola, <@${memberId}>! Si el bot te saluda primero, no significa que sepa lo que hace.`
];

function pickRandomMessage(messages) {

    return messages[Math.floor(Math.random() * messages.length)];
}

function isMessageAgainstBot(message) {

    const content = message.content
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    const mentionsBot = message.mentions.has(message.client.user)
        || message.mentions.users.has(message.client.user.id)
        || message.mentions.repliedUser?.id === message.client.user.id
        || new RegExp(`\\b(bot|robot)\\b|<@!?${message.client.user.id}>`).test(content);
    const saysSleep = /\b(duermalo|duermelo|dormilo|dormirlo)\b/.test(content);
    const saysLowerSalary = /\b(baj\w*|reduc\w*|recort\w*)\b.{0,40}\b(sueldo|salario|paga)\b|\b(sueldo|salario|paga)\b.{0,40}\b(baj\w*|reduc\w*|recort\w*)\b/.test(content);

    return mentionsBot || saysSleep || saysLowerSalary;
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
        .setName("8ball")
        .setDescription("Consulta la bola mágica y descubre la probabilidad.")
        .addStringOption(option =>
            option
                .setName("pregunta")
                .setDescription("La pregunta que quieres hacerle a la bola mágica.")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("ppt")
        .setDescription("Juega piedra, papel o tijera contra el bot o una persona.")
        .addUserOption(option =>
            option
                .setName("oponente")
                .setDescription("Persona contra la que quieres jugar; vacío para jugar contra el bot.")
                .setRequired(false)
        ),

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
        )

].map(command => command.toJSON());

// ===============================
// REGISTRAR COMANDOS
// ===============================

const rest = new REST({ version: "10" }).setToken(TOKEN);

async function registerCommands() {

    try {

        console.log("Registrando comandos...");

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
            "`/ppt [oponente]` Juega piedra, papel o tijera contra el bot o una persona.",
            "`/8ball pregunta` Consulta una respuesta y su probabilidad.",
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
            "`/timeout usuario minutos [razon]` Aplica un timeout. Requiere Moderar miembros."
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

function createRockPaperScissorsButtons(
    interactionId,
    choicesDisabled = false,
    includeRematch = false,
    rematchDisabled = false
) {

    const choices = ["piedra", "papel", "tijera"];
    const rows = [
        new ActionRowBuilder().addComponents(
            ...choices.map(choice =>
                new ButtonBuilder()
                    .setCustomId(`ppt-${interactionId}-${choice}`)
                    .setLabel(choice[0].toUpperCase() + choice.slice(1))
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(choicesDisabled)
            )
        )
    ];

    if (includeRematch) {
        rows.push(
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`ppt-${interactionId}-rematch`)
                    .setLabel("Revancha")
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(rematchDisabled)
            )
        );
    }

    return rows;

}

// ===============================
// BOT ENCENDIDO
// ===============================

client.once("ready", async () => {

    console.log("--------------------------------");
    console.log(`Bot conectado como ${client.user.tag}`);
    console.log(`Servidores: ${client.guilds.cache.size}`);
    console.log("--------------------------------");

    client.user.setPresence({
        activities: [{
            name: "estoy en decadencia",
            state: "estoy en decadencia",
            type: ActivityType.Custom
        }],
        status: "dnd"
    });

    scheduleFunnyMessage();
    await registerCommands();

});

client.on("guildMemberAdd", async member => {

    if (member.user.bot || member.guild.name.trim().toLowerCase() !== "fuck") return;

    try {

        const channel = await client.channels.fetch(CHAT_CHANNEL_ID);

        if (!channel?.isTextBased() || channel.guildId !== member.guild.id) {
            throw new Error("El canal de bienvenida no pertenece al servidor configurado.");
        }

        await channel.send({
            content: pickRandomMessage(WELCOME_MESSAGES)(member.id),
            allowedMentions: {
                parse: [],
                users: [member.id]
            }
        });

    } catch (error) {

        console.error("No pude enviar el mensaje de bienvenida:", error);

    }

});

// ===============================
// ANTI-SPAM
// ===============================

client.on("messageCreate", async message => {

    // Ignorar bots
    if (message.author.bot) return;

    // Ignorar mensajes privados
    if (!message.guild) return;

    if (isMessageAgainstBot(message)) {

        try {

            await message.channel.sendTyping();
            await new Promise(resolve => setTimeout(resolve, BOT_REPLY_DELAY));
            const gifUrl = pickRandomMessage(BOT_REPLY_GIF_URLS);
            await message.channel.send(`${pickRandomMessage(BOT_REPLY_MESSAGES)}\n${gifUrl}`);

        } catch (error) {

            console.error("No pude responder al mensaje contra el bot:", error);

        }

        return;
    }

    const userId = message.author.id;

    // =================================
    // COOLDOWN DE 5 SEGUNDOS
    // =================================

    const now = Date.now();

    const lastMessage = userCooldowns.get(userId);

    if (lastMessage) {

        const difference = now - lastMessage;

        if (difference < MESSAGE_COOLDOWN) {

            // Eliminar mensaje
            try {

                await message.delete();

            } catch (error) {

                console.log("No pude eliminar el mensaje.");

            }

            // Añadir advertencia
            const warnings =
                (userWarnings.get(userId) || 0) + 1;

            userWarnings.set(userId, warnings);

            // Tiempo restante
            const remaining =
                Math.ceil((MESSAGE_COOLDOWN - difference) / 1000);

            try {

                const warningMessage = await message.channel.send(
                    `${message.author}, espera **${remaining} segundos** antes de enviar otro mensaje. ⚠️`
                );

                setTimeout(() => {

                    warningMessage.delete().catch(() => {});

                }, 3000);

            } catch (error) {}

            // =================================
            // TIMEOUT
            // =================================

            if (warnings >= MAX_WARNINGS) {

                try {

                    await message.member.timeout(
                        TIMEOUT_DURATION,
                        "Anti-spam automático"
                    );

                    const timeoutMessage =
                        await message.channel.send(
                            `${message.author} fue silenciado durante 1 minuto por spam. 🔇`
                        );

                    setTimeout(() => {

                        timeoutMessage.delete().catch(() => {});

                    }, 5000);

                    // Reiniciar advertencias
                    userWarnings.delete(userId);

                } catch (error) {

                    console.log(
                        "No pude aplicar timeout:",
                        error.message
                    );

                }

            }

            return;
        }

    }

    userCooldowns.set(userId, now);

    // =================================
    // MENSAJES REPETIDOS
    // =================================

    const lastMessageData =
        userLastMessages.get(userId);

    if (lastMessageData) {

        if (
            lastMessageData.content.toLowerCase() ===
            message.content.toLowerCase()
        ) {

            lastMessageData.count++;

        } else {

            lastMessageData.content = message.content;
            lastMessageData.count = 1;

        }

    } else {

        userLastMessages.set(userId, {

            content: message.content,
            count: 1

        });

    }

    const duplicateData =
        userLastMessages.get(userId);

    if (duplicateData.count >= MAX_DUPLICATE_MESSAGES) {

        try {

            await message.delete();

            await message.member.timeout(
                TIMEOUT_DURATION,
                "Spam de mensajes repetidos"
            );

            const warning =
                await message.channel.send(
                    `${message.author} fue silenciado por enviar mensajes repetidos. 🔇`
                );

            setTimeout(() => {

                warning.delete().catch(() => {});

            }, 5000);

        } catch (error) {

            console.log(
                "Error con anti-spam:",
                error.message
            );

        }

        duplicateData.count = 0;

    }

});

// ===============================
// SLASH COMMANDS
// ===============================

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

client.on("interactionCreate", async interaction => {

    if (!interaction.isChatInputCommand()) return;

    if (await handleEconomyCommand(interaction)) return;

    if (interaction.commandName === "8ball") {

        const question = interaction.options.getString("pregunta", true);
        const probability = Math.floor(Math.random() * 101);
        const answer = probability < 20
            ? "Las señales dicen que no."
            : probability < 40
                ? "Parece poco probable."
                : probability < 60
                    ? "La bola no puede decidirse todavía."
                    : probability < 80
                        ? "Todo apunta a que sí."
                        : "Es casi seguro que sí.";

        return interaction.reply({
            content: `**Pregunta:** ${question}\n**Probabilidad:** ${probability}%\n${answer}`,
            allowedMentions: { parse: [] }
        });

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
    // PIEDRA, PAPEL O TIJERA
    // =================================

    if (interaction.commandName === "ppt") {

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

        const choices = ["piedra", "papel", "tijera"];
        const winningChoices = {
            piedra: "tijera",
            papel: "piedra",
            tijera: "papel"
        };
        const playerIds = [interaction.user.id, ...(opponent ? [opponent.id] : [])];
        const playerChoices = new Map();
        let roundFinished = false;

        const createPrompt = () => opponent
            ? `${interaction.user} retó a ${opponent} a piedra, papel o tijera. Elijan sin mirar la jugada del otro.`
            : `${interaction.user}, elige tu jugada contra el bot:`;

        await interaction.reply({
            content: createPrompt(),
            components: createRockPaperScissorsButtons(interaction.id),
            allowedMentions: { parse: [], users: playerIds }
        });

        const gameMessage = await interaction.fetchReply();
        const collector = gameMessage.createMessageComponentCollector({
            time: 120000
        });

        collector.on("collect", async buttonInteraction => {

            if (!playerIds.includes(buttonInteraction.user.id)) {
                return buttonInteraction.reply({
                    content: "No participas en esta partida.",
                    ephemeral: true
                });
            }

            const choice = buttonInteraction.customId.split("-").pop();

            if (choice === "rematch") {
                if (!roundFinished) {
                    return buttonInteraction.reply({
                        content: "La ronda todavía no termina.",
                        ephemeral: true
                    });
                }

                playerChoices.clear();
                roundFinished = false;
                collector.resetTimer();

                return buttonInteraction.update({
                    content: createPrompt(),
                    components: createRockPaperScissorsButtons(interaction.id),
                    allowedMentions: { parse: [], users: playerIds }
                });
            }

            if (roundFinished) {
                return buttonInteraction.reply({
                    content: "La ronda terminó. Pulsa Revancha para jugar otra vez.",
                    ephemeral: true
                });
            }

            if (!choices.includes(choice)) {
                return buttonInteraction.reply({
                    content: "Esa jugada no es válida.",
                    ephemeral: true
                });
            }

            if (playerChoices.has(buttonInteraction.user.id)) {
                return buttonInteraction.reply({
                    content: "Ya elegiste; espera a que termine la ronda.",
                    ephemeral: true
                });
            }

            playerChoices.set(buttonInteraction.user.id, choice);

            if (!opponent) {
                const botChoice = choices[Math.floor(Math.random() * choices.length)];
                const result = choice === botChoice
                    ? "Empate, nadie pudo presumir esta vez."
                    : winningChoices[choice] === botChoice
                        ? "¡Ganaste! El bot va a pedir la revancha."
                        : "Ganó el bot. Exige una auditoría de sus manos digitales.";

                roundFinished = true;

                return buttonInteraction.update({
                    content: `Tú: **${choice}** | Bot: **${botChoice}**\n${result}`,
                    components: createRockPaperScissorsButtons(interaction.id, true, true),
                    allowedMentions: { parse: [], users: playerIds }
                });
            }

            if (playerChoices.size < playerIds.length) {
                const waitingFor = buttonInteraction.user.id === interaction.user.id
                    ? opponent
                    : interaction.user;

                return buttonInteraction.update({
                    content: `${buttonInteraction.user} ya eligió. Esperando a ${waitingFor}.`,
                    components: createRockPaperScissorsButtons(interaction.id),
                    allowedMentions: { parse: [], users: playerIds }
                });
            }

            const firstChoice = playerChoices.get(interaction.user.id);
            const secondChoice = playerChoices.get(opponent.id);
            const result = firstChoice === secondChoice
                ? "Empate, nadie pudo presumir esta vez."
                : winningChoices[firstChoice] === secondChoice
                    ? `¡Ganó ${interaction.user}!`
                    : `¡Ganó ${opponent}!`;

            roundFinished = true;

            await buttonInteraction.update({
                content: `${interaction.user}: **${firstChoice}** | ${opponent}: **${secondChoice}**\n${result}`,
                components: createRockPaperScissorsButtons(interaction.id, true, true),
                allowedMentions: { parse: [], users: playerIds }
            });

        });

        collector.on("end", async (_, reason) => {

            if (reason !== "time") return;

            if (!roundFinished) {
                roundFinished = true;
                await interaction.editReply({
                    content: "Se acabó el tiempo. La ronda quedó sin terminar.",
                    components: createRockPaperScissorsButtons(interaction.id, true),
                    allowedMentions: { parse: [], users: playerIds }
                }).catch(() => {});
            } else {
                await interaction.editReply({
                    components: createRockPaperScissorsButtons(interaction.id, true, true, true)
                }).catch(() => {});
            }

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