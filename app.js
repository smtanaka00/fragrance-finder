let perfumes = [];

fetch("fragrance_data.json")
  .then(response => response.json())
  .then(data => {
    perfumes = data.filter(p => p.title && p.primaryImageUrl);
    setupSearch(perfumes);
  })
  .catch(error => console.error('Error loading fragrance data:', error));

let fuse; // Declare fuse globally or pass it around

function setupSearch(data) {
  fuse = new Fuse(data, {
    keys: ["title"],
    threshold: 0.1
  });

  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");

  searchButton.addEventListener("click", () => {
    performSearch(searchInput.value.trim(), data);
  });

  // Display all results initially
  performSearch("", data);
}

function performSearch(query, allData) {
  let results;
  if (query) {
    results = fuse.search(query).map(r => r.item);
  } else {
    results = allData;
  }
  displayResults(results);
}

function displayResults(results) {
  const container = document.getElementById("results");
  if (results.length === 0) {
    container.innerHTML = '<p class="no-results">No fragrances found. Try a different search!</p>';
    return;
  }
  container.innerHTML = results.map(item => `
    <div class="card">
      <img src="${item.primaryImageUrl}" alt="${item.title}" class="card-image">
      <div class="card-content">
        <h3 class="card-title">${item.title}</h3>
        <a href="${item.url}" target="_blank" class="card-link">View Details</a>
      </div>
    </div>
  `).join("");
}
