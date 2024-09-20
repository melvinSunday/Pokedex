import PropTypes from "prop-types";
import { useState } from "react";
import { motion } from "framer-motion";
import CardBack from "./CardBack";

const PokemonCard = ({
  id,
  name,
  number,
  image,
  fallbackImage,
  types,
  description,
  habitat,
  shape,
  eggGroups,
  height,
  weight,
  captureRate,
  location,
  varieties,
  isBaby,
  isMythical,
  isLegendary,
  japaneseName,
  japaneseRomaji,
  hp,
  attack,
  defense,
  specialAttack,
  specialDefense,
  speed,
  evolutions,
  evolutionChain,
  moves,
  
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [imageError, setImageError] = useState(false);

  const typeColors = {
    normal: "from-gray-300/80 to-gray-400/80",
    fire: "from-red-400/80 to-red-500/80",
    water: "from-blue-400/80 to-blue-500/80",
    electric: "from-yellow-300/80 to-yellow-400/80",
    grass: "from-green-400/80 to-green-500/80",
    ice: "from-blue-200/80 to-blue-300/80",
    fighting: "from-red-600/80 to-red-700/80",
    poison: "from-purple-400/80 to-purple-500/80",
    ground: "from-yellow-600/80 to-yellow-700/80",
    flying: "from-indigo-300/80 to-indigo-400/80",
    psychic: "from-pink-400/80 to-pink-500/80",
    bug: "from-green-500/80 to-green-600/80",
    rock: "from-yellow-700/80 to-yellow-800/80",
    ghost: "from-purple-600/80 to-purple-700/80",
    dragon: "from-indigo-600/80 to-indigo-700/80",
    dark: "from-gray-700/80 to-gray-800/80",
    steel: "from-gray-400/80 to-gray-500/80",
    fairy: "from-pink-300/80 to-pink-400/80",
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  return (
    <motion.div
      className={`relative perspective-1000 bg-gradient-to-br cursor-pointer ${
        typeColors[types[0].toLowerCase()] || "from-gray-700/80 to-gray-800/80"
      } rounded-3xl p-6 shadow-lg transition-all duration-300 overflow-hidden h-[400px]`}
      onClick={handleFlip}
    >
      {/* Background design */}
      <div className="absolute inset-0 opacity-30">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.1" />
              <stop offset="100%" stopColor="white" stopOpacity="0.4" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <g filter="url(#glow)">
            <path d="M10,50 Q50,10 90,50 T10,50" fill="none" stroke="url(#grad1)" strokeWidth="0.5">
              <animate attributeName="d" 
                       dur="10s" 
                       repeatCount="indefinite"
                       values="M10,50 Q50,10 90,50 T10,50;
                               M10,50 Q50,90 90,50 T10,50;
                               M10,50 Q50,10 90,50 T10,50" />
            </path>
            <path d="M10,60 Q50,20 90,60 T10,60" fill="none" stroke="url(#grad1)" strokeWidth="0.5" opacity="0.5">
              <animate attributeName="d" 
                       dur="15s" 
                       repeatCount="indefinite"
                       values="M10,60 Q50,20 90,60 T10,60;
                               M10,60 Q50,100 90,60 T10,60;
                               M10,60 Q50,20 90,60 T10,60" />
            </path>
          </g>
          <circle cx="50" cy="50" r="45" fill="none" stroke="url(#grad1)" strokeWidth="0.5" opacity="0.7">
            <animate attributeName="r" from="43" to="46" dur="4s" repeatCount="indefinite" />
          </circle>
          <circle cx="50" cy="50" r="35" fill="none" stroke="url(#grad1)" strokeWidth="0.5" opacity="0.5">
            <animate attributeName="r" from="33" to="37" dur="6s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>
      {/* Card flipping animation */}
      <motion.div
        className="relative w-full h-full"
        style={{
          transformStyle: "preserve-3d",
          position: "relative",
        }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Front of the card */}
        <motion.div
          className="absolute w-full h-full backface-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="absolute top-4 right-4 z-10">
            <span className="text-white font-bold text-lg opacity-80 bg-black bg-opacity-30 px-3 py-1 rounded-full">
              #{number.toString().padStart(3, "0")}
            </span>
          </div>
          <div className="flex flex-col h-full">
            <motion.h2
              className="text-white text-3xl capitalize font-bold mb-2"
              whileHover={{ scale: 1.05, originX: 0 }}
            >
              {name}
            </motion.h2>
            <motion.p
              className="text-white text-base mb-2 font-semibold"
              whileHover={{ scale: 1.05, originX: 0 }}
            >
              <span className="text-yellow-300">{japaneseName}</span> (<span className="italic">{japaneseRomaji}</span>)
            </motion.p>
            <div className="flex flex-wrap gap-2 mb-4">
              {types.map((type, index) => (
                <motion.span
                  key={index}
                  className={`bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  {type}
                </motion.span>
              ))}
            </div>
            <div className="flex-grow flex items-center justify-center">
              <motion.img
                src={imageError ? fallbackImage : image}
                alt={name}
                className="w-40 h-40 object-contain drop-shadow-lg"
                onError={handleImageError}
                whileHover={{
                  scale: 1.2,
                  rotate: [0, 10, -10, 10, 0],
                  transition: { duration: 0.5 },
                }}
              />
            </div>
          </div>
        </motion.div>

        <CardBack

          //About
          id={id}
          description={description}
          habitat={habitat}
          shape={shape}
          eggGroups={eggGroups}
          height={height}
          weight={weight}
          captureRate={captureRate}
          location={location}
          varieties={varieties}
          isBaby={isBaby}
          isMythical={isMythical}
          isLegendary={isLegendary}
          japaneseName={japaneseName}
          japaneseRomaji={japaneseRomaji}

          //Base Stats
          hp={hp}
          attack={attack}
          defense={defense}
          specialAttack={specialAttack}
          specialDefense={specialDefense}
          speed={speed}

          //Evolution
          evolutions={evolutions}
          evolutionChain={evolutionChain}

          //Moves
          moves={moves}
        />
      </motion.div>
    </motion.div>
  );
};

PokemonCard.propTypes = {
  //About
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  number: PropTypes.number.isRequired,
  image: PropTypes.string.isRequired,
  fallbackImage: PropTypes.string.isRequired,
  types: PropTypes.arrayOf(PropTypes.string).isRequired,
  description: PropTypes.string.isRequired,
  habitat: PropTypes.string.isRequired,
  shape: PropTypes.string.isRequired,
  eggGroups: PropTypes.string.isRequired,
  height: PropTypes.number.isRequired,
  weight: PropTypes.number.isRequired,
  captureRate: PropTypes.number.isRequired,
  location: PropTypes.string.isRequired,
  varieties: PropTypes.string.isRequired,
  isBaby: PropTypes.bool.isRequired,
  isMythical: PropTypes.bool.isRequired,
  isLegendary: PropTypes.bool.isRequired,
  japaneseName: PropTypes.string.isRequired,
  japaneseRomaji: PropTypes.string.isRequired,

  //Base Stats
  hp: PropTypes.number.isRequired,
  attack: PropTypes.number.isRequired,
  defense: PropTypes.number.isRequired,
  specialAttack: PropTypes.number.isRequired,
  specialDefense: PropTypes.number.isRequired,
  speed: PropTypes.number.isRequired,

  //Evolution
  evolutions: PropTypes.array.isRequired,
  evolutionChain: PropTypes.array.isRequired,

  //Moves
  moves: PropTypes.array.isRequired,
};

export default PokemonCard;
