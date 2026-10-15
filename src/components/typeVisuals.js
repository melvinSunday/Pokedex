export const POKEMON_TYPES = [
  "normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground",
  "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy",
];

export const TYPE_VISUALS = {
  normal: { accent: "#8b9298", wash: "#f1f2ef", ink: "#59636a" },
  fire: { accent: "#df7656", wash: "#fff0e9", ink: "#8d452f" },
  water: { accent: "#5f91c8", wash: "#eaf3fd", ink: "#345f91" },
  electric: { accent: "#d8ad3e", wash: "#fff7db", ink: "#755a12" },
  grass: { accent: "#69a878", wash: "#eaf5e9", ink: "#366844" },
  ice: { accent: "#72b9c1", wash: "#e8f7f7", ink: "#356e74" },
  fighting: { accent: "#bf675d", wash: "#faece9", ink: "#7a3e38" },
  poison: { accent: "#9970b3", wash: "#f3ebf8", ink: "#614276" },
  ground: { accent: "#bf9560", wash: "#f8f0e4", ink: "#765830" },
  flying: { accent: "#7d91c8", wash: "#edf0fb", ink: "#4c5f98" },
  psychic: { accent: "#d3749c", wash: "#fbebf2", ink: "#8d4565" },
  bug: { accent: "#88a54b", wash: "#f0f4e2", ink: "#596d2e" },
  rock: { accent: "#9d8b67", wash: "#f3efe5", ink: "#62563b" },
  ghost: { accent: "#7979a9", wash: "#eeedf7", ink: "#4d4d78" },
  dragon: { accent: "#7478c4", wash: "#edecfa", ink: "#484a8a" },
  dark: { accent: "#77736f", wash: "#efeeeb", ink: "#4b4945" },
  steel: { accent: "#8899a5", wash: "#edf1f3", ink: "#52636d" },
  fairy: { accent: "#cf83ad", wash: "#faedf4", ink: "#874c70" },
};

export const getTypeVisual = (type) => TYPE_VISUALS[type] || TYPE_VISUALS.normal;
