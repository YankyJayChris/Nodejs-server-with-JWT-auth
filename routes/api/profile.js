const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load validetion
const validateProfileInput = require('../../validation/profile');
const validateexpirienceInput = require('../../validation/expirience');
const validateeducationInput = require('../../validation/education');

//Load Profile model
const  Profile = require('../../models/Profile');
// // Load User Profile
// const User = require('../../models/User');

//@route GET api/profile/test
//@desc Test profile route
//@access Public
router.get('/test', (req, res) => res.json({msg: "Users Profile"}));

//@route GET api/profile/
//@desc get current user route
//@access Private
router.get(
    '/', 
    passport.authenticate('jwt', {session: false}), 
    (req, res) =>{
        const errors = {};
        Profile.findOne({ user: req.user.id })
        .populate('user', ['name', 'username'])
            .then(profile =>{
                if(!profile){
                    errors.noprofile = 'There is no profile for this User';
                    return res.status(404).json(errors);
                }
            }).catch(err => res.status(404).json(err));

});

//@route Post api/profile/handle/:handle
//@desc get all profile route
//@access public every one can see the profile
router.get('/all', (req, res) =>{
    const errors = {};
    Profile.find()
        .populate('user', ['name','username'])
        .then(profile =>{
            if(!profile){
                errors.profile = 'There is no profiles';
                return res.status(404).json()
            }
            res.json(profile);
        }).catch(err =>{
            res.status(404).json({profile: 'There are no profiles'});
        });
});

//@route Post api/profile/handle/:handle
//@desc get profile by handle route
//@access public every one can see the profile
router.get('/handle/:handle', (req, res) =>{
    const errors = {};
    Profile.findOne({handle: req.params.handle})
    .populate('user', ['name', 'username'])
    .then(profile=>{
        if(!profile){
            errors.noprofile = 'There is no profile for this user';
            res.status(404).json(errors);
        }
        res.json(profile)
    }).catch(err => res.status(404).json(err));
});

//@route Post api/profile/user/:user_id
//@desc get profile by handle route
//@access public every one can see the profile
router.get('/user/:user_id', (req, res) =>{
    const errors = {};
    Profile.findOne({user: req.params.user_id})
    .populate('user', ['name', 'username'])
    .then(profile=>{
        if(!profile){
            errors.noprofile = 'There is no profile for this user';
            res.status(404).json(errors);
        }
        res.json(profile)
    }).catch(err => res.status(404).json(err));
});


//@route Post api/profile/test
//@desc create or update profile route
//@access Private
router.post(
    '/', 
    passport.authenticate('jwt', {session: false}), 
    (req, res) =>{
        // errors validator
        const {errors, isValid} = validateProfileInput(req.body);

        if(!isValid){
            return res.status(400).json(errors);
        }
        //get fields
        const profileFields = {};
        profileFields.user = req.user.id;
        if(req.body.handle) profileFields.handle = req.body.handle;
        if(req.body.company) profileFields.company = req.body.company;
        if(req.body.website) profileFields.website = req.body.website;
        if(req.body.location) profileFields.location = req.body.location;
        if(req.body.status) profileFields.status = req.body.status;
        if(req.body.bio) profileFields.bio = req.body.bio;
        //Skills - split into array
        if(typeof req.body.skills !== 'undefined'){
            profileFields.skills = req.body.skills.split(',');
        }
        // Social
        profileFields.social = {};
        if(req.body.youtube) profileFields.social.youtube = req.body.youtube;
        if(req.body.website) profileFields.social.website = req.body.website;
        if(req.body.facebook) profileFields.social.facebook = req.body.facebook;
        if(req.body.twitter) profileFields.social.twitter = req.body.twitter;
        
        Profile.findOne({user: req.user.id})
            .then(profile =>{
                if(profile){
                    // Update
                    Profile.findOneAndUpdate(
                        {user: req.user.id},
                        {$set: profileFields},
                        {new: true}
                    ).then(profile => res.json(profile));
                }else{
                    //  Create

                    // check if handle exists
                    Profile.findOne({handle: profileFields.handle}).then(profile =>{
                        if(profile){
                            errors.handle = 'that handle already exists';
                            res.status(400).json(errors);
                        }

                        // save profile
                        new Profile(profileFields).save().then(profile => res.json(profile));
                    })
                }
            });

});

//@route Post api/profile/experience
//@desc add expirience
//@access Private
router.post('/expirience',  
    passport.authenticate('jwt', {session: false}), 
    (req, res) =>{
        // errors validator
        const {errors, isValid} = validateexpirienceInput(req.body);

        if(!isValid){
            return res.status(400).json(errors);
        }
        Profile.findOne({ user: req.user.id})
        .then(profile =>{
            const newExp = {
                title: req.body.title,
                company: req.body.company,
                location: req.body.location,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            }

            // add to exp array
            profile.exprience.unshift(newExp);

            Profile.save().then(profile => res.json(profile));
        }).catch(err => res.status(404).json(err));

});

//@route Post api/profile/education
//@desc add education
//@access Private
router.post('/edication',  
    passport.authenticate('jwt', {session: false}), 
    (req, res) =>{
        // errors validator
        const {errors, isValid} = validateeducationInput(req.body);

        if(!isValid){
            return res.status(400).json(errors);
        }
        Profile.findOne({ user: req.user.id})
        .then(profile =>{
            const newEdu = {
                school: req.body.school,
                degree: req.body.degree,
                fieldofstudy: req.body.fieldofstudy,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            }

            // add to exp array
            profile.education.unshift(newEdu);

            Profile.save().then(profile => res.json(profile));
        }).catch(err => res.status(404).json(err));

});

//@route DELETE api/profile/expirience
//@desc delete expirience
//@access Private
router.delete('/expirience/:exp_id',  
    passport.authenticate('jwt', {session: false}), 
    (req, res) =>{
    
        Profile.findOne({ user: req.user.id})
        .then(profile =>{
            // get remove index
            const removeIndex = profile.expirience
                .map(item => item.id)
                .indexOf(req.params.exp_id);

                // splice out index
                profile.expirience.splice(removeIndex, 1);

                // save
                Profile.save().then(profile => res.json(profile));
        }).catch(err => res.status(404).json(err));

});


//@route DELETE api/profile/education
//@desc delete education
//@access Private
router.delete('/education/:edu_id',  
    passport.authenticate('jwt', {session: false}), 
    (req, res) =>{
    
        Profile.findOne({ user: req.user.id})
        .then(profile =>{
            // get remove index
            const removeIndex = profile.education
                .map(item => item.id)
                .indexOf(req.params.edu_id);

                // splice out index
                profile.education.splice(removeIndex, 1);

                // save
                Profile.save().then(profile => res.json(profile));
        }).catch(err => res.status(404).json(err));

});


//@route DELETE api/profile
//@desc delete Profile
//@access Private
router.delete('/education/:edu_id',  
    passport.authenticate('jwt', {session: false}), 
    (req, res) =>{
    
        Profile.findOneAndRemove({ user: req.user.id})
        .then(() =>{
               
        }).catch(err => res.status(404).json(err));

});
module.exports = router;