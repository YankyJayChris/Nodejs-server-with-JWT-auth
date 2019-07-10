const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load validetion
const validatePostInput = require('../../validation/post');

//Load Post model
const Post = require('../../models/Post');
//Load Profile model
const Profile = require('../../models/Profile');

//@route GET api/posts/test
//@desc Test post route
//@access Public
router.get('/test', (req, res) => res.json({msg: "Users Posts"}));

//@route GET api/posts
//@desc Get Post
//@access Public
router.get('/', (req, res) => {
    Post.find()
        .sort({date: -1})
        .then(posts => res.json(posts))
        .catch(err => res.status(404).json({nopostsfound: 'No posts found'}));
});

//@route GET api/posts/:id
//@desc Get Post by id
//@access Public
router.get('/:id', (req, res) => {
    Post.findByid(req.params.id)
        .then(post => res.json(post))
        .catch(err => res.status(404).json({nopostfound: 'No post found with that id'}));
});

//@route POST api/posts/
//@desc create a post
//@access Private
router.post('/', passport.authenticate('jwt', {session: false}), (req, res) =>{
    // errors validator
    const {errors, isValid} = validatePostInput(req.body);

    if(!isValid){
        return res.status(400).json(errors);
    }
    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
    });

    newPost.save().then(post => res.json(post));
});

//@route Delete api/posts/:id
//@desc Delete a post
//@access Private
router.delete('/:id', passport.authenticate('jwt', {session: false}), (req, res) =>{
    Profile.findOne({user: req.user.id})
        .then(profile => {
            Post.findByid(req.params.id)
                .then(post => {
                    // check for owner 
                    if(post.user.toString() !== req.user.id) {
                        return res.status(401).json({noauthorized: 'user not  authorized'});
                    }
                    
                    // delete
                    post.remove().then(() => res.json({ success: true }));
                })
                .catch(err => res.status(404).json({ postnotfound: 'No post found'}));
        })
});

//@route like api/posts/like/:id
//@desc like a post
//@access Private
router.post('/like/:id', passport.authenticate('jwt', {session: false}), (req, res) =>{
    Profile.findOne({user: req.user.id})
        .then(profile => {
            Post.findByid(req.params.id)
                .then(post => {
                   if(
                       post.likes.filter(like => like.user.toString() === req.user.id).length > 0
                   ){
                       return res.status(400).json({ alreadliked: 'user alresdy liked this post'});
                   }

                   // add user id to likes array
                   post.likes.unshift({ user: req.user.id });

                   post.save().then(post => res.json(post));
                })
                .catch(err => res.status(404).json({ postnotfound: 'No post found'}).length === 0);
        })
});

//@route unlike api/posts/like/:id
//@desc unlike a post
//@access Private
router.post('/unlike/:id', passport.authenticate('jwt', {session: false}), (req, res) =>{
    Profile.findOne({user: req.user.id})
        .then(profile => {
            Post.findByid(req.params.id)
                .then(post => {
                   if(
                       post.likes.filter(like => like.user.toString() === req.user.id)
                   ){
                       return res.status(400).json({ notliked: 'you have not yet liked this post'});
                   }

                   // get remove index
                   const removeIndex = post.likes
                        .map(item => item.user.toString())
                        .indexOf(req.user.id);

                    // splice out of array
                    post.likes.splice(removeIndex, 1);

                    //save 
                    post.save().then(post => res.json(post));
                   
                })
                .catch(err => res.status(404).json({ postnotfound: 'No post found'}));
        })
});

//@route comment api/posts/comment/:id
//@desc comment a post
//@access Private
router.post('/comment/:id', passport.authenticate('jwt', {session: false}), (req, res) =>{
    const {errors, isValid} = validatePostInput(req.body);

    if(!isValid){
        return res.status(400).json(errors);
    }
    Profile.findByid({user: req.params.id})
    .then(post =>{
        const newComment = {
            text: req.body.text,
            name: req.body.name,
            avatar: req.body.avatar,
            user: req.user.id
        }

        //add to comment array
        post.comments.unshift(newComment);

        //save
        post.save().then(post => res.jso(post))
    })
    .catch(err => res.status(404).json({postnotfound: 'no post found'}));
        
});

//@route delete api/posts/comment/:id
//@desc delete comment from post
//@access Private
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', {session: false}), (req, res) =>{
    
    Profile.findByid({user: req.params.id})
    .then(post =>{
        // check if comment exists
        if(post.comments.filter(comment => comment._id.toString() === req.params.coment_id).length === 0){
            return res.status(404).json({commentnotexists: 'Comment doest not exist'});
        }

        // get remove index
        const removeIndex = post.comments
            .map(item => item._id.toString())
            indexOf(req.params.comment_id);

        // splice comment out of array
        post.comments.splice(removeIndex, 1);

        post.save().then(post => res.json(post));
    })
    .catch(err => res.status(404).json({postnotfound: 'no post found'}));
        
});
module.exports = router;