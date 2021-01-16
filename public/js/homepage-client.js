
// Room Modal Focus => room name input
const roomModal = document.getElementById('roomModal');
const roomInput = document.getElementById('_roomNameInput');
const roomForm = document.getElementById('_joinRoomForm');

roomModal.addEventListener('shown.bs.modal', () => {
    roomInput.focus();
});

roomForm.addEventListener('submit', (e) => {
    e.preventDefault();
    window.location.href = `${window.location.href}ttt/${roomInput.value}`
});




// SocketIO implementation
const socket = io(); // '/'
try {
    const _onlineRoomsLoggedIn = document.getElementById('_online-rooms-loggedIn');
    
    socket.on('newGame', (properties) => { // room created and user is waiting for an opponent
        var { game, roomName, member, points, _option } = properties;
        if (_option == 'public') {
            _onlineRoomsLoggedIn.innerHTML += `<a class="btn btn-outline-secondary" href="/ttt/${roomName}" id="link-${roomName}">${game} | ${member} (${points})</a>`;
        }
    });

    socket.on('removeExistingGame', (roomName) => { // room has 2 users so it needs to be deleted from other users' main page
        try {
            let elem = document.getElementById(`link-${roomName}`);
            elem.parentNode.removeChild(elem);
        } catch (e) {
        }
    })
} catch (e) {
    
}