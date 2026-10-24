import { useState } from "react";
import { validateBooking, getTotalCost } from "../planLogic.js";
import { request } from "../api.js";

// فرم رزرو نمونه + پیش‌نمایش (چیزی ذخیره نمی‌شود)
function ReservationForm({ plan, facilities }) {
  const [form, setForm] = useState({ organiserAlias: "", participants: "", email: "" });
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);
  const [saved, setSaved] = useState(false);

  // یک تابع برای همه‌ی input ها: از name خود input استفاده می‌کند
  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const foundErrors = validateBooking(form, plan, facilities);
    setErrors(foundErrors);

    if (Object.keys(foundErrors).length > 0) {
      setPreview(null);
      return;
    }
    // یک کپی از برنامه و هزینه را برای پیش‌نمایش نگه می‌داریم
    try {
      const booking = await request("/reservations", { method: "POST", body: JSON.stringify({ ...form, participants: Number(form.participants), items: plan }) });
      setPreview({ ...form, ...booking }); setSaved(true);
    } catch (error) { setErrors({ api: error.message }); setPreview(null); }
  }

  function facilityName(id) {
    return facilities.find((f) => f.id === id).name;
  }

  return (
    <section>
      <h2>Booking details</h2>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Organiser alias
          <input name="organiserAlias" value={form.organiserAlias} onChange={handleChange} />
        </label>
        {errors.organiserAlias && <p className="error">{errors.organiserAlias}</p>}

        <label>
          Participants
          <input name="participants" value={form.participants} onChange={handleChange} />
        </label>
        {errors.participants && <p className="error">{errors.participants}</p>}

        <label>
          Email
          <input name="email" value={form.email} onChange={handleChange} />
        </label>
        {errors.email && <p className="error">{errors.email}</p>}

        {errors.plan && <p className="error">{errors.plan}</p>}
        {errors.api && <p className="error">{errors.api}</p>}
        <button type="submit">Show booking preview</button>
      </form>

      {preview && (
        <div className="card preview">
          <h3>Booking preview</h3>
          <p>Organiser: {preview.organiserAlias}</p>
          <p>Participants: {preview.participants}</p>
          <p>Email: {preview.email}</p>
          <ul>
            {preview.items.map((item) => (
              <li key={item.facilityId + item.slotId}>
                {facilityName(item.facilityId)} — {item.slotId}
              </li>
            ))}
          </ul>
          <p><strong>Total: {preview.total} AFN</strong></p>
          <p className="success">{saved ? `Reservation saved. Reference: ${preview.id.slice(0, 8)}` : `Preview total: ${getTotalCost(plan, facilities)} AFN`}</p>
        </div>
      )}
    </section>
  );
}

export default ReservationForm;
