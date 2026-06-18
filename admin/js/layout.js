document.addEventListener("DOMContentLoaded", () => {

    fetch("./components/sidebar.html")
        .then(res => res.text())
        .then(data => {

            document.getElementById(
                "sidebar-container"
            ).innerHTML = data;

            highlightActive();
        });
});

function highlightActive() {

    const page =
        window.location.pathname
        .split("/")
        .pop()
        .replace(".html", "");

    document.querySelectorAll(".sidebar a")
        .forEach(link => {

            link.classList.remove("active");

            const target =
                link.getAttribute("data-page");

            if (target === page) {

                link.classList.add("active");

                link.style.transition =
                    "all 0.3s ease";
            }
        });
}

document.addEventListener("DOMContentLoaded", () => {

    const toggle =
        document.getElementById("toggleSidebar");

    const sidebar =
        document.querySelector(".sidebar");

    if (toggle) {

        toggle.addEventListener("click", () => {
            sidebar.classList.toggle("show");
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {

    const toggle = document.getElementById("toggleSidebar");
    const sidebar = document.querySelector(".sidebar");

    // create overlay dynamically
    const overlay = document.createElement("div");
    overlay.classList.add("sidebar-overlay");
    document.body.appendChild(overlay);

    function closeSidebar() {
        sidebar.classList.remove("show");
        overlay.classList.remove("show");
    }

    if (toggle) {

        toggle.addEventListener("click", () => {
            sidebar.classList.toggle("show");
            overlay.classList.toggle("show");
        });
    }

    overlay.addEventListener("click", closeSidebar);
});