function element(tag, value, className) {
  const node = document.createElement(tag);
  if (value) node.textContent = value;
  if (className) node.className = className;
  return node;
}

function mapLink(place) {
  const link = element("a", "在 Google 地圖查看");
  link.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(place + " 日本");
  link.target = "_blank";
  link.rel = "noopener";
  return link;
}

function render(trip, meta) {
  document.title = meta.title + "｜我們的旅程";
  document.querySelector(".hero h1").textContent = meta.title;
  document.querySelector(".hero .dates").textContent = meta.range;
  document.querySelector(".hero-sub").textContent = meta.summary;
  const tabs = document.querySelector("#day-tabs");
  const timeline = document.querySelector("#timeline");
  const buttons = [];
  const cards = trip.days.map((day, index) => {
    const card = element("article", "", "day-card");
    card.append(element("p", day.date + "（" + day.weekday + "） · " + day.city, "day-label"), element("h3", day.title));
    const list = element("ul", "", "entries");
    for (const item of day.items) {
      const row = element("li", "", "entry");
      const detail = element("div");
      detail.append(element("p", item.body));
      if (item.map) detail.append(mapLink(item.map));
      row.append(element("span", item.time, "entry-time"), detail);
      list.append(row);
    }
    card.append(list);
    const tab = element("button", day.date);
    tab.type = "button";
    tab.addEventListener("click", () => select(index));
    buttons.push(tab);
    tabs.append(tab);
    timeline.append(card);
    return card;
  });
  const all = element("button", "全部");
  all.type = "button";
  all.addEventListener("click", () => select(-1));
  buttons.push(all);
  tabs.append(all);

  function select(active) {
    for (const [index, card] of cards.entries()) card.hidden = active !== -1 && active !== index;
    for (const [index, button] of buttons.entries()) button.setAttribute("aria-pressed", String(index === (active === -1 ? cards.length : active)));
  }
  select(0);

  const logistics = document.querySelector("#logistics");
  for (const [title, lines, place] of [
    ["去程｜11/20", ["台灣虎航 IT270", "15:25 高雄出發 · 18:55 抵達福岡"]],
    ["回程｜11/25", ["台灣虎航 · 18:30 福岡起飛", "目的地高雄"], "福岡機場國際線航廈"],
    ["全程住宿｜5 晚", [trip.stay, trip.stayEn], trip.stay]
  ]) {
    const card = element("article", "", "panel");
    card.append(element("h3", title), ...lines.map(line => element("p", line)));
    if (place) card.append(mapLink(place));
    logistics.append(card);
  }

  const checklist = document.querySelector("#checklist");
  for (const [key, label] of [
    ["rail", "核對 JR Pass 適用路線與指定席"],
    ["ropeway", "確認皿倉山纜車營運時間"],
    ["nishitetsu", "確認柳川、太宰府西鐵套票與乘船時間"],
    ["flight", "核對回程航班及報到時間"]
  ]) {
    const storageKey = "triplog/" + meta.id + "/" + key;
    const row = element("li");
    const field = element("label");
    const input = element("input");
    input.type = "checkbox";
    try { input.checked = localStorage.getItem(storageKey) === "1"; } catch {}
    input.addEventListener("change", () => {
      try { localStorage.setItem(storageKey, input.checked ? "1" : "0"); } catch {}
    });
    field.append(input, element("span", label));
    row.append(field);
    checklist.append(row);
  }
}

const id = new URLSearchParams(location.search).get("trip") ?? window.TRIPS[0]?.id;
const meta = window.TRIPS.find(trip => trip.id === id);
function showError() {
  const notice = element("p", "找不到這趟旅程。");
  const link = element("a", "回旅程清單");
  link.href = "index.html";
  document.querySelector("#trip-content").replaceChildren(notice, link);
}
if (meta) {
  const script = element("script");
  script.src = "trips/" + encodeURIComponent(meta.id) + ".js";
  script.onload = () => window.TRIP ? render(window.TRIP, meta) : showError();
  script.onerror = showError;
  document.head.append(script);
} else {
  showError();
}
