const { io, tttNamespace } = require('../app'); // require io instance from app.js
const Room = require('../models/Room');
const User = require('../models/User');
const OnlineRoom = require('../models/OnlineRoom');
const roomdata = require('roomdata');

const INACTIVITY_TIME = 30; // secs




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








tttNamespace.on('connection', async (socket) => {
    try {
        var roomName = socket.nsp.name.toString().split("/")[2];
        const room_db = await Room.findOne({ name: roomName });
        const socketUser = socket.request.user; 
        if (room_db.members.length < 1) { // room has not been created before so emit one
            room_db.members.push(socketUser.username); // add current user to the room's member list
            socketUser.games.push(roomName); // add room name to the user's game list

            room_db.socketIDs.push({
                socketid: socket.id,
                username: socketUser.username,
                xo: "X"
            });

            await room_db.save();
            await socketUser.save();

            roomdata.joinRoom(socket, roomName);
            roomdata.set(socket, "turn", socketUser.username); // first user gets the first turn
            roomdata.set(socket, 'squareList', [
                { element: 1, filled: false, value: "" },
                { element: 2, filled: false, value: "" },
                { element: 3, filled: false, value: "" },
                { element: 4, filled: false, value: "" },
                { element: 5, filled: false, value: "" },
                { element: 6, filled: false, value: "" },
                { element: 7, filled: false, value: "" },
                { element: 8, filled: false, value: "" },
                { element: 9, filled: false, value: "" }
            ]);
            

            io.emit('newGame', {
                game: 'XOX',
                roomName,
                member: socketUser.username,
                points: socketUser.ttt_wins - socketUser.ttt_loses,
                _option: room_db._option
            })
        } else  { // room has been created once so remove the existing one

            if (room_db.members.includes(socket.request.user.username)) { // check if the user tries to join the same game using different browsers
                return 0;
            }

            const currentOnlineRoom = await OnlineRoom.findOne({ name: roomName });
            if (currentOnlineRoom) {
                await currentOnlineRoom.remove();
            }
            
            io.emit('removeExistingGame', roomName);


            room_db.members.push(socketUser.username); // add current user to the room's member list
            socketUser.games.push(roomName); // add room name to the user's game list

            room_db.socketIDs.push({
                socketid: socket.id,
                username: socketUser.username,
                xo: "O"
            });

            roomdata.joinRoom(socket, roomName);
            roomdata.set(socket, "turn", room_db.socketIDs[0].username); // first user gets the first turn
            roomdata.set(socket, 'squareList', [
                { element: 1, filled: false, value: "" },
                { element: 2, filled: false, value: "" },
                { element: 3, filled: false, value: "" },
                { element: 4, filled: false, value: "" },
                { element: 5, filled: false, value: "" },
                { element: 6, filled: false, value: "" },
                { element: 7, filled: false, value: "" },
                { element: 8, filled: false, value: "" },
                { element: 9, filled: false, value: "" }
            ]);

            const player1 = await User.findOne({ username: room_db.socketIDs[0].username }); 
            const player2 = await User.findOne({ username: room_db.socketIDs[1].username });

            const _player1 = {
                username: player1.username,
                points: player1.ttt_wins - player1.ttt_loses
            }

            const _player2 = {
                username: player2.username,
                points: player2.ttt_wins - player2.ttt_loses
            }

            await socketUser.save();
            await room_db.save();

            socket.in(roomName).emit('secondUserJoin', { sockets: room_db.socketIDs, players: [_player1, _player2] }); // fire game() in client side js
            socket.emit('secondUserJoin', { sockets: room_db.socketIDs, players: [_player1, _player2] }); // fire game() in client side js

            roomdata.set(socket, "timer", INACTIVITY_TIME);

            var timerInterval = setInterval( async () => {
                var _timer = await roomdata.get(socket, "timer")
                if (_timer > 0) {
                    roomdata.set(socket, "timer", --_timer);
                } else if (_timer == "STOP") {
                    clearInterval(timerInterval);
                } else {
                    clearInterval(timerInterval);
                    // turn -> loser
                    var _turn = await roomdata.get(socket, "turn");
                    const room_db = await Room.findOne({ name: roomName });
                    const _winnerUsername = _turn == room_db.members[1] ? room_db.members[0] : room_db.members[1]; 
                    const _loserUsername = _turn == room_db.members[0] ? room_db.members[0] : room_db.members[1]; 
                    
                    const _winner = await User.findOne({ username: _winnerUsername });
                    const _loser = await User.findOne({ username: _loserUsername });

                    _winner.ttt_wins++;
                    _loser.ttt_loses++;
                    room_db.winner = _winnerUsername;
                    room_db.ended = true;
                    room_db.socketIDs = [];

                    await _winner.save();
                    await _loser.save();
                    await room_db.save();

                    socket.in(roomName).emit('gameEnded', {
                        winner: _winnerUsername,
                        message: `${_loserUsername} was inactive for too long.`,
                        line: ["USER INACTIVE"]
                    })
                    return socket.emit('gameEnded', {
                        winner: _winnerUsername,
                        message: `${_loserUsername} was inactive for too long.`,
                        line: ["USER INACTIVE"]
                    })
                }
            }, 1000);

        }
    
        socket.on('move', async ({ i, emitter, otherUser }) => {
            var _squareList = await roomdata.get(socket, "squareList"); // get the list reference
            var _turn = await roomdata.get(socket, "turn"); // get the turn reference
            if (!_squareList[i-1].filled && _turn == emitter.username) { // check if the square is filled and who's turn it is
                _squareList[i-1].filled = true;
                _squareList[i-1].value = emitter.xo;

                roomdata.set(socket, "squareList", _squareList);
                roomdata.set(socket, "turn", otherUser.username); // give turn to the other user

                socket.in(roomName).emit('moveOK', { i, emitter, otherUser });
                socket.emit('moveOK', { i, emitter, otherUser });

                var _sl = await roomdata.get(socket, "squareList");
                var returned = endCheck(_sl);
                if (returned) { // returns undefined if the game is not finished
                    var result = returned.winner;
                    var resultLine = returned.line;
                    // returns GAME ENDED DRAW if it's draw
                    if (result == 'GAME ENDED DRAW') {
                        // stop the timer
                        roomdata.set(socket, "timer", "STOP");

                        // game draw
                        const player1 = await User.findOne({ username: emitter.username });
                        const player2 = await User.findOne({ username: otherUser.username });
                        const room_db = await Room.findOne({ name: roomName });
                        
                        room_db.winner = 'GAME ENDED DRAW'
                        room_db.ended = true;
                        room_db.socketIDs = [];
                        player1.ttt_draws++;
                        player2.ttt_draws++;

                        await room_db.save();
                        await player1.save();
                        await player2.save();

                        socket.in(roomName).emit('gameEnded', {
                            winner: 'GAME ENDED DRAW',
                            message: `Literally, no winner.`,
                            line: resultLine
                        });
                        
                        return socket.emit('gameEnded', {
                            winner: 'GAME ENDED DRAW',
                            message: `Literally, no winner.`,
                            line: resultLine
                        });
                        
                    } else {
                        // stop the timer
                        roomdata.set(socket, "timer", "STOP");

                        var winnerUsername = result.winner == emitter.xo ? otherUser.username : emitter.username; // emitter
                        var loserUsername = result.winner == emitter.xo ? emitter.username : otherUser.username; // otherUser
                        const _winner = await User.findOne({ username: winnerUsername });
                        const _loser = await User.findOne({ username: loserUsername });
                        const room_db = await Room.findOne({ name: roomName });

                        _winner.ttt_wins++;
                        _loser.ttt_loses++;
                        room_db.winner = winnerUsername;
                        room_db.ended = true;
                        room_db.socketIDs = [];

                        await _winner.save();
                        await _loser.save();
                        await room_db.save();

                        socket.in(roomName).emit('gameEnded', {
                            winner: winnerUsername,
                            message: `${loserUsername} must be feeling sad now.`,
                            line: resultLine
                        })

                        return socket.emit('gameEnded', {
                            winner: winnerUsername,
                            message: `${loserUsername} must be feeling sad now.`,
                            line: resultLine
                        })

                    }
                } else {
                    // general turn emit
                    socket.in(roomName).emit('turn', otherUser);
                    socket.emit('turn', otherUser);
                    
                    // reset the timer
                    roomdata.set(socket, "timer", INACTIVITY_TIME);

                    // turn => other user
                    roomdata.set(socket, "turn", otherUser.username)

                    // emit to the emmitter
                    socket.emit('turnFinish');
        
                    // emit to the other user
                    socket.to(otherUser.socketid).emit('turnStart');
                }

            }
            
        });
        
    
        socket.on('disconnect', async () => {
            roomdata.leaveRoom(socket);
            const socketUser = socket.request.user
            const room_db = await Room.findOne({ name: roomName });
            if (room_db.members.length == 1) { // 1 user was waiting and left the room
                
                // stop the timer
                roomdata.set(socket, "timer", "STOP");

                const currentOnlineRoom = await OnlineRoom.findOne({ name: roomName });
                if (currentOnlineRoom) {
                    await currentOnlineRoom.remove();
                }
    
                io.emit('removeExistingGame', roomName);

                // delete the room from db and user's game list
                socketUser.games.splice(socketUser.games.indexOf(roomName), 1) // remove the room name from user's game list
                await socketUser.save();
                await room_db.remove();
                
            } else if (room_db.members.length == 2) { // users were playing and one of them suddenly disconnected
                
                // stop the timer
                roomdata.set(socket, "timer", "STOP");

                if (!room_db.ended) {
                    room_db.ended = true;
                    room_db.socketIDs = [];
                    let otherUserUsername = room_db.members.indexOf(socketUser.username) == 0 ? room_db.members[1] : room_db.members[0];
                    let otherUser = await User.findOne({ username: otherUserUsername });
    
                    socketUser.ttt_loses++;
                    otherUser.ttt_wins++;
                    
                    room_db.winner = otherUser.username;
    
                    await socketUser.save();
                    await otherUser.save();
                    await room_db.save();
                    
                    socket.in(roomName).emit('gameEnded', {
                        winner: otherUserUsername,
                        message: `${socketUser.username} left the room.`,
                        line: ['USER DISCONNECTED']
                    });

                    return socket.emit('gameEnded', {
                        winner: otherUserUsername,
                        message: `${socketUser.username} left the room.`,
                        line: ['USER DISCONNECTED']
                    });
                }

    
            } else {
                console.log('something is wrong - socket.js');
            }
        });
    
    } catch (e) {
        console.log(e);
    }
});


// xD