import { useState } from "react";

// انتخاب اسلات شروع + تعداد ساعت (۱ تا ۴)
// onAdd خطا را به صورت متن برمی‌گرداند ("" یعنی موفق)
function HourSlotPicker({ facility, onAdd }) {
  const [startSlot, setStartSlot] = useState("");
  const [hours, setHours] = useState(1);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    const error = onAdd(facility, startSlot, hours);
    if (error === "") {
      setMessage("Added to your plan.");
      setIsError(false);
    } else {
      setMessage(error);
      setIsError(true);
    }
  }

  if (facility.slotIds.length === 0) {
    return <p className="muted">No slots available for this facility.</p>;
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label>
        Start slot
        <select value={startSlot} onChange={(e) => setStartSlot(e.target.value)}>
          <option value="">Choose...</option>
          {facility.slotIds.map((slotId) => (
            <option key={slotId} value={slotId}>{slotId}</option>
          ))}
        </select>
      </label>

      <label>
        Hours
        <select value={hours} onChange={(e) => setHours(Number(e.target.value))}>
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </label>

      <button type="submit">Add to plan</button>
      {message !== "" && (
        <p className={isError ? "error" : "success"}>{message}</p>
      )}
    </form>
  );
}

export default HourSlotPicker;
