const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

// Regigster
router.post("/register", async (request, response) => {
    try{
        // encrypt user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(request.body.password, salt);
        
        // create new user
        const createUser = await new User({
            username: request.body.username,
            email: request.body.email,
            password: hashedPassword,
        });

        // save user and response
        const user = await createUser.save();
        response.status(200).json(user);
    } catch(err) {
        response.status(500).json(err);
    }
});

// Login
router.post("/login", async (request, response) => {
    try{
        const user = await User.findOne({
            email: request.body.email
        });
        !user && response.status(404).json('user not found.');

        const validPassword = await bcrypt.compare(request.body.password, user.password);
        !validPassword && response.status(400).json('wrong password, try again.');

        response.status(200).json(user);
    } catch(err){
        response.status(500).json(err);
    }
});

module.exports = router;
