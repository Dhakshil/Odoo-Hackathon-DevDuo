const API_URL = "http://localhost:3000/api";

async function fetchItems() {
    const res = await fetch(`${API_URL}/items`);
    const data = await res.json();
    console.log(data);
    // Render to HTML using Vanilla JS
}