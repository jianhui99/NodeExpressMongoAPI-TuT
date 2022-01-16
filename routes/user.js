const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

// update user
router.put("/:id", async (request, response) => {
    if(request.body.userId === request.params.id || request.body.isAdmin){
        // encrypt password if user request to update password
        if(request.body.password){
            try{
                const salt = await bcrypt.genSalt(10);
                request.body.password = await bcrypt.hash(request.body.password, salt);
            }catch (err){
                response.status(500).json(err);
            }
        }

        try{
            const user = await User.findByIdAndUpdate(request.params.id, {
                $set: request.body,
            });

            response.status(200).json(user);
        }catch (err){
            response.status(500).json(err);
        }
    } else{
        response.status(403).json("You can manage only your account!");
    }
});

// delete user
router.delete("/:id", async (request, response) => {
    if(request.body.userId === request.params.id || request.body.isAdmin){
        try{
            const user = await User.findByIdAndDelete(request.params.id);
            response.status(200).json("Account has been deleted.");
        }catch (err){
            response.status(500).json(err);
        }
    } else{
        response.status(403).json("You can manage only your account!");
    }
});

// get a user
router.get("/:id", async (request, response) => {
    try{
        const user = await User.findById(request.params.id);
        !user && response.status(404).json(validate.message);

        const {password, updatedAt, ...other} = user._doc;
        response.status(200).json(other);
    } catch (err){
        response.status(500).json(err);
    }
});

// follow a user
router.put("/:id/follow", async (req, res) => {
    if(req.body.userId !== req.params.id){
        try{
            const user = await User.findById(req.params.id);
            const curentUser = await User.findById(req.body.userId);

            if(!user.followers.includes(req.body.userId)){
                await user.updateOne({
                    $push: {
                        followers: req.body.userId
                    }
                });
                await curentUser.updateOne({
                    $push: {
                        followings: req.params.id
                    }
                });

                res.status(200).json("you are following " + user.username);
            } else{
                res.status(403).json("you already follow " + user.username);
            }
        } catch(err){
            res.status(500).json(err);
        }
    } else{
        res.status(403).json("you cannot follow yourself.");
    }
});

// unfollow a user
router.put("/:id/unfollow", async (req, res) => {
    if(req.body.userId !== req.params.id){
        try{
            const user = await User.findById(req.params.id);
            const curentUser = await User.findById(req.body.userId);

            if(user.followers.includes(req.body.userId)){
                await user.updateOne({
                    $pull: {
                        followers: req.body.userId
                    }
                });
                await curentUser.updateOne({
                    $pull: {
                        followings: req.params.id
                    }
                });

                res.status(200).json("you has been unfollow " + user.username);
            } else{
                res.status(403).json("you already unfollow " + user.username);
            }
        } catch(err){
            res.status(500).json(err);
        }
    } else{
        res.status(403).json("you cannot unfollow yourself.");
    }
});

module.exports = router;
