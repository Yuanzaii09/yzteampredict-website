const toggleBtn = document.getElementById("toggleBtn");
const toggleContainer = document.querySelector(".toggle-container");

toggleBtn.addEventListener("click", () => {
    toggleContainer.classList.toggle("on");
});