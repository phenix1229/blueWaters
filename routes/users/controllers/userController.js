const Member = require('../../../models/Member');
const Transaction = require('../../../models/Transaction');
const MemberFee = require('../../../models/MemberFee');
const utils = require('../utils/userUtils');


module.exports = {
    //create new member
    newMember: async (req, res) => {
        const memberFees = await MemberFee.find();
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
        return res.render('users/createMember', {member, memberFees:memberFees, error:null})
    },

    //find member
    findMember: (req, res, next) => {
        const {memberEmail} = req.body;
        Member.findOne({email:memberEmail.toUpperCase()}).then(member => {
            if(member){
                return res.render('users/updateMember', {member, error:null})
            } else {
                return res.render('users/members', {error:"No member with this email found"})
            }
        }).catch(err => {
            next (err);
        });
    },

    //register new member
    saveMember: async (req, res, next) => {
        const { typeID, lastName, firstName, address, city, state, zipCode, phoneNumber, cellNumber, email, membershipType, membershipStatus } = req.body;
        if(typeID.trim() === "" || lastName.trim() === "" || firstName.trim() === "" || address.trim() === "" || city.trim() === "" || state.trim() === "" || zipCode.trim() === "" || phoneNumber.trim() === "" || cellNumber.trim() === "" || email.trim() === "" || membershipType.trim() === "" || membershipStatus.trim() === ""){
            const memberFees = await MemberFee.find();
            return res.render('users/createMember', {member:req.body, memberFees, error:"Please complete all fields"})
        }
        const exists = await Member.findOne({ email:email.toUpperCase() });
            if(exists){
                return res.render('users/createMember', {member:req.body, error:'Member using this email exists'});
            }
            else {
                const newMember = new Member();
                newMember.typeID = typeID;
                newMember.lastName = lastName.toUpperCase();
                newMember.firstName = firstName.toUpperCase();
                newMember.address = address.toUpperCase();
                newMember.city = city.toUpperCase();
                newMember.state = state.toUpperCase();
                newMember.zipCode = zipCode;
                newMember.phoneNumber = phoneNumber;
                newMember.cellNumber = cellNumber;
                newMember.email = email.toUpperCase();
                newMember.membershipType = membershipType;
                newMember.membershipStatus = membershipStatus;
                newMember.save().then((newMember) => {
                    return res.render('users/success', {message:"Member created.", item:JSON.stringify(newMember).split(",")})
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
            if(req.body.lastName !== '') member.lastName = lastName.toUpperCase();
            if(req.body.firstName !== '') member.firstName = firstName.toUpperCase();
            if(req.body.address !== '') member.address = address.toUpperCase();
            if(req.body.city !== '') member.city = city.toUpperCase(); 
            if(req.body.state !== '') member.state = state.toUpperCase();
            if(req.body.zipCode !== '') member.zipCode = zipCode;
            if(req.body.phoneNumber !== '') member.phoneNumber = phoneNumber;
            if(req.body.cellNumber !== '') member.cellNumber = cellNumber;
            if(req.body.email !== '') member.email = email.toUpperCase();
            if(req.body.membershipType !== '') member.membershipType = membershipType;
            if(req.body.membershipStatus !== '') member.membershipStatus = membershipStatus;
            member.save().then(member => {
                return res.render('users/success', {message:"Member updated.", item:JSON.stringify(member).split(",")})
            })
        })
        .catch(err => {
            return next(err);
        });
    },

    //find transactions
    findTransactions: (req, res) => {
        const {memberEmail, month, year} = req.body;
        Member.findOne({email:memberEmail.toUpperCase()}).then(member => {
            if(year.trim() === "" || year.trim().length < 4 || year.trim().length > 4 || Number(year.trim()) === NaN){
                return res.render('users/transactions', {error:"Please enter 4 digit year."});
            }
            if(member){
                Transaction.find({memberID:member._id}).then(transactions => {
                    const transList = [];
                    transactions.forEach(item => {
                        const tDate = String(item.date);
                        if(tDate.slice(11,15) === year && tDate.slice(4,7) === month){
                                transList.push(item);
                        }
                    });
                    if(transList.length > 0){
                        return res.render('users/memberTransactions', {member, month, year, transList, error:null});
                    } else if(transList.length <= 0){
                        return res.render('users/transactions', {member, month, year, transList, error:"No transactions found."});
                    }
                })
            }
        }).catch(err => {
            next (err);
        });
    },

    findTransaction: (req, res, next) => {
        const { transID } = req.body;
        Transaction.findOne({_id:transID}).then(trans => {
            return res.render('users/updateTransaction', {trans, error:null})
        }).catch(err => {
            next (err);
        });
    },

    //update transaction
    updateTransaction: (req, res, next) => {
        const { _id, memberID, date, location, description, amount } = req.body;
        Transaction.findById({_id:_id})
        .then(trans => {
            if(req.body.memberID !== '') trans.memberID = memberID;
            if(req.body.date !== '') trans.date = date;
            if(req.body.location !== '') trans.location = location.toUpperCase();
            if(req.body.description !== '') trans.description = description.toUpperCase();
            if(req.body.amount !== '') trans.amount = amount;
            trans.save().then((trans) => {
                return res.render('users/success', {message:"Transaction updated.", item:JSON.stringify(trans).split(",")})
            })
        })
        .catch(err => {
            return next(err);
        });
    },

    //save transaction
    saveTransaction: (req, res, next) => {
    const { memberID, date, location, description, amount } = req.body;
    if(location.trim() === "" || description.trim() === "" || amount.trim() === ""){
        return res.render('users/newTransaction', {transaction:req.body, error:"Please complete all fields."})
    }
    if(utils.properAmount(amount) === false){
        return res.render('users/newTransaction', {transaction:req.body, error:"Please enter amount in 2 decimal format (ex. 1.00)."})
    }
    Member.findOne({ email:memberID.toUpperCase() }).then(member => {
        if(member){
            const newTransaction = new Transaction();
            newTransaction.memberID = member._id;
            newTransaction.date = date;
            newTransaction.location = location.toUpperCase();
            newTransaction.description = description.toUpperCase();
            newTransaction.amount = amount;
            newTransaction.save().then((newTransaction) => {
                return res.render('users/success', {message:"Transaction created.", item:JSON.stringify(newTransaction).split(",")})
            })
            } else {
                return res.render('users/newTransaction', {transaction:req.body, error:'Member does not exist'})
            }
        })
        .catch(err => {
            return next(err);
        });
    },
    
    //new member fee
    newMemberFee: async (req,res) => {
        const existingFees = await MemberFee.find();
        const nextNum = existingFees.sort((a, b) => a.typeID - b.typeID)[existingFees.length - 1].typeID + 1;
        const fee = {
            typeID:"",
            membershipType:"",
            monthlyFee:"",
            minMonthlyCharge:""
        }
        res.render('users/newMemberFee', {fee, nextNum, error:null});
    },

    //save new member fee
    saveMemberFee: (req, res, next) => {
    const { typeID, membershipType, monthlyFee, minMonthlyCharge } = req.body;
    if(typeID.trim() === "" || membershipType.trim() === "" || monthlyFee.trim() === "" || minMonthlyCharge.trim() === ""){
        return res.render('users/newMemberFee', {fee:req.body, error:"Please complete all fields"})
    }
    MemberFee.findOne({ membershipType:membershipType.toUpperCase() }).then(memberFee => {
        if(memberFee){
            res.render('users/newMemberFee', {fee, error:'Fee of this type exists'})
        } else {}
            const newMemberFee = new MemberFee();
            newMemberFee.typeID = typeID;
            newMemberFee.membershipType = membershipType.toUpperCase();
            newMemberFee.monthlyFee = monthlyFee;
            newMemberFee.minMonthlyCharge = minMonthlyCharge;
            newMemberFee.save().then((newMemberFee) => {
                return res.render('users/success', {message:"Member fee created.", item:JSON.stringify(newMemberFee).split(",")})
            })
        })
        .catch(err => {
            return next(err);
        });
    },

    //find member fee
    findMemberFee: (req, res, next) => {
        const {feeType} = req.body;
        MemberFee.findOne({membershipType:feeType.toUpperCase()}).then(fee => {
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
            if(req.body.membershipType !== '') fee.membershipType = membershipType.toUpperCase();
            if(req.body.monthlyFee !== '') fee.monthlyFee = monthlyFee;
            if(req.body.minMonthlyCharge !== '') fee.minMonthlyCharge = minMonthlyCharge;
            fee.save().then((fee) => {
                return res.render('users/success', {message:"Member fee updated.", item:JSON.stringify(fee).split(",")})
            })
        })
        .catch(err => {
            return next(err);
        });
    },

    //select report
    selectReport: (req, res) => {
        const { reportType } = req.body;
        return res.render(reportType, {error:null});
    },

    //create invoice
    createInvoice: (req, res, next) => {
        const {memberEmail, year, month} = req.body;
        if(year.length < 4 || year.length > 4 || Number(year) === NaN){
            return res.render('users/memberInvoices', {error:"Please enter 4 digit year."})
        }
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
        Member.findOne({email:memberEmail.toUpperCase()}).then(member => {
            if(member){
                Transaction.find({memberID:member._id}).then(transactions => {
                    transactions.forEach(item => {
                        const tDate = String(item.date);
                        if(tDate.slice(11,15) === year && tDate.slice(4,7) === month){
                            transArray.push(item);
                            switch (item.location){
                                case "BAR":
                                    bFees += Number(item.amount);
                                    break;
                                case "RESTAURANT":
                                    rFees += Number(item.amount);
                                    break;
                                case "PRO SHOP":
                                    psFees += Number(item.amount);
                                    break;
                                case "TENNIS/GOLF LESSONS":
                                    tglFees += Number(item.amount);
                                    break;
                            }
                        }
                    })
                    return currentMember = member;
                }).then(currentMember => {
                    MemberFee.findOne({membershipType:currentMember.membershipType.toUpperCase()})
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
        if(year.length < 4 || year.length > 4 || Number(year) === NaN){
            res.render('users/createMonthlySummary', {error:"Please enter four digit year."})
        }
        let bFees = 0;
        let rFees = 0;
        let psFees = 0;
        let tglFees = 0;
        Transaction.find().then(trans => {
                trans.forEach(item => {
                    const tDate = String(item.date);
                    if(tDate.slice(11,15) === year && tDate.slice(4,7) === month){
                        switch (item.location){
                            case "BAR":
                                bFees += Number(item.amount);
                                break;
                            case "RESTAURANT":
                                rFees += Number(item.amount);
                                break;
                            case "PRO SHOP":
                                psFees += Number(item.amount);
                                break;
                            case "TENNIS/GOLF LESSONS":
                                tglFees += Number(item.amount);
                                break;
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
                            case "BAR":
                                bFees += Number(item.amount);
                                break;
                            case "RESTAURANT":
                                rFees += Number(item.amount);
                                break;
                            case "PRO SHOP":
                                psFees += Number(item.amount);
                                break;
                            case "TENNIS/GOLF LESSONS":
                                tglFees += Number(item.amount);
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
        if(year.length < 4 || year.length > 4 || Number(year) === NaN){
            res.render('users/createMonthlyMemberSales', {error:"Please enter four digit year."})
        }
        const salesList = [[],[]];
        let memTotal = 0;
        const members = await Member.find()
        for(let i = 0; i < members.length; i++){
            salesList[0].push([`${members[i].lastName}, ${members[i].firstName}`]);
            const trans = await Transaction.find({memberID:members[i]._id})
            for(item of trans){
                const tDate = String(item.date)
                if(tDate.slice(11,15) === year && tDate.slice(4,7) === month){
                    memTotal += Number(item.amount);
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
    memberFeesPage: async (req, res) => {
        const feeTypes = await MemberFee.find();
        return res.render('users/memberFees', {feeTypes, error:null});
    },

    //render transactions page
    transactionsPage: (req, res) => {
        return res.render('users/transactions', { error:null});
    },

    //render member transaction list page
    memberTransactionsPage: (req, res) => {
        const { member, month, year, transList } = req.body
        return res.render('users/memberTransactions', {member, month, year, transList, error:null})
    },
    
    //render new transaction page
    newTransactionPage: (req, res) => {
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
        return res.render('users/newTransaction', { transaction, error:null});
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

    //render success page
    successPage: (req, res) => {
        return res.render('users/success', {message:null, item:null});
    }

}