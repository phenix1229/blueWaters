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
        const member = {
            typeID: null,
            lastName:"",
            firstName:"",
            address:"",
            city:"",
            state:"",
            zipCode:"",
            phoneNumber:"",
            cellNumber:"",
            email:"",
            membershipType:"",
            membershipStatus:""
        }
        return res.render('users/createMember', {member, error:null})
    },

    //find member
    findMember: (req, res, next) => {
        const {memberEmail} = req.body;
        Member.findOne({email:memberEmail}).then(member => {
            if(member){
                return res.render('users/updateMember', {member, error:null})
            } else {
                return res.render('users/members', {error:"No user with this email found"})
            }
        }).catch(err => {
            next (err);
        });
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

    //register new member
    saveMember: (req, res, next) => {
        const { typeID, lastName, firstName, address, city, state, zipCode, phoneNumber, cellNumber, email, membershipType, membershipStatus } = req.body;
        Member.findOne({ email }).then(member => {
            if(member){
                return res.render('users/createMember', {member:req.body, error:'Member using this email exists'});
            } else {
                const newMember = new Member();
                newMember.typeID = typeID;
                newMember.lastName = lastName;
                newMember.firstName = firstName;
                newMember.address = address;
                newMember.city = city;
                newMember.state = state;
                newMember.zipCode = zipCode;
                newMember.phoneNumber = phoneNumber;
                newMember.cellNumber = cellNumber;
                newMember.email = email;
                newMember.membershipType = membershipType;
                newMember.membershipStatus = membershipStatus;
                newMember
                .save();
            }
        })
        return res.redirect('/')
        .catch(err => {
            return next(err);
        });
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
    
    //update member profile
    updateMember: (req, res, next) => {
        const { memberID, typeID, lastName, firstName, address, city, state, zipCode, phoneNumber, cellNumber, email, membershipType, membershipStatus} = req.body;
            console.log(req.body);
            Member.findById({_id:memberID})
            .then(member => {
                if(req.body.typeID !== '') member.typeID = typeID;
                if(req.body.lastName !== '') member.lastName = lastName;
                if(req.body.firstName !== '') member.firstName = firstName;
                if(req.body.address !== '') member.address = address;
                if(req.body.city !== '') member.city = city; 
                if(req.body.state !== '') member.state = state;
                if(req.body.zipCode !== '') member.zipCode = zipCode;
                if(req.body.phoneNumber !== '') member.phoneNumber = phoneNumber;
                if(req.body.cellNumber !== '') member.cellNumber = cellNumber;
                if(req.body.email !== '') member.email = email;
                if(req.body.membershipType !== '') member.membershipType = membershipType;
                if(req.body.membershipStatus !== '') member.membershipStatus = membershipStatus;
                member.save();
                });
                return res.redirect('/')
                    .catch(err => {
                        return next(err);
                    });
            },
    // },
    // updateMember: (params) => {
    //     const { typeID, lastName, firstName, address, city, state, zipCode, phoneNumber, cellNumber, email, membershipType, membershipStatus} = params;
    //     return new Promise((resolve, reject) => {
    //         Member.findOne({email})
    //         .then(member => {
    //             if(typeID) member.typeID = typeID;
    //             if(lastName) member.lastName = lastName;
    //             if(firstName) member.firstName = firstName;
    //             if(address) member.address = address;
    //             if(city) member.city = city;
    //             if(state) member.state = state;
    //             if(zipCode) member.zipCode = zipCode;
    //             if(phoneNumber) member.phoneNumber = phoneNumber;
    //             if(cellNumber) member.cellNumber = cellNumber;
    //             if(email) member.email = email;
    //             if(membershipType) member.membershipType = membershipType;
    //             if(membershipStatus) member.membershipStatus = membershipStatus;
    //             return member;
    //         })
    //         .then(member => {
    //             member.save().then(member => {
    //             resolve(member);
    //             });
    //         })
    //         .catch(err => reject(err));
    //     }).catch(err => reject(err));
    // },
    
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
        const member = req.body;
        return res.render('users/memberInfo', {member, error:null});
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