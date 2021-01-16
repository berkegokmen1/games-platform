const bodyElem = document.getElementById('_body');
const optionsModalElem = document.getElementById('optionsModal');
const optionsModal = new bootstrap.Modal(optionsModalElem, {backdrop:'static', keyboard:false});
const gameScene = document.getElementById('_gameScene');
const optionsForm = document.getElementById('_optionsForm');
const turnArea = document.getElementById('_turnArea');
const turnAreaXO = document.getElementById('_turnAreaXO');
const _member2 = document.getElementById('_member2');

const squareList = [
    { element: document.getElementById('_square1'), filled: false, value: "", index: 0 },
    { element: document.getElementById('_square2'), filled: false, value: "", index: 1 },
    { element: document.getElementById('_square3'), filled: false, value: "", index: 2 },
    { element: document.getElementById('_square4'), filled: false, value: "", index: 3 },
    { element: document.getElementById('_square5'), filled: false, value: "", index: 4 },
    { element: document.getElementById('_square6'), filled: false, value: "", index: 5 },
    { element: document.getElementById('_square7'), filled: false, value: "", index: 6 },
    { element: document.getElementById('_square8'), filled: false, value: "", index: 7 },
    { element: document.getElementById('_square9'), filled: false, value: "", index: 8 }
];



optionsModal.show();



function endCheck(_sl) {
    var sl = _sl.map((s) => s.value);
    var winner = undefined;
    var line = undefined;

    if (sl[0] != "" && sl[1] != "" && sl[2] != "") {
        if (sl[0] == sl[1] && sl[1] == sl[2]) {
            winner = sl[0];
            line = [0, 1, 2];
            return { winner, line };
        }
    }
    
    if (sl[3] != "" && sl[4] != "" && sl[5] != "") {
        if (sl[3] == sl[4] && sl[4] == sl[5]) {
            winner = sl[3];
            line = [3, 4, 5];
            return { winner, line };
        }
    }
    
    if (sl[6] != "" && sl[7] != "" && sl[8] != "") {
        if (sl[6] == sl[7] && sl[7] == sl[8]) {
            winner = sl[6];
            line = [6, 7, 8];
            return { winner, line };
        }
    }
    
    if (sl[0] != "" && sl[3] != "" && sl[6] != "") {
        if (sl[0] == sl[3] && sl[3] == sl[6]) {
            winner = sl[0];
            line = [0, 3, 6];
            return { winner, line };
        }
    }
    
    if (sl[1] != "" && sl[4] != "" && sl[7] != "") {
        if (sl[1] == sl[4] && sl[4] == sl[7]) {
            winner = sl[1];
            line = [1, 4, 7];
            return { winner, line };
        }
    }
    
    if (sl[2] != "" && sl[5] != "" && sl[8] != "") {
        if (sl[2] == sl[5] && sl[5] == sl[8]) {
            winner = sl[2];
            line = [2, 5, 8];
            return { winner, line };
        }
    }
    
    if (sl[0] != "" && sl[4] != "" && sl[8] != "") {
        if (sl[0] == sl[4] && sl[4] == sl[8]) {
            winner = sl[0];
            line = [0, 4, 8];
            return { winner, line };
        }
    }
    
    if (sl[2] != "" && sl[4] != "" && sl[6] != "") {
        if (sl[2] == sl[4] && sl[4] == sl[6]) {
            winner = sl[2];
            line = [2, 4, 6];
            return { winner, line };
        }
    }

    if (sl.every((s) => s != "")) { // if all elements are filled
        if (sl.every((s) => s == "X" || s == "O")) {
            winner = "GAME ENDED DRAW"; // long enough to prevent someone from getting this as a username also contains white spaces 
            line = ["GAME ENDED DRAW"];
            return { winner, line };
        }
    }

    return undefined
}

optionsForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const level = e.target.elements._optionsLevel.value;
    let huPlayerXO, aiPlayerXO;

    if (e.target.elements._optionsXO.value == "R") { // random
        huPlayerXO = ["X", "O"][Math.floor(Math.random() * 2)];
    } else {
        huPlayerXO = e.target.elements._optionsXO.value;
    }

    aiPlayerXO = huPlayerXO == "X" ? "O" : "X";


    optionsModal.hide();
    optionsModalElem.parentNode.removeChild(optionsModalElem);
    _member2.innerText = `AI ${level}`;

    if (aiPlayerXO == "X") {
        turnArea.innerText = `AI ${level}`;
        turnAreaXO.innerText = aiPlayerXO;
        gameScene.style.cursor = 'not-allowed';
        gameScene.style.pointerEvents = 'none';
    } else {
        turnArea.innerText = `You`;
        turnAreaXO.innerText = huPlayerXO;
        gameScene.style.cursor = 'pointer';
    }


    function timeout(ms) {
        return new Promise((resolve, reject) => setTimeout(resolve, ms));
    }

    function minimax(board, depth, isMaximizing) {
        let result = endCheck(board);

        if (result) {
            if (result.winner == aiPlayerXO) {
                return 10;
            } else if (result.winner == huPlayerXO) {
                return -10;
            } else if (result.winner == 'GAME ENDED DRAW') {
                return 0;
            }
        }

        
        if (isMaximizing) { // starter (AI)
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) { // loop through all squares
                if (board[i].filled == false) { // is the square available?
                    board[i].filled = true;
                    board[i].value = aiPlayerXO;
                    let score = minimax(board, depth + 1, false); // call the next move (human)
                    
                    board[i].filled = false;
                    board[i].value = ""; // reset the board

                    bestScore = Math.max(score, bestScore); // the highest value is the best value for ai player since in every situation in which ai wins, function returns "10"
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i].filled == false) {
                    board[i].filled = true;
                    board[i].value = huPlayerXO;
                    let score = minimax(board, depth + 1, true); // call the next move (AI)
                    
                    board[i].filled = false;
                    board[i].value = ""; // reset the board

                    bestScore = Math.min(score, bestScore); // the smallest value is the best value for human player since in every situation in which the human player wins, functions returns "-10"
                }
            }
            return bestScore;
        }
    } 

    function bestMove() {
        // AI to make its move
        let bestScore = -Infinity;
        let move;
        for (let i = 0; i < 9; i++) {
            if (squareList[i].filled == false) { // is the square available
                squareList[i].filled = true;
                squareList[i].value = aiPlayerXO;
                let score = minimax(squareList, 0, false); // initial call (depth = 0 & turn => human)

                squareList[i].filled = false;
                squareList[i].value = ""; // reset the board

                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }

        return move;
    }

    async function aiPlayerMove() {

        async function moveBest() {
            turnArea.innerText = `AI ${level}`;
            turnAreaXO.innerText = aiPlayerXO;
            gameScene.style.cursor = 'not-allowed';
            gameScene.style.pointerEvents = 'none';
            await timeout(200);
            
            let i = bestMove();
            squareList[i].filled = true;
            squareList[i].value = aiPlayerXO;
            squareList[i].element.innerText = aiPlayerXO;
            
            gameScene.style.pointerEvents = 'auto';
            gameScene.style.cursor = 'pointer';

            turnArea.innerText = `You`;
            turnAreaXO.innerText = huPlayerXO;
        }

        async function moveRandom() {
            turnArea.innerText = `AI ${level}`;
            turnAreaXO.innerText = aiPlayerXO;
            gameScene.style.cursor = 'not-allowed';
            gameScene.style.pointerEvents = 'none';
            await timeout(200);
            
            let availableSquares = squareList.filter((square) => square.filled != true);
            let randIndex = availableSquares[Math.floor(Math.random() * availableSquares.length)].index;
            squareList[randIndex].filled = true;
            squareList[randIndex].value = aiPlayerXO;
            squareList[randIndex].element.innerText = aiPlayerXO;
            
            gameScene.style.pointerEvents = 'auto';
            gameScene.style.cursor = 'pointer';

            turnArea.innerText = `You`;
            turnAreaXO.innerText = huPlayerXO;
        }
        // Math.round(Math.random() * 99) + 1

        if (level == 'Easy') {
            await moveRandom(); // 100% chance of performing random move
        } else if (level == 'Medium') {
            if ((Math.round(Math.random() * 99) + 1) < 50) { // 50% chance of performing random move
                await moveRandom();
            } else {
                await moveBest();
            }
        } else if (level == 'Hard') {
            if ((Math.round(Math.random() * 99) + 1) < 25) { // 25% chance of performing random move
                await moveRandom();
            } else {
                await moveBest();
            }
        } else if (level == 'Impossible') {
            await moveBest();
        } else { // for some reason level is not one of the predefined ones. level => Medium
            if ((Math.round(Math.random() * 99) + 1) < 50) { // 50% chance of performing random move
                await moveRandom();
            } else {
                await moveBest();
            }
        }
        
    }

    // game end check

    if (aiPlayerXO == "X") {
        await aiPlayerMove();
    }




    function showEndingModal(winner, message) {
        bodyElem.innerHTML += ` <div class="modal fade" id="endGameModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="endGameModalLabel" aria-hidden="true">
                                    <div class="modal-dialog">
                                        <div class="modal-content">
                                            <div class="modal-header">
                                                <h5 class="modal-title" id="endGameModalLabel">Game ended</h5>
                                            </div>
                                            <div class="modal-body text-primary">
                                                <h4 class="text-center">Winner: ${winner}</h4>
                                                <h5 class="text-center">${message}</h4>
                                                <h3 class="text-center">You will be redirected in <span id="_countdown">5</span></h3>
                                            </div>
                                            <div class="modal-footer">
                                                <div class="d-flex w-100">
                                                    <a role="button" class="btn btn-primary w-100 m-1" href="/">Go homepage now</a>
                                                    <a role="button" class="btn btn-primary w-100 m-1" href="/computer/ttt">Play Again</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>`;

        let endGameModalElem = document.getElementById('endGameModal');
        let endGameModal = new bootstrap.Modal(endGameModalElem, {backdrop:'static', keyboard:false});
        endGameModal.show();
        let _seconds = document.getElementById('_countdown').textContent;
        setInterval(() => {
            _seconds--;
            document.getElementById('_countdown').textContent = _seconds;
            if (_seconds <= 0) {
            window.location.href = "/";
            }
        }, 1000);
    }





    squareList.forEach((square) => {
        square.element.addEventListener('click', async (e) => {
            var target = e.target;
            var match = target.id.match(/(\d+)/); // extract the number from id
            var num = parseInt(match[0])
            if (!squareList[num-1].filled) {
                squareList[num-1].filled = true;
                squareList[num-1].value = huPlayerXO;
                squareList[num-1].element.innerText = huPlayerXO;

                var result = endCheck(squareList)

                if (result) { // game ended
                    if (result.winner == "GAME ENDED DRAW") { // DRAW
                        const squares = document.querySelectorAll('._square');
                        squares.forEach((s) => {
                            s.style.backgroundColor = "rgba(240, 173, 78, 0.5)";
                        });
            
                        return setTimeout(() => {
                            showEndingModal('DRAW', 'Literally draw...');
                        }, 1500);
            
                    } else { // winning line
                        document.getElementById(`_square${result.line[0] + 1}`).style.backgroundColor = "rgba(92, 184, 92, 0.5)";
                        document.getElementById(`_square${result.line[1] + 1}`).style.backgroundColor = "rgba(92, 184, 92, 0.5)";
                        document.getElementById(`_square${result.line[2] + 1}`).style.backgroundColor = "rgba(92, 184, 92, 0.5)";
            
                        return setTimeout(() => {
                            if (result.winner == huPlayerXO) { // human won
                                showEndingModal('You', `AI ${level} lost the game`);
                            } else if (result.winner == aiPlayerXO) { // ai won
                                showEndingModal(`AI ${level}`, `You must be feeling sad now.`);
                            }
                        }, 1500);
                    }
                } else { 

                    // computer movement
                    await aiPlayerMove();
            
                    var secondResult = endCheck(squareList)

                    if (secondResult) { // game ended
                        if (secondResult.winner == "GAME ENDED DRAW") { // DRAW
                            const squares = document.querySelectorAll('._square');
                            squares.forEach((s) => {
                                s.style.backgroundColor = "rgba(240, 173, 78, 0.5)";
                            });
                
                            return setTimeout(() => {
                                showEndingModal('DRAW', 'Literally draw...');
                            }, 1500);
                
                        } else { // winning line
                            document.getElementById(`_square${secondResult.line[0] + 1}`).style.backgroundColor = "rgba(92, 184, 92, 0.5)";
                            document.getElementById(`_square${secondResult.line[1] + 1}`).style.backgroundColor = "rgba(92, 184, 92, 0.5)";
                            document.getElementById(`_square${secondResult.line[2] + 1}`).style.backgroundColor = "rgba(92, 184, 92, 0.5)";
                
                            return setTimeout(() => {
                                if (secondResult.winner == huPlayerXO) { // human won
                                    showEndingModal('You', `AI ${level} lost the game`);
                                } else if (secondResult.winner == aiPlayerXO) { // ai won
                                    showEndingModal(`AI ${level}`, `You must be feeling sad now.`);
                                }
                            }, 1500);
                        }
                    }
                }
            }
        })
    })
});