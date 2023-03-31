const User = require('../models/User');
const Checking = require('../../accounts/models/Checking');
const Savings = require('../../accounts/models/Savings');
const Member = require('../../../models/Member');
const { validationResult } = require('express-validator');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const accountUtils = require('../../accounts/utils/accountUtils')


module.exports = {
    //create new member
    newMember: (req, res) => {
        return res.render('users/memberInfo')
    },

    //find member
    findMember: (req, res, next) => {
        Member.findById(id).then(member => {
            res.render('users/memberInfo', {member})
        })
    },

    //register new user
    register: (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('users/register', {error:accountUtils.registerErrors(errors.array())});
        }
        const { name, email, password } = req.body;
        User.findOne({ email }).then(user => {
            if (user) {
                return res.render('users/register', {error:'User exists'});
            } else {
                const newUser = new User();
                newUser.profile.name = name;
                newUser.email = email;
                newUser.password = password;
                newUser
                .save()
                .then((user) => {
                    //create a checking account
                    const checking = new Checking();
                    checking.owner = user._id;
                    checking.accountNumber = accountUtils.generateAccountNumber();
                    checking.save()
                    user.checkingBalance = checking.balance;
                    return user
                })
                .then((user) => {
                    //create a savings account
                    const savings = new Savings();
                    savings.owner = user._id;
                    savings.accountNumber = accountUtils.generateAccountNumber();
                    savings.save()
                    user.savingsBalance = savings.balance;
                    user.save()
                    return user
                })
                .then(user => {
                    req.login(user, err => {
                        if (err) {
                            return res
                            .status(400)
                            .json({ confirmation: false, message: err });
                        } else {
                            res.redirect('/auth/options');
                        }
                    });
                })
                .catch(err => {
                    return next(err);
                });
            }
        })
        .catch(err => reject(err));
    },

    //render profile page
    profilePage: (req, res, next) => {
        if (req.isAuthenticated()) {
            return res.render('auth/profile');
        } else {
            return res.redirect('/fail');
        }
    },

    //render update profile page
    updateProfilePage: (req, res) => {
        if (req.isAuthenticated()) {
            return res.render('auth/updateProfile');
        }
        return res.redirect('/fail');
    },
    
    //update profile
    updateProfile: (params, id) => {
        const {
            name,
            email,
            address,
            oldPassword,
            newPassword,
            repeatNewPassword
        } = params;
        return new Promise((resolve, reject) => {
            User.findById(id)
            .then(user => {
                if (name) user.profile.name = name;
                if (email) user.email = email;
                if (address) user.address = address;
                return user;
            })
            .then(user => {
                user.save().then(user => {
                resolve(user);
                });
            })
            .catch(err => reject(err));
        }).catch(err => reject(err));
    },
    
    //update password
    updatePassword: (params, id) => {
        return new Promise((resolve, reject) => {
            User.findById(id)
            .then(user => {
                if (
                !params.oldPassword ||
                !params.newPassword ||
                !params.repeatNewPassword
                ) {
                    reject('All password inputs must be filled');
                } else if (params.newPassword !== params.repeatNewPassword) {
                    reject('New passwords do not match');
                } else {
                    bcrypt
                    .compare(params.oldPassword, user.password)
                    .then(result => {
                        if (result === false) {
                            reject('Old Password Incorrect');
                        } else {
                            user.password = params.newPassword;
                            user
                            .save()
                            .then(user => {
                                resolve(user);
                            })
                            .catch(err => {
                                throw new Error(err);
                            });
                        }
                    })
                    .catch(err => {
                        throw new Error(err);
                    });
                }
            })
            .catch(err => {
                reject(err);
            });
        });
    },

    //render login page
    loginPage:(req, res) => {
        return res.render('users/login', { error:null});
    },
    
    //render members page
    membersPage:(req, res) => {
        return res.render('users/members', { error:null});
    },
    
    //render member info page
    memberInfoPage:(req, res) => {
        return res.render('users/memberInfo', { error:null});
    },

    //login user
    login: passport.authenticate('local-login', {
        successRedirect: '/auth/options',
        failureRedirect: 'loginError',
        failureFlash: true
    }),

    //render login error page
    loginError: (req, res) => {
        res.render('users/login', {error: 'Please check that you are registered and are using the correct email address and password.'})
    },

    //logout user, end session
    logout:(req, res) => {
        req.session.destroy();
        console.log('logout ', req.session);
        req.logout();
        return res.redirect('/');
    }
}