const clockEl = document.getElementById("clock");
const metaEl = document.getElementById("clock-meta");

function renderClock() {
  const now = new Date();

  const time = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(now);

  const date = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(now);

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local timezone";

  clockEl.textContent = time;
  metaEl.textContent = `${date} - ${timezone}`;
}

renderClock();
setInterval(renderClock, 1000);
