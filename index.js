const catalog = document.querySelector("#catalog");
for (const trip of window.TRIPS) {
  const card = document.createElement("a");
  card.className = "catalog-card";
  card.href = "trip.html?trip=" + encodeURIComponent(trip.id);
  for (const [tag, value] of [["p",trip.range],["h3",trip.title],["p",trip.summary]]) {
    const element = document.createElement(tag);
    element.textContent = value;
    card.append(element);
  }
  catalog.append(card);
}
