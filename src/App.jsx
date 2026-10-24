import { useEffect, useState } from "react";
import { Routes, Route, NavLink, Link, Navigate } from "react-router-dom";
import { sampleFacilities } from "./data/facilities.js";
import {
  addSlots, increaseHour, decreaseHour, removeSlot, resetPlan,
} from "./planLogic.js";

import {
  HomePage, FacilitiesPage, FacilityDetailsPage, ReservationPlanPage,
  ManageFacilitiesPage, AboutPage, ContactPage,
  AuthPage, NearbyPage,
} from "./Pages.jsx";
import { request } from "./api.js";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-columns">
        <div>
          <h4>Sports Facility Planner</h4>
          <p>Plan practice hours at fictional football pitches, volleyball courts and fitness rooms.</p>
        </div>

        <div>
          <h4>Quick links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/facilities">Facilities</Link></li>
            <li><Link to="/plan">Reservation Plan</Link></li>
            <li><Link to="/manage">Manage Facilities</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4>Contact</h4>
          <p>Email: sportfacilities@gmail.com</p>
          <p>Phone: +93 777 322 923</p>
          <p>Herat, Afghanistan</p>
        </div>
      </div>

      <p className="footer-bottom">
        © {year} Sports Facility Planner. Local demo reservations; no online payments.
      </p>
    </footer>
  );
}

function App() {
  // دو state اصلی کل برنامه:
  const [facilities, setFacilities] = useState(sampleFacilities);
  const [apiStatus, setApiStatus] = useState("loading");
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(() => !localStorage.getItem("sportPlannerToken"));
  useEffect(() => { request("/facilities").then(setFacilities).then(() => setApiStatus("online")).catch(() => setApiStatus("offline")); }, []);
  useEffect(() => { if (localStorage.getItem("sportPlannerToken")) request("/auth/me").then(setUser).catch(() => localStorage.removeItem("sportPlannerToken")).finally(() => setAuthReady(true)); }, []);
  const [plan, setPlan] = useState([]); // [{ facilityId, slotId }]

  // این توابع "" برمی‌گردانند اگر موفق بود، و متن خطا اگر نبود
  function handleAdd(facility, startSlotId, hours) {
    const result = addSlots(plan, facility, startSlotId, hours);
    if (result.error === "") setPlan(result.plan);
    return result.error;
  }

  function handleIncrease(facility) {
    const result = increaseHour(plan, facility);
    if (result.error === "") setPlan(result.plan);
    return result.error;
  }

  function handleDecrease(facilityId) {
    setPlan(decreaseHour(plan, facilityId));
  }

  function handleRemove(facilityId, slotId) {
    setPlan(removeSlot(plan, facilityId, slotId));
  }

  function handleReset() {
    setPlan(resetPlan());
  }

  // ---------- مدیریت مجموعه‌ها ----------
  function addFacility(data) {
    const newFacility = { ...data, id: "f" + Date.now() };
    request("/facilities", { method: "POST", body: JSON.stringify(newFacility) }).then((saved) => setFacilities((current) => [...current, saved])).catch((error) => window.alert(error.message));
  }

  function updateFacility(id, data) {
    request(`/facilities/${id}`, { method: "PUT", body: JSON.stringify(data) }).then((updated) => setFacilities((current) => current.map((f) => (f.id === id ? updated : f)))).catch((error) => window.alert(error.message));
    // اسلات‌هایی که دیگر وجود ندارند از برنامه حذف شوند
    setPlan(plan.filter((item) => item.facilityId !== id || data.slotIds.includes(item.slotId)));
  }

  function deleteFacility(id) {
    request(`/facilities/${id}`, { method: "DELETE" }).then(() => setFacilities((current) => current.filter((f) => f.id !== id))).catch((error) => window.alert(error.message));
    setPlan(plan.filter((item) => item.facilityId !== id));
  }

  async function handleLogout() { try { await request("/auth/logout", { method:"POST" }); } finally { localStorage.removeItem("sportPlannerToken"); setUser(null); } }

  return (
    <div className="app">
      <header className="header">
        <h1>Sports Facility Planner</h1>
        <nav className="nav">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/facilities">Facilities</NavLink>
          <NavLink to="/nearby">near me</NavLink>
          <NavLink to="/plan">My Plan ({plan.length})</NavLink>
          {user?.role === "admin" && <NavLink to="/manage">CMS</NavLink>}
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>
        {user ? <div className="user-actions"><span>{user.name}</span><button className="header-button" onClick={handleLogout}>Sign out</button></div> : <Link className="header-login" to="/login">Sign in</Link>}
        <span className={`api-indicator ${apiStatus}`} aria-live="polite">{apiStatus === "online" ? "API connected" : apiStatus === "loading" ? "Connecting…" : "Demo mode · API offline"}</span>
      </header>

      <main className="main">
        <Routes>
          <Route path="/" element={<HomePage facilities={facilities} />} />
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <AuthPage onAuth={setUser} />} />
          <Route path="/nearby" element={<NearbyPage />} />
          <Route path="/facilities" element={<FacilitiesPage facilities={facilities} />} />
          <Route
            path="/facilities/:id"
            element={<FacilityDetailsPage facilities={facilities} plan={plan} onAdd={handleAdd} />}
          />
          <Route
            path="/plan"
            element={!authReady ? <p>Loading account…</p> : user ? <ReservationPlanPage
                facilities={facilities}
                plan={plan}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
                onRemove={handleRemove}
                onReset={handleReset}
              /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/manage"
            element={!authReady ? <p>Loading account…</p> : user?.role === "admin" ? <ManageFacilitiesPage
                facilities={facilities}
                onAdd={addFacility}
                onUpdate={updateFacility}
                onDelete={deleteFacility}
              /> : <Navigate to={user ? "/" : "/login"} replace />}
          />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
