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
        span.dataset.id = character.id; // Store ID for deletion
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
            <button id="reset-votes-btn">Reset Votes</button>
            <button id="remove-character-btn">Remove Character</button> <!-- Remove Button Added -->
        `;

        // Attach event listeners to new elements
        document.getElementById("votes-form").addEventListener("submit", handleVote);
        document.getElementById("reset-votes-btn").addEventListener("click", resetVotes);
        document.getElementById("remove-character-btn").addEventListener("click", removeCharacter);
    }

    /** Handle voting (No persistence) */
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

        // Update votes in the UI only (No Server Request)
        let voteCountElement = document.getElementById("vote-count");
        currentCharacter.votes += newVotes; // Update local state
        voteCountElement.textContent = currentCharacter.votes; // Update UI

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
    }

    /** Handle removing a character */
    function removeCharacter() {
        if (!currentCharacter) {
            alert("Select a character first!");
            return;
        }

        if (!confirm(`Are you sure you want to remove ${currentCharacter.name}?`)) {
            return;
        }

        // Send DELETE request to remove character from the server
        fetch(`${baseUrl}/${currentCharacter.id}`, {
            method: "DELETE"
        })
        .then(() => {
            // Remove from UI
            let characterElement = document.querySelector(`[data-id="${currentCharacter.id}"]`);
            if (characterElement) {
                characterElement.remove();
            }
            detailedInfo.innerHTML = ""; // Clear character details
            currentCharacter = null;
        })
        .catch(error => console.error("Error deleting character:", error));
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
