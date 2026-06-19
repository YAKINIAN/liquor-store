document.addEventListener("DOMContentLoaded", () => {

    fetch("./components/sidebar.html")
        .then(res => res.text())
        .then(data => {
            document.getElementById("sidebar-container").innerHTML = data;
            highlightActive();
            initToggle();
        });
});

function highlightActive() {
    const page = window.location.pathname.split("/").pop().replace(".html", "");
    document.querySelectorAll(".sidebar a").forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("data-page") === page) {
            link.classList.add("active");
        }
    });
}

function initToggle() {
    const toggle = document.getElementById("toggleSidebar");
    const sidebar = document.querySelector(".sidebar");
    if (!toggle || !sidebar) return;

    const overlay = document.createElement("div");
    overlay.className = "sidebar-overlay";
    document.body.appendChild(overlay);

    toggle.addEventListener("click", () => {
        sidebar.classList.toggle("show");
        overlay.classList.toggle("show");
    });

    overlay.addEventListener("click", () => {
        sidebar.classList.remove("show");
        overlay.classList.remove("show");
    });
}
