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

    //create invoice
    createInvoice: (req, res, next) => {
        const {memberEmail, year, month} = req.body;
        let currentMember = {};
        const transArray = [];
        let bFees = 0;
        let rFees = 0;
        let psFees = 0;
        let tglFees = 0;
        let feeMet = false;
        let monthlyFee = 0;
        let minMonthlyCharge = 0;
        let totalFees = 0;
        Member.findOne({email:memberEmail}).then(member => {
            if(member){
                Transaction.find({memberID:member._id}).then(transactions => {
                    transactions.forEach(item => {
                        const tDate = String(item.date);
                        if(tDate.slice(11,15) === year){
                            if(tDate.slice(4,7) === month){
                                transArray.push(item);
                                switch (item.location){
                                    case "bar":
                                        bFees += item.amount;
                                        break;
                                    case "restaurant":
                                        rFees += item.amount;
                                        break;
                                    case "proShop":
                                        psFees += item.amount;
                                        break;
                                    case "tennis/golf lessons":
                                        tglFees += item.amount;
                                        break;
                                }
                            }
                        }
                    })
                    return currentMember = member;
                }).then(currentMember => {
                    MemberFee.findOne({membershipType:currentMember.membershipType})
                    .then(feeType => {
                        monthlyFee = feeType.monthlyFee;
                        minMonthlyCharge = feeType.minMonthlyCharge;
                        if(minMonthlyCharge < (bFees+rFees+psFees+tglFees)){
                            feeMet = true;
                            totalFees = monthlyFee + (bFees+rFees+psFees+tglFees);
                        } else {
                            totalFees = monthlyFee + minMonthlyCharge;
                        }
                        return res.render('users/monthlyInvoice', {monthlyFee,minMonthlyCharge,feeMet,subtotal:(bFees+rFees+psFees+tglFees),totalFees,transArray,member:currentMember, error:null});
                    })
                })
            } else {
                return res.render('users/memberInvoices', {error:"No user with this email found"})
            }
        }).catch(err => {
            next (err);
        });
    },
    
    //create monthly summary
    createMonthlySummary: (req, res, next) => {
        const {year, month} = req.body;
        let bFees = 0;
        let rFees = 0;
        let psFees = 0;
        let tglFees = 0;
        Transaction.find().then(trans => {
                trans.forEach(item => {
                    const tDate = String(item.date);
                    if(tDate.slice(11,15) === year){
                        if(tDate.slice(4,7) === month){
                            switch (item.location){
                                case "bar":
                                    bFees += item.amount;
                                    break;
                                case "restaurant":
                                    rFees += item.amount;
                                    break;
                                case "proShop":
                                    psFees += item.amount;
                                    break;
                                case "tennis/golf lessons":
                                    tglFees += item.amount;
                                    break;
                            }
                        }
                    }
                })
                    return res.render('users/monthlySummary', {month,year,bFees,rFees,psFees,tglFees,totalFees:(bFees+rFees+psFees+tglFees), error:null});
        }).catch(err => {
            next (err);
        });
    },
    
    //create daily summary
    createDailySummary: (req, res, next) => {
        const {year, month, day} = req.body;
        if(year.length < 4 || year.length > 4 || Number(year) === NaN){
            res.render('users/createDailySummary', {error:"Please enter four digit year."})
        }
        let bFees = 0;
        let rFees = 0;
        let psFees = 0;
        let tglFees = 0;
        Transaction.find().then(trans => {
                trans.forEach(item => {
                    const tDate = String(item.date);
                    if(tDate.slice(11,15) === year && tDate.slice(4,7) === month && tDate.slice(8,10) === day){
                        switch (item.location){
                            case "bar":
                                bFees += item.amount;
                                break;
                            case "restaurant":
                                rFees += item.amount;
                                break;
                            case "proShop":
                                psFees += item.amount;
                                break;
                            case "tennis/golf lessons":
                                tglFees += item.amount;
                                break;
                        }
                    }
                })
            return res.render('users/dailySummary', {month,year,day,bFees,rFees,psFees,tglFees,totalFees:(bFees+rFees+psFees+tglFees), error:null});
        }).catch(err => {
            next (err);
        });
    },

    //create monthly member sales summary
    createMonthlyMemberSales: async (req, res, next) => {
        const {year, month} = req.body;
        const salesList = [[],[]];
        let memTotal = 0;
        const members = await Member.find()
        for(let i = 0; i < members.length; i++){
            salesList[0].push([`${members[i].lastName}, ${members[i].firstName}`]);
            const trans = await Transaction.find({memberID:members[i]._id})
            for(item of trans){
                const tDate = String(item.date)
                if(tDate.slice(11,15) === year && tDate.slice(4,7) === month){
                    memTotal += item.amount;
                }
            }
            salesList[1].push(memTotal);
            memTotal = 0
        }
        return res.render('users/monthlyMemberSales',{month, year, salesList, error:null})
    },

    //render members page
    membersPage: (req, res) => {
        return res.render('users/members', { error:null});
    },
    
    //render member fees page
    memberFeesPage: (req, res) => {
        return res.render('users/memberFees', { error:null});
    },
    
    //render transactions page
    transactionsPage: (req, res) => {
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

    //render reports page
    reportsPage: (req, res) => {
        res.render('users/reports');
    },
    
    //render member invoices page
    memberInvoicesPage: (req, res) => {
        res.render('users/memberInvoices', {error:null});
    },

    //render monthly invoice page
    monthlyInvoicePage: (req, res) => {
        return res.render('users/monthlyInvoice', {month,year,subtotal:0,totalFees:0,transArray:[],member:{}, error:null});
    },
    
    //render monthly summary page
    monthlySummaryPage: (req, res) => {
        return res.render('users/monthlySummary', {month:"",year:"",rFees:0,bFees:0,psFees:0,tglFees:0,totalFees:0, error:null});
    },
    
    //render create monthly summary page
    createMonthlySummaryPage: (req, res) => {
        return res.render('users/createMonthlySummary', {error:null});
    },
    
    //render daily summary page
    dailySummaryPage: (req, res) => {
        return res.render('users/dailySummary', {month:"",year:"",day:"",rFees:0,bFees:0,psFees:0,tglFees:0,totalFees:0, error:null});
    },
    
    //render create daily summary page
    createDailySummaryPage: (req, res) => {
        return res.render('users/createDailySummary', {error:null});
    },
    
    //render create monthly member sales page
    createMonthlyMemberSalesPage: (req, res) => {
        return res.render('users/createMonthlyMemberSales', {error:null});
    },
    
    //render monthly member sales page
    monthlyMemberSalesPage: (req, res) => {
        return res.render('users/monthlyMemberSales', {month:"",year:"",salesList:[], error:null});
    },

    //render login error page
    loginError: (req, res) => {
        res.render('users/login', {error: 'Please check that you are registered and are using the correct email address and password.'})
    },

}