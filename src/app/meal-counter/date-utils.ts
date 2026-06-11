const dayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "short",
  day: "numeric",
});

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day);
}

export function isWeekday(dateKey: string) {
  const day = parseDateKey(dateKey).getDay();

  return day >= 1 && day <= 5;
}

export function formatDate(dateKey: string) {
  return dayFormatter.format(parseDateKey(dateKey));
}
