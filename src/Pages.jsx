// همه‌ی صفحه‌ها در یک فایل. هر صفحه یک تابع (کامپوننت) جداست.
import { useState, useEffect } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { SPORTS } from "./data/facilities.js";
import { getHours, validateFacility } from "./planLogic.js";
import FacilityCard from "./components/FacilityCard.jsx";
import SportFilters from "./components/SportFilters.jsx";
import HourSlotPicker from "./components/HourSlotPicker.jsx";
import ReservationSummary from "./components/ReservationSummary.jsx";
import ReservationForm from "./components/ReservationForm.jsx";
import { request } from "./api.js";

// ---------- FacilityForm (فرم افزودن/ویرایش مجموعه) ----------
const emptyForm = {
  name: "", sportCategory: "football", hourlyRateAFN: "",
  capacity: "", slotIds: "", description: "", image: "",
};

// وقتی ویرایش است، فرم با مقدارهای مجموعه پر می‌شود (همه به صورت رشته)
function toForm(facility) {
  return {
    ...facility,
    hourlyRateAFN: String(facility.hourlyRateAFN),
    capacity: String(facility.capacity),
    slotIds: facility.slotIds.join(", "),
  };
}

function FacilityForm({ editing, onSave, onCancel }) {
  const [form, setForm] = useState(editing ? toForm(editing) : emptyForm);
  const [errors, setErrors] = useState({});

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const result = validateFacility(form);
    setErrors(result.errors);
    if (Object.keys(result.errors).length > 0) return;

    onSave({ ...result.facility, image: form.image || editing?.image || "" });
    setForm(emptyForm);
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h3>{editing ? "Edit facility" : "Add facility"}</h3>

      <label>Name
        <input name="name" value={form.name} onChange={handleChange} />
      </label>
      {errors.name && <p className="error">{errors.name}</p>}

      <label>Sport category
        <select name="sportCategory" value={form.sportCategory} onChange={handleChange}>
          {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>

      <label>Hourly rate (AFN)
        <input name="hourlyRateAFN" value={form.hourlyRateAFN} onChange={handleChange} />
      </label>
      {errors.hourlyRateAFN && <p className="error">{errors.hourlyRateAFN}</p>}

      <label>Capacity
        <input name="capacity" value={form.capacity} onChange={handleChange} />
      </label>
      {errors.capacity && <p className="error">{errors.capacity}</p>}

      <label>Slot IDs (comma separated, e.g. SAT-09, SAT-10)
        <input name="slotIds" value={form.slotIds} onChange={handleChange} />
      </label>
      {errors.slotIds && <p className="error">{errors.slotIds}</p>}

      <label>Description
        <input name="description" value={form.description} onChange={handleChange} />
      </label>

      <label>Image URL (optional)
        <input name="image" value={form.image || ""} onChange={handleChange} />
      </label>

      <button type="submit">{editing ? "Save changes" : "Add facility"}</button>{" "}
      {editing && <button type="button" onClick={onCancel}>Cancel</button>}
    </form>
  );
}

// ---------- HomePage ----------
// آیکن ساده برای هر ورزش (ایموجی، بدون کتابخانه‌ی اضافه)
const sportIcons = {
  football: "⚽",
  volleyball: "🏐",
  "fitness room": "🏋️",
};
const sportImages = {
  football: "https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=900&q=80",
  volleyball: "https://images.unsplash.com/photo-1728971125178-9d393c36b460?auto=format&fit=crop&w=900&q=80",
  "fitness room": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80",
};
const heroSlides = [
  { image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1500&q=85", alt: "Football field ready for a game", label: "FIND YOUR FIELD", title: "Every great game starts somewhere." },
  { image: "https://images.unsplash.com/photo-1728971125178-9d393c36b460?auto=format&fit=crop&w=1500&q=85", alt: "Men playing indoor volleyball", label: "BRING YOUR TEAM", title: "Make time for the moments that matter." },
  { image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1500&q=85", alt: "Man training at the gym", label: "MOVE YOUR WAY", title: "Your next best session is waiting." },
];

export function HomePage({ facilities }) {
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return undefined;
    const timer = window.setInterval(() => setSlide((current) => (current + 1) % heroSlides.length), 5000);
    return () => window.clearInterval(timer);
  }, [paused]);
  // سه مجموعه‌ی اول که اسلات دارند به عنوان پیشنهاد نشان داده می‌شوند
  const featured = facilities.filter((f) => f.slotIds.length > 0).slice(0, 3);

  // برای هر ورزش تعداد مجموعه‌ها را می‌شماریم
  function countBySport(sport) {
    return facilities.filter((f) => f.sportCategory === sport).length;
  }

  return (
    <div>
      {/* 1. بخش اصلی (Hero) */}
      <section className="hero">
        <div className="hero-copy"><span className="eyebrow">YOUR GAME. YOUR TIME.</span><h2>Make room for the game you love.</h2>
        <p>Find a place to move, bring your team together, and plan your next session in a few simple steps.</p>
        <Link className="button" to="/facilities">Explore facilities <span aria-hidden="true">→</span></Link>{" "}
        <Link className="button light" to="/plan">Open my plan</Link><div className="hero-proof"><span>⚡ Easy planning</span><span>◎ Flexible hours</span></div></div>
        <div className="hero-visual" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}>
          {heroSlides.map((item, index) => <img key={item.image} className={`hero-image ${index === slide ? "is-active" : ""}`} src={item.image} alt={index === slide ? item.alt : ""} aria-hidden={index !== slide} />)}
          <div className="hero-image-shade"/><div className="hero-caption" aria-live="polite"><span>{heroSlides[slide].label}</span><strong>{heroSlides[slide].title}</strong></div>
          <div className="hero-controls">{heroSlides.map((item, index) => <button key={item.label} className={`hero-dot ${index === slide ? "active" : ""}`} aria-label={`Show slide ${index + 1}`} aria-pressed={index === slide} onClick={() => setSlide(index)} />)}<button className="pause-button" onClick={() => setPaused((value) => !value)} aria-label={paused ? "Resume slideshow" : "Pause slideshow"}>{paused ? "▶" : "Ⅱ"}</button></div>
          <div className="hero-float"><span>✦</span><div><strong>More play, less planning</strong><small>Pick a place. Set a time. Let's go.</small></div></div>
        </div>
      </section>

      {/* 2. دسته‌بندی ورزش‌ها */}
      <div className="section-heading"><div><span className="eyebrow">PICK YOUR PACE</span><h3>Find your kind of game</h3></div><p>From team sports to solo training, start with what moves you.</p></div>
      <div className="grid">
        {SPORTS.map((sport) => (
          <Link className="sport-box" to="/facilities" key={sport}>
          <img src={sportImages[sport]} alt="" /><span className="sport-box-shade" /><span className="sport-icon">{sportIcons[sport]}</span>
            <strong>{sport}</strong>
          <span>{countBySport(sport)} places to play <b>↗</b></span>
          </Link>
        ))}
      </div>

      {/* 3. سه مرحله */}
      <div className="section-heading"><div><span className="eyebrow">THREE SIMPLE STEPS</span><h3>Your next session, sorted</h3></div></div>
      <div className="grid">
        <div className="card step-card"><span>01</span><strong>Find your spot</strong><p>Explore courts and spaces that fit your sport and budget.</p></div>
        <div className="card step-card"><span>02</span><strong>Choose your time</strong><p>Build a session that works for your crew, hour by hour.</p></div>
        <div className="card step-card"><span>03</span><strong>Get game-ready</strong><p>Review your plan and see the full cost before you go.</p></div>
      </div>

      {/* 4. پیشنهادها */}
      <div className="section-heading"><div><span className="eyebrow">READY WHEN YOU ARE</span><h3>Spaces to get you moving</h3></div><Link to="/facilities">See all spaces →</Link></div>
      <div className="grid">
        {featured.map((facility) => (
          <FacilityCard key={facility.id} facility={facility} />
        ))}
      </div>
    </div>
  );
}

// ---------- FacilitiesPage ----------
export function FacilitiesPage({ facilities }) {
  const [search, setSearch] = useState("");
  const [sport, setSport] = useState("all");
  const [sortOrder, setSortOrder] = useState("none");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // مرحله به مرحله لیست را فیلتر می‌کنیم
  let result = facilities.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );
  if (sport !== "all") {
    result = result.filter((f) => f.sportCategory === sport);
  }
  if (onlyAvailable) {
    result = result.filter((f) => f.slotIds.length > 0);
  }
  if (sortOrder === "low") {
    result = [...result].sort((a, b) => a.hourlyRateAFN - b.hourlyRateAFN);
  }
  if (sortOrder === "high") {
    result = [...result].sort((a, b) => b.hourlyRateAFN - a.hourlyRateAFN);
  }

  return (
    <section>
      <h2>Facilities</h2>
      <SportFilters
        search={search} setSearch={setSearch}
        sport={sport} setSport={setSport}
        sortOrder={sortOrder} setSortOrder={setSortOrder}
        onlyAvailable={onlyAvailable} setOnlyAvailable={setOnlyAvailable}
      />

      {result.length === 0 && <p className="muted">No facilities match your search.</p>}

      <div className="grid">
        {result.map((facility) => (
          <FacilityCard key={facility.id} facility={facility} />
        ))}
      </div>
    </section>
  );
}

// ---------- FacilityDetailsPage ----------
export function FacilityDetailsPage({ facilities, plan, onAdd }) {
  const { id } = useParams(); // id از آدرس: /facilities/f1
  const facility = facilities.find((f) => f.id === id);

  if (!facility) {
    return (
      <section>
        <p>Facility not found.</p>
        <Link to="/facilities">Back to facilities</Link>
      </section>
    );
  }

  const mySlots = plan.filter((item) => item.facilityId === facility.id);

  return (
    <section>
      <Link to="/facilities">← Back to facilities</Link>
      <h2>{facility.name}</h2>
      <img className="detail-image" src={facility.image || sportImages[facility.sportCategory]} alt={facility.name} />
      <p className="tag">{facility.sportCategory}</p>
      <p>{facility.description}</p>
      <p>Rate: <strong>{facility.hourlyRateAFN} AFN</strong> / hour</p>
      <p>Capacity: {facility.capacity} people</p>

      <h3>Choose hours</h3>
      <HourSlotPicker facility={facility} onAdd={onAdd} />

      <h3>Your selected hours here ({getHours(plan, facility.id)} of 4)</h3>
      {mySlots.length === 0 ? (
        <p className="muted">Nothing selected yet.</p>
      ) : (
        <div className="chips">
          {mySlots.map((item) => (
            <span className="chip" key={item.slotId}>{item.slotId}</span>
          ))}
        </div>
      )}
      <Link className="button" to="/plan">Go to reservation plan</Link>
    </section>
  );
}

// ---------- ReservationPlanPage ----------
export function ReservationPlanPage(props) {
  return (
    <section>
      <h2>Reservation Plan</h2>
      <ReservationSummary
        facilities={props.facilities}
        plan={props.plan}
        onIncrease={props.onIncrease}
        onDecrease={props.onDecrease}
        onRemove={props.onRemove}
        onReset={props.onReset}
      />
      <ReservationForm facilities={props.facilities} plan={props.plan} />
    </section>
  );
}

export function AuthPage({ onAuth }) {
  const [register, setRegister] = useState(false);
  const [form, setForm] = useState({ name:"", email:"", password:"" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const result = await request(register ? "/auth/register" : "/auth/login", { method:"POST", body:JSON.stringify(form) });
      localStorage.setItem("sportPlannerToken", result.token); onAuth(result.user);
    } catch (cause) { setError(cause.message); } finally { setBusy(false); }
  }
  return <section className="auth-shell"><div className="auth-intro"><span className="eyebrow">WELCOME TO THE TEAM</span><h2>{register ? "Create your account." : "Good to see you."}</h2><p>Sign in to save your reservations and access your member tools.</p><img src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1100&q=80" alt="Men playing football on a field" /></div><form className="form auth-form" onSubmit={submit}><h2>{register ? "Create account" : "Sign in"}</h2>{register && <label>Name<input required value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})}/></label>}<label>Email<input required type="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})}/></label><label>Password<input required type="password" minLength="8" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})}/></label>{error&&<p className="error">{error}</p>}<button disabled={busy}>{busy?"Please wait…":register?"Create account":"Sign in"}</button><button type="button" className="text-button" onClick={()=>{setRegister((v)=>!v);setError("")}}>{register?"Already have an account? Sign in":"New here? Create an account"}</button></form></section>;
}

const distanceKm = (a,b) => { const rad=(n)=>n*Math.PI/180; const dLat=rad(b.lat-a.lat),dLon=rad(b.lon-a.lon);const x=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLon/2)**2;return 6371*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x)); };
const inHerat = ({lat,lon}) => lat >= 34.25 && lat <= 34.43 && lon >= 62.13 && lon <= 62.27;
export function NearbyPage() {
  const [places,setPlaces]=useState([]); const [query,setQuery]=useState(""); const [origin,setOrigin]=useState(null); const [message,setMessage]=useState(""); const [loading,setLoading]=useState(false);
  useEffect(()=>{request("/locations").then(setPlaces).catch((error)=>setMessage(error.message));},[]);
  async function searchAddress(event) {
    event.preventDefault(); if(!query.trim()) return; setLoading(true); setMessage("");
    try { const response=await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(`${query}, Herat, Afghanistan`)}`); const matches=await response.json(); if(!matches.length) throw new Error("این نشانی پیدا نشد. لطفاً مکان دیگری در هرات وارد کنید."); const result={lat:Number(matches[0].lat),lon:Number(matches[0].lon)};if(!inHerat(result))throw new Error("این نشانی در محدودهٔ شهر هرات نیست.");setOrigin({...result,label:matches[0].display_name}); }
    catch(error){setMessage(error.message||"یافتن مکان ممکن نشد؛ GPS را امتحان کنید.");} finally {setLoading(false);}
  }
  function locateMe(){setMessage("");if(!navigator.geolocation){setMessage("مرورگر از مکان‌یابی پشتیبانی نمی‌کند.");return;}navigator.geolocation.getCurrentPosition(({coords})=>{const point={lat:coords.latitude,lon:coords.longitude};if(!inHerat(point)){setMessage("مکان فعلی بیرون از محدودهٔ شهر هرات است.");return;}setOrigin({...point,label:"مکان فعلی شما"});},()=>setMessage("دسترسی مکان فعال نشد؛ نشانی خود را بنویسید."),{enableHighAccuracy:true,timeout:12000});}
  const ranked=origin?places.map((place)=>({...place,distance:distanceKm(origin,place)})).sort((a,b)=>a.distance-b.distance):[];
  return <section className="nearby-page"><div className="nearby-heading"><span className="eyebrow">هرات، افغانستان</span><h2>مکان ورزشی نزدیکت را پیدا کن</h2><p>نشانی خود را وارد کن یا مکان فعلی را به اشتراک بگذار تا گزینه‌های نزدیک‌تر را ببینی.</p></div><form className="location-search" onSubmit={searchAddress}><label className="sr-only" htmlFor="nearby-address">نشانی در هرات</label><input id="nearby-address" value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="مثلاً شهرنو، هرات"/><button disabled={loading}>{loading?"در حال جست‌وجو…":"جست‌وجوی نشانی"}</button><button type="button" className="secondary-button" onClick={locateMe}>استفاده از GPS من</button></form>{message&&<p className="error">{message}</p>}{origin&&<p className="location-note">نزدیک‌ترین گزینه‌ها به: {origin.label}</p>}<p className="approx-note">مکان‌ها و فاصله‌ها تقریبی هستند؛ پیش از حرکت، نشانی را در نقشه بررسی کنید.</p>{origin?<div className="nearby-grid">{ranked.map((place,index)=><article className="nearby-card" key={place.id}><img src={place.image} alt=""/><div className="nearby-card-body"><span className="tag">{place.type}</span>{index===0&&<span className="nearest-tag">نزدیک‌ترین</span>}<h3>{place.name}</h3><p>{place.address}</p><strong>{place.distance<1?`${Math.round(place.distance*1000)} متر`:`${place.distance.toFixed(1)} کیلومتر`}</strong><a target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.mapQuery)}`}>نمایش در نقشه ↗</a></div></article>)}</div>:<div className="nearby-placeholder"><span>⌖</span><strong>موقعیتت را وارد کن</strong><p>نتیجه‌های ورزشی هرات بر اساس فاصله مرتب می‌شوند.</p></div>}</section>;
}

// ---------- ManageFacilitiesPage ----------
export function ManageFacilitiesPage({ facilities, onAdd, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(null); // مجموعه‌ای که در حال ویرایش است

  function handleSave(data) {
    if (editing) {
      onUpdate(editing.id, data);
      setEditing(null);
    } else {
      onAdd(data);
    }
  }

  function handleDelete(facility) {
    if (window.confirm("Delete " + facility.name + "?")) {
      onDelete(facility.id);
      if (editing && editing.id === facility.id) setEditing(null);
    }
  }

  return (
    <section>
      <h2>Manage Facilities</h2>

      {/* key باعث می‌شود با عوض شدن مجموعه، فرم از نو ساخته و پر شود */}
      <FacilityForm
        key={editing ? editing.id : "new"}
        editing={editing}
        onSave={handleSave}
        onCancel={() => setEditing(null)}
      />

      <h3>All facilities</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Sport</th><th>Rate (AFN)</th>
              <th>Capacity</th><th>Slots</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {facilities.map((f) => (
              <tr key={f.id}>
                <td>{f.name}</td>
                <td>{f.sportCategory}</td>
                <td>{f.hourlyRateAFN}</td>
                <td>{f.capacity}</td>
                <td>{f.slotIds.join(", ") || "—"}</td>
                <td>
                  <button onClick={() => setEditing(f)}>Edit</button>{" "}
                  <button className="danger" onClick={() => handleDelete(f)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ---------- AboutPage ----------
export function AboutPage() {
  return (
    <section>
      <h2>About</h2>
      <img className="about-image" src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1400&q=85" alt="Men playing football on a field" />
      <p>
        This is a student prototype for planning practice sessions at fictional
        sports facilities. All data is sample data kept in memory, so it resets
        when the page is reloaded.
      </p>
      <ul>
        <li>Built with React, Vite and React Router.</li>
        <li>Rules (4-hour limit, no duplicates, cost) live in one file: planLogic.js.</li>
        <li>Demo accounts and reservations are saved locally by the project API; no online payments are processed.</li>
      </ul>
    </section>
  );
}

// ---------- ContactPage ----------
export function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.name.trim() === "" || form.message.trim() === "") {
      setError("Name and message are required.");
      setSent(false);
    } else if (!emailPattern.test(form.email.trim())) {
      setError("Please enter a valid email.");
      setSent(false);
    } else {
      try { await request("/messages", { method: "POST", body: JSON.stringify(form) }); setError(""); setSent(true); }
      catch (requestError) { setError(requestError.message); setSent(false); }
    }
  }

  return (
    <section className="contact-layout">
      <div><span className="eyebrow">LET'S TALK</span><h2>Ready when you are.</h2><p>Questions about a space or planning a session? Send us a note and our team will get back to you.</p><img className="contact-image" src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1000&q=80" alt="Men playing football on a field" /></div>
      <form className="form" onSubmit={handleSubmit}>
        <label>Name <input name="name" value={form.name} onChange={handleChange} /></label>
        <label>Email <input name="email" value={form.email} onChange={handleChange} /></label>
        <label>Message <textarea name="message" rows="4" value={form.message} onChange={handleChange} /></label>
        <button type="submit">Send</button>
        {error && <p className="error">{error}</p>}
        {sent && <p className="success">Thanks! Your message has been saved.</p>}
      </form>
    </section>
  );
}
