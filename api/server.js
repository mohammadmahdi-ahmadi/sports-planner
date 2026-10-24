import http from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { scryptSync, timingSafeEqual } from "node:crypto";

const root = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(root, "data");
const facilitiesFile = path.join(dataDir, "facilities.json");
const reservationsFile = path.join(dataDir, "reservations.json");
const messagesFile = path.join(dataDir, "messages.json");
const usersFile = path.join(dataDir, "users.json");
const port = Number(process.env.API_PORT || 3001);
const sessions = new Map();
const heratLocations = [
  { id:"h1", name:"Mirwais Sadeq Gymnasium", type:"سالن ورزشی", address:"ناحیهٔ ششم، هرات", lat:34.3478, lon:62.1978, image:"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80", mapQuery:"Mirwais Sadeq Gymnasium Herat" },
  { id:"h2", name:"Toofan Harirod FC", type:"باشگاه فوتبال", address:"هرات", lat:34.3501, lon:62.2040, image:"https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=900&q=80", mapQuery:"Toofan Harirod FC Herat" },
  { id:"h3", name:"Town Soccer / Football Field", type:"میدان فوتبال", address:"بلوار شاهد، هرات", lat:34.3420, lon:62.1902, image:"https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=900&q=80", mapQuery:"Town Soccer Football Field Shahed Blvd Herat" },
  { id:"h4", name:"Aryana Futsal Gymnasium", type:"سالن فوتسال", address:"خیابان شهید میرویس صادق، هرات", lat:34.3372, lon:62.1834, image:"https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80", mapQuery:"Aryana Futsal Gymnasium Herat" },
  { id:"h5", name:"Sahel Body Building Club", type:"باشگاه بدنسازی", address:"هرات", lat:34.3265, lon:62.1768, image:"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80", mapQuery:"Sahel Body Building Club Herat" },
  { id:"h6", name:"Shahin Harirod Gymnastics Club", type:"باشگاه ژیمناستیک", address:"هرات", lat:34.3582, lon:62.1870, image:"https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80", mapQuery:"Shahin Harirod Gymnastics Club Herat" },
];
const slots = (day, first, last) => Array.from({ length: last - first + 1 }, (_, i) => `${day}-${String(first + i).padStart(2, "0")}`);
const starter = [
  { id: "f1", name: "City Football Pitch A", sportCategory: "football", hourlyRateAFN: 200, capacity: 22, slotIds: slots("SAT", 9, 14), description: "Full-size grass pitch with floodlights.", image: "https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=1000&q=80" },
  { id: "f2", name: "Riverside Mini Football", sportCategory: "football", hourlyRateAFN: 150, capacity: 14, slotIds: slots("SUN", 9, 12), description: "Small 7-a-side pitch near the river.", image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1000&q=80" },
  { id: "f3", name: "Sunset Volleyball Court", sportCategory: "volleyball", hourlyRateAFN: 180, capacity: 12, slotIds: slots("SAT", 9, 13), description: "Outdoor court with seating.", image: "https://images.unsplash.com/photo-1728971125178-9d393c36b460?auto=format&fit=crop&w=1000&q=80" },
  { id: "f4", name: "Indoor Volleyball Hall", sportCategory: "volleyball", hourlyRateAFN: 250, capacity: 16, slotIds: slots("SUN", 10, 15), description: "Wooden-floor hall, usable in any weather.", image: "https://images.unsplash.com/photo-1728971125178-9d393c36b460?auto=format&fit=crop&w=1000&q=80" },
  { id: "f5", name: "Power Fitness Room", sportCategory: "fitness room", hourlyRateAFN: 100, capacity: 10, slotIds: slots("SAT", 9, 13), description: "Weights and cardio equipment for strength training.", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1000&q=80" },
  { id: "f6", name: "Mobility & Recovery Room", sportCategory: "fitness room", hourlyRateAFN: 120, capacity: 8, slotIds: [], description: "Quiet room for mobility, stretching and recovery.", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1000&q=80" },
];

async function readJson(file, fallback) {
  try { return JSON.parse(await readFile(file, "utf8")); }
  catch (error) { if (error.code !== "ENOENT") throw error; await writeFile(file, JSON.stringify(fallback, null, 2)); return fallback; }
}
const loadFacilities = () => readJson(facilitiesFile, starter);
const loadReservations = () => readJson(reservationsFile, []);
function send(res, status, payload) {
  const origin = res.req.headers.origin;
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": ["http://localhost:5173", "http://127.0.0.1:5173"].includes(origin) ? origin : "http://localhost:5173", "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization" });
  res.end(payload === null ? "" : JSON.stringify(payload));
}
async function body(req) {
  let raw = "";
  for await (const chunk of req) { raw += chunk; if (raw.length > 1_000_000) throw new Error("Request is too large."); }
  return raw ? JSON.parse(raw) : {};
}
function validateFacility(item) {
  if (!item.name?.trim() || !["football", "volleyball", "fitness room"].includes(item.sportCategory)) return "Name and a valid sport category are required.";
  if (!Number.isFinite(Number(item.hourlyRateAFN)) || Number(item.hourlyRateAFN) <= 0) return "Hourly rate must be greater than zero.";
  if (!Number.isInteger(Number(item.capacity)) || Number(item.capacity) < 1) return "Capacity must be a positive whole number.";
  if (!Array.isArray(item.slotIds) || new Set(item.slotIds).size !== item.slotIds.length) return "Slot IDs must be a unique list.";
  return "";
}

await mkdir(dataDir, { recursive: true });
await loadFacilities();
await loadReservations();
await readJson(messagesFile, []);
const users = await readJson(usersFile, [{ id:"admin", name:"مدیر سیستم", email:"admin@sportplanner.local", role:"admin", salt:"herat-demo-salt", passwordHash:scryptSync("HeratAdmin2026!", "herat-demo-salt", 64).toString("hex") }]);
function authorized(req, roles = []) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const user = users.find((item) => item.id === sessions.get(token));
  return user && (!roles.length || roles.includes(user.role)) ? user : null;
}
function passwordHash(password, salt) { return scryptSync(password, salt, 64).toString("hex"); }
const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return send(res, 204, null);
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] !== "api") return send(res, 404, { error: "Route not found." });
    if (parts[1] === "health") return send(res, 200, { status: "ok" });
    if (parts[1] === "auth" && parts[2] === "register" && req.method === "POST") {
      const data = await body(req); const email = String(data.email || "").trim().toLowerCase();
      if (!data.name?.trim() || !/^\S+@\S+\.\S+$/.test(email) || String(data.password || "").length < 8) return send(res, 400, { error:"نام، ایمیل معتبر و گذرواژهٔ حداقل ۸ نویسه لازم است." });
      if (users.some((user) => user.email === email)) return send(res, 409, { error:"این ایمیل قبلاً ثبت شده است." });
      const salt = randomUUID(); const user = { id:randomUUID(), name:data.name.trim(), email, role:"user", salt, passwordHash:passwordHash(data.password, salt) };
      users.push(user); await writeFile(usersFile, JSON.stringify(users, null, 2)); const token = randomUUID(); sessions.set(token, user.id); return send(res, 201, { token, user:{ id:user.id, name:user.name, email:user.email, role:user.role } });
    }
    if (parts[1] === "auth" && parts[2] === "login" && req.method === "POST") {
      const data = await body(req); const user = users.find((item) => item.email === String(data.email || "").trim().toLowerCase());
      if (!user || !timingSafeEqual(Buffer.from(passwordHash(String(data.password || ""), user.salt)), Buffer.from(user.passwordHash))) return send(res, 401, { error:"ایمیل یا گذرواژه درست نیست." });
      const token = randomUUID(); sessions.set(token, user.id); return send(res, 200, { token, user:{ id:user.id, name:user.name, email:user.email, role:user.role } });
    }
    if (parts[1] === "auth" && parts[2] === "me" && req.method === "GET") { const user = authorized(req); return user ? send(res, 200, { id:user.id, name:user.name, email:user.email, role:user.role }) : send(res, 401, { error:"برای ادامه وارد شوید." }); }
    if (parts[1] === "auth" && parts[2] === "logout" && req.method === "POST") { const token = req.headers.authorization?.replace(/^Bearer\s+/i, ""); sessions.delete(token); return send(res, 200, { ok:true }); }
    if (parts[1] === "locations" && req.method === "GET") return send(res, 200, heratLocations);
    if (parts[1] === "facilities") {
      if (["POST", "PUT", "DELETE"].includes(req.method) && !authorized(req, ["admin"])) return send(res, 403, { error:"دسترسی مدیر لازم است." });
      const facilities = await loadFacilities();
      if (req.method === "GET" && !parts[2]) {
        let result = facilities;
        const sport = url.searchParams.get("sport");
        const query = (url.searchParams.get("q") || "").toLowerCase();
        if (sport) result = result.filter((f) => f.sportCategory === sport);
        if (query) result = result.filter((f) => f.name.toLowerCase().includes(query));
        if (url.searchParams.get("sort") === "rate") result = [...result].sort((a, b) => a.hourlyRateAFN - b.hourlyRateAFN);
        return send(res, 200, result);
      }
      if (req.method === "POST" && !parts[2]) {
        const item = await body(req); const error = validateFacility(item);
        if (error) return send(res, 400, { error });
        const saved = { ...item, id: randomUUID(), hourlyRateAFN: Number(item.hourlyRateAFN), capacity: Number(item.capacity) };
        facilities.push(saved); await writeFile(facilitiesFile, JSON.stringify(facilities, null, 2)); return send(res, 201, saved);
      }
      if (parts[2]) {
        const index = facilities.findIndex((f) => f.id === parts[2]);
        if (index < 0) return send(res, 404, { error: "Facility not found." });
        if (req.method === "GET") return send(res, 200, facilities[index]);
        if (req.method === "PUT") {
          const item = await body(req); const error = validateFacility(item);
          if (error) return send(res, 400, { error });
          facilities[index] = { ...item, id: parts[2], hourlyRateAFN: Number(item.hourlyRateAFN), capacity: Number(item.capacity) };
          await writeFile(facilitiesFile, JSON.stringify(facilities, null, 2)); return send(res, 200, facilities[index]);
        }
        if (req.method === "DELETE") { facilities.splice(index, 1); await writeFile(facilitiesFile, JSON.stringify(facilities, null, 2)); return send(res, 204, null); }
      }
    }
    if (parts[1] === "reservations" && req.method === "POST") {
      const user = authorized(req); if (!user) return send(res, 401, { error:"برای ثبت رزرو ابتدا وارد شوید." });
      const data = await body(req); const facilities = await loadFacilities();
      if (!data.organiserAlias?.trim() || !/^\S+@\S+\.\S+$/.test(data.email || "")) return send(res, 400, { error: "A name and valid email are required." });
      if (!Array.isArray(data.items) || !data.items.length) return send(res, 400, { error: "Add at least one hour to your plan." });
      const counts = new Map(); let total = 0;
      for (const item of data.items) {
        const facility = facilities.find((f) => f.id === item.facilityId);
        if (!facility || !facility.slotIds.includes(item.slotId)) return send(res, 400, { error: "One or more selected slots are no longer available." });
        counts.set(facility.id, (counts.get(facility.id) || 0) + 1); total += facility.hourlyRateAFN;
        if (new Set(data.items.map((slot) => `${slot.facilityId}/${slot.slotId}`)).size !== data.items.length) return send(res, 400, { error: "Duplicate hours are not allowed." });
      }
      for (const [id, count] of counts) if (count > 4 || Number(data.participants) > facilities.find((f) => f.id === id).capacity) return send(res, 400, { error: "Hours or participants exceed facility limits." });
      const reservations = await loadReservations();
      const booking = { id: randomUUID(), userId:user.id, organiserAlias: data.organiserAlias.trim(), email: data.email.trim(), participants: Number(data.participants), items: data.items, total, createdAt: new Date().toISOString() };
      reservations.push(booking); await writeFile(reservationsFile, JSON.stringify(reservations, null, 2)); return send(res, 201, booking);
    }
    if (parts[1] === "messages" && req.method === "POST") {
      const data = await body(req);
      if (!data.name?.trim() || !/^\S+@\S+\.\S+$/.test(data.email || "") || !data.message?.trim()) return send(res, 400, { error: "Name, valid email and message are required." });
      const messages = await readJson(messagesFile, []);
      const saved = { id: randomUUID(), name: data.name.trim(), email: data.email.trim(), message: data.message.trim(), createdAt: new Date().toISOString() };
      messages.push(saved); await writeFile(messagesFile, JSON.stringify(messages, null, 2)); return send(res, 201, { id: saved.id, received: true });
    }
    return send(res, 404, { error: "Route not found." });
  } catch (error) { return send(res, 400, { error: error instanceof SyntaxError ? "Invalid JSON body." : error.message }); }
});
server.listen(port, () => console.log(`Sports planner API listening at http://localhost:${port}`));
