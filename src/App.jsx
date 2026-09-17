import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas } from "@react-three/fiber";
import { ArrowUpRight, Database, X } from "lucide-react";
import VideoHero from "@/components/VideoHero";
import Receipt from "@/components/Receipt";
import StickerPeel from "@/components/StickerPeel";
import TravelScene from "@/scene/TravelScene";
import { DATASET_URL, loadStoryData, summarizeLocations } from "@/data/dining";
import { LANDMARKS, LANDMARK_BY_ID } from "@/data/landmarks";
import {
  assignItinerarySlot,
  formatDistance,
  itinerarySegments,
  selectNearbyLocations,
} from "@/data/nearby";
import { publicUrl } from "@/publicUrl";
import "./styles.css";

const STORY_SECTIONS = ["intro", "landmarks", "plan", "source"];
const EMPTY_ITINERARY = { morning: null, afternoon: null, evening: null };
const LANDMARK_STORAGE = "dining-out-selected-landmark";
const SAVED_STORAGE = "dining-out-saved-restaurants";
const ITINERARY_STORAGE = "dining-out-itinerary";

const readStorage = (key, fallback) => {
  try {
    return JSON.parse(sessionStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches,
  );
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);
  return matches;
};

const phaseForMode = (mode) =>
  ({
    "all-landmarks": "landmark",
    nearby: "nearby",
    "restaurant-detail": "detail",
  })[mode] || "landmark";
const useStoryPosition = (exploreMode) => {
  const [position, setPosition] = useState({
    phase: "intro",
    progress: 0,
    direction: 1,
  });
  const lastValid = useRef(position);
  const lastScroll = useRef(window.scrollY);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const anchor = window.innerHeight * 0.5;
      const direction = window.scrollY >= lastScroll.current ? 1 : -1;
      lastScroll.current = window.scrollY;
      let active = null;
      for (const id of STORY_SECTIONS) {
        const element = document.getElementById(id);
        if (!element) continue;
        const rect = element.getBoundingClientRect();
        if (rect.top <= anchor && rect.bottom >= anchor) {
          const progress = Math.max(
            0,
            Math.min(1, (anchor - rect.top) / rect.height),
          );
          if (id === "intro")
            active = {
              phase: progress > 0.76 ? "landmark-enter" : "intro",
              progress,
              direction,
            };
          else if (id === "landmarks")
            active = { phase: phaseForMode(exploreMode), progress, direction };
          else active = { phase: id, progress, direction };
          break;
        }
      }
      if (!active) active = lastValid.current;
      lastValid.current = active;
      setPosition((previous) =>
        previous.phase === active.phase &&
        previous.direction === active.direction &&
        Math.abs(previous.progress - active.progress) < 0.004
          ? previous
          : active,
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [exploreMode]);
  return position;
};

class SceneBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    console.error("WebGL scene failed.", error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
function LandmarkFallback({ selected, onSelect }) {
  return (
    <div className="landmark-fallback">
      <p>Interactive 3D is unavailable. Choose a landmark:</p>
      {LANDMARKS.map((item) => (
        <button
          type="button"
          key={item.id}
          aria-pressed={selected === item.id}
          onClick={() => onSelect(item.id)}
        >
          {item.name}
          <small>{item.borough}</small>
        </button>
      ))}
    </div>
  );
}

function RoutePreview({ itinerary }) {
  const route = itinerarySegments(itinerary);
  const points = route.ordered.map(({ slot, restaurant }, index) => ({
    slot,
    restaurant,
    index,
  }));
  const lats = points.map((point) => point.restaurant.latitude);
  const lons = points.map((point) => point.restaurant.longitude);
  const minLat = Math.min(...lats, 0);
  const maxLat = Math.max(...lats, 1);
  const minLon = Math.min(...lons, 0);
  const maxLon = Math.max(...lons, 1);
  const plotted = points.map((point) => ({
    ...point,
    x:
      24 +
      ((point.restaurant.longitude - minLon) /
        Math.max(0.0001, maxLon - minLon)) *
        212,
    y:
      136 -
      ((point.restaurant.latitude - minLat) /
        Math.max(0.0001, maxLat - minLat)) *
        108,
  }));
  return (
    <div
      className="route-preview"
      aria-label="Straight-line itinerary overview"
    >
      <div>
        <strong>Straight-line overview</strong>
        <p>Approximate spatial order — not a walking or transit route.</p>
      </div>
      <svg
        viewBox="0 0 260 160"
        role="img"
        aria-label={`${points.length} itinerary stops shown in approximate spatial order`}
      >
        <path
          d="M18 142 C62 108 70 58 112 76 S178 124 242 24"
          className="route-preview__coast"
        />
        {plotted.length > 1 && (
          <polyline
            points={plotted.map((point) => `${point.x},${point.y}`).join(" ")}
            className="route-preview__line"
          />
        )}
        {plotted.map((point) => (
          <g key={point.slot} transform={`translate(${point.x} ${point.y})`}>
            <circle r="13" />
            <text textAnchor="middle" dy="4">
              {point.index + 1}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
function Itinerary({ itinerary, saved, onAssign, onRemove, onClear, onBack }) {
  const route = itinerarySegments(itinerary);
  const slotFor = (id) =>
    ["morning", "afternoon", "evening"].find(
      (slot) => itinerary[slot]?.id === id,
    );
  return (
    <div className="plan-workspace">
      {saved.length > 0 && (
        <div className="saved-tray">
          <div className="saved-tray__head">
            <span>Saved restaurants</span>
            <small>{saved.length} candidates</small>
          </div>
          <div className="saved-tray__rail">
            {saved.map((restaurant) => {
              const assigned = slotFor(restaurant.id);
              return (
                <div className="saved-ticket" key={restaurant.id}>
                  <strong>{restaurant.name}</strong>
                  <small>
                    {restaurant.landmarkName || restaurant.borough} ·{" "}
                    {restaurant.cuisine || "Cuisine not matched"}
                  </small>
                  {assigned ? (
                    <span>{assigned}</span>
                  ) : (
                    <div>
                      {["morning", "afternoon", "evening"].map((slot) => (
                        <button
                          type="button"
                          key={slot}
                          onClick={() => onAssign(slot, restaurant)}
                        >
                          {slot[0].toUpperCase()}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="itinerary-ticket">
        <div className="itinerary-ticket__head">
          <span>NYC / DAY PLAN</span>
          <button
            type="button"
            onClick={onClear}
            disabled={!route.ordered.length}
          >
            Clear itinerary
          </button>
        </div>
        {!route.ordered.length && (
          <div className="itinerary-empty">
            <strong>Build the day as you explore.</strong>
            <p>Save restaurants while exploring, then build your day here.</p>
            <button type="button" className="text-link" onClick={onBack}>
              Return to Landmark Selection
            </button>
          </div>
        )}
        {["morning", "afternoon", "evening"].map((slot, index) => {
          const restaurant = itinerary[slot];
          const prior = route.segments.find(
            (segment) => segment.to.slot === slot,
          );
          return (
            <div
              className={`itinerary-stop ${restaurant ? "is-filled" : ""}`}
              key={slot}
            >
              <div className="itinerary-stop__time">
                {String(index + 1).padStart(2, "0")}
                <span>{slot}</span>
              </div>
              <div>
                {restaurant ? (
                  <>
                    <strong>{restaurant.name}</strong>
                    <p>{restaurant.landmarkName || restaurant.borough}</p>
                    <small>
                      {restaurant.cuisine || "Cuisine not matched"} ·{" "}
                      {restaurant.licenseType} Cafe ·{" "}
                      {formatDistance(restaurant.distanceKm)}
                    </small>
                    {prior && (
                      <em>
                        {formatDistance(prior.distanceKm)} straight-line from
                        previous stop
                      </em>
                    )}
                  </>
                ) : (
                  <p>Assign a saved restaurant to {slot}.</p>
                )}
              </div>
              {restaurant && (
                <button
                  type="button"
                  onClick={() => onRemove(slot)}
                  aria-label={`Remove ${restaurant.name}`}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          );
        })}
        <div className="itinerary-ticket__total">
          <span>Total straight-line distance</span>
          <strong>{route.totalKm ? formatDistance(route.totalKm) : "—"}</strong>
        </div>
      </div>
      <RoutePreview itinerary={itinerary} />
    </div>
  );
}
const formatFetched = (value) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

export default function App() {
  const [story, setStory] = useState(null);
  const [error, setError] = useState(null);
  const [webgl, setWebgl] = useState(true);
  const [landmarkListOpen, setLandmarkListOpen] = useState(false);
  const [selectedLandmarkId, setSelectedLandmarkId] = useState(() => {
    const hash = window.location.hash.slice(1);
    if (!["nearby", "detail"].includes(hash)) return null;
    const id = readStorage(LANDMARK_STORAGE, null);
    return LANDMARK_BY_ID[id] ? id : null;
  });
  const [hoveredLandmarkId, setHoveredLandmarkId] = useState(null);
  const [hoveredRestaurantId, setHoveredRestaurantId] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [displayedRestaurant, setDisplayedRestaurant] = useState(null);
  const [pendingRestaurant, setPendingRestaurant] = useState(null);
  const [receiptPhase, setReceiptPhase] = useState("entering");
  const [exploreMode, setExploreMode] = useState("all-landmarks");
  const [savedRestaurants, setSavedRestaurants] = useState(() =>
    readStorage(SAVED_STORAGE, []),
  );
  const [itinerary, setItinerary] = useState(() =>
    readStorage(ITINERARY_STORAGE, EMPTY_ITINERARY),
  );
  const [statusMessage, setStatusMessage] = useState("");
  const hasRestoredInitialHash = useRef(false);
  const initialLandmarkId = useRef(selectedLandmarkId);
  const exploreModeRef = useRef(exploreMode);
  const reverseGestureConsumed = useRef(false);
  const reverseGestureTimer = useRef(0);
  const pendingRestaurantRef = useRef(null);
  const receiptExitIntent = useRef("replace");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const coarsePointer = useMediaQuery("(hover: none), (pointer: coarse)");
  const { phase, progress, direction } = useStoryPosition(exploreMode);
  const selectedLandmark = LANDMARK_BY_ID[selectedLandmarkId] || null;
  const nearby = useMemo(
    () => selectNearbyLocations(story?.locations || [], selectedLandmark),
    [story, selectedLandmark],
  );
  const summary = useMemo(
    () => summarizeLocations(story?.locations || []),
    [story],
  );

  useEffect(() => {
    const probe = document.createElement("canvas");
    setWebgl(Boolean(probe.getContext("webgl2") || probe.getContext("webgl")));
    loadStoryData().then(setStory).catch(setError);
  }, []);
  useEffect(() => {
    sessionStorage.setItem(ITINERARY_STORAGE, JSON.stringify(itinerary));
  }, [itinerary]);
  useEffect(() => {
    sessionStorage.setItem(SAVED_STORAGE, JSON.stringify(savedRestaurants));
  }, [savedRestaurants]);
  useEffect(() => {
    selectedLandmarkId
      ? sessionStorage.setItem(
          LANDMARK_STORAGE,
          JSON.stringify(selectedLandmarkId),
        )
      : sessionStorage.removeItem(LANDMARK_STORAGE);
  }, [selectedLandmarkId]);
  useEffect(() => {
    if (!story || hasRestoredInitialHash.current) return;
    hasRestoredInitialHash.current = true;
    let id = window.location.hash.slice(1);
    if (["nearby", "detail"].includes(id)) {
      if (initialLandmarkId.current) {
        setExploreMode("nearby");
        id = "landmarks";
      } else {
        id = "landmarks";
        window.history.replaceState(
          { mode: "all-landmarks" },
          "",
          "#landmarks",
        );
      }
    }
    requestAnimationFrame(() =>
      document
        .getElementById(id || "intro")
        ?.scrollIntoView({ behavior: "auto" }),
    );
  }, [story]);
  useEffect(() => {
    exploreModeRef.current = exploreMode;
  }, [exploreMode]);
  useEffect(() => {
    pendingRestaurantRef.current = pendingRestaurant;
  }, [pendingRestaurant]);
  useEffect(() => {
    if (!displayedRestaurant || receiptPhase !== "entering") return;
    const frame = requestAnimationFrame(() => setReceiptPhase("visible"));
    return () => cancelAnimationFrame(frame);
  }, [displayedRestaurant, receiptPhase]);
  useEffect(() => {
    const restore = (event) => {
      const hash = window.location.hash.slice(1);
      if (["nearby", "detail"].includes(hash) && selectedLandmarkId) {
        setSelectedRestaurant(null);
        setExploreMode("nearby");
      } else if (hash === "landmarks") {
        setSelectedRestaurant(null);
        setHoveredRestaurantId(null);
        setSelectedLandmarkId(null);
        setExploreMode("all-landmarks");
      }
      if (["intro", "plan", "source"].includes(hash))
        document.getElementById(hash)?.scrollIntoView({ behavior: "auto" });
      if (event.state?.mode === "all-landmarks") {
        setSelectedLandmarkId(null);
        setExploreMode("all-landmarks");
      }
    };
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, [selectedLandmarkId]);
  useEffect(() => {
    const onKey = (event) => {
      if (event.key !== "Escape") return;
      if (landmarkListOpen) {
        setLandmarkListOpen(false);
        return;
      }
      if (exploreMode === "restaurant-detail") {
        setSelectedRestaurant(null);
        setExploreMode("nearby");
        window.history.replaceState({ mode: "nearby" }, "", "#nearby");
      } else if (exploreMode !== "all-landmarks") {
        setSelectedRestaurant(null);
        setSelectedLandmarkId(null);
        setExploreMode("all-landmarks");
        window.history.replaceState(
          { mode: "all-landmarks" },
          "",
          "#landmarks",
        );
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [exploreMode, landmarkListOpen]);
  useEffect(() => {
    if (exploreMode !== "restaurant-detail") {
      setDisplayedRestaurant(null);
      setPendingRestaurant(null);
      pendingRestaurantRef.current = null;
    }
    if (!["nearby", "restaurant-detail"].includes(exploreMode)) {
      setSelectedRestaurant(null);
      setHoveredRestaurantId(null);
    }
  }, [exploreMode]);
  useEffect(() => {
    const finishGesture = () => {
      window.clearTimeout(reverseGestureTimer.current);
      reverseGestureTimer.current = window.setTimeout(() => {
        reverseGestureConsumed.current = false;
      }, 180);
    };
    const reverseOneLayer = (event) => {
      if (event.ctrlKey || event.deltaY >= -8) return;
      const section = document.getElementById("landmarks");
      if (!section) return;
      const rect = section.getBoundingClientRect();
      if (
        rect.bottom < window.innerHeight * 0.25 ||
        rect.top > window.innerHeight * 0.75
      )
        return;
      const mode = exploreModeRef.current;
      if (mode === "all-landmarks") return;
      event.preventDefault();
      finishGesture();
      if (reverseGestureConsumed.current) return;
      reverseGestureConsumed.current = true;
      if (mode === "restaurant-detail") {
        setSelectedRestaurant(null);
        setHoveredRestaurantId(null);
        setExploreMode("nearby");
        window.history.replaceState({ mode: "nearby" }, "", "#nearby");
        setStatusMessage("Returned to nearby dining");
        return;
      }
      setSelectedRestaurant(null);
      setHoveredRestaurantId(null);
      setHoveredLandmarkId(null);
      setSelectedLandmarkId(null);
      setExploreMode("all-landmarks");
      window.history.replaceState({ mode: "all-landmarks" }, "", "#landmarks");
      setStatusMessage("Returned to all landmarks");
    };
    window.addEventListener("wheel", reverseOneLayer, { passive: false });
    return () => {
      window.removeEventListener("wheel", reverseOneLayer);
      window.clearTimeout(reverseGestureTimer.current);
    };
  }, []);

  const activateLandmark = (id) => {
    setLandmarkListOpen(false);
    setHoveredLandmarkId(null);
    setSelectedRestaurant(null);
    setHoveredRestaurantId(null);
    setStatusMessage("");
    setSelectedLandmarkId(id);
    setExploreMode("nearby");
    window.history.pushState({ mode: "nearby" }, "", "#nearby");
  };
  const selectRestaurant = (location) => {
    if (!["nearby", "restaurant-detail"].includes(exploreMode)) return;
    const replacing = exploreMode === "restaurant-detail";
    setStatusMessage("");
    setSelectedRestaurant(location);
    setHoveredRestaurantId(location.id);
    if (!displayedRestaurant) {
      setDisplayedRestaurant(location);
      setPendingRestaurant(null);
      pendingRestaurantRef.current = null;
      setReceiptPhase("entering");
    } else if (displayedRestaurant.id !== location.id) {
      setPendingRestaurant(location);
      pendingRestaurantRef.current = location;
      receiptExitIntent.current = "replace";
      setReceiptPhase("exiting");
    } else if (receiptPhase === "exiting") {
      setPendingRestaurant(null);
      pendingRestaurantRef.current = null;
      receiptExitIntent.current = "replace";
      setReceiptPhase("visible");
    }
    setExploreMode("restaurant-detail");
    window.history[replacing ? "replaceState" : "pushState"](
      { mode: "restaurant-detail" },
      "",
      "#detail",
    );
  };
  const closeRestaurantDetail = () => {
    if (!displayedRestaurant) {
      setSelectedRestaurant(null);
      setHoveredRestaurantId(null);
      setExploreMode("nearby");
      window.history.replaceState({ mode: "nearby" }, "", "#nearby");
      return;
    }
    setPendingRestaurant(null);
    pendingRestaurantRef.current = null;
    receiptExitIntent.current = "close";
    setReceiptPhase("exiting");
  };
  const finishReceiptTransition = () => {
    if (receiptPhase !== "exiting") return;
    const next = pendingRestaurantRef.current;
    if (receiptExitIntent.current === "replace" && next) {
      setDisplayedRestaurant(next);
      setPendingRestaurant(null);
      pendingRestaurantRef.current = null;
      setReceiptPhase("entering");
      setStatusMessage(`Showing ${next.name}`);
      return;
    }
    setDisplayedRestaurant(null);
    setSelectedRestaurant(null);
    setHoveredRestaurantId(null);
    setReceiptPhase("entering");
    setExploreMode("nearby");
    window.history.replaceState({ mode: "nearby" }, "", "#nearby");
  };
  const backToAllLandmarks = () => {
    setSelectedRestaurant(null);
    setHoveredRestaurantId(null);
    setHoveredLandmarkId(null);
    setSelectedLandmarkId(null);
    setExploreMode("all-landmarks");
    window.history.replaceState({ mode: "all-landmarks" }, "", "#landmarks");
    document
      .getElementById("landmarks")
      ?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
  };
  const withLandmark = (restaurant) => ({
    ...restaurant,
    landmarkId: selectedLandmark?.id,
    landmarkName: selectedLandmark?.name,
    landmarkDistrict: selectedLandmark?.district,
  });
  const saveRestaurant = (restaurant) => {
    const record = withLandmark(restaurant);
    setSavedRestaurants((current) =>
      current.some((item) => item.id === record.id)
        ? current
        : [...current, record],
    );
    setStatusMessage(`Saved ${record.name}`);
  };
  const toggleSaved = (restaurant) => {
    const exists = savedRestaurants.some((item) => item.id === restaurant.id);
    if (exists) {
      setSavedRestaurants((current) =>
        current.filter((item) => item.id !== restaurant.id),
      );
      setStatusMessage(`Removed ${restaurant.name} from saved restaurants`);
    } else saveRestaurant(restaurant);
  };
  const addToItinerary = (slot, restaurant) => {
    const record = withLandmark(restaurant);
    setSavedRestaurants((current) =>
      current.some((item) => item.id === record.id)
        ? current
        : [...current, record],
    );
    setItinerary((current) => assignItinerarySlot(current, slot, record));
    setStatusMessage(
      `Added to ${slot[0].toUpperCase() + slot.slice(1)} · Saved`,
    );
  };
  const browseRelative = (offset) => {
    if (!nearby.locations.length) return;
    const index = Math.max(
      0,
      nearby.locations.findIndex((item) => item.id === selectedRestaurant?.id),
    );
    selectRestaurant(
      nearby.locations[
        (index + offset + nearby.locations.length) % nearby.locations.length
      ],
    );
  };
  const viewPlan = () => {
    document
      .getElementById("plan")
      ?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
    window.history.pushState(null, "", "#plan");
  };
  const interactive = [
    "landmark-enter",
    "landmark",
    "nearby",
    "detail",
  ].includes(phase);

  if (error)
    return (
      <main className="fatal-error">
        <Database size={32} />
        <h1>The city experience could not load.</h1>
        <p>{error.message}</p>
      </main>
    );
  return (
    <div className="app-shell">
      <a className="skip-link" href="#landmarks">
        Skip to landmark selection
      </a>
      <header className="site-nav">
        <a href="#intro" className="wordmark">
          NYC / OUTSIDE
        </a>
        <nav aria-label="Primary navigation">
          <a className="nav-link" href="#landmarks">
            Landmarks
          </a>
          <a className="nav-link" href="#plan">
            Plan
          </a>
          <a className="nav-link" href="#source">
            Source
          </a>
        </nav>
      </header>
      {story && (
        <div
          className={`canvas-shell phase-${phase} mode-${exploreMode} ${interactive ? "is-interactive" : ""} ${["plan", "source"].includes(phase) ? "is-muted" : ""}`}
          aria-hidden={!webgl}
        >
          {webgl ? (
            <SceneBoundary
              fallback={
                <LandmarkFallback
                  selected={selectedLandmarkId}
                  onSelect={activateLandmark}
                />
              }
            >
              <Canvas
                shadows={!coarsePointer}
                dpr={coarsePointer ? [1, 1.15] : [1, 1.5]}
                camera={{
                  position: [7.4, 5.5, 11.5],
                  fov: 36,
                  near: 0.1,
                  far: 90,
                }}
                gl={{
                  antialias: !coarsePointer,
                  powerPreference: "high-performance",
                }}
              >
                <Suspense fallback={null}>
                  <TravelScene
                    phase={phase}
                    progress={progress}
                    direction={direction}
                    exploreMode={exploreMode}
                    landmarks={LANDMARKS}
                    selectedLandmark={selectedLandmark}
                    hoveredLandmarkId={hoveredLandmarkId}
                    nearbyLocations={
                      ["nearby", "restaurant-detail"].includes(exploreMode)
                        ? nearby.locations
                        : []
                    }
                    selectedRestaurantId={selectedRestaurant?.id}
                    hoveredRestaurantId={hoveredRestaurantId}
                    onLandmarkHover={setHoveredLandmarkId}
                    onLandmarkSelect={activateLandmark}
                    onRestaurantHover={(restaurant) =>
                      setHoveredRestaurantId(restaurant?.id || null)
                    }
                    onRestaurantSelect={selectRestaurant}
                    reducedMotion={reducedMotion}
                    coarsePointer={coarsePointer}
                  />
                </Suspense>
              </Canvas>
            </SceneBoundary>
          ) : (
            <LandmarkFallback
              selected={selectedLandmarkId}
              onSelect={activateLandmark}
            />
          )}
        </div>
      )}
      <main className="story">
        <VideoHero reducedMotion={reducedMotion} />
        <section
          id="landmarks"
          className={`story-section explore-stage mode-${exploreMode}`}
        >
          <span id="nearby" className="hash-anchor" />
          <span id="detail" className="hash-anchor" />
          <div className="story-sticky">
            {exploreMode === "all-landmarks" && (
              <div className="copy-panel landmark-copy">
                <p className="eyebrow">02 · All landmarks</p>
                <h2>Where do you want to be?</h2>
                <p>
                  Drag the scene to orbit New York. Select any miniature to zoom
                  in and reveal licensed outdoor dining around it.
                </p>
                <button
                  type="button"
                  className="landmark-drawer-toggle"
                  aria-expanded={landmarkListOpen}
                  aria-controls="landmark-drawer"
                  onClick={() => setLandmarkListOpen((value) => !value)}
                >
                  Explore landmarks <span>12</span>
                </button>
                <div
                  id="landmark-drawer"
                  className={`landmark-drawer ${landmarkListOpen ? "is-open" : ""}`}
                  aria-hidden={!landmarkListOpen}
                >
                  <div className="landmark-drawer__head">
                    <strong>New York landmarks</strong>
                    <button
                      type="button"
                      onClick={() => setLandmarkListOpen(false)}
                      aria-label="Close landmark list"
                    >
                      <X size={17} />
                    </button>
                  </div>
                  <div
                    className="landmark-index"
                    role="list"
                    aria-label="Choose a New York landmark"
                  >
                    {LANDMARKS.map((item) => (
                      <button
                        role="listitem"
                        key={item.id}
                        type="button"
                        onMouseEnter={() => setHoveredLandmarkId(item.id)}
                        onMouseLeave={() => setHoveredLandmarkId(null)}
                        onFocus={() => setHoveredLandmarkId(item.id)}
                        onClick={() => activateLandmark(item.id)}
                      >
                        <span>{item.name}</span>
                        <small>
                          {item.borough} · {item.district}
                        </small>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {["nearby", "restaurant-detail"].includes(exploreMode) &&
              selectedLandmark && (
                <div className="copy-panel nearby-copy">
                  <p className="eyebrow">03 · Landmark + nearby dining</p>
                  <h2>Around {selectedLandmark.name}</h2>
                  <p>{selectedLandmark.description}</p>
                  <div className="nearby-legend">
                    <span>
                      <i className="legend__table" />
                      Sidewalk
                    </span>
                    <span>
                      <i className="legend__shed" />
                      Roadway
                    </span>
                  </div>
                  <p className="nearby-count">
                    <strong>{nearby.locations.length}</strong> licensed places
                    within {nearby.radiusKm.toFixed(1)} km
                  </p>
                  <p className="nearby-instruction">
                    Hover a model for its name. Select it for details. Scroll up
                    to zoom back out.
                  </p>
                  <div className="location-stepper">
                    <button type="button" onClick={() => browseRelative(-1)}>
                      Previous location
                    </button>
                    <button type="button" onClick={() => browseRelative(1)}>
                      Next location
                    </button>
                  </div>
                  <details className="nearby-disclosure">
                    <summary>
                      Browse all {nearby.locations.length} locations
                    </summary>
                    <div>
                      {nearby.locations.map((location) => (
                        <button
                          type="button"
                          key={location.id}
                          onClick={() => selectRestaurant(location)}
                        >
                          {location.name}
                          <small>
                            {formatDistance(location.distanceKm)} ·{" "}
                            {location.licenseType}
                          </small>
                        </button>
                      ))}
                    </div>
                  </details>
                </div>
              )}
            {exploreMode === "nearby" && (
              <div className="nearby-plan-cue">
                <span>
                  <strong>Save places as you explore</strong>Build a Morning ·
                  Afternoon · Evening NYC plan.
                </span>
                <button type="button" onClick={viewPlan}>
                  {savedRestaurants.length} saved · View your plan →
                </button>
              </div>
            )}
          </div>
        </section>
        <section id="plan" className="story-section plan-section">
          <div className="plan-layout">
            <div>
              <p className="eyebrow">05 · Plan your day</p>
              <h2>Three stops. Your call.</h2>
              <p>
                Saved restaurants are your candidate pool. Place one into
                Morning, Afternoon and Evening; distances are straight-line
                only.
              </p>
            </div>
            <Itinerary
              itinerary={itinerary}
              saved={savedRestaurants}
              onAssign={addToItinerary}
              onRemove={(slot) =>
                setItinerary((current) => ({ ...current, [slot]: null }))
              }
              onClear={() => setItinerary(EMPTY_ITINERARY)}
              onBack={backToAllLandmarks}
            />
          </div>
        </section>
        <section id="source" className="story-section source-section">
          <div className="source-layout">
            <div className="source-copy">
              <p className="eyebrow">06 · Data source</p>
              <h2>Real records, careful limits.</h2>
              <p>
                Outdoor dining licenses come from Dining Out NYC. Cuisine is
                added only when a high-confidence match exists in the official
                DOHMH inspection dataset. Price, menu, hours and suitability are
                never invented.
              </p>
              <dl className="source-stats">
                <div>
                  <dt>Records</dt>
                  <dd>{summary.total.toLocaleString()}</dd>
                </div>
                <div>
                  <dt>Mapped</dt>
                  <dd>{summary.mapped.toLocaleString()}</dd>
                </div>
                <div>
                  <dt>Landmarks</dt>
                  <dd>12</dd>
                </div>
              </dl>
              <a
                className="button"
                href={DATASET_URL}
                target="_blank"
                rel="noreferrer"
              >
                Open NYC Open Data <ArrowUpRight size={18} />
              </a>
              {story && (
                <p className="source-meta">
                  {story.source === "live" ? "Live API" : "Bundled snapshot"} ·
                  fetched {formatFetched(story.updatedAt)}
                </p>
              )}
            </div>
            <div className="source-desk">
              <div className="source-reveal">
                <strong>Distance ≠ travel time</strong>
                <span>Method note</span>
                <p>
                  Nearby results use Haversine straight-line distance, expanding
                  from 0.8 km to at most 2 km and showing no more than 24
                  records.
                </p>
              </div>
              <StickerPeel
                imageSrc={publicUrl("assets/nyc-open-data-seal.svg")}
                alt="Peelable NYC Open Data seal"
                width={150}
                rotate={-7}
                peelBackHoverPct={18}
                peelBackActivePct={34}
                shadowIntensity={0.35}
                lightingIntensity={0.08}
                initialPosition={{ x: 24, y: 18 }}
                draggable={!coarsePointer && !reducedMotion}
              />
            </div>
          </div>
          <footer>
            <span>Dining Out NYC · 2026</span>
            <span>
              StickerPeel adapted from{" "}
              <a href="https://reactbits.dev" target="_blank" rel="noreferrer">
                React Bits
              </a>
              .
            </span>
          </footer>
        </section>
      </main>
      {!story && (
        <div className="loading-screen" role="status">
          <span className="loading-mark">NYC</span>
          <p>Setting the tables…</p>
        </div>
      )}
      <div className="sr-only" aria-live="polite">
        {statusMessage}
      </div>
      {displayedRestaurant && exploreMode === "restaurant-detail" && (
        <Receipt
          location={displayedRestaurant}
          landmark={selectedLandmark}
          phase={receiptPhase}
          onTransitionEnd={finishReceiptTransition}
          saved={savedRestaurants.some(
            (item) => item.id === displayedRestaurant.id,
          )}
          statusMessage={statusMessage}
          onClose={closeRestaurantDetail}
          onSave={() => toggleSaved(displayedRestaurant)}
          onAddToItinerary={addToItinerary}
        />
      )}
    </div>
  );
}
