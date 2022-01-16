const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");

// create a post
router.post("/", async(req, res) => {
    let reqBody = req.body;
    // check userId
    // const user = await User.findById(req.body.userId);
    // !user && res.status(404).json('user not found.');
    const createPost = new Post(reqBody);
    try{
        const savePost = await createPost.save();
        res.status(200).json(savePost);
    } catch(err){
        res.status(500).json(err);
    }
});

// update a post
router.put("/:id", async (req, res) => {
    try{
        const post = await Post.findById(req.params.id);
        if(post.userId === req.body.userId){
            await post.updateOne({
                $set: req.body,
            });
            res.status(200).json("post updated successfully.");
        } else{
            res.status(400).json("user id not found!");
        }
    } catch(err){
        res.status(500).json(err);
    }
});

// delete a post
router.delete("/:id", async (req, res) => {
    try{
        const post = await Post.findById(req.params.id);
        !post && res.status(404).json("post id not found.");
        if(post.userId === req.body.userId){
            await post.deleteOne();
            res.status(200).json("post deleted successfully.");
        } else{
            res.status(400).json("user id not found!");
        }
    } catch(err){
        res.status(500).json(err);
    }
});

// like/dislike a post
router.put("/:id/like", async (req, res) => {
    try{
        const post = await Post.findById(req.params.id);
        !post && res.status(404).json("post id not found.");
        if(!post.likes.includes(req.body.userId)){
            await post.updateOne({
                $push: {
                    likes: req.body.userId
                }
            });
            res.status(200).json("liked post successfully.");
        } else{
            await post.updateOne({
                $pull: {
                    likes: req.body.userId
                }
            });
            res.status(200).json("disliked post successfully.");
        }
    } catch(err){
        res.status(500).json(err);
    }
});

// get a post
router.get("/:id", async(req, res) => {
    const post = await Post.findById(req.params.id);
    !post && res.status(404).json("post id not found.");

    res.status(200).json(post);
});

// get timeline posts
router.get("/timeline/all", async(req, res) => {
    try{
        const currentUser = await User.findById(req.body.userId);
        const userPosts = await Post.find({
            userId: currentUser._id
        });
        const friendPosts = await Promise.all(
            currentUser.followings.map((friendId) => {
                return Post.find({
                    userId: friendId
                });
            })
        );

        res.status(200).json(userPosts.concat(...friendPosts));
    } catch(err){
        res.status(500).json(err);
    }
});

module.exports = router;