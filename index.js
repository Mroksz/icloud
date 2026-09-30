require("dotenv").config();

const {
    Client,
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
        .setName("clear")
        .setDescription("Elimina mensajes.")
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

// ===============================
// BOT ENCENDIDO
// ===============================

client.once("ready", async () => {

    console.log("--------------------------------");
    console.log(`Bot conectado como ${client.user.tag}`);
    console.log(`Servidores: ${client.guilds.cache.size}`);
    console.log("--------------------------------");

    await registerCommands();

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