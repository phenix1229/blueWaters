const Member = require('../../../models/Member');
const Transaction = require('../../../models/Transaction');
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
    saveTransaction: async (req, res, next) => {
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
    
    //render members page
    membersPage:(req, res) => {
        return res.render('users/members', { error:null});
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