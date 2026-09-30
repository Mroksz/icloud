require("dotenv").config();

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
const STREAM_URL = process.env.STREAM_URL;
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
    "Si pensar contara como ejercicio, ya habría terminado la rutina de hoy."
];

// Tiempo mínimo entre mensajes
const MESSAGE_COOLDOWN = 5000;

// Cuántas infracciones antes de timeout
const MAX_WARNINGS = 3;

// Duración del timeout
const TIMEOUT_DURATION = 60 * 1000;

// Máximo de mensajes iguales consecutivos
const MAX_DUPLICATE_MESSAGES = 3;

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

// ===============================
// COMANDOS
// ===============================

const commands = [

    new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Comprueba si el bot está funcionando."),

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
        title: "Diversión y comandos públicos",
        description: [
            "`/gato [oponente]` Juega tres en raya contra el bot o una persona. Disponible para todos.",
            "`/ppt [oponente]` Juega piedra, papel o tijera contra el bot o una persona. Disponible para todos.",
            "`/ping` Comprueba la latencia del bot. Disponible para todos.",
            "`/help` Abre esta guía. Disponible para todos."
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
        .setFooter({ text: `Página ${pageIndex + 1} de ${HELP_PAGES.length}` });

}

function createHelpButtons(pageIndex, interactionId, disabled = false) {

    return [
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`help-${interactionId}-previous`)
                .setLabel("Anterior")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(disabled || pageIndex === 0),
            new ButtonBuilder()
                .setCustomId(`help-${interactionId}-next`)
                .setLabel("Siguiente")
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

    if (STREAM_URL) {
        client.user.setPresence({
            activities: [{
                name: "Fuck server",
                state: "estoy ocupado bro",
                type: ActivityType.Streaming,
                url: STREAM_URL
            }],
            status: "dnd"
        });
    } else {
        console.warn("Define STREAM_URL en .env para activar el estado de transmisión.");
    }

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
            content: `¡Bienvenido, <@${member.id}>! Ya eres oficialmente parte del caos de **fuck**. Ponte cómodo y no le des de comer al bot.`,
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