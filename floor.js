/* floor.html — op filter chips (gallery HTML from scripts/build-floor.py). */

const host = document.getElementById("floor-gallery");
const countEl = document.getElementById("floor-count");
if (host) {
  const n = host.querySelectorAll(".floor-frame").length;
  if (countEl && n) countEl.textContent = `From the floor · ${n} photos`;

  const chips = [...host.querySelectorAll(".floor-chip")];
  const sections = [...host.querySelectorAll(".floor-op")];
  const setOp = (op) => {
    chips.forEach((c) => c.classList.toggle("is-on", c.dataset.floorOp === op));
    sections.forEach((s) => {
      s.hidden = op !== "all" && s.dataset.floorOp !== op;
    });
    const url = new URL(location.href);
    if (op === "all") url.searchParams.delete("op");
    else url.searchParams.set("op", op);
    history.replaceState(null, "", url);
  };
  chips.forEach((btn) => btn.addEventListener("click", () => setOp(btn.dataset.floorOp || "all")));
  const fromUrl = new URLSearchParams(location.search).get("op");
  if (fromUrl && chips.some((c) => c.dataset.floorOp === fromUrl)) setOp(fromUrl);
}