const socket = io(window.location.href);
const bodyElem = document.getElementById('_body');
const waitingModalElem = document.getElementById('waitingModal');
const waitingModal = new bootstrap.Modal(waitingModalElem, {backdrop:'static', keyboard:false});
const turnArea = document.getElementById('_turnArea');
const turnAreaXO = document.getElementById('_turnAreaXO');
const timeBar = document.getElementById('_turnRemainingTime');
const gameScene = document.getElementById('_gameScene');
const _gameLink = document.getElementById('_gameLink');
const _gameLinkCopy = document.getElementById('_gameLinkCopy');


const _member1 = document.getElementById('_member1');
const _member2 = document.getElementById('_member2');
const _member1points = document.getElementById('_member1points');
const _member2points = document.getElementById('_member2points');


const roomName = window.location.href.split('/')[4];


waitingModal.show();
_gameLink.value = window.location.href; 

_gameLinkCopy.addEventListener("click", () => { // game link copy button
    _gameLink.select();
    document.execCommand("copy");
    _gameLinkCopy.innerText = 'Copied!';
    setTimeout(() => {
        _gameLinkCopy.innerText = 'Copy';
    }, 500);
})









try {
    socket.on('connect', () => {

        function game(currentUser, otherUser) {    
            for (let i = 1; i <= 9; i++) { // register event listeners
                document.getElementById(`_square${i}`).addEventListener("click", (evt) => {
                    socket.emit('move', { i, emitter: currentUser, otherUser })
                })
            }
        }
        
        const socketid = socket.id;

        socket.on('secondUserJoin', ({ sockets, players }) => {
            setTimeout(() => {
                waitingModal.hide();
                waitingModalElem.parentNode.removeChild(waitingModalElem);
                turnArea.innerText = sockets[0].username;
                turnAreaXO.innerText = sockets[0].xo;
                
                _member1.innerText = players[0].username;
                _member1points.innerText = players[0].points;
                _member2.innerText = players[1].username;
                _member2points.innerText = players[1].points;

                const currentUser = socketid == sockets[0].socketid ? sockets[0] : sockets[1];
                const otherUser = socketid == sockets[1].socketid ? sockets[0] : sockets[1];
                
                if (socketid == sockets[0].socketid) { // the first player
                    gameScene.style.cursor = 'pointer'; 
                } else if (socketid == sockets[1].socketid) { // the 2nd player
                    gameScene.style.cursor = 'not-allowed'; 
                }
                game(currentUser, otherUser);
            }, 1000);
        });
    })



    socket.on('moveOK', ({ i, emitter }) => {
        document.getElementById(`_square${i}`).innerText = emitter.xo;
    });


    socket.on('turn', ({ username, xo }) => {
        turnArea.innerText = username;
        turnAreaXO.innerText = xo;
        timeBar.style.width = '100%';
    });

    socket.on('turnFinish', () => {
        gameScene.style.cursor = 'not-allowed';
    });

    socket.on('turnStart', () => {
        gameScene.style.cursor = 'pointer'
    });





    socket.on('gameEnded', ({ winner, message, line }) => {

        function showEndingModal() {
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
                                                    <a role="button" class="btn btn-primary btn-block" href="/">Go homepage now</a>
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

        // line => [0, 1, 2]
        // line[0] => GAME ENDED DRAW
        // line[0] => USER DISCONNECTED


        if (line[0] == "GAME ENDED DRAW") { // DRAW
            const squares = document.querySelectorAll('._square');
            squares.forEach((s) => {
                s.style.backgroundColor = "rgba(240, 173, 78, 0.5)";
            });

            return setTimeout(showEndingModal, 1500);

        } else if (line[0] == "USER DISCONNECTED") { // DISCONNECT

            const squares = document.querySelectorAll('._square');
            squares.forEach((s) => {
                s.style.backgroundColor = "rgba(217, 83, 79, 0.5)";
            });

            return setTimeout(showEndingModal, 1500);


        } else if (line[0] == "USER INACTIVE") { // USER INACTIVE
            const squares = document.querySelectorAll('._square');
            squares.forEach((s) => {
                s.style.backgroundColor = "#DDDDDD";
            });

            return setTimeout(showEndingModal, 1500);

        } else { // winning line
            document.getElementById(`_square${line[0] + 1}`).style.backgroundColor = "rgba(92, 184, 92, 0.5)";
            document.getElementById(`_square${line[1] + 1}`).style.backgroundColor = "rgba(92, 184, 92, 0.5)";
            document.getElementById(`_square${line[2] + 1}`).style.backgroundColor = "rgba(92, 184, 92, 0.5)";

            return setTimeout(showEndingModal, 1500);
        }


    })
} catch (e) {
    
}
