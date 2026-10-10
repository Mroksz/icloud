const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require("discord.js");

const MYSTERY_CASES = [
    {
        title: "La joya del ala norte",
        setting: "Museo de San Telmo",
        introduction: "Durante la gala, desapareció la Estrella de Ámbar de una vitrina que no fue forzada. La alarma se activó a las 21:20; el museo cerró sus puertas cinco minutos después.",
        suspects: [
            {
                name: "Irene Vidal",
                role: "Curadora",
                motive: "El museo rechazó su propuesta de trasladar la pieza.",
                alibi: "Asegura que presentó el discurso en el escenario entre las 21:10 y las 21:25."
            },
            {
                name: "Bruno Salas",
                role: "Guardia nocturno",
                motive: "Tiene deudas y conocía los puntos ciegos de las cámaras.",
                alibi: "Dice que patrulló el ala sur y que no se acercó a la vitrina."
            },
            {
                name: "Clara Montes",
                role: "Restauradora",
                motive: "La joya debía salir de exhibición para una restauración que ella dirigiría.",
                alibi: "Afirma que estuvo preparando materiales en el taller."
            },
            {
                name: "Damián Cruz",
                role: "Periodista",
                motive: "Quería una exclusiva que le devolviera relevancia.",
                alibi: "Sostiene que entrevistó invitados en el vestíbulo."
            }
        ],
        evidence: [
            {
                title: "La vitrina",
                detail: "No hay marcas de ganzúa. El cierre se abrió con una llave de mantenimiento y quedó una fina capa de cera azul en el borde interior."
            },
            {
                title: "El registro de acceso",
                detail: "La llave de mantenimiento se retiró a las 21:14. El registro indica que fue devuelta a las 21:23; solo el personal de conservación podía solicitarla."
            },
            {
                title: "La cámara del taller",
                detail: "La grabación muestra el taller vacío entre las 21:12 y las 21:24. En ese intervalo, el escenario y el vestíbulo aparecen continuamente en cámara."
            },
            {
                title: "La mesa de restauración",
                detail: "La cera azul coincide con la que se usa para proteger piezas durante el embalaje. En el taller falta una caja de transporte del tamaño exacto de la joya."
            }
        ],
        culprit: 2,
        solution: "Clara Montes tomó la llave de conservación, abrió la vitrina y escondió la joya en una caja de embalaje. Su taller vacío contradice su coartada; la cera y la caja conectan la escena con su trabajo."
    },
    {
        title: "Silencio en el observatorio",
        setting: "Observatorio de Sierra Clara",
        introduction: "La noche de una lluvia de meteoros, alguien sustituyó el fragmento original de una exposición por una réplica. El edificio permaneció cerrado al público, pero había cuatro personas trabajando.",
        suspects: [
            {
                name: "Dr. Mateo Ríos",
                role: "Astrónomo",
                motive: "Quería ocultar que había alterado las notas de una investigación.",
                alibi: "Dice que observó el cielo desde la cúpula principal."
            },
            {
                name: "Vera León",
                role: "Técnica de laboratorio",
                motive: "Disputaba la autoría de un descubrimiento con el astrónomo.",
                alibi: "Asegura que calibró el espectrómetro en el laboratorio."
            },
            {
                name: "Óscar Beltrán",
                role: "Encargado de seguridad",
                motive: "Conocía las claves y necesitaba dinero.",
                alibi: "Afirma que vigiló la entrada durante toda la noche."
            },
            {
                name: "Nadia Sol",
                role: "Fotógrafa científica",
                motive: "Quería vender una imagen exclusiva del meteorito.",
                alibi: "Dice que fotografió la lluvia desde la terraza."
            }
        ],
        evidence: [
            {
                title: "La réplica",
                detail: "La pieza falsa tiene una aleación que no se usa en el observatorio. Una etiqueta del proveedor indica que fue entregada esa misma tarde."
            },
            {
                title: "La puerta de la exposición",
                detail: "La puerta no fue forzada. Se abrió con una tarjeta temporal asignada al laboratorio; el sistema registró el acceso a las 23:48."
            },
            {
                title: "El espectrómetro",
                detail: "El registro muestra que el equipo estuvo apagado de 23:40 a 00:05, aunque la bitácora de Vera asegura que lo calibró sin interrupción."
            },
            {
                title: "La terraza",
                detail: "Todas las fotografías de Nadia tienen metadatos continuos entre las 23:35 y las 00:10. La cúpula registra observaciones durante el mismo periodo."
            }
        ],
        culprit: 1,
        solution: "Vera León usó la tarjeta del laboratorio para entrar en la exposición y colocar la réplica. El registro del espectrómetro demuestra que su coartada es falsa; la tarjeta y la entrega de la aleación explican cómo preparó el cambio."
    },
    {
        title: "El último tren de medianoche",
        setting: "Estación de Puerto Viejo",
        introduction: "Desapareció un sobre con los planos originales de la estación justo antes de que partiera el último tren. El sobre estaba en la oficina del jefe de estación y nadie reportó una puerta forzada.",
        suspects: [
            {
                name: "Elena Prado",
                role: "Jefa de estación",
                motive: "Los planos podían probar que autorizó una remodelación irregular.",
                alibi: "Dice que estuvo coordinando la salida del tren desde el andén."
            },
            {
                name: "Tomás Vega",
                role: "Maquinista",
                motive: "Temía que los planos revelaran una falla que él había reportado.",
                alibi: "Asegura que no abandonó la locomotora."
            },
            {
                name: "Rita Campos",
                role: "Archivista",
                motive: "Quería impedir la demolición de un edificio histórico.",
                alibi: "Afirma que ordenó documentos en el archivo."
            },
            {
                name: "Iván Solís",
                role: "Vendedor del quiosco",
                motive: "Debía dinero y conocía los horarios de todo el personal.",
                alibi: "Dice que atendió el quiosco hasta la salida del tren."
            }
        ],
        evidence: [
            {
                title: "La oficina",
                detail: "El cajón de los planos se abrió con una llave maestra. Sobre el escritorio quedó tinta ferroviaria fresca, del mismo tipo que se usa para sellar el registro de salidas bajo custodia de la jefa de estación."
            },
            {
                title: "El corredor de oficinas",
                detail: "La cámara muestra a Elena entrando al corredor que conduce a la oficina a las 23:44 y regresando al andén a las 23:48. Ella afirma que no dejó el andén."
            },
            {
                title: "La locomotora",
                detail: "El registro de cabina no muestra interrupciones y confirma que Tomás permaneció al mando desde las 23:35 hasta la partida."
            },
            {
                title: "El archivo y el quiosco",
                detail: "Rita aparece en el archivo en el inventario de las 23:47. El recibo del quiosco de Iván, fechado a las 23:49, se imprimió desde su caja y coincide con el video."
            }
        ],
        culprit: 0,
        solution: "Elena Prado tomó los planos usando la llave maestra antes de acudir al andén. La tinta ferroviaria la vincula con la oficina y la cámara contradice que estuviera allí durante todo el intervalo; el tren partió mientras ella tenía oportunidad de regresar."
    }
];

function createMysteryEmbed(mystery, revealedClues, phase = "investigation", result = null) {

    const embed = new EmbedBuilder()
        .setColor(0x34495e)
        .setTitle(`🕵️ Expediente: ${mystery.title}`)
        .setDescription(
            `${mystery.introduction}\n\n**Lugar:** ${mystery.setting}\n\n` +
            `**Sospechosos**\n${mystery.suspects.map((suspect, index) =>
                `**${index + 1}. ${suspect.name} — ${suspect.role}**\n` +
                `Motivo: ${suspect.motive}\nCoartada: ${suspect.alibi}`
            ).join("\n\n")}`
        )
        .addFields({
            name: "Pistas",
            value: mystery.evidence.map((clue, index) =>
                revealedClues.has(index)
                    ? `**${index + 1}. ${clue.title}** — ${clue.detail}`
                    : `**${index + 1}.** 🔒 Pista sin investigar`
            ).join("\n")
        })
        .setFooter({ text: "Expediente cooperativo · Investiguen las pistas antes de acusar." });

    if (phase === "accusing") {
        embed.addFields({
            name: "Tu decisión",
            value: "¿A quién acusas? Elige con cuidado: una acusación equivocada cerrará el caso."
        });
    }

    if (phase === "abandoned" || phase === "timeout") {
        embed.setColor(0x7f8c8d);
        embed.addFields({
            name: phase === "timeout" ? "⌛ Expediente archivado" : "🚪 Caso abandonado",
            value: `La persona responsable era **${mystery.suspects[mystery.culprit].name}**.\n\n**Resolución:** ${mystery.solution}`
        });
    }

    if (result) {
        const solved = result.suspectIndex === mystery.culprit;
        embed.setColor(solved ? 0x2ecc71 : 0xe74c3c);
        embed.addFields({
            name: solved ? "✅ Caso resuelto" : "❌ Acusación incorrecta",
            value: `${solved
                ? `${mystery.suspects[mystery.culprit].name} era responsable.`
                : `Acusaste a ${mystery.suspects[result.suspectIndex].name}.`
            }\n\n**Resolución:** ${mystery.solution}` +
                (result.rewardMessage ? `\n\n💰 ${result.rewardMessage}` : "")
        });
    }

    return embed;
}

function createMysteryButtons(gameId, mystery, revealedClues, phase = "investigation", disabled = false) {

    if (phase === "accusing") {
        return [
            new ActionRowBuilder().addComponents(
                ...mystery.suspects.map((suspect, index) =>
                    new ButtonBuilder()
                        .setCustomId(`misterio-${gameId}-suspect-${index}`)
                        .setLabel(suspect.name)
                        .setStyle(ButtonStyle.Danger)
                )
            ),
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`misterio-${gameId}-cancel`)
                    .setLabel("Volver a las pistas")
                    .setStyle(ButtonStyle.Secondary)
            )
        ];
    }

    return [
        new ActionRowBuilder().addComponents(
            ...mystery.evidence.map((clue, index) =>
                new ButtonBuilder()
                    .setCustomId(`misterio-${gameId}-clue-${index}`)
                    .setLabel(`Investigar ${index + 1}`)
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(disabled || revealedClues.has(index))
            )
        ),
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`misterio-${gameId}-accuse`)
                .setLabel("Acusar")
                .setStyle(ButtonStyle.Danger)
                .setDisabled(disabled || revealedClues.size < 2),
            new ButtonBuilder()
                .setCustomId(`misterio-${gameId}-finish`)
                .setLabel("Abandonar")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(disabled)
        )
    ];
}

module.exports = {
    MYSTERY_CASES,
    createMysteryEmbed,
    createMysteryButtons
};
