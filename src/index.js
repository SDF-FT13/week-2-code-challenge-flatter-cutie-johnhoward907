document.addEventListener("DOMContentLoaded", () => {
    const baseUrl = "http://localhost:3000/characters";
    const characterBar = document.getElementById("character-bar");
    const detailedInfo = document.getElementById("detailed-info");
    const characterForm = document.getElementById("character-form");

    let currentCharacter = null; // Store the currently selected character

    /** Fetch and display characters */
    function fetchCharacters() {
        fetch(baseUrl)
            .then(response => response.json())
            .then(characters => {
                characterBar.innerHTML = ""; // Clear previous entries
                characters.forEach(addCharacterToBar);
            })
            .catch(error => console.error("Error fetching characters:", error));
    }

    /** Add a character to the character bar */
    function addCharacterToBar(character) {
        const span = document.createElement("span");
        span.textContent = character.name;
        span.addEventListener("click", () => displayCharacterDetails(character));
        characterBar.appendChild(span);
    }

    /** Display selected character details */
    function displayCharacterDetails(character) {
        currentCharacter = character;
        detailedInfo.innerHTML = `
            <h2>${character.name}</h2>
            <img src="${character.image}" alt="${character.name}">
            <p>Votes: <span id="vote-count">${character.votes}</span></p>
            <form id="votes-form">
                <input type="number" id="vote-input" min="1" placeholder="Enter votes">
                <button type="submit">Vote</button>
            </form>
            <button id="reset-votes-btn">Reset Votes</button> <!-- Reset Button Added -->
        `;

        // Attach event listeners to the new elements
        document.getElementById("votes-form").addEventListener("submit", handleVote);
        document.getElementById("reset-votes-btn").addEventListener("click", resetVotes);
    }

    /** Handle voting */
    function handleVote(event) {
        event.preventDefault();
        if (!currentCharacter) {
            alert("Select a character first!");
            return;
        }

        const voteInput = document.getElementById("vote-input");
        const newVotes = parseInt(voteInput.value) || 0;

        if (newVotes < 1) {
            alert("Votes must be at least 1!");
            return;
        }

        let updatedVotes = currentCharacter.votes + newVotes;
        document.getElementById("vote-count").textContent = updatedVotes;

        // Persist votes to server
        fetch(`${baseUrl}/${currentCharacter.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ votes: updatedVotes })
        })
        .then(response => response.json())
        .then(updatedCharacter => {
            currentCharacter.votes = updatedCharacter.votes;
        })
        .catch(error => console.error("Error updating votes:", error));

        voteInput.value = ""; // Clear input field
    }

    /** Handle reset votes */
    function resetVotes() {
        if (!currentCharacter) {
            alert("Select a character first!");
            return;
        }

        currentCharacter.votes = 0;
        document.getElementById("vote-count").textContent = 0;

        // Persist reset to server
        fetch(`${baseUrl}/${currentCharacter.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ votes: 0 })
        })
        .then(response => response.json())
        .catch(error => console.error("Error resetting votes:", error));
    }

    /** Handle adding a new character */
    characterForm.addEventListener("submit", event => {
        event.preventDefault();
        const name = document.getElementById("name").value.trim();
        const image = document.getElementById("image-url").value.trim();

        if (!name || !image) {
            alert("Both Name and Image URL are required!");
            return;
        }

        const newCharacter = { name, image, votes: 0 };

        // Persist new character to server
        fetch(baseUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newCharacter)
        })
        .then(response => response.json())
        .then(character => {
            addCharacterToBar(character);
            displayCharacterDetails(character);
        })
        .catch(error => console.error("Error adding new character:", error));

        characterForm.reset();
    });

    // Fetch characters when the page loads
    fetchCharacters();
});
