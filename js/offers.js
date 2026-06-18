document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".offer-card[data-category]");

    cards.forEach(card => {
        card.style.cursor = "pointer";
        card.addEventListener("click", () => {
            const category = card.dataset.category;
            window.location.href = `shop/shop.html${category ? '?category=' + category : ''}`;
        });
    });
});
