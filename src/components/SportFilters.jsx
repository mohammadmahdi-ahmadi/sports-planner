import { SPORTS } from "../data/facilities.js";

// جستجو، فیلتر ورزش، مرتب‌سازی و تاگل. همه‌ی state ها از صفحه‌ی بالاتر می‌آیند (props)
function SportFilters(props) {
  return (
    <div className="filters">
      <input
        type="text"
        placeholder="Search by name..."
        value={props.search}
        onChange={(e) => props.setSearch(e.target.value)}
      />

      <select value={props.sport} onChange={(e) => props.setSport(e.target.value)}>
        <option value="all">All sports</option>
        {SPORTS.map((sport) => (
          <option key={sport} value={sport}>{sport}</option>
        ))}
      </select>

      <select value={props.sortOrder} onChange={(e) => props.setSortOrder(e.target.value)}>
        <option value="none">Sort by rate: default</option>
        <option value="low">Rate: low to high</option>
        <option value="high">Rate: high to low</option>
      </select>

      <label>
        <input
          type="checkbox"
          checked={props.onlyAvailable}
          onChange={(e) => props.setOnlyAvailable(e.target.checked)}
        />
        {" "}Only with available slots
      </label>
    </div>
  );
}

export default SportFilters;
