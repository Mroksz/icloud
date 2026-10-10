const CATEGORY_QUESTIONS = {
    person: "¿Estás pensando en una persona real?",
    sport: "¿Estás pensando en un deportista?",
    actor: "¿Estás pensando en un actor o actriz?",
    philosopher: "¿Estás pensando en un filósofo?",
    ruler: "¿Estás pensando en un gobernante o líder político?",
    scientist: "¿Estás pensando en un científico o inventor?",
    city: "¿Estás pensando en una ciudad?",
    food: "¿Estás pensando en una comida o bebida?",
    film: "¿Estás pensando en una película?",
    fiction: "¿Estás pensando en un personaje ficticio?",
    game: "¿Estás pensando en un personaje de videojuego?",
    youtuber: "¿Estás pensando en un YouTuber o creador de videos?"
};

const GROUP_QUESTIONS = {
    football: "¿Es conocido principalmente por el fútbol?",
    basketball: "¿Es conocido principalmente por el baloncesto?",
    tennis: "¿Es conocido principalmente por el tenis?",
    motorsport: "¿Compite o compitió en automovilismo?",
    athletics: "¿Destaca en atletismo o deportes olímpicos?",
    combat: "¿Practica un deporte de combate?",
    actor_hollywood: "¿Es conocido por el cine de Hollywood?",
    actor_mexican: "¿Es conocido por el cine o televisión mexicanos?",
    actor_classic: "¿Es una figura clásica del cine del siglo XX?",
    actor_comedy: "¿Es conocido principalmente por la comedia?",
    philosophy_ancient: "¿Es un filósofo de la Antigüedad?",
    philosophy_modern: "¿Es un filósofo de la época moderna o contemporánea?",
    philosophy_eastern: "¿Pertenece a una tradición filosófica asiática?",
    philosophy_political: "¿Es conocido por sus ideas políticas?",
    ruler_monarch: "¿Fue monarca, emperador o integrante de una dinastía gobernante?",
    ruler_president: "¿Fue jefe de Gobierno o de Estado en la época moderna?",
    ruler_ancient: "¿Gobernó en la Antigüedad?",
    ruler_revolution: "¿Lideró una revolución o movimiento independentista?",
    science_physics: "¿Su trabajo principal fue en física?",
    science_biology: "¿Su trabajo principal fue en biología o medicina?",
    science_chemistry: "¿Su trabajo principal fue en química?",
    science_math: "¿Su trabajo principal fue en matemáticas?",
    science_space: "¿Se dedicó principalmente a la astronomía o exploración espacial?",
    science_invention: "¿Es conocido por inventos o ingeniería?",
    city_europe: "¿Está en Europa?",
    city_asia: "¿Está en Asia?",
    city_america: "¿Está en América?",
    city_africa: "¿Está en África?",
    city_oceania: "¿Está en Oceanía?",
    food_mexican: "¿Es una comida o bebida típica de México?",
    food_italian: "¿Es una comida o bebida típica de Italia?",
    food_asian: "¿Es una comida o bebida típica de Asia?",
    food_dessert: "¿Es un postre o algo dulce?",
    food_drink: "¿Es una bebida?",
    food_fast: "¿Se considera comida rápida o comida callejera?",
    film_animation: "¿Es una película animada?",
    film_scifi: "¿Es de ciencia ficción?",
    film_action: "¿Es principalmente de acción o aventuras?",
    film_drama: "¿Es principalmente un drama?",
    film_comedy: "¿Es principalmente una comedia?",
    film_horror: "¿Es una película de terror?",
    fiction_literature: "¿Se originó en un libro o una obra literaria?",
    fiction_tv: "¿Es conocido principalmente por una serie de televisión?",
    fiction_film: "¿Es conocido principalmente por una película?",
    fiction_comics: "¿Se originó en un cómic?",
    game_nintendo: "¿Aparece en una franquicia de Nintendo?",
    game_playstation: "¿Aparece principalmente en una franquicia de PlayStation?",
    game_pc: "¿Es conocido por un juego de PC?",
    game_mobile: "¿Es conocido por un juego para móviles?",
    game_fighting: "¿Es de un juego de lucha?",
    game_adventure: "¿Es de un juego de aventuras o rol?",
    youtube_spanish: "¿Crea contenido principalmente en español?",
    youtube_gaming: "¿Su contenido principal son los videojuegos?",
    youtube_entertainment: "¿Su contenido principal es entretenimiento o retos?",
    youtube_education: "¿Su contenido principal es educativo o divulgativo?",
    youtube_music: "¿Su contenido principal es música?",
    youtube_english: "¿Crea contenido principalmente en inglés?"
};

const CHARACTER_ROWS = String.raw`
sport|football|Lionel Messi
sport|football|Cristiano Ronaldo
sport|football|Pelé
sport|football|Diego Maradona
sport|football|Neymar
sport|football|Kylian Mbappé
sport|football|Marta Vieira da Silva
sport|football|Alexia Putellas
sport|football|Zinedine Zidane
sport|football|Ronaldinho
sport|football|David Beckham
sport|football|Erling Haaland
sport|basketball|Michael Jordan
sport|basketball|LeBron James
sport|basketball|Kobe Bryant
sport|basketball|Stephen Curry
sport|basketball|Shaquille O'Neal
sport|basketball|Magic Johnson
sport|tennis|Serena Williams
sport|tennis|Roger Federer
sport|tennis|Rafael Nadal
sport|tennis|Novak Djokovic
sport|motorsport|Lewis Hamilton
sport|motorsport|Ayrton Senna
sport|motorsport|Michael Schumacher
sport|motorsport|Max Verstappen
sport|athletics|Usain Bolt
sport|athletics|Simone Biles
sport|athletics|Michael Phelps
sport|combat|Muhammad Ali
sport|combat|Mike Tyson
actor|actor_hollywood|Tom Hanks
actor|actor_hollywood|Leonardo DiCaprio
actor|actor_hollywood|Meryl Streep
actor|actor_hollywood|Denzel Washington
actor|actor_hollywood|Brad Pitt
actor|actor_hollywood|Angelina Jolie
actor|actor_hollywood|Robert Downey Jr.
actor|actor_hollywood|Scarlett Johansson
actor|actor_hollywood|Keanu Reeves
actor|actor_hollywood|Morgan Freeman
actor|actor_mexican|Cantinflas
actor|actor_mexican|María Félix
actor|actor_mexican|Salma Hayek
actor|actor_mexican|Gael García Bernal
actor|actor_mexican|Eugenio Derbez
actor|actor_mexican|Pedro Infante
actor|actor_mexican|Diego Luna
actor|actor_mexican|Damián Alcázar
actor|actor_classic|Charlie Chaplin
actor|actor_classic|Marilyn Monroe
actor|actor_classic|Audrey Hepburn
actor|actor_classic|Bruce Lee
actor|actor_comedy|Jim Carrey
actor|actor_comedy|Robin Williams
actor|actor_comedy|Adam Sandler
actor|actor_comedy|Rowan Atkinson
philosopher|philosophy_ancient|Sócrates
philosopher|philosophy_ancient|Platón
philosopher|philosophy_ancient|Aristóteles
philosopher|philosophy_ancient|Diógenes de Sinope
philosopher|philosophy_ancient|Epicuro
philosopher|philosophy_ancient|Confucio
philosopher|philosophy_ancient|Lao-Tse
philosopher|philosophy_ancient|Sun Tzu
philosopher|philosophy_modern|René Descartes
philosopher|philosophy_modern|David Hume
philosopher|philosophy_modern|Immanuel Kant
philosopher|philosophy_modern|Friedrich Nietzsche
philosopher|philosophy_modern|Simone de Beauvoir
philosopher|philosophy_modern|Jean-Paul Sartre
philosopher|philosophy_modern|Albert Camus
philosopher|philosophy_modern|Hannah Arendt
philosopher|philosophy_eastern|Mencio
philosopher|philosophy_eastern|Zhuangzi
philosopher|philosophy_eastern|Nagarjuna
philosopher|philosophy_political|John Locke
philosopher|philosophy_political|Thomas Hobbes
philosopher|philosophy_political|Karl Marx
philosopher|philosophy_political|John Stuart Mill
ruler|ruler_monarch|Cleopatra
ruler|ruler_monarch|Alejandro Magno
ruler|ruler_monarch|Julio César
ruler|ruler_monarch|Augusto
ruler|ruler_monarch|Isabel I de Inglaterra
ruler|ruler_monarch|Napoleón Bonaparte
ruler|ruler_monarch|Catalina la Grande
ruler|ruler_monarch|Reina Victoria
ruler|ruler_monarch|Carlomagno
ruler|ruler_monarch|Akenatón
ruler|ruler_president|Abraham Lincoln
ruler|ruler_president|Nelson Mandela
ruler|ruler_president|Barack Obama
ruler|ruler_president|Franklin D. Roosevelt
ruler|ruler_president|Winston Churchill
ruler|ruler_revolution|Mahatma Gandhi
ruler|ruler_president|Benito Juárez
ruler|ruler_president|José de San Martín
ruler|ruler_revolution|Simón Bolívar
ruler|ruler_revolution|George Washington
ruler|ruler_revolution|Emiliano Zapata
ruler|ruler_revolution|Fidel Castro
scientist|science_physics|Albert Einstein
scientist|science_physics|Isaac Newton
scientist|science_physics|Galileo Galilei
scientist|science_physics|Stephen Hawking
scientist|science_physics|Niels Bohr
scientist|science_physics|Richard Feynman
scientist|science_biology|Charles Darwin
scientist|science_physics|Marie Curie
scientist|science_biology|Rosalind Franklin
scientist|science_biology|Gregor Mendel
scientist|science_biology|Louis Pasteur
scientist|science_biology|Jane Goodall
scientist|science_chemistry|Dmitri Mendeléyev
scientist|science_chemistry|Antoine Lavoisier
scientist|science_chemistry|Dorothy Hodgkin
scientist|science_chemistry|Linus Pauling
scientist|science_math|Ada Lovelace
scientist|science_math|Alan Turing
scientist|science_math|Euclides
scientist|science_math|Katherine Johnson
scientist|science_space|Carl Sagan
scientist|science_space|Neil Armstrong
scientist|science_invention|Nikola Tesla
scientist|science_invention|Thomas Edison
city|city_europe|París
city|city_europe|Londres
city|city_europe|Roma
city|city_europe|Madrid
city|city_europe|Barcelona
city|city_europe|Berlín
city|city_europe|Atenas
city|city_europe|Estambul
city|city_asia|Tokio
city|city_asia|Pekín
city|city_asia|Seúl
city|city_asia|Bangkok
city|city_asia|Nueva Delhi
city|city_asia|Singapur
city|city_america|Ciudad de México
city|city_america|Nueva York
city|city_america|Los Ángeles
city|city_america|Río de Janeiro
city|city_america|Buenos Aires
city|city_america|Lima
city|city_africa|El Cairo
city|city_africa|Ciudad del Cabo
city|city_africa|Marrakech
city|city_oceania|Sídney
food|food_mexican|Tacos
food|food_mexican|Tamales
food|food_mexican|Pozole
food|food_mexican|Chilaquiles
food|food_mexican|Mole
food|food_mexican|Guacamole
food|food_italian|Pizza
food|food_italian|Lasaña
food|food_italian|Risotto
food|food_italian|Tiramisú
food|food_asian|Sushi
food|food_asian|Ramen
food|food_asian|Kimchi
food|food_asian|Pad thai
food|food_asian|Dim sum
food|food_dessert|Pastel de chocolate
food|food_dessert|Churros
food|food_dessert|Flan
food|food_dessert|Helado
food|food_dessert|Dona
food|food_drink|Café
food|food_drink|Té matcha
food|food_drink|Horchata
food|food_drink|Agua de jamaica
food|food_fast|Hamburguesa
food|food_fast|Hot dog
food|food_fast|Papas fritas
film|film_animation|Toy Story
film|film_animation|Coco
film|film_animation|El rey león
film|film_animation|Shrek
film|film_animation|Spider-Man: Into the Spider-Verse
film|film_animation|Mi vecino Totoro
film|film_scifi|Matrix
film|film_scifi|Interstellar
film|film_scifi|Blade Runner
film|film_scifi|Dune
film|film_scifi|Regreso al futuro
film|film_action|Mad Max: Fury Road
film|film_action|Gladiador
film|film_action|Misión imposible
film|film_action|Piratas del Caribe
film|film_drama|Titanic
film|film_drama|El padrino
film|film_drama|Sueño de fuga
film|film_comedy|Mi pobre angelito
film|film_comedy|¿Y dónde está el policía?
film|film_comedy|La máscara
film|film_horror|El exorcista
film|film_horror|El resplandor
film|film_horror|Get Out
fiction|fiction_literature|Don Quijote
fiction|fiction_literature|Sherlock Holmes
fiction|fiction_literature|Drácula
fiction|fiction_literature|Frankenstein
fiction|fiction_literature|Alicia
fiction|fiction_literature|Peter Pan
fiction|fiction_tv|Walter White
fiction|fiction_tv|Eleven
fiction|fiction_tv|Homero Simpson
fiction|fiction_tv|Wednesday Addams
fiction|fiction_tv|Doraemon
fiction|fiction_tv|Aang
fiction|fiction_film|Darth Vader
fiction|fiction_film|Forrest Gump
fiction|fiction_film|Indiana Jones
fiction|fiction_film|Jack Sparrow
fiction|fiction_film|Terminator
fiction|fiction_comics|Batman
fiction|fiction_comics|Wonder Woman
fiction|fiction_comics|Tintín
fiction|fiction_comics|Astérix
fiction|fiction_comics| Mafalda
game|game_nintendo|Yoshi
game|game_nintendo|Bowser
game|game_nintendo|Samus Aran
game|game_nintendo|Donkey Kong
game|game_nintendo|Kirby
game|game_playstation|Kratos
game|game_playstation|Aloy
game|game_playstation|Nathan Drake
game|game_playstation|Ratchet
game|game_pc|Gordon Freeman
game|game_pc|Doom Slayer
game|game_pc|Geralt de Rivia
game|game_pc|Tracer
game|game_mobile|Pou
game|game_mobile|Om Nom
game|game_fighting|Ryu
game|game_fighting|Chun-Li
game|game_fighting|Scorpion
game|game_fighting|Liu Kang
game|game_fighting|Pikachu Libre
game|game_adventure|Link
game|game_adventure|Cloud Strife
game|game_adventure|Sackboy
youtuber|youtube_spanish|Luisito Comunica
youtuber|youtube_spanish|Yuya
youtuber|youtube_spanish|AuronPlay
youtuber|youtube_spanish|Rubius
youtuber|youtube_spanish|Ibai Llanos
youtuber|youtube_spanish|Willyrex
youtuber|youtube_spanish|DrossRotzank
youtuber|youtube_spanish|Vegetta777
youtuber|youtube_gaming|Markiplier
youtuber|youtube_gaming|PewDiePie
youtuber|youtube_gaming|The Game Theorists
youtuber|youtube_gaming|ElMariana
youtuber|youtube_entertainment|MrBeast
youtuber|youtube_entertainment|Dude Perfect
youtuber|youtube_entertainment|Dhar Mann
youtuber|youtube_entertainment|Ryan Higa
youtuber|youtube_education|Kurzgesagt
youtuber|youtube_education|Veritasium
youtuber|youtube_education|Date un Vlog
youtuber|youtube_education|QuantumFracture
youtuber|youtube_music|Bely y Beto
youtuber|youtube_music|Alan Walker
youtuber|youtube_english|Mark Rober
youtuber|youtube_english|Marques Brownlee
`;

const categoryNames = {
    sport: "deportista",
    actor: "actor o actriz",
    philosopher: "filósofo",
    ruler: "gobernante",
    scientist: "científico",
    city: "ciudad",
    food: "comida o bebida",
    film: "película",
    fiction: "personaje ficticio",
    game: "personaje de videojuego",
    youtuber: "YouTuber o creador de videos"
};

const realPersonCategories = new Set([
    "sport",
    "actor",
    "philosopher",
    "ruler",
    "scientist",
    "youtuber"
]);
const femalePeople = new Set([
    "Marta Vieira da Silva",
    "Alexia Putellas",
    "Serena Williams",
    "Simone Biles",
    "Meryl Streep",
    "Angelina Jolie",
    "Scarlett Johansson",
    "María Félix",
    "Salma Hayek",
    "Yuya",
    "Simone de Beauvoir",
    "Hannah Arendt",
    "Cleopatra",
    "Isabel I de Inglaterra",
    "Catalina la Grande",
    "Reina Victoria",
    "Marie Curie",
    "Rosalind Franklin",
    "Dorothy Hodgkin",
    "Jane Goodall",
    "Ada Lovelace",
    "Katherine Johnson"
]);

const characters = CHARACTER_ROWS.trim().split("\n").map(row => {
    const [category, group, ...nameParts] = row.split("|");
    const name = nameParts.join("|").trim();
    const traits = [`kind-${category}`, `group-${group}`];

    if (realPersonCategories.has(category)) {
        traits.push("kind-person");
        traits.push(femalePeople.has(name) ? "female" : "male");
    }

    return {
        name,
        wiki: name,
        category,
        traits
    };
});

const questions = [
    ...Object.entries(CATEGORY_QUESTIONS).map(([category, text]) => ({
        trait: `kind-${category}`,
        text
    })),
    ...Object.entries(GROUP_QUESTIONS).map(([group, text]) => ({
        trait: `group-${group}`,
        text
    }))
];

module.exports = {
    characters,
    questions,
    categoryNames
};
