import { Link } from "react-router-dom";

// یک کارت برای نمایش یک مجموعه
function FacilityCard({ facility }) {
  return (
    <div className="card">
      <img className="facility-image" src={facility.image || "https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=900&q=80"} alt={facility.name} loading="lazy" />
      <h3>{facility.name}</h3>
      <p className="tag">{facility.sportCategory}</p>
      <p>Rate: <strong>{facility.hourlyRateAFN} AFN</strong> / hour</p>
      <p>Capacity: {facility.capacity} people</p>

      <p>Available slots:</p>
      {facility.slotIds.length === 0 ? (
        <p className="muted">No slots available</p>
      ) : (
        <div className="chips">
          {facility.slotIds.map((slotId) => (
            <span key={slotId} className="chip">{slotId}</span>
          ))}
        </div>
      )}

      <Link className="button" to={"/facilities/" + facility.id}>View details</Link>
    </div>
  );
}

export default FacilityCard;
