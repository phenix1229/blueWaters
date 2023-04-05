const Member = require('../../../models/Member');
const Transaction = require('../../../models/Transaction');
const MemberFee = require('../../../models/MemberFee');
const { validationResult } = require('express-validator');


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

    //register new member
    saveMember: async (req, res, next) => {
        const { typeID, lastName, firstName, address, city, state, zipCode, phoneNumber, cellNumber, email, membershipType, membershipStatus } = req.body;
        const exists = await Member.findOne({ email });
            if(exists){
                return res.render('users/createMember', {member:req.body, error:'Member using this email exists'});
            } 
            else {
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
                newMember.save().then(() => {
                    return res.redirect('/')
                })
                .catch(err => {
                    return next(err);
                });
            }
    },
    
    //update member profile
    updateMember: (req, res, next) => {
        const { memberID, typeID, lastName, firstName, address, city, state, zipCode, phoneNumber, cellNumber, email, membershipType, membershipStatus} = req.body;
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

    //save transaction
    saveTransaction: (req, res, next) => {
    const { memberID, date, location, description, amount } = req.body;
    Member.findOne({ email:memberID }).then(member => {
        if(member){
            const newTransaction = new Transaction();
            newTransaction.memberID = member._id;
            newTransaction.date = date;
            newTransaction.location = location;
            newTransaction.description = description;
            newTransaction.amount = amount;
            newTransaction.save().then(() => {
                return res.redirect('/')
            })
            } else {
                return res.render('users/transactions', {transaction:req.body, error:'Member does not exist'})
            }
        })
        .catch(err => {
            return next(err);
        });
    },
    
    //new member fee
    newMemberFee: (req,res) => {
        const fee = {
            typeID:"",
            membershipType:"",
            monthlyFee:"",
            minMonthlyCharge:""
        }
        res.render('users/newMemberFee', {fee, error:null});
    },

    //save new member fee
    saveMemberFee: (req, res, next) => {
    const { typeID, membershipType, monthlyFee, minMonthlyCharge } = req.body;
    MemberFee.findOne({ membershipType }).then(memberFee => {
        if(memberFee){
            res.render('users/newMemberFee', {fee, error:'Fee of this type exists'})
        } else {}
            const newMemberFee = new MemberFee();
            newMemberFee.typeID = typeID;
            newMemberFee.membershipType = membershipType;
            newMemberFee.monthlyFee = monthlyFee;
            newMemberFee.minMonthlyCharge = minMonthlyCharge;
            newMemberFee.save().then(() => {
                return res.redirect('/')
            })
        })
        .catch(err => {
            return next(err);
        });
    },

    //find member fee
    findMemberFee: (req, res, next) => {
        const {feeType} = req.body;
        MemberFee.findOne({membershipType:feeType}).then(fee => {
            if(fee){
                return res.render('users/updateMemberFees', {fee, error:null})
            } else {
                return res.render('users/memberFees', {error:"No fee of this type found"})
            }
        }).catch(err => {
            next (err);
        });
    },

    //update member fee
    updateMemberFee: (req, res, next) => {
        const { ID, typeID, membershipType, monthlyFee, minMonthlyCharge } = req.body;
        MemberFee.findById({_id:ID})
        .then(fee => {
            if(req.body.typeID !== '') fee.typeID = typeID;
            if(req.body.membershipType !== '') fee.membershipType = membershipType;
            if(req.body.monthlyFee !== '') fee.monthlyFee = monthlyFee;
            if(req.body.minMonthlyCharge !== '') fee.minMonthlyCharge = minMonthlyCharge;
            fee.save().then(() => {
                return res.redirect('/');
            })
        })
        .catch(err => {
            return next(err);
        });
    },
    
    //render members page
    membersPage:(req, res) => {
        return res.render('users/members', { error:null});
    },
    
    //render member fees page
    memberFeesPage:(req, res) => {
        return res.render('users/memberFees', { error:null});
    },
    
    //render transactions page
    transactionsPage:(req, res) => {
        const today = () =>{
            return `${new Date().getMonth()+1}/${new Date().getDate()}/${new Date().getFullYear()}`;
        };
        const transaction = {
            memberID: "",
            date:today(),
            location:"",
            description:"",
            amount:""
        }
        return res.render('users/transactions', { transaction, error:null});
    },

    //render login error page
    loginError: (req, res) => {
        res.render('users/login', {error: 'Please check that you are registered and are using the correct email address and password.'})
    },

}