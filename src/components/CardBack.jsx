import { motion } from "framer-motion";
import PropTypes from "prop-types";
import { useState, useRef, useEffect } from "react";
import { Modal } from "antd";

const CardBack = ({
  //About
  id,
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

  //Base Stats
  hp,
  attack,
  defense,
  specialAttack,
  specialDefense,
  speed,

  //Evolution
  evolutions,

  //Moves
  moves,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeSection, setActiveSection] = useState("About");
  const navRef = useRef(null);

  const showModal = (e) => {
    e.stopPropagation();
    setIsModalVisible(true);
  };

  const handleOk = (e) => {
    e.stopPropagation();
    setIsModalVisible(false);
  };

  const handleCancel = (e) => {
    e.stopPropagation();
    setIsModalVisible(false);
  };

  const truncateLocation = (loc) => {
    if (loc.length > 20) {
      return loc.substring(0, 20) + "...";
    }
    return loc;
  };

  const formatLocations = (locations) => {
    return locations
      .split(",")
      .map((location) => location.trim())
      .join(", ");
  };

  const scrollToSection = (section) => {
    const navElement = navRef.current;
    const sectionElement = navElement.querySelector(
      `[data-section="${section}"]`
    );
    if (sectionElement) {
      const scrollLeft = sectionElement.offsetLeft - navElement.offsetLeft;
      navElement.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToSection(activeSection);
  }, [activeSection]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const renderSection = () => {
    switch (activeSection) {
      case "About":
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className=" backdrop-blur-md rounded-lg "
          >
            <motion.div variants={itemVariants}>
              <h3 className="text-2xl font-bold mb-2 text-blue-400">About</h3>
              <p className="text-lg text-gray-200">{description}</p>
            </motion.div>
            <motion.div
              className="grid grid-cols-2 gap-4 mt-4"
              variants={containerVariants}
            >
              {[
                { label: "ID", value: id, color: "text-red-400" },
                { label: "Habitat", value: habitat, color: "text-green-400" },
                { label: "Shape", value: shape, color: "text-yellow-400" },
                {
                  label: "Egg Groups",
                  value: eggGroups,
                  color: "text-purple-400",
                },
                {
                  label: "Height",
                  value: `${(height / 10).toFixed(1)} m. (${((height / 10) * 3.281).toFixed(2)} ft.)`,
                  color: "text-pink-400",
                },
                {
                  label: "Weight",
                  value: `${(weight / 10).toFixed(1)} kg. (${((weight / 10) * 2.205).toFixed(2)} lb.)`,
                  color: "text-indigo-400",
                },
                
                
                {
                  label: "Capture Rate",
                  value: `${((captureRate / 255) * 100).toFixed(2)}%`,
                  color: "text-teal-400",
                },
                {
                  label: "Location",
                  value: location ? (
                    <>
                      {truncateLocation(location)}
                      {location.length > 20 && (
                        <span
                          className="text-blue-400 cursor-pointer ml-2"
                          onClick={showModal}
                        >
                          See more
                        </span>
                      )}
                    </>
                  ) : (
                    "N/A"
                  ),
                  color: "text-orange-400",
                },
              ].map(({ label, value, color }) => (
                <motion.div
                  key={label}
                  variants={itemVariants}
                  className="bg-white bg-opacity-5 rounded-lg p-3"
                >
                  <h4 className={`font-bold ${color}`}>{label}</h4>
                  <p className="text-gray-200">{value}</p>
                </motion.div>
              ))}
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="mt-4 bg-white bg-opacity-5 rounded-lg p-3"
            >
              <h4 className="font-bold text-cyan-400">Varieties</h4>
              <p className="text-gray-200">{varieties}</p>
            </motion.div>
            <motion.div
              className="grid grid-cols-3 gap-4 mt-4"
              variants={containerVariants}
            >
              {[
                { label: "Baby", 
                  value: isBaby, 
                  color: "text-pink-400"
                },
                {
                  label: "Mythical",
                  value: isMythical,
                  color: "text-purple-400",
                },
                {
                  label: "Legendary",
                  value: isLegendary,
                  color: "text-yellow-400",
                },
              ].map(({ label, value, color }) => (
                <motion.div
                  key={label}
                  variants={itemVariants}
                  className="bg-white bg-opacity-5 rounded-lg p-3"
                >
                  <h4 className={`font-bold ${color}`}>{label}</h4>
                  <p className="text-gray-200">{value ? "Yes" : "No"}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        );
      case "Base Stats":
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <h3 className="text-2xl font-bold mb-2">Base Stats</h3>
              <div className="space-y-2">
                {[
                  { label: "HP", value: hp },
                  { label: "Attack", value: attack },
                  { label: "Defense", value: defense },
                  { label: "Special Attack", value: specialAttack },
                  { label: "Special Defense", value: specialDefense },
                  { label: "Speed", value: speed },
                ].map(({ label, value }) => (
                  <motion.div
                    key={label}
                    variants={itemVariants}
                    className="flex items-center"
                  >
                    <h4 className="font-bold w-32">{label}</h4>
                    <div className="flex-grow bg-gray-700 rounded-full h-2.5 mr-2">
                      <motion.div
                        className="bg-blue-600 h-2.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(value / 255) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <p className="w-8 text-right">{value}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        );
      case "Evolution":
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="p-4"
          >
            <h3 className="text-2xl font-bold mb-6 text-center">
              Evolution Chain
            </h3>
            <div className="flex flex-col items-center gap-4">
              {evolutions.map((evolution, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="flex flex-col items-center"
                >
                  <div className="bg-gray-800 rounded-full p-4 mb-4 shadow-lg">
                    <img
                      src={evolution.image}
                      alt={evolution.species_name}
                      className="w-24 h-24 object-contain"
                    />
                  </div>
                  <h4 className="font-semibold text-lg">
                    {evolution.species_name}
                  </h4>
                  {evolution.min_level && (
                    <p className="text-sm text-gray-400 mt-1">
                      Level {evolution.min_level}
                    </p>
                  )}
                  {index < evolutions.length - 1 && (
                    <div className="text-3xl text-gray-400 my-4">↓</div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      case "Moves":
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="p-4"
          >
            <h3 className="text-2xl font-bold mb-4">Moves</h3>
            <div className="flex flex-col space-y-4">
              {moves.map((move, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-gray-800 rounded-lg p-4 shadow-lg"
                >
                  <h4 className="text-lg font-semibold mb-2">{move.name}</h4>
              
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Target</p>
                      <p className="text-sm font-medium">{move.target}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Power</p>
                      <p className="text-sm font-medium">{move.power}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">PP</p>
                      <p className="text-sm font-medium">{move.pp}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Accuracy</p>
                      <p className="text-sm font-medium">{move.accuracy}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  //sectionssssssss
  const sections = ["About", "Base Stats", "Evolution", "Moves"];

  return (
    <motion.div
      className="absolute w-full h-full text-white rounded-3xl backface-hidden overflow-y-auto"
      style={{
        backfaceVisibility: "hidden",
        transform: "rotateY(180deg)",
        background:
          "radial-gradient(circle, rgba(64,64,64,1) 0%, rgba(32,32,32,1) 100%)",
        boxShadow: "inset 0 0 50px rgba(0,0,0,0.5)",
        backdropFilter: "blur(5px)",
      }}
      initial={{ opacity: 0, rotateY: 180 }}
      animate={{ opacity: 1, rotateY: 180 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-4 space-y-6">
        <motion.div
          ref={navRef}
          className="flex pb-2 mb-4 overflow-x-auto scrollbar-none 2xl:justify-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <div className="inline-flex">
            {sections.map((section) => (
              <motion.button
                key={section}
                data-section={section}
                className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ease-in-out whitespace-nowrap ${
                  activeSection === section
                    ? "text-white border-b-2 border-white"
                    : "text-gray-400 hover:text-white"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveSection(section);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {section}
              </motion.button>
            ))}
          </div>
        </motion.div>
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderSection()}
        </motion.div>
      </div>
      <Modal
        title="Location"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <p style={{ whiteSpace: "pre-wrap" }}>
          {formatLocations(location).split(", ").join("\n")}
        </p>
      </Modal>
    </motion.div>
  );
};

CardBack.propTypes = {
  //About
  id: PropTypes.number.isRequired,
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

  //Base Stats
  hp: PropTypes.number.isRequired,
  attack: PropTypes.number.isRequired,
  defense: PropTypes.number.isRequired,
  specialAttack: PropTypes.number.isRequired,
  specialDefense: PropTypes.number.isRequired,
  speed: PropTypes.number.isRequired,

  //Evolution
  evolutions: PropTypes.array,
  evolutionChain: PropTypes.array,

  //Moves
  moves: PropTypes.array
};

export default CardBack;
