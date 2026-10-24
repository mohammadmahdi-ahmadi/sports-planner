// اجرا: npm test
// سه بررسی پذیرش (acceptance checks) صورت پروژه را تست می‌کند.
import assert from "node:assert";
import { sampleFacilities as facilities } from "./data/facilities.js";
import {
  addSlots, removeSlot, resetPlan, getTotalCost, validateBooking,
} from "./planLogic.js";

const pitch = facilities[0]; // 200 AFN per hour

// Check 1: two hours = 400, remove one = 200
let result = addSlots([], pitch, "SAT-09", 2);
assert.equal(result.error, "");
assert.equal(getTotalCost(result.plan, facilities), 400);
const afterRemove = removeSlot(result.plan, pitch.id, "SAT-10");
assert.equal(getTotalCost(afterRemove, facilities), 200);

// Check 2: duplicate rejected
result = addSlots(afterRemove, pitch, "SAT-09", 1);
assert.ok(result.error.includes("already in the plan"));

// Check 2: fifth hour rejected
const fourHours = addSlots([], pitch, "SAT-09", 4).plan;
result = addSlots(fourHours, pitch, "SAT-13", 1);
assert.ok(result.error.includes("Limit is 4"));

// Check 3: participants above capacity rejected (pitch capacity = 22)
const form = { organiserAlias: "Ali", participants: "30", email: "ali@example.com" };
const errors = validateBooking(form, fourHours, facilities);
assert.ok(errors.participants);

// Check 3: reset clears slots and cost
const cleared = resetPlan();
assert.equal(cleared.length, 0);
assert.equal(getTotalCost(cleared, facilities), 0);

console.log("All acceptance checks passed.");
