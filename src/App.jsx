import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useJsApiLoader } from "@react-google-maps/api";
import Sidebar from "./Sidebar";
import MobileTopBar from "./MobileTopBar";
import HospitalList from "./HospitalList";
import MapPreview from "./MapPreview";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import "./App.css";

const TABS = ["All", "Nearby", "Top Rated", "Open Now"];
const PAGE_SIZE = 5;
const PLACE_TYPES = ["hospital"];

function getDistance(lat1, lon1, lat2, lon2) {
  // Haversine formula
  const R = 3958.8; // miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function App() {
  const [userLocation, setUserLocation] = useState(null);
  const [tab, setTab] = useState("All");
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [placesError, setPlacesError] = useState(null);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyDV2172NBypnPVbzvdXMpXHDjv9blnjhMI",
    libraries: ["places"],
  });

  const isMobile = typeof window !== "undefined" && window.innerWidth <= 700;

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => setUserLocation({ lat: 37.7749, lng: -122.4194 }) // fallback: SF
      );
    } else {
      setUserLocation({ lat: 37.7749, lng: -122.4194 });
    }
  }, []);

  // Fetch hospitals when userLocation or isLoaded changes
  useEffect(() => {
    if (!isLoaded || !userLocation) return;
    setLoading(true);
    setPlacesError(null);
    const map = new window.google.maps.Map(document.createElement("div"));
    const service = new window.google.maps.places.PlacesService(map);
    let allResults = [];
    let completed = 0;
    PLACE_TYPES.forEach((type) => {
      service.nearbySearch(
        {
          location: userLocation,
          radius: 5000,
          type,
        },
        (results, status) => {
          completed++;
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            results
          ) {
            allResults = allResults.concat(
              results.map((place) => {
                let lat, lng;
                if (typeof place.geometry.location.lat === "function") {
                  lat = place.geometry.location.lat();
                  lng = place.geometry.location.lng();
                } else {
                  lat = place.geometry.location.lat;
                  lng = place.geometry.location.lng;
                }
                return {
                  ...place,
                  distance: getDistance(
                    userLocation.lat,
                    userLocation.lng,
                    lat,
                    lng
                  ),
                  location: { lat, lng },
                };
              })
            );
          }
          if (completed === PLACE_TYPES.length) {
            // Remove duplicates by place_id
            const unique = Object.values(
              allResults.reduce((acc, place) => {
                acc[place.place_id] = place;
                return acc;
              }, {})
            );
            setPlaces(unique);
            setLoading(false);
          }
        }
      );
    });
  }, [isLoaded, userLocation]);

  // Reset page when tab or places change
  useEffect(() => {
    setPage(1);
  }, [tab, places]);

  // Filtering for Top Rated (client-side)
  let filtered = places.slice();
  if (tab === "Top Rated") {
    filtered = filtered
      .filter((p) => typeof p.rating === "number")
      .sort((a, b) => b.rating - a.rating);
  } else if (tab === "Nearby") {
    filtered = filtered.sort((a, b) => a.distance - b.distance);
  } else if (tab === "Open Now") {
    filtered = filtered.filter(
      (p) => p.opening_hours && p.opening_hours.open_now
    );
  }

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Handle direction button click
  const handleDirection = (hospital) => {
    const safeHospital = {
      place_id: hospital.place_id,
      name: hospital.name,
      vicinity: hospital.vicinity,
      formatted_address: hospital.formatted_address,
      rating: hospital.rating,
      location: hospital.location,
    };
    navigate("/map", { state: { hospital: safeHospital, userLocation } });
  };

  return (
    <div className="app-root">
      {isMobile ? <MobileTopBar activeTab="hospitals" /> : <Sidebar />}
      <main className="main-content">
        <header className="header">
          <h2>Search Hospitals & Medical Care</h2>
          <div className="search-section">
            <label htmlFor="search" className="search-label">
              Location or Medical Care Name
            </label>
            <div className="search-bar-wrapper">
              <input
                id="search"
                className="search-bar"
                placeholder="Enter city, address, or medical care"
                disabled
              />
              <span className="search-icon">🔍</span>
            </div>
          </div>
          <div className="tabs">
            {TABS.map((t) => (
              <span
                key={t}
                className={`tab${tab === t ? " active" : ""}`}
                onClick={() => setTab(t)}
              >
                {t}
              </span>
            ))}
          </div>
        </header>
        <section className="hospital-list-section">
          <h3>Medical Care List</h3>
          {(!isLoaded || loading) && (
            <div className="loader">Loading hospitals...</div>
          )}
          {placesError && <div style={{ color: "#e14c4c" }}>{placesError}</div>}
          {!loading && isLoaded && (
            <HospitalList
              hospitals={paginated}
              userLocation={userLocation}
              onDirection={handleDirection}
            />
          )}
          {totalPages > 1 && !loading && isLoaded && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Previous page"
              >
                <MdChevronLeft color={page === 1 ? "#bbb" : "#5a4ff3"} />
              </button>
              <span className="pagination-info">
                Page {page} of {totalPages}
              </span>
              <button
                className="pagination-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Next page"
              >
                <MdChevronRight
                  color={page === totalPages ? "#bbb" : "#5a4ff3"}
                />
              </button>
            </div>
          )}
        </section>
        <section className="map-preview-section">
          <h3>Map Preview</h3>
          <MapPreview
            hospitals={paginated}
            userLocation={userLocation}
            onPlacesFetched={() => {}}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
