import { useRef } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import "./MapPreview.css";

const containerStyle = {
  width: "100%",
  height: "500px",
  borderRadius: "8px",
  overflow: "hidden",
};

const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 };
// const PLACE_TYPES = ["hospital", "doctor", "pharmacy", "health"];
const PLACE_TYPES = ["hospital"];

function MapPreview({ hospitals = [], userLocation, onPlacesFetched }) {
  const mapRef = useRef(null);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyDV2172NBypnPVbzvdXMpXHDjv9blnjhMI", // TODO: Replace with your real key
    libraries: ["places"],
  });

  // Fetch places when map is loaded and userLocation is available
  const handleMapLoad = (map) => {
    mapRef.current = map;
    if (userLocation && window.google && window.google.maps.places) {
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
              allResults = allResults.concat(results);
            }
            if (
              completed === PLACE_TYPES.length &&
              typeof onPlacesFetched === "function"
            ) {
              // Remove duplicates by place_id
              const unique = Object.values(
                allResults.reduce((acc, place) => {
                  acc[place.place_id] = place;
                  return acc;
                }, {})
              );
              onPlacesFetched(unique);
            }
          }
        );
      });
    }
  };

  const center = userLocation || DEFAULT_CENTER;

  return (
    <div className="map-preview">
      {isLoaded && (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={13}
          onLoad={handleMapLoad}
        >
          {userLocation && (
            <Marker
              position={userLocation}
              icon={{
                url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                scaledSize: { width: 40, height: 40 },
              }}
            />
          )}
          {hospitals.map((h, i) =>
            h.geometry && h.geometry.location ? (
              <Marker
                key={h.place_id || i}
                position={{
                  lat: h.geometry.location.lat(),
                  lng: h.geometry.location.lng(),
                }}
                title={h.name}
              />
            ) : null
          )}
        </GoogleMap>
      )}
    </div>
  );
}

export default MapPreview;
