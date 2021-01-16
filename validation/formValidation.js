const User = require('../models/User');
const bcrypt = require('bcryptjs');

module.exports.registerValidation = (username, password, password2) => {
    const errors = [];

    if (username === "") {
        errors.push({ message: "Please fill the username area." })
    } else {
        if (username.length < 3) {
            errors.push({ message: "Username must be at least 3 characters long."})
        }
        
        if (/\s/.test(username)) {
            errors.push({ message: "Username cannot contain any whitespaces." })
        }
        
        if (/\W/.test(username)) {
            errors.push({ message: "Username cannot contain any special characters." })
        }
    }
    
    if (password === "" || password2 === "") {
        errors.push({ message: "Please fill the password areas." })
    } else {
        if (password !== password2) {
            errors.push({ message: "Passwords don't match." })
        }  
        
        if (password.includes(username) || password2.includes(username)) {
            errors.push({ message: "Password cannot contain username" })
        }

        if (password.length < 6) {
            errors.push({ message: "Password must be at least 6 characters long"})
        }

        if (password.length > 15) {
            errors.push({ message: "Password must be less than 15 characters long" })
        }
        
        if (/\s/.test(password) || /\s/.test(password2)) {
            errors.push({ message: "Password cannot contain any whitespaces" })
        }   
    }

    return errors;
}

module.exports.passChangeValidation = async (username, oldpass, newpass, newpass2) => {
    const errors = [];

    try {
        const user = await User.findOne({ username });

        if (!user) { 
            errors.push({ message: "User not found"}) 
        } else {
            const res = await bcrypt.compare(oldpass, user.password);
            if (!res) { // res returns => true / false
                errors.push({ message: "Incorrect password" })
            } else {
                if (newpass === "" || newpass2 === "") {
                    errors.push({ message: "Please fill the password areas." })
                } else {
                    if (newpass !== newpass2) {
                        errors.push({ message: "Passwords don't match." })
                    }  
                    
                    if (newpass.includes(user.username) || newpass2.includes(user.username)) {
                        errors.push({ message: "Password cannot contain username" })
                    }
            
                    if (newpass.length < 6) {
                        errors.push({ message: "Password must be at least 6 characters long"})
                    }
            
                    if (newpass.length > 15) {
                        errors.push({ message: "Password must be less than 15 characters long" })
                    }
                    
                    if (/\s/.test(newpass) || /\s/.test(newpass2)) {
                        errors.push({ message: "Password cannot contain any whitespaces" })
                    }

                    if (newpass === oldpass || newpass2 === oldpass) {
                        errors.push({ message: "New password cannot be the same as the old one" })
                    }
                }
            } 
            
            return errors;
        }
    } catch (e) {
        errors.push({ message: "There was an error." });
    }

}