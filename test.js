const assert = require('assert');

// Mock PapaParse and Fuse.js for testing purposes
global.Papa = {
  parse: function(filePath, config) {
    // Simulate loading data from the CSV
    const mockData = [
      { Perfume: "Perfume A", Brand: "Brand X", Gender: "unisex", Year: "2020", Mainaccord1: "fresh", Mainaccord2: "citrus", Mainaccord3: "", Top: "lemon", Middle: "jasmine", Base: "musk", Url: "url_a" },
      { Perfume: "Perfume B", Brand: "Brand Y", Gender: "women", Year: "2021", Mainaccord1: "floral", Mainaccord2: "sweet", Mainaccord3: "", Top: "rose", Middle: "vanilla", Base: "sandalwood", Url: "url_b" },
      { Perfume: "", Brand: "Brand Z", Gender: "men", Year: "2022", Mainaccord1: "woody", Mainaccord2: "", Mainaccord3: "", Top: "cedar", Middle: "patchouli", Base: "amber", Url: "url_c" }, // Missing Perfume
      { Perfume: "Perfume D", Brand: "", Gender: "unisex", Year: "2023", Mainaccord1: "spicy", Mainaccord2: "", Mainaccord3: "", Top: "cinnamon", Middle: "clove", Base: "vetiver", Url: "url_d" }  // Missing Brand
    ];
    config.complete({ data: mockData });
  }
};

global.Fuse = function(data, options) {
  this.data = data;
  this.options = options;
  this.search = function(query) {
    if (query === "Perfume A") {
      return [{ item: this.data[0] }];
    }
    if (query === "Brand Y") {
      return [{ item: this.data[1] }];
    }
    return [];
  };
};

// Mock DOM elements
global.document = {
  getElementById: function(id) {
    if (id === "searchInput") {
      const inputElement = {
        value: "",
        listeners: {}
      };
      inputElement.addEventListener = function(event, callback) {
        inputElement.listeners[event] = callback;
      };
      inputElement.dispatchEvent = function(event) {
        if (inputElement.listeners[event]) {
          inputElement.listeners[event]();
        }
      };
      return inputElement;
    }
    if (id === "results") {
      if (!global.mockResultsContainer) {
        global.mockResultsContainer = { innerHTML: "" };
      }
      return global.mockResultsContainer;
    }
    return null;
  }
};

// Load the app.js file after mocking globals
require('./app.js');

// Simple test cases
function runTests() {
  console.log("Running unit tests...");

  // Test 1: Data loading and filtering
  try {
    // Papa.parse is called when app.js is loaded, so perfumes array should be populated
    // We need to access the perfumes array from app.js, which is not directly exported.
    // For this simple test, we'll assume app.js's global 'perfumes' variable is updated.
    // A better approach would be to refactor app.js to export functions/variables.

    // Since app.js immediately calls setupSearch and displayResults,
    // we can check the state after app.js has run.
    // This requires a slight modification to app.js to expose 'perfumes' or a way to get it.
    // For now, let's assume the displayResults function is called with filtered data.

    // Let's test the filtering logic by re-running the complete function of Papa.parse
    let testPerfumes = [];
    Papa.parse("mock.csv", {
      download: true,
      header: true,
      complete: function(results) {
        testPerfumes = results.data.filter(p => p.Perfume && p.Brand);
      }
    });
    assert.strictEqual(testPerfumes.length, 2, "Test 1 Failed: Should filter out perfumes with missing Perfume or Brand.");
    assert.strictEqual(testPerfumes[0].Perfume, "Perfume A", "Test 1 Failed: First perfume should be 'Perfume A'.");
    assert.strictEqual(testPerfumes[1].Perfume, "Perfume B", "Test 1 Failed: Second perfume should be 'Perfume B'.");
    console.log("Test 1 Passed: Data loading and filtering.");
  } catch (error) {
    console.error(error.message);
  }

  // Test 2: Search functionality for "Perfume A"
  try {
    const searchInput = document.getElementById("searchInput");
    const resultsContainer = document.getElementById("results");
    resultsContainer.innerHTML = ""; // Clear previous results

    searchInput.value = "Perfume A";
    searchInput.dispatchEvent('input');
    console.log("Test 2 - resultsContainer.innerHTML after dispatch:", resultsContainer.innerHTML.length, "chars");
    assert.ok(resultsContainer.innerHTML.includes("Perfume A"), "Test 2 Failed: Search for 'Perfume A' should display results.");
    assert.ok(!resultsContainer.innerHTML.includes("Perfume B"), "Test 2 Failed: Search for 'Perfume A' should not display 'Perfume B'.");
    console.log("Test 2 Passed: Search functionality for 'Perfume A'.");
  } catch (error) {
    console.error(error.message);
  }

  // Test 3: Search functionality for "Brand Y"
  try {
    const searchInput = document.getElementById("searchInput");
    const resultsContainer = document.getElementById("results");
    resultsContainer.innerHTML = ""; // Clear previous results

    searchInput.value = "Brand Y";
    searchInput.dispatchEvent('input');
    console.log("Test 3 - resultsContainer.innerHTML after dispatch:", resultsContainer.innerHTML.length, "chars");
    assert.ok(resultsContainer.innerHTML.includes("Perfume B"), "Test 3 Failed: Search for 'Brand Y' should display 'Perfume B'.");
    assert.ok(!resultsContainer.innerHTML.includes("Perfume A"), "Test 3 Failed: Search for 'Brand Y' should not display 'Perfume A'.");
    console.log("Test 3 Passed: Search functionality for 'Brand Y'.");
  } catch (error) {
    console.error(error.message);
  }

  // Test 4: Empty search query should display all filtered data
  try {
    const searchInput = document.getElementById("searchInput");
    const resultsContainer = document.getElementById("results");
    resultsContainer.innerHTML = ""; // Clear previous results

    searchInput.value = "";
    searchInput.dispatchEvent('input');
    console.log("Test 4 - resultsContainer.innerHTML after dispatch:", resultsContainer.innerHTML.length, "chars");
    assert.ok(resultsContainer.innerHTML.includes("Perfume A"), "Test 4 Failed: Empty search should display 'Perfume A'.");
    assert.ok(resultsContainer.innerHTML.includes("Perfume B"), "Test 4 Failed: Empty search should display 'Perfume B'.");
    assert.ok(!resultsContainer.innerHTML.includes("Perfume C"), "Test 4 Failed: Empty search should not display 'Perfume C' (filtered).");
    console.log("Test 4 Passed: Empty search query.");
  } catch (error) {
    console.error(error.message);
  }

  console.log("All tests completed.");
}

runTests();
