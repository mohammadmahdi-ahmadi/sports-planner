import { useState } from "react";
import { getHours, getFacilityCost, getTotalCost } from "../planLogic.js";

// لیست ساعت‌های انتخاب‌شده + دکمه‌های افزایش، کاهش، حذف، بازنشانی + هزینه
function ReservationSummary(props) {
  const { facilities, plan } = props;
  const [message, setMessage] = useState("");

  // فقط مجموعه‌هایی که حداقل یک ساعت دارند
  const usedFacilities = facilities.filter((f) => getHours(plan, f.id) > 0);

  function handleIncrease(facility) {
    setMessage(props.onIncrease(facility));
  }

  return (
    <section>
      <h2>Selected hours</h2>

      {usedFacilities.length === 0 && (
        <p className="muted">No hours selected yet.</p>
      )}

      {usedFacilities.map((facility) => {
        const slots = plan.filter((item) => item.facilityId === facility.id);
        return (
          <div className="card" key={facility.id}>
            <h3>{facility.name}</h3>
            <p>
              {facility.hourlyRateAFN} AFN × {getHours(plan, facility.id)} hours ={" "}
              <strong>{getFacilityCost(plan, facility)} AFN</strong>
            </p>

            <div className="chips">
              {slots.map((item) => (
                <span className="chip" key={item.slotId}>
                  {item.slotId}{" "}
                  <button
                    className="small"
                    onClick={() => props.onRemove(facility.id, item.slotId)}
                  >
                    Remove
                  </button>
                </span>
              ))}
            </div>

            <button onClick={() => handleIncrease(facility)}>+ 1 hour</button>{" "}
            <button onClick={() => props.onDecrease(facility.id)}>− 1 hour</button>
          </div>
        );
      })}

      {message !== "" && <p className="error">{message}</p>}

      <h3>Total: {getTotalCost(plan, facilities)} AFN</h3>
      <button
        className="danger"
        onClick={() => {
          props.onReset();
          setMessage("");
        }}
      >
        Reset plan
      </button>
    </section>
  );
}

export default ReservationSummary;
