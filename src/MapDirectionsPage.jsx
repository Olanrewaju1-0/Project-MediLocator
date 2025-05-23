import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  useJsApiLoader,
} from "@react-google-maps/api";
import Sidebar from "./Sidebar";
import MobileTopBar from "./MobileTopBar";
import { MdMenu } from "react-icons/md";

const containerStyle = {
  width: "100%",
  height: "70vh",
  borderRadius: "12px",
  margin: "16px auto",
  maxWidth: "900px",
};

const PLACE_TYPES = ["hospital", "doctor", "pharmacy", "health"];

function MapDirectionsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    hospital,
    userLocation: navUserLocation,
    hospitals: navHospitals,
  } = location.state || {};
  const [userLocation, setUserLocation] = useState(navUserLocation);
  const [directions, setDirections] = useState(null);
  const [error, setError] = useState(null);
  const [hospitals, setHospitals] = useState(navHospitals || []);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyDV2172NBypnPVbzvdXMpXHDjv9blnjhMI",
    libraries: ["places"],
  });
  const mapRef = useRef(null);

  const isMobile = typeof window !== "undefined" && window.innerWidth <= 700;

  // Request geolocation if not provided
  useEffect(() => {
    if (!userLocation) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
          },
          () => {
            setUserLocation({ lat: 37.7749, lng: -122.4194 });
          }
        );
      } else {
        setUserLocation({ lat: 37.7749, lng: -122.4194 });
      }
    }
  }, [userLocation]);

  // Fetch hospitals if not provided
  useEffect(() => {
    if (!isLoaded || !userLocation || hospitals.length > 0) return;
    const map =
      mapRef.current ||
      new window.google.maps.Map(document.createElement("div"));
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
              results.map((place) => ({
                ...place,
                location: {
                  lat:
                    typeof place.geometry.location.lat === "function"
                      ? place.geometry.location.lat()
                      : place.geometry.location.lat,
                  lng:
                    typeof place.geometry.location.lng === "function"
                      ? place.geometry.location.lng()
                      : place.geometry.location.lng,
                },
              }))
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
            setHospitals(unique);
          }
        }
      );
    });
  }, [isLoaded, userLocation, hospitals.length]);

  useEffect(() => {
    if (!isLoaded || !hospital || !userLocation) return;
    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: userLocation,
        destination: { lat: hospital.location.lat, lng: hospital.location.lng },
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          setError("Could not find directions.");
        }
      }
    );
  }, [isLoaded, hospital, userLocation]);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        flexDirection: isMobile ? "column" : "row",
      }}
    >
      {isMobile ? (
        <MobileTopBar activeTab="map" />
      ) : (
        <Sidebar activeTab="map" />
      )}
      <div
        style={{
          padding: isMobile ? 8 : 32,
          flex: 1,
          width: "100vw",
          minHeight: 0,
          overflow: "auto",
        }}
      >
        <button onClick={() => navigate("/")} style={{ marginBottom: 16 }}>
          ← Back
        </button>
        {hospital ? (
          <>
            <h2 style={{ fontSize: isMobile ? 18 : 24 }}>
              Directions to {hospital.name}
            </h2>
            <div style={{ marginBottom: 12, color: "#888" }}>
              {hospital.vicinity || hospital.formatted_address}
            </div>
          </>
        ) : (
          <h2 style={{ fontSize: isMobile ? 18 : 24 }}>
            Hospitals & Medical Care Near You
          </h2>
        )}
        {isLoaded && userLocation && (
          <GoogleMap
            mapContainerStyle={{
              ...containerStyle,
              width: isMobile ? "100vw" : "100%",
              height: isMobile ? "55vh" : containerStyle.height,
              margin: isMobile ? "8px 0" : containerStyle.margin,
            }}
            center={userLocation}
            zoom={13}
            onLoad={(map) => (mapRef.current = map)}
          >
            <Marker position={userLocation} label="You" />
            {hospital ? (
              <>
                <Marker
                  position={{
                    lat: hospital.location.lat,
                    lng: hospital.location.lng,
                  }}
                  label="Dest"
                />
                {directions && <DirectionsRenderer directions={directions} />}
              </>
            ) : (
              Array.isArray(hospitals) &&
              hospitals.map((h, i) => (
                <Marker
                  key={h.place_id || i}
                  position={{
                    lat: h.location?.lat,
                    lng: h.location?.lng,
                  }}
                  title={h.name}
                />
              ))
            )}
          </GoogleMap>
        )}
        {error && (
          <div style={{ color: "#e14c4c", marginTop: 16 }}>{error}</div>
        )}
      </div>
    </div>
  );
}

export default MapDirectionsPage;
