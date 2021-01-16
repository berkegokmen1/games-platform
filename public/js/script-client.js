



// Navbar login-register Focus => input

const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');

const loginInput = document.getElementById('username-l');
const registerInput = document.getElementById('username-r');

loginModal.addEventListener('shown.bs.modal', () => {
    loginInput.focus();
});

registerModal.addEventListener('shown.bs.modal', () => {
    registerInput.focus();
});






