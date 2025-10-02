function toggleCode(button) {
  const container = button.closest(".togglecode");
  const compact = container.querySelector("#code-compact");
  const full = container.querySelector("#code-full");

  if (!compact || !full) return;

  compact.classList.toggle("hidden");
  full.classList.toggle("hidden");
  
  const showingCompact = !compact.classList.contains("hidden");
  
  const active = showingCompact ? compact : full;
  const pre = active.querySelector("pre");
  if (pre) {
    pre.classList.add("toggled");
    setTimeout(() => pre.classList.remove("toggled"), 15);
  }
  const targets = active.querySelectorAll("pre");
  targets.forEach((el) => {
	el.classList.add("toggled");
	function handleTransitionEnd() {
	  el.classList.remove("toggled");
	  el.removeEventListener("transitionend", handleTransitionEnd);
	}
	el.addEventListener("transitionend", handleTransitionEnd);
  });
  
  
  button.textContent = showingCompact
    ? "Full Code"
    : "Compact Code";
}