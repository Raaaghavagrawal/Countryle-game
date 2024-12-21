document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('name');
    const startBtn = document.getElementById('start-difficulty-btn');
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    const guessInput = document.getElementById('guess');
    const guessBtn = document.getElementById('guess-btn');
    const hintDiv = document.getElementById('hint');
    const showHintBtn = document.getElementById('show-hint-btn');
    const wordRows = document.getElementById('word-rows');
    const resultDiv = document.getElementById('result');
    const scoreSpan = document.getElementById('score');
    const restartBtn = document.getElementById('restart-game-btn');
    const menuBtn = document.getElementById('menu-btn');
    const menuOptions = document.getElementById('menu-options');
    
    // Pages
    const landingPage = document.getElementById('landing-page');
    const difficultyPage = document.getElementById('difficulty-page');
    const gameContainer = document.getElementById('game-container');
    const gameOverPage = document.getElementById('game-over-page');

    // Game State
    let countries = [];
    let selectedCountry = '';
    let maxAttempts = 6;
    let attempts = 0;
    let difficulty = '';

    // Toggle the menu visibility
    menuBtn.addEventListener('click', () => {
        menuOptions.classList.toggle('hidden');
    });

    // Hide menu if a menu option is clicked
    menuOptions.addEventListener('click', (event) => {
        // Hide the menu when an option is selected
        menuOptions.classList.add('hidden');
    });

    // Navigate to Home (Landing Page)
    document.getElementById('home-btn').addEventListener('click', () => {
        showPage(landingPage);
    });

    // Navigate to Home (Landing Page) and Reset the Game
    document.getElementById('home-btn').addEventListener('click', () => {
        // Reset game progress
        resetGame();
        // Show the landing page
        showPage(landingPage);
    });

    // Function to Reset Game State
    const resetGame = () => {
        // Reset all game variables
        attempts = 0;
        guessInput.value = '';
        resultDiv.textContent = '';
        guessInput.disabled = false;
        guessBtn.disabled = false;
        hintDiv.classList.add('hidden');
        showHintBtn.classList.remove('hidden');
        
        // Clear word rows
        wordRows.innerHTML = '';

        // Clear the selected country
        selectedCountry = '';
    };

    // Fetch countries from API
    const fetchCountries = async () => {
        const response = await fetch('https://restcountries.com/v3.1/all');
        const data = await response.json();
        countries = data.filter(country => country.name.common.length <= 10).map(country => ({
            name: country.name.common,
            capital: country.capital && country.capital[0] ? country.capital[0] : 'Not Available',
        }));
    };

    // Select a random country based on difficulty
    const selectCountry = () => {
        let filteredCountries;
        if (difficulty === 'beginner') {
            filteredCountries = countries;  // Use all countries
        } else if (difficulty === 'intermediate') {
            filteredCountries = countries.filter(country => country.name.length >= 5 && country.name.length <= 8);
        } else {
            filteredCountries = countries.filter(country => country.name.length >= 9);  // Use 9 or 10 letter countries
        }
        return filteredCountries[Math.floor(Math.random() * filteredCountries.length)];
    };

    // Render the word rows
    const renderWordRows = () => {
        wordRows.innerHTML = '';
        for (let i = 0; i < maxAttempts; i++) {
            const row = document.createElement('div');
            row.className = 'flex justify-center space-x-2';
            for (let j = 0; j < selectedCountry.name.length; j++) {
                const box = document.createElement('div');
                box.className = 'w-10 h-10 border border-gray-400 flex items-center justify-center text-lg font-bold';
                row.appendChild(box);
            }
            wordRows.appendChild(row);
        }
    };

    // Update the word row based on the guess
    const updateWordRow = (guess, rowIndex) => {
        const row = wordRows.children[rowIndex];
        for (let i = 0; i < guess.length; i++) {
            const box = row.children[i];
            box.textContent = guess[i];
            if (guess[i] === selectedCountry.name[i].toLowerCase()) {
                box.className += ' bg-green-500';
            } else if (selectedCountry.name.toLowerCase().includes(guess[i])) {
                box.className += ' bg-yellow-500';
            } else {
                box.className += ' bg-gray-500';
            }
        }
    };

    // Provide a hint based on difficulty
    const provideHint = () => {
        let hint = '';
        if (difficulty === 'beginner') {
            hint = `First Letter: ${selectedCountry.name[0]}, Capital: ${selectedCountry.capital}, Last Letter: ${selectedCountry.name[selectedCountry.name.length - 1]}`;
        } else if (difficulty === 'intermediate') {
            hint = `First Letter: ${selectedCountry.name[0]}, Capital: ${selectedCountry.capital}`;
        } else if (difficulty === 'professional') {
            hint = `Capital: ${selectedCountry.capital}`;
        }
        hintDiv.textContent = `Hint: ${hint}`;
        
        // Directly show the hint without any hidden class or animation
        hintDiv.classList.remove('hidden');
        showHintBtn.classList.add('hidden');  // Hide the button after showing the hint
    };

    // Start the game by selecting difficulty
    startBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        if (!name) {
            alert('Please enter your name.');
            return;
        }
        showPage(difficultyPage);
    });

    // Handle difficulty selection
    difficultyBtns.forEach(button => {
        button.addEventListener('click', async (event) => {
            difficulty = event.target.dataset.level;
            await fetchCountries();
            selectedCountry = selectCountry();
            renderWordRows();
            showPage(gameContainer);
        });
    });

    // Handle guessing
    guessBtn.addEventListener('click', () => {
        const guess = guessInput.value.trim().toLowerCase();
        if (guess.length !== selectedCountry.name.length) {
            alert(`Guess must be ${selectedCountry.name.length} characters long.`);
            return;
        }
        updateWordRow(guess, attempts);
        attempts++;

        if (guess === selectedCountry.name.toLowerCase()) {
            // Show guessed country and move directly to Game Over screen
            setTimeout(() => {
                guessInput.value = selectedCountry.name;
                resultDiv.textContent = 'You guessed it!';
                guessInput.disabled = true;
                guessBtn.disabled = true;
                scoreSpan.textContent = `You guessed the country: ${selectedCountry.name}`;
                showPage(gameOverPage);
            }, 500);  // Delay for showing correct guess
        } else if (attempts === maxAttempts) {
            resultDiv.textContent = `Game Over! The country was ${selectedCountry.name}.`;
            guessInput.disabled = true;
            guessBtn.disabled = true;
            scoreSpan.textContent = `The country was: ${selectedCountry.name}`;
            showPage(gameOverPage);
        }
        guessInput.value = '';
    });

    // Show hint on button click
    showHintBtn.addEventListener('click', () => {
        provideHint();
    });

    // Restart the game
    restartBtn.addEventListener('click', () => {
        attempts = 0;
        guessInput.value = '';
        resultDiv.textContent = '';
        guessInput.disabled = false;
        guessBtn.disabled = false;
        hintDiv.classList.add('hidden');
        showHintBtn.classList.remove('hidden');
        showPage(landingPage);
    });

    // Show a specific page
    const showPage = (pageToShow) => {
        [landingPage, difficultyPage, gameContainer, gameOverPage].forEach(page => {
            page.classList.add('hidden');
        });
        pageToShow.classList.remove('hidden');
    };
});
