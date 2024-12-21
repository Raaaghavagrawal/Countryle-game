let countries = [];
let selectedLevel = "beginner";
let currentCountry = null;
let attempts = 0;
const maxAttempts = 6;
let guesses = [];

// Fetch country list from the API
async function fetchCountries() {
    try {
        const response = await fetch('https://restcountries.com/v3.1/all');
        const data = await response.json();
        countries = data.map(country => ({
            name: country.name.common,
            region: country.region || "Unknown region",
            currencies: country.currencies || "Unknown currency",
            capital: country.capital ? country.capital[0] : "Unknown capital"
        }));
    } catch (error) {
        console.error("Error fetching countries:", error);
    }
}

// Select random country based on difficulty
function getRandomCountry(level) {
    let filteredCountries;
    if (level === "beginner") {
        filteredCountries = countries.filter(c => c.name.length <= 10);
    } else if (level === "intermediate") {
        filteredCountries = countries.filter(c => c.name.length <= 20 && c.name.length > 10);
    } else {
        filteredCountries = countries.filter(c => c.name.length <= 50);
    }

    const randomIndex = Math.floor(Math.random() * filteredCountries.length);
    return filteredCountries[randomIndex];
}

// Display empty word rows at the start of the game
function displayWordRows() {
    const wordRowsContainer = document.getElementById("word-rows");
    wordRowsContainer.innerHTML = "";

    if (currentCountry) {
        const wordLength = currentCountry.name.length;
        for (let i = 0; i < maxAttempts; i++) {
            const wordRow = document.createElement("div");
            wordRow.className = "word-row";
            for (let j = 0; j < wordLength; j++) {
                const letterBox = document.createElement("div");
                letterBox.className = "letter-box";
                wordRow.appendChild(letterBox);
            }
            wordRowsContainer.appendChild(wordRow);
        }
    }
}

// Update the word rows based on guesses
function updateWordRows() {
    const wordRowsContainer = document.getElementById("word-rows");
    const wordRows = wordRowsContainer.querySelectorAll(".word-row");

    guesses.forEach((guess, rowIndex) => {
        const row = wordRows[rowIndex];
        guess.forEach((letter, letterIndex) => {
            const letterBox = row.children[letterIndex];
            letterBox.textContent = letter.letter;
            if (letter.status === 'correct') {
                letterBox.classList.add("correct-letter");
            } else if (letter.status === 'wrong-position') {
                letterBox.classList.add("wrong-position");
            } else if (letter.status === 'wrong') {
                letterBox.classList.add("wrong-letter");
            }
        });
    });
}

// Check user's guess and update the status
function checkGuess(userGuess) {
    const status = [];
    let remainingLetters = currentCountry.name.toLowerCase().split('');

    // Check for correct letters first
    for (let i = 0; i < userGuess.length; i++) {
        if (userGuess[i] === remainingLetters[i]) {
            status.push({ letter: userGuess[i], status: 'correct' });
            remainingLetters[i] = null;
        } else {
            status.push({ letter: userGuess[i], status: 'wrong' });
        }
    }

    // Check for wrong-position letters
    for (let i = 0; i < status.length; i++) {
        if (status[i].status === 'wrong') {
            const index = remainingLetters.indexOf(userGuess[i]);
            if (index !== -1) {
                status[i].status = 'wrong-position';
                remainingLetters[index] = null;
            }
        }
    }

    guesses.push(status);
    attempts++;

    // Check if user won or lost
    if (userGuess === currentCountry.name.toLowerCase()) {
        document.getElementById("game-container").style.display = "none";
        document.getElementById("game-won").style.display = "block";
    } else if (attempts >= maxAttempts) {
        document.getElementById("correct-country").textContent = currentCountry.name;
        document.getElementById("game-container").style.display = "none";
        document.getElementById("game-over").style.display = "block";
    }

    updateWordRows();
}

// Display hint based on difficulty level
function displayHint() {
    if (selectedLevel === "beginner") {
        document.getElementById("hint").textContent = `Hint: This country is in the ${currentCountry.region}.`;
    } else if (selectedLevel === "intermediate") {
        document.getElementById("hint").textContent = `Hint: The currency is ${Object.keys(currentCountry.currencies)[0]}.`;
    } else {
        document.getElementById("hint").textContent = `Hint: The capital is ${currentCountry.capital}.`;
    }
}

// Event listener for difficulty change
document.getElementById("level").addEventListener("change", function () {
    selectedLevel = this.value;
});

// Start a new game
document.getElementById("start-game-btn").addEventListener("click", function () {
    const name = document.getElementById("name").value.trim();
    if (!name) {
        alert("Please enter your name.");
        return;
    }

    if (countries.length === 0) {
        alert("Countries are still loading. Please try again in a moment.");
        return;
    }

    currentCountry = getRandomCountry(selectedLevel);
    guesses = [];
    attempts = 0;
    displayHint();
    document.getElementById("result").textContent = "";
    document.getElementById("guess").disabled = false;
    document.getElementById("guess-btn").disabled = false;
    document.getElementById("guess").value = "";
    displayWordRows();

    document.getElementById("landing-page").style.display = "none";
    document.getElementById("game-container").style.display = "block";
});

// Submit user's guess
document.getElementById("guess-btn").addEventListener("click", function () {
    const userGuess = document.getElementById("guess").value.trim().toLowerCase();
    if (userGuess.length !== currentCountry.name.length) {
        alert(`Please enter a country name with ${currentCountry.name.length} letters.`);
        return;
    }
    checkGuess(userGuess);
    document.getElementById("guess").value = "";
});

// Start a new game after winning
document.getElementById("start-new-game-btn").addEventListener("click", function () {
    window.location.reload();
});

// Start a new game after losing
document.getElementById("start-new-game-btn-game-over").addEventListener("click", function () {
    window.location.reload();
});

// Return to the home page
document.getElementById("home-btn-fixed").addEventListener("click", function () {
    document.getElementById("game-container").style.display = "none";
    document.getElementById("game-won").style.display = "none";
    document.getElementById("game-over").style.display = "none";
    document.getElementById("landing-page").style.display = "block";
});

// Fetch countries on load
fetchCountries();
