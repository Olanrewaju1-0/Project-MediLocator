import "./HospitalList.css";

function formatDistance(miles) {
  if (miles == null) return "-";
  return miles.toFixed(1) + " mi";
}

function HospitalList({ hospitals, userLocation, onDirection }) {
  return (
    <ul className="hospital-list">
      {hospitals.map((h, i) => (
        <li className="hospital-item" key={h.place_id || i}>
          <span className="hospital-icon">🏥</span>
          <div className="hospital-info">
            <div className="hospital-name">{h.name}</div>
            <div className="hospital-specialty">
              {h.vicinity || h.formatted_address}
            </div>
          </div>
          <div className="hospital-rating-center">
            {typeof h.rating === "number" && (
              <span className="hospital-rating">⭐ {h.rating.toFixed(1)}</span>
            )}
          </div>
          <div className="hospital-distance">{formatDistance(h.distance)}</div>
          <div
            className={`hospital-status ${
              h.opening_hours && h.opening_hours.open_now ? "open" : "closed"
            }`}
          >
            {h.opening_hours && h.opening_hours.open_now ? "Open" : "Closed"}
          </div>
          <button
            className="direction-btn"
            onClick={() => onDirection && onDirection(h)}
          >
            Directions
          </button>
        </li>
      ))}
    </ul>
  );
}

export default HospitalList;
