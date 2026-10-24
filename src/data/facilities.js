// داده‌های نمونه (فرضی). هر رکورد همان فیلدهای صورت پروژه را دارد.
// ترتیب slotIds همان ترتیب ساعت‌هاست؛ "ساعت‌های پشت سر هم" یعنی کنار هم در این آرایه.

export const SPORTS = ["football", "volleyball", "fitness room"];

export const sampleFacilities = [
  {
    id: "f1",
    name: "City Football Pitch A",
    sportCategory: "football",
    hourlyRateAFN: 200,
    capacity: 22,
    slotIds: ["SAT-09", "SAT-10", "SAT-11", "SAT-12", "SAT-13", "SAT-14"],
    description: "Full-size grass pitch with floodlights.",
  },
  {
    id: "f2",
    name: "Riverside Mini Football",
    sportCategory: "football",
    hourlyRateAFN: 150,
    capacity: 14,
    slotIds: ["SUN-09", "SUN-10", "SUN-11", "SUN-12"],
    description: "Small 7-a-side pitch near the river.",
  },
  {
    id: "f3",
    name: "Sunset Volleyball Court",
    sportCategory: "volleyball",
    hourlyRateAFN: 180,
    capacity: 12,
    slotIds: ["SAT-09", "SAT-10", "SAT-11", "SAT-12", "SAT-13"],
    description: "Outdoor sand court with seating.",
  },
  {
    id: "f4",
    name: "Indoor Volleyball Hall",
    sportCategory: "volleyball",
    hourlyRateAFN: 250,
    capacity: 16,
    slotIds: ["SUN-10", "SUN-11", "SUN-12", "SUN-13", "SUN-14", "SUN-15"],
    description: "Wooden-floor hall, usable in any weather.",
  },
  {
    id: "f5",
    name: "Power Fitness Room",
    sportCategory: "fitness room",
    hourlyRateAFN: 100,
    capacity: 10,
    slotIds: ["SAT-09", "SAT-10", "SAT-11", "SAT-12", "SAT-13"],
    description: "Weights, mats and cardio machines.",
  },
  {
    id: "f6",
    name: "Mobility & Recovery Room",
    sportCategory: "fitness room",
    hourlyRateAFN: 120,
    capacity: 8,
    slotIds: [], // هیچ اسلات آزادی ندارد؛ برای تست دکمه‌ی "فقط اسلات‌دار"
    description: "Quiet room for mobility, stretching and recovery. Fully booked in the sample data.",
  },
];
