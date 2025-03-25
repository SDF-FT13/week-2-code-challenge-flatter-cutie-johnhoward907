// Your code here
document.addEventListener("DOMContentLoaded", () => {
    const baseUrl = "http://localhost:3000/characters";
    const characterBar = document.getElementById("character-bar");
    const detailedInfo = document.getElementById("detailed-info");
    const votesForm = document.getElementById("votes-form");
    const characterForm = document.getElementById("character-form");
    const resetButton = document.getElementById("reset-btn");
    let currentCharacter = null;

    // Fetch and display characters in character bar
    function fetchCharacters() {
        fetch(baseUrl)
            .then(response => response.json())
            .then(characters => {
                characters.forEach(character => addCharacterToBar(character));
            });
    }

    function addCharacterToBar(character) {
        const span = document.createElement("span");
        span.textContent = character.name;
        span.addEventListener("click", () => displayCharacterDetails(character));
        characterBar.appendChild(span); 
    } 

    function displayCharacterDetails(character) {
        currentCharacter = character;
        detailedInfo.innerHTML = `
            <h2>${character.name}</h2>
            <img src="${character.image}" alt="${character.name}">
            <p>Votes: <span id="vote-count">${character.votes}</span></p>
        `;
    }

    votesForm.addEventListener("submit", event => {
        event.preventDefault();
        if (currentCharacter) {
            const votesInput = document.getElementById("votes");
            const newVotes = parseInt(votesInput.value) || 0;
            currentCharacter.votes += newVotes;
            document.getElementById("vote-count").textContent = currentCharacter.votes;
            votesInput.value = "";
            
            // Extra Bonus: Persist votes update
            fetch(`${baseUrl}/${currentCharacter.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ votes: currentCharacter.votes })
            });
        }
    });

    resetButton.addEventListener("click", () => {
        if (currentCharacter) {
            currentCharacter.votes = 0;
            document.getElementById("vote-count").textContent = 0;
            
            // Extra Bonus: Reset votes on server
            fetch(`${baseUrl}/${currentCharacter.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ votes: 0 })
            });
        }
    });

    characterForm.addEventListener("submit", event => {
        event.preventDefault();
        const name = document.getElementById("name").value;
        const image = document.getElementById("image-url").value;


        const newCharacter = { name, image, votes: 0 };

        // Extra Bonus: Persist new character
        fetch(baseUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newCharacter)
        })
        .then(response => response.json())
        .then(character => {
            addCharacterToBar(character);
            displayCharacterDetails(character);
        });

        characterForm.reset();
    });if (characterForm) {
        characterForm.addEventListener("submit", event => {
            event.preventDefault();
            const name = document.getElementById("name").value;
            const image = document.getElementById("image-url").value; // Fix ID
    
            const newCharacter = { name, image, votes: 0 };
    
            fetch(baseUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newCharacter)
            })
            .then(response => response.json())
            .then(character => {
                addCharacterToBar(character);
                displayCharacterDetails(character);
            });
    
            characterForm.reset();
        });
    } else {
        console.error("characterForm is null. Ensure the form exists in your HTML.");
    }
    

    fetchCharacters();
});
