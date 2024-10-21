var currentTile;
var blankTile;
var turns = 0;

// Check if a saved game exists in localStorage
window.onload = function () {
    const savedGame = localStorage.getItem('puzzleGame');

    if (savedGame) {
        document.getElementById("continueGameBtn").style.display = "inline-block";
    }

    document.getElementById("newGameBtn").addEventListener("click", function () {
        startNewGame();
    });

    document.getElementById("continueGameBtn").addEventListener("click", function () {
        continueSavedGame();
    });

    document.getElementById("startMenu").style.display = "block";
    document.getElementById("board").style.display = "none";
};


function startNewGame() {
    console.log("StartNewGame called");
    document.getElementById("startMenu").style.display = "none";
    document.getElementById("board").style.display = "block";
    resetGame();
}


function continueSavedGame() {
    console.log("ContinueNewGame called");
    document.getElementById("startMenu").style.display = "none";
    document.getElementById("board").style.display = "block";

    initializeBoard();

    // Load the saved game state from localStorage
    const savedGame = JSON.parse(localStorage.getItem('puzzleGame'));
    loadGameState(savedGame);
}


function resetGame() {
    console.log("Reset Game called");
    localStorage.removeItem('puzzleGame');
    initializeBoard();
}


function loadGameState(savedGame) {
    console.log("Load game state called");
    // Set the board and turns from the saved game
    document.getElementById("turns").innerText = savedGame.turns;
    document.getElementById("difficulty").value = savedGame.difficulty;

    initializeBoard();

    // Loop through the saved game board and place the tiles accordingly
    savedGame.tiles.forEach(function (tileData) {
        const tile = document.getElementById(tileData.id);
        tile.src = tileData.src;
    });
}


function initializeBoard() {
    console.log("initialize board called");
    const difficulty = document.getElementById('difficulty').value;

    let rows = 3;
    let columns = 3;

    let imgOrder = getImgOrderForDifficulty(difficulty);

    // Clear existing tiles if they are already present
    document.getElementById("board").innerHTML = "";

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("img");
            tile.id = r.toString() + "." + c.toString();
            tile.src = imgOrder.shift() + ".jpg";
            document.getElementById("board").append(tile);

            //Drag events
            tile.addEventListener("dragstart", dragStart);
            tile.addEventListener("dragover", dragOver);
            tile.addEventListener("dragenter", dragEnter);
            tile.addEventListener("dragleave", dragLeave);
            tile.addEventListener("drop", dragDrop);
            tile.addEventListener("dragend", dragEnd);
        }
    }
}


function getImgOrderForDifficulty(difficulty) {
    let randomOrder = Math.floor(Math.random() * 5);
    console.log(randomOrder)
    if (difficulty === "normal") {
        switch (randomOrder) {
            case 0:
                return ["1", "3", "2", "4", "5", "6", "7", "9", "8"];
            case 1:
                return ["1", "2", "4", "3", "5", "6", "7", "8", "9"];
            case 2:
                return ["2", "3", "1", "5", "4", "6", "8", "7", "9"];
            case 3:
                return ["1", "2", "3", "4", "6", "5", "7", "9", "8"];
            case 4:
                return ["1", "3", "2", "6", "5", "4", "7", "8", "9"];
            default:
                return ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
        }
    } else if (difficulty === "difficult") {
        return ["4", "2", "8", "5", "1", "6", "7", "3", "9"];
    }
    else if (difficulty === "test") {
        return ["1", "2", "3", "4", "5", "6", "7", "9", "8"];
    }
}


function saveGameState() {
    console.log("save game state called");
    const tiles = [];
    const difficulty = document.getElementById('difficulty').value;

    document.querySelectorAll('#board img').forEach(function (tile) {
        tiles.push({
            id: tile.id,
            src: tile.src
        });
    });

    const gameState = {
        turns: document.getElementById("turns").innerText,
        tiles: tiles,
        difficulty: difficulty
    };

    // Save the game state to localStorage
    localStorage.setItem('puzzleGame', JSON.stringify(gameState));
}


function checkIfSolved() {
    let isSolved = true;
    const tiles = document.querySelectorAll("#board img"); // Check each tile's position
    tiles.forEach((tile, index) => {
        const expectedImage = (index + 1) + ".jpg";
        if (!tile.src.includes(expectedImage)) {
            isSolved = false;
        }
    });
    return isSolved;
}


function showSolvedMessage() {
    // Display the solved message
    const message = document.createElement("div");
    message.id = "solvedMessage";
    message.innerHTML = `
        <h2>Congratulations! You solved the puzzle!</h2>
        <button id="newGameButton" class="button">Start New Game</button>
        <button id="quitButton" class="button">Quit</button>
    `;
    document.body.appendChild(message);

    // Add event listeners for the buttons
    document.getElementById("newGameButton").addEventListener("click", function () {
        startNewGame();
        message.remove(); // Remove the message once a new game starts
    });

    document.getElementById("quitButton").addEventListener("click", function () {
        message.innerHTML = "<h2>Thank you for playing!</h2>";
        setTimeout(() => message.remove(), 2000); // Remove the message after a short delay
    });
}


function dragStart() { currentTile = this; }
function dragOver(e) { e.preventDefault(); }
function dragEnter(e) { e.preventDefault(); }
function dragLeave() { }
function dragDrop() { blankTile = this; } //tile being dropped on

function dragEnd() {
    console.log("drag end called");
    if (!blankTile.src.includes("9.jpg")) {
        return;
    }

    let currCoords = currentTile.id.split(".");
    let r = parseInt(currCoords[0]);
    let c = parseInt(currCoords[1]);

    let otherCoords = blankTile.id.split(".");
    let r2 = parseInt(otherCoords[0]);
    let c2 = parseInt(otherCoords[1]);

    let moveLeft = r == r2 && c2 == c - 1;
    let moveRight = r == r2 && c2 == c + 1;
    let moveUp = c == c2 && r2 == r - 1;
    let moveDown = c == c2 && r2 == r + 1;

    let isAdjacent = moveLeft || moveRight || moveUp || moveDown;

    if (isAdjacent) {
        let currentImage = currentTile.src;
        let blankImage = blankTile.src;

        currentTile.src = blankImage;
        blankTile.src = currentImage;

        turns += 1;
        document.getElementById("turns").innerText = turns;
        saveGameState();

        if (checkIfSolved()) {
            showSolvedMessage();
        }
    }
}
