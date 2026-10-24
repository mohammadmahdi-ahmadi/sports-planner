// همه‌ی منطق برنامه (قوانین رزرو و اعتبارسنجی) اینجاست.
// توابع ساده هستند: ورودی می‌گیرند و خروجی برمی‌گردانند، بدون React.
// برنامه (plan) یک آرایه است: [{ facilityId: "f1", slotId: "SAT-09" }, ...]

export const MAX_HOURS = 4; // حداکثر ساعت برای هر مجموعه

// چند ساعت از این مجموعه در برنامه هست؟
export function getHours(plan, facilityId) {
  return plan.filter((item) => item.facilityId === facilityId).length;
}

// آیا این جفت (مجموعه، اسلات) قبلاً در برنامه هست؟
export function hasSlot(plan, facilityId, slotId) {
  return plan.some(
    (item) => item.facilityId === facilityId && item.slotId === slotId
  );
}

// اضافه کردن چند ساعت پشت سر هم از یک اسلات شروع
// خروجی: { plan: برنامه‌ی جدید, error: متن خطا یا "" }
export function addSlots(plan, facility, startSlotId, hours) {
  const startIndex = facility.slotIds.indexOf(startSlotId);
  if (startIndex === -1) {
    return { plan, error: "Please choose a start slot." };
  }
  if (hours < 1 || hours > MAX_HOURS) {
    return { plan, error: "Hours must be between 1 and 4." };
  }

  // اسلات‌های پشت سر هم از نقطه‌ی شروع
  const wanted = facility.slotIds.slice(startIndex, startIndex + hours);
  if (wanted.length < hours) {
    return {
      plan,
      error: "Not enough consecutive slots after " + startSlotId + ".",
    };
  }

  // جلوگیری از تکرار
  for (const slotId of wanted) {
    if (hasSlot(plan, facility.id, slotId)) {
      return {
        plan,
        error: facility.name + " " + slotId + " is already in the plan.",
      };
    }
  }

  // محدودیت چهار ساعت
  const current = getHours(plan, facility.id);
  if (current + hours > MAX_HOURS) {
    return {
      plan,
      error:
        "Limit is " + MAX_HOURS + " hours per facility. You already have " +
        current + ".",
    };
  }

  const newItems = wanted.map((slotId) => ({ facilityId: facility.id, slotId }));
  return { plan: [...plan, ...newItems], error: "" };
}

// دکمه‌ی افزایش: ساعت بعد از آخرین ساعت انتخاب‌شده را اضافه می‌کند
export function increaseHour(plan, facility) {
  const indexes = plan
    .filter((item) => item.facilityId === facility.id)
    .map((item) => facility.slotIds.indexOf(item.slotId));

  if (indexes.length === 0) {
    return { plan, error: "Choose a start slot first." };
  }
  const nextSlot = facility.slotIds[Math.max(...indexes) + 1];
  if (nextSlot === undefined) {
    return { plan, error: "No more slots after the last selected hour." };
  }
  return addSlots(plan, facility, nextSlot, 1);
}

// حذف یک اسلات مشخص
export function removeSlot(plan, facilityId, slotId) {
  return plan.filter(
    (item) => !(item.facilityId === facilityId && item.slotId === slotId)
  );
}

// دکمه‌ی کاهش: آخرین ساعتی که اضافه شده حذف می‌شود
export function decreaseHour(plan, facilityId) {
  const items = plan.filter((item) => item.facilityId === facilityId);
  if (items.length === 0) return plan;
  const last = items[items.length - 1];
  return removeSlot(plan, facilityId, last.slotId);
}

// دکمه‌ی بازنشانی: همه چیز پاک می‌شود
export function resetPlan() {
  return [];
}

// هزینه = نرخ ساعتی × تعداد ساعت
export function getFacilityCost(plan, facility) {
  return facility.hourlyRateAFN * getHours(plan, facility.id);
}

export function getTotalCost(plan, facilities) {
  let total = 0;
  for (const facility of facilities) {
    total = total + getFacilityCost(plan, facility);
  }
  return total;
}

// ---------- اعتبارسنجی فرم مجموعه (Manage Facilities) ----------
// form همه فیلدها را به شکل رشته دارد (چون از input می‌آید)
export function validateFacility(form) {
  const errors = {};

  const name = form.name.trim();
  if (name === "") errors.name = "Name is required.";

  const rate = Number(form.hourlyRateAFN);
  if (form.hourlyRateAFN.trim() === "" || isNaN(rate) || rate <= 0) {
    errors.hourlyRateAFN = "Hourly rate must be a positive number.";
  }

  const capacity = Number(form.capacity);
  if (form.capacity.trim() === "" || !Number.isInteger(capacity) || capacity <= 0) {
    errors.capacity = "Capacity must be a whole number greater than 0.";
  }

  // "SAT-09, SAT-10" -> ["SAT-09", "SAT-10"]
  const slotIds = form.slotIds
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter((s) => s !== "");
  if (new Set(slotIds).size !== slotIds.length) {
    errors.slotIds = "Slot identifiers must be unique.";
  }

  const facility = {
    name,
    sportCategory: form.sportCategory,
    hourlyRateAFN: rate,
    capacity,
    slotIds,
    description: form.description.trim(),
  };
  return { errors, facility };
}

// ---------- اعتبارسنجی فرم رزرو ----------
export function validateBooking(form, plan, facilities) {
  const errors = {};

  if (plan.length === 0) {
    errors.plan = "Your plan is empty. Select at least one hour first.";
  }
  if (form.organiserAlias.trim().length < 2) {
    errors.organiserAlias = "Alias must have at least 2 characters.";
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(form.email.trim())) {
    errors.email = "Please enter a valid email.";
  }

  const count = Number(form.participants);
  if (form.participants.trim() === "" || !Number.isInteger(count) || count < 1) {
    errors.participants = "Participants must be a whole number of at least 1.";
  } else {
    // تعداد نفرات نباید از ظرفیت هیچ‌کدام از مجموعه‌های برنامه بیشتر باشد
    for (const facility of facilities) {
      if (getHours(plan, facility.id) > 0 && count > facility.capacity) {
        errors.participants =
          "Too many participants. " + facility.name + " allows " +
          facility.capacity + ".";
        break;
      }
    }
  }
  return errors;
}
