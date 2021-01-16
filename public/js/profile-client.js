const apiInput = document.getElementById('apiKeyInput');
const apiBtn = document.getElementById('apiKeyGenerate');

const deleteBtn = document.getElementById('deleteAccount');

async function generateKey() {
    try {
        apiBtn.disabled = true;
        // apiBtn.classList.add('__disabled__');
        const response = await fetch('/api/apiKey');
        const data = await response.json();
        await fetch('/api/apiKey', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'PATCH',                                                              
            body: JSON.stringify( { apiKey: data.uuid.toString() } )     
        });
        apiInput.value = data.uuid.toString();
        setTimeout(() => {
            apiBtn.disabled = false;
            // apiBtn.classList.remove('__disabled__');
        }, 60000);
    } catch (e) {
        alert('Something went wrong.');
    }
}

async function deleteAccount() {
    try {
        deleteBtn.disabled = true;
        await fetch('/p', {
            method: 'DELETE'
        });
        window.location = "/";
    } catch (e) {
        alert('Something went wrong.');
    }
}

apiBtn.addEventListener('click', generateKey);
deleteBtn.addEventListener('click', deleteAccount);