import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { HiOutlineXMark } from "react-icons/hi2";
import { getTypeVisual } from "./typeVisuals";

const SECTIONS = ["About", "Base stats", "Evolution", "Moves"];
const NOOP = () => {};

const formatName = (name = "") => name.replace(/-/g, " ");
const formatLabel = (value = "") => value.replace(/-/g, " ");

const PokemonDetailsDialog = ({
  pokemon,
  details = null,
  detailsLoading = false,
  moves = [],
  movesLoading = false,
  onRequestDetails = NOOP,
  onRequestMoves = NOOP,
  onClose = NOOP,
}) => {
  const dialogRef = useRef(null);
  const [activeSection, setActiveSection] = useState("About");
  const pokemonId = pokemon?.id;
  const primaryType = pokemon?.types?.[0] || "normal";
  const visual = getTypeVisual(primaryType);
  const isOpen = Boolean(pokemonId);

  useEffect(() => {
    if (!isOpen) return undefined;

    const root = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - root.clientWidth;
    const previousRootOverflow = root.style.overflow;
    const previousScrollBehavior = root.style.scrollBehavior;
    const previousBodyStyles = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    };

    root.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      const currentPadding = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;
      body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
    }

    return () => {
      root.style.overflow = previousRootOverflow;
      body.style.position = previousBodyStyles.position;
      body.style.top = previousBodyStyles.top;
      body.style.left = previousBodyStyles.left;
      body.style.right = previousBodyStyles.right;
      body.style.width = previousBodyStyles.width;
      body.style.overflow = previousBodyStyles.overflow;
      body.style.paddingRight = previousBodyStyles.paddingRight;

      root.style.scrollBehavior = "auto";
      window.scrollTo(0, scrollY);
      root.style.scrollBehavior = previousScrollBehavior;
    };
  }, [isOpen]);

  useEffect(() => {
    if (pokemonId && dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
    }
    if (!pokemonId && dialogRef.current?.open) dialogRef.current.close();
  }, [pokemonId]);

  useEffect(() => {
    setActiveSection("About");
  }, [pokemonId]);

  if (!pokemon) return null;

  const baseStats = [
    ["HP", pokemon.hp],
    ["Attack", pokemon.attack],
    ["Defense", pokemon.defense],
    ["Sp. attack", pokemon.specialAttack],
    ["Sp. defense", pokemon.specialDefense],
    ["Speed", pokemon.speed],
  ];
  const statsTotal = baseStats.reduce((total, [, value]) => total + (value || 0), 0);

  const renderSection = () => {
    if (activeSection === "Base stats") {
      if (!baseStats.some(([, value]) => typeof value === "number")) {
        return <p className="detail-status" role="status">Reading this Pokémon&apos;s stats…</p>;
      }
      return (
        <section className="detail-stats" aria-label={`${formatName(pokemon.name)} base stats`}>
          <div className="detail-section-heading">
            <div>
              <h3>Base stats</h3>
              <p>A quick read on this Pokémon&apos;s natural strengths.</p>
            </div>
            <span className="detail-stats__total"><strong>{statsTotal}</strong><span>Total</span></span>
          </div>
          <div className="detail-stats__rows">
            {baseStats.map(([label, value]) => {
              const statValue = value || 0;
              return (
                <div className="stat-row" key={label}>
                  <span className="stat-row__label">{label}</span>
                  <span className="stat-row__value">{statValue}</span>
                  <span
                    className="stat-row__track"
                    role="meter"
                    aria-label={`${label} stat`}
                    aria-valuemin="0"
                    aria-valuemax="255"
                    aria-valuenow={statValue}
                  >
                    <span className="stat-row__fill" style={{ transform: `scaleX(${Math.min(statValue / 255, 1)})` }} />
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      );
    }

    if (activeSection === "Evolution") {
      if (detailsLoading && !details) {
        return <p className="detail-status" role="status">Tracing the evolution route…</p>;
      }
      const routes = details?.evolutionRoutes || (details?.evolutions?.length ? [details.evolutions] : []);
      if (!routes.length) {
        return <p className="detail-empty">No evolution route is recorded for this Pokémon.</p>;
      }
      return (
        <section className="detail-evolution" aria-label={`${formatName(pokemon.name)} evolution chain`}>
          <div className="detail-section-heading">
            <div>
              <h3>Evolution route</h3>
              <p>Follow the species from its first recorded form.</p>
            </div>
          </div>
          <ol className="evolution-path-list">
            {routes.map((route, routeIndex) => (
              <li className="evolution-path" key={route.map(({ species_name }) => species_name).join("-")}>
                {routes.length > 1 && <p className="evolution-path__label">POSSIBLE ROUTE {String(routeIndex + 1).padStart(2, "0")}</p>}
                <ol className="evolution-path__stops">
                  {route.map((evolution, stageIndex) => (
                    <li className="evolution-stop" key={`${evolution.species_name}-${stageIndex}`}>
                      <span className="evolution-stop__image-wrap">
                        <img src={evolution.image} alt="" loading="lazy" decoding="async" />
                      </span>
                      <span className="evolution-stop__info">
                        <span className="evolution-stop__number">STAGE {String(stageIndex + 1).padStart(2, "0")}</span>
                        <strong>{formatName(evolution.species_name)}</strong>
                        {evolution.min_level ? <span>Level {evolution.min_level}</span> : evolution.trigger_name ? <span>{formatLabel(evolution.trigger_name)}</span> : null}
                      </span>
                      {stageIndex < route.length - 1 && (
                        <svg className="evolution-stop__connector" aria-hidden="true" viewBox="0 0 24 24" focusable="false">
                          <path d="M4 12h15m-6-6 6 6-6 6" />
                        </svg>
                      )}
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ol>
        </section>
      );
    }

    if (activeSection === "Moves") {
      if (movesLoading) return <p className="detail-status" role="status">Looking up recorded moves…</p>;
      if (!moves.length) {
        return (
          <div className="detail-empty">
            <p>Move information isn&apos;t ready yet.</p>
            <button type="button" className="text-action" onClick={onRequestMoves}>Load moves <span aria-hidden="true">↗</span></button>
          </div>
        );
      }
      return (
        <section className="detail-moves" aria-label={`${formatName(pokemon.name)} moves`}>
          <div className="detail-section-heading">
            <div>
              <h3>Recorded moves</h3>
              <p>Selected moves and their battle details.</p>
            </div>
            <span className="detail-moves__count">{moves.length} moves</span>
          </div>
          <div className="move-table-wrap">
            <table className="move-table">
              <thead>
                <tr><th scope="col">Move</th><th scope="col">Power</th><th scope="col">PP</th><th scope="col">Accuracy</th></tr>
              </thead>
              <tbody>
                {moves.map((move) => (
                  <tr key={`${move.name}-${move.learn_method}`}>
                    <th scope="row">
                      <span>{move.name}</span>
                      <span className="move-table__method">{formatLabel(move.learn_method || "")}{move.level_learned_at ? ` · level ${move.level_learned_at}` : ""}</span>
                    </th>
                    <td>{move.power ?? "—"}</td>
                    <td>{move.pp ?? "—"}</td>
                    <td>{move.accuracy ? `${move.accuracy}%` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      );
    }

    if (detailsLoading && !details) {
      return <p className="detail-status" role="status">Gathering field notes…</p>;
    }
    if (!details) {
      return (
        <div className="detail-empty">
          <p>Species notes could not be loaded.</p>
          <button type="button" className="text-action" onClick={onRequestDetails}>Try again <span aria-hidden="true">↗</span></button>
        </div>
      );
    }

    const facts = [
      ["Height", `${(pokemon.height / 10).toFixed(1)} m`],
      ["Weight", `${(pokemon.weight / 10).toFixed(1)} kg`],
      ["Habitat", details.habitat],
      ["Shape", details.shape],
      ["Egg groups", details.eggGroups],
      ["Capture rate", `${details.captureRate} / 255`],
    ];
    const collectionTags = [
      details.isBaby && "Baby",
      details.isMythical && "Mythical",
      details.isLegendary && "Legendary",
    ].filter(Boolean);

    return (
      <section className="detail-about">
        <div className="detail-section-heading">
          <div>
            <h3>Field notes</h3>
            <p>{details.description}</p>
          </div>
        </div>
        {details.japaneseName && details.japaneseName !== "Unknown" && (
          <p className="detail-about__japanese"><span>Japanese name</span><strong lang="ja">{details.japaneseName}</strong>{details.japaneseRomaji && details.japaneseRomaji !== "Unknown" && <span>{details.japaneseRomaji}</span>}</p>
        )}
        {collectionTags.length > 0 && (
          <div className="detail-about__tags" aria-label="Species classification">
            {collectionTags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>
        )}
        <dl className="detail-facts">
          {facts.map(([label, value]) => (
            <div className="detail-fact" key={label}>
              <dt>{label}</dt><dd>{value}</dd>
            </div>
          ))}
        </dl>
        <div className="detail-about__location">
          <h4>Known locations</h4>
          {details.location ? <p>{details.location.split(", ").join(" · ")}</p> : <p>No known locations recorded.</p>}
        </div>
        {details.varieties && (
          <details className="detail-varieties">
            <summary>View species varieties</summary>
            <p>{details.varieties.split(", ").join(" · ")}</p>
          </details>
        )}
      </section>
    );
  };

  return (
    <dialog
      ref={dialogRef}
      className="detail-dialog"
      aria-labelledby={`detail-title-${pokemon.id}`}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) dialogRef.current.close();
      }}
    >
      <div className="detail-sheet" style={{ "--detail-accent": visual.accent, "--detail-wash": visual.wash, "--detail-ink": visual.ink }}>
        <button type="button" className="detail-close detail-close--dialog" onClick={() => dialogRef.current?.close()} aria-label="Close field notes">
          <HiOutlineXMark aria-hidden="true" />
        </button>
        <aside className="detail-hero">
          <div className="detail-hero__map" aria-hidden="true"><span /><span /></div>
          <p className="detail-hero__number">National Pokédex <span>№ {String(pokemon.id).padStart(3, "0")}</span></p>
          {pokemon.image ? <img className="detail-hero__image" src={pokemon.image} alt={`${formatName(pokemon.name)} artwork`} /> : <div className="detail-hero__image-empty" aria-hidden="true">?</div>}
          <div className="detail-hero__identity">
            <h2 id={`detail-title-${pokemon.id}`}>{formatName(pokemon.name)}</h2>
            <div className="detail-hero__types">
              {(pokemon.types || []).map((type) => {
                const typeVisual = getTypeVisual(type);
                return <span key={type} style={{ "--type-accent": typeVisual.accent, "--type-ink": typeVisual.ink }}><span />{type}</span>;
              })}
            </div>
          </div>
          <p className="detail-hero__edition">Species field entry</p>
        </aside>

        <div className="detail-content">
          <nav className="detail-tabs" role="tablist" aria-label={`${formatName(pokemon.name)} field notes`}>
            {SECTIONS.map((section) => (
              <button
                type="button"
                role="tab"
                id={`detail-tab-${section.replace(/\s/g, "-").toLowerCase()}-${pokemon.id}`}
                aria-selected={activeSection === section}
                aria-controls={`detail-panel-${pokemon.id}`}
                key={section}
                className={activeSection === section ? "is-active" : ""}
                onClick={() => {
                  setActiveSection(section);
                  if (section === "Moves" && !moves.length && !movesLoading) onRequestMoves();
                  if (!details && !detailsLoading) onRequestDetails();
                }}
              >
                {section}
              </button>
            ))}
          </nav>
          <div
            role="tabpanel"
            id={`detail-panel-${pokemon.id}`}
            aria-labelledby={`detail-tab-${activeSection.replace(/\s/g, "-").toLowerCase()}-${pokemon.id}`}
            className="detail-panel"
            key={activeSection}
          >
            {renderSection()}
          </div>
        </div>
      </div>
    </dialog>
  );
};

PokemonDetailsDialog.propTypes = {
  pokemon: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    types: PropTypes.arrayOf(PropTypes.string),
    image: PropTypes.string,
    height: PropTypes.number,
    weight: PropTypes.number,
    hp: PropTypes.number,
    attack: PropTypes.number,
    defense: PropTypes.number,
    specialAttack: PropTypes.number,
    specialDefense: PropTypes.number,
    speed: PropTypes.number,
  }),
  details: PropTypes.object,
  detailsLoading: PropTypes.bool,
  moves: PropTypes.arrayOf(PropTypes.object),
  movesLoading: PropTypes.bool,
  onRequestDetails: PropTypes.func,
  onRequestMoves: PropTypes.func,
  onClose: PropTypes.func,
};

export default PokemonDetailsDialog;
