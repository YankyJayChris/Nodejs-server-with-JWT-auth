const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

//load Input Validator
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

//load User model
const User = require('../../models/User');

//@route GET api/users/test
//@desc Test users route
//@access Public
router.get('/register', (req, res) => res.json({msg: "Users Works"}));

//@route GET api/users/test
//@desc register users route
//@access Public
router.post('/register', (req, res) => {
    const {errors, isValid} = validateRegisterInput(req.body);

    if(!isValid){
        return res.status(400).json(errors);
    }

    User.findOne({ email: req.body.email})
        .then(user => {
            if(user){
                errors.email = 'Email Already exist';
                return res.status(400).json(errors);
            }else{
                const newUser = new User({
                    name: req.body.name,
                    username: req.body.username,
                    email: req.body.email,
                    password: req.body.password
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err));
                    })
                })
            }
        })
});

//@route GET api/users/login
//@desc login user || returning jwt token
//@access Public
router.post('/login', (req, res) => {
    const {errors, isValid} = validateLoginInput(req.body);

    if(!isValid){
        return res.status(400).json(errors);
    }


    const email = req.body.email;
    const password = req.body.password;

    //Find user by email
    User.findOne({email})
        .then(user =>{
            //check for user
            if(!user){
                errors.email ='User not Found';
                return res.status(404).json(errors);
            }

            //check password 
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if(isMatch){
                        //user match 
                        const payload = {id: user.id, name: user.name, username: user.username} // create jwt payload

                        //sign token
                        jwt.sign(
                            payload, 
                            keys.secretOrKey, 
                            {expiresIn: 36000}, 
                            (err, token) =>{
                                res.json({
                                success: true,
                                token:'Bearer ' + token
                                });

                            });
                    }else{
                        errors.password = 'Password incorrect'
                        return res.status(400).json(errors);
                    }
                })
        })

});

//@route GET api/users/current
//@desc return current user
//@access Pivate
router.get(
    '/current', 
    passport.authenticate('jwt', {session: false}), 
    (req, res) =>{
    res.json({
        id: req.user.id,
        name: req.user.name,
        username: req.user.username,
        email: req.user.email
    });
});

module.exports = router;