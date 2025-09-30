function toggleCode(button) {
  const container = button.closest(".togglecode");
  const compact = container.querySelector("#code-compact");
  const full = container.querySelector("#code-full");

  if (!compact || !full) return;

  compact.classList.toggle("hidden");
  full.classList.toggle("hidden");

  button.textContent = compact.classList.contains("hidden")
    ? "Focused Code"
    : "Full Code";
}