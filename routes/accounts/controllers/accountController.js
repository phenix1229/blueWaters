require('../../../lib/passport');
const User = require('../../users/models/User');
const Checking = require('../models/Checking');
const CheckingTrans = require('../models/CheckingTransaction');
const CheckingStatement = require('../models/CheckingStatement');
const Savings = require('../models/Savings');
const SavingsTrans = require('../models/SavingsTransaction');
const SavingsStatement = require('../models/SavingsStatement');
const utils = require('../utils/accountUtils');


module.exports = {

    //render options page
    options: (req, res) => {
        if(req.isAuthenticated()){
            const id = req.user._id;
            utils.getBalances(id);
            return res.render('auth/options', {cBalance, sBalance, user:req.user.profile.name});
        } else {
            return res.redirect('/fail');
        };
    },

    //render credit and debit page
    creditDebitPage: (req, res) => {
        if(req.isAuthenticated()){
            const id = req.user._id;
            utils.getBalances(id);
            return res.render('auth/creditDebit', {cBalance, sBalance, user:req.user.profile.name, error:null});
        } else {
            return res.redirect('/fail');
        };
    },

    //post transaction to account
    transaction: (req, res, next) => {
        const {dollarAmount, description, debtOrCred, acctChoice, } = req.body;
        const id = req.user._id;
        const adjDolAmt = utils.adjAmount(dollarAmount);
        if(utils.checkForNumbers(dollarAmount)){
            return res.render('auth/creditDebit', {cBalance, sBalance, user:req.user.profile.name, error:'Please enter dollar amount as a number. Example: 100.00'});
        }
        if(!description){
            return res.render('auth/creditDebit', {cBalance, sBalance, user:req.user.profile.name, error:'Please enter a description of transaction for records.'});
        }
        if(acctChoice === 'checking'){
            Checking.findOne({owner:id})
                .then((acct) => {
                    if(debtOrCred === 'withdrawal'){
                        if(Number(acct.balance) - Number(adjDolAmt) < 0){
                            return res.render('auth/creditDebit', {cBalance, sBalance, user:req.user.profile.name, error:'Cannot complete transaction. Not enough funds.'});
                        } else {
                            acct.balance = (Number(acct.balance) - Number(adjDolAmt)).toFixed(2);
                        };
                    } else if (debtOrCred === 'deposit'){
                        acct.balance = (Number(acct.balance) + Number(adjDolAmt)).toFixed(2);
                    };
                    acct.save()
                    .then((acct) => {
                        const newTrans = new CheckingTrans();
                        newTrans.owner = acct._id;
                        newTrans.transType = debtOrCred;
                        newTrans.description = description;
                        newTrans.amount = adjDolAmt;
                        newTrans.newBalance = acct.balance;
                        newTrans.save()
                        .then(() => {
                            return res.redirect('/auth/creditDebit');
                        })
                        .catch(err => {
                            next (err);
                        });
                    })
            })
        } else if (acctChoice === 'savings'){
            const id = req.user._id;
            Savings.findOne({owner:id})
                .then((acct) => {
                    if(debtOrCred === 'withdrawal'){
                        if(Number(acct.balance) - Number(adjDolAmt) < 0){
                            return res.render('auth/creditDebit', {cBalance, sBalance, user:req.user.profile.name, error:'Cannot complete transaction. Not enough funds.'});
                        } else {
                            acct.balance = (Number(acct.balance) - Number(adjDolAmt)).toFixed(2);
                        };
                    } else if (debtOrCred === 'deposit'){
                        acct.balance = (Number(acct.balance) + Number(adjDolAmt)).toFixed(2);
                    };
                    acct.save()
                    .then((acct) => {
                        const newTrans = new SavingsTrans();
                        newTrans.owner = acct._id;
                        newTrans.transType = debtOrCred;
                        newTrans.description = description;
                        newTrans.amount = adjDolAmt;
                        newTrans.newBalance = acct.balance;
                        newTrans.save()
                    .then(() => {
                        return res.redirect('/auth/creditDebit');
                    })
                    .catch(err => {
                        next (err);
                    });
                })
            })
        }
    },
    
    //render transfer page
    transferPage: (req, res) => {
        if(req.isAuthenticated()){
            const id = req.user._id;
            utils.getBalances(id);
            return res.render('auth/transfer', {cBalance, sBalance, user:req.user.profile.name, error:null})
        }else {
            return res.redirect('/fail');
        };
    },

    //post transfers between checking/savings accounts
    transfer: (req, res, next) => {
        const {transAmount, transFrom, transTo} = req.body;
        const adjAmount = utils.adjAmount(transAmount);
        if(utils.checkForNumbers(transAmount)){
            return res.render('auth/transfer', {cBalance, sBalance, user:req.user.profile.name, error:'Please enter transfer amount as a number. Example: 100.00'})
        }
        if(transFrom === 'checking'){
            const id = req.user._id;
            Checking.findOne({owner:id})
                .then((acct) => {
                    if(transTo === 'savings'){
                            if(Number(acct.balance) - Number(adjAmount) < 0){
                                return res.render('auth/transfer', {cBalance, sBalance, user:req.user.profile.name, error:'Cannot complete transaction. Not enough funds.'});
                            } else {
                                acct.balance = (Number(acct.balance) - Number(adjAmount)).toFixed(2);
                            };
                        Savings.findOne({owner:acct.owner})
                        .then(sAcct => {
                            sAcct.balance = (Number(sAcct.balance) + Number(adjAmount)).toFixed(2);
                            sAcct.save()
                            .then((acct) => {
                                const newTrans = new SavingsTrans();
                                newTrans.owner = acct._id;
                                newTrans.transType = 'deposit';
                                newTrans.description = 'transfer from checking';
                                newTrans.amount = adjAmount;
                                newTrans.newBalance = acct.balance;
                                newTrans.save()
                            });
                        })
                        acct.save()
                        .then((acct) => {
                            const newTrans = new CheckingTrans();
                            newTrans.owner = acct._id;
                            newTrans.transType = 'withdrawal';
                            newTrans.description = 'transfer to savings';
                            newTrans.amount = adjAmount;
                            newTrans.newBalance = acct.balance;
                            newTrans.save()
                            .then(() => {
                                utils.getBalances(id);
                                return res.redirect('/auth/transfer');
                            })
                            .catch(err => {
                                next (err);
                            });
                        })
                    } else if (transTo === 'checking'){
                        return res.redirect('/auth/transfer');
                    };
                    
                })
        } else if(transFrom === 'savings'){
            const id = req.user._id;
            Savings.findOne({owner:id})
            .then((acct) => {
                if(transTo === 'checking'){
                    if(Number(acct.balance) - Number(adjAmount) < 0){
                        return res.render('auth/transfer', {cBalance, sBalance, user:req.user.profile.name, error:'Cannot complete transaction. Not enough funds.'})
                    } else {
                        acct.balance = (Number(acct.balance) - Number(adjAmount)).toFixed(2);
                    };
                    Checking.findOne({owner:acct.owner})
                        .then(cAcct => {
                            cAcct.balance = (Number(cAcct.balance) + Number(adjAmount)).toFixed(2);
                            cAcct.save()
                            .then((acct) => {
                                const newTrans = new CheckingTrans();
                                newTrans.owner = cAcct._id;
                                newTrans.transType = 'deposit';
                                newTrans.description = 'transfer from savings';
                                newTrans.amount = adjAmount;
                                newTrans.newBalance = cAcct.balance;
                                newTrans.save()
                            })
                        });
                    acct.save()
                    .then((acct) => {
                        const newTrans = new SavingsTrans();
                        newTrans.owner = acct._id;
                        newTrans.transType = 'withdrawal';
                        newTrans.description = 'transfer to checking';
                        newTrans.amount = adjAmount;
                        newTrans.newBalance = acct.balance;
                        newTrans.save()
                        .then(() => {
                            utils.getBalances(id);
                            return res.redirect('/auth/transfer');
                        })
                        .catch(err => {
                            next (err);
                        });
                    })
                } else if (transTo === 'savings'){
                    return res.redirect('/auth/transfer');
                };
                
            })
        }
    },

    //render checking account history
    checking: (req, res, next) => {
        if(req.isAuthenticated()){
            const id = req.user._id;
            Checking.findOne({owner: id})
            .then(acct => {
                CheckingTrans.find({owner: acct._id})
                .then(transactions => {
                    const cTransactions = transactions;
                    utils.getBalances(id);
                    return res.render('auth/checking', {cTransactions, cBalance, sBalance, user:req.user.profile.name})
                })
            })
                .catch(err => {
                    next (err);
                })
        } else {
            return res.redirect('/fail');
        };
    },

    //render savings account history
    savings: (req, res, next) => {
        if(req.isAuthenticated()){
            const id = req.user._id;
            Savings.findOne({owner: id})
            .then(acct => {
                SavingsTrans.find({owner: acct._id})
                .then(transactions => {
                    const sTransactions = transactions;
                    utils.getBalances(id);
                    return res.render('auth/savings', {sTransactions, cBalance, sBalance, user:req.user.profile.name})
                })
            })
            .catch(err => {
                next (err);
            })
        } else {
            return res.redirect('/fail');
        };
    },

    //render send money page
    sendMoneyPage: (req, res) => {
        if(req.isAuthenticated()){
            const id = req.user._id;
            utils.getBalances(id);
            return res.render('auth/sendMoney', {cBalance, sBalance, user:req.user.profile.name, error:null})
        }else {
            return res.redirect('/fail');
        };
    },

    //post send transaction to account
    sendMoney: (req, res, next) => {
        const {dollarAmount, sendTo, sendFrom, } = req.body;
        const adjAmount = utils.adjAmount(dollarAmount);
        if(utils.checkForNumbers(dollarAmount)){
            return res.render('auth/sendMoney', {cBalance, sBalance, user:req.user.profile.name, error:'Please enter dollar amount as a number. Example: 100.00'})
        }
        if(!sendTo.includes('@') || !sendTo.includes('.')){
            return res.render('auth/sendMoney', {cBalance, sBalance, user:req.user.profile.name, error:'Please enter send to as a valid email. Example: me@me.com'})
        }
        User.findOne({email:sendTo})
        .then(user => {
            if(!user){
            return res.render('auth/sendMoney', {cBalance, sBalance, user:req.user.profile.name, error: 'The person you are trying to send to is not in the system.'})
        } else {
        if(sendFrom === 'checking'){
            const id = req.user._id;
            Checking.findOne({owner:id})
                .then((acct) => {
                    if(sendTo){
                        if(Number(acct.balance) - Number(adjAmount) < 0){
                            return res.render('auth/sendMoney', {cBalance, sBalance, user:req.user.profile.name, error:'Cannot complete transaction. Not enough funds.'});
                        } else {
                            acct.balance = (Number(acct.balance) - Number(adjAmount)).toFixed(2);
                        };
                        acct.save()
                        .then((acct) => {
                        const newTrans = new CheckingTrans();
                        newTrans.owner = acct._id;
                        newTrans.transType = 'withdrawal';
                        newTrans.description = `money sent to ${sendTo}`;
                        newTrans.amount = adjAmount;
                        newTrans.newBalance = acct.balance;
                        newTrans.save()
                        return newTrans;
                        });
                        User.findOne({email:sendTo})
                        .then(user => {
                            return user._id;
                        })
                        .then(idTo => {
                            Checking.findOne({owner:idTo})
                            .then(acct => {
                                acct.balance = (Number(acct.balance) + Number(adjAmount)).toFixed(2);
                                acct.save()
                                .then((acct) => {
                                const newTrans = new CheckingTrans();
                                newTrans.owner = acct._id;
                                newTrans.transType = 'deposit';
                                newTrans.description = `money received from ${req.user.email}`;
                                newTrans.amount = adjAmount;
                                newTrans.newBalance = acct.balance;
                                newTrans.save();
                                })
                            })
                        })
                        .then(() => {
                            return res.redirect('/auth/sendMoney')
                        })
                        .catch(err => {
                            next (err);
                        });
                    } 
                })
        } else if (sendFrom === 'savings'){
            const id = req.user._id;
            Savings.findOne({owner:id})
                .then((acct) => {
                    if(sendTo){
                        if(Number(acct.balance) - Number(adjAmount) < 0){
                            return res.render('auth/sendMoney', {cBalance, sBalance, user:req.user.profile.name, error:'Cannot complete transaction. Not enough funds.'});
                        } else {
                            acct.balance = (Number(acct.balance) - Number(adjAmount)).toFixed(2);
                        };
                        acct.save()
                        .then((acct) => {
                        const newTrans = new SavingsTrans();
                        newTrans.owner = acct._id;
                        newTrans.transType = 'withdrawal';
                        newTrans.description = `money sent to ${sendTo}`;
                        newTrans.amount = adjAmount;
                        newTrans.newBalance = acct.balance;
                        newTrans.save()
                        });
                        User.findOne({email:sendTo})
                        .then(user => {
                            return user._id;
                        })
                        .then(idTo => {
                            Checking.findOne({owner:idTo})
                            .then(acct => {
                                acct.balance = (Number(acct.balance) + Number(adjAmount)).toFixed(2);
                                acct.save()
                                .then((acct) => {
                                const newTrans = new CheckingTrans();
                                newTrans.owner = acct._id;
                                newTrans.transType = 'deposit';
                                newTrans.description = `money received from ${req.user.email}`;
                                newTrans.amount = adjAmount;
                                newTrans.newBalance = acct.balance;
                                newTrans.save();
                                })
                            })
                        })
                        .then(() => {
                            return res.redirect('/auth/sendMoney')
                        })
                        .catch(err => {
                            next (err);
                        });
                    }
                })
        }
    }})
    },

    //render statements page
    statementsPage: (req, res) => {
        if(req.isAuthenticated()){
            const cStatementList = [];
            const sStatementList = [];
            Checking.findOne({owner:req.user._id})
            .then((acct) => {
                CheckingStatement.find({owner:acct._id})
                .then(cStatements => {
                    cStatements.forEach(item => {
                        cStatementList.push({month:item.month});
                    });
                    Savings.findOne({owner:req.user._id})
                        .then(sAcct =>{
                            SavingsStatement.find({owner:sAcct._id})
                            .then(sStatements => {
                                sStatements.forEach(item => {
                                    sStatementList.push({month:item.month});
                                });
                                return res.render('auth/statements', {cBalance:acct.balance, sBalance:sAcct.balance, cStatementList, sStatementList, user:req.user.profile.name})
                            })
                        })
                })
            })
            .catch(err => err);
        }else {
            return res.redirect('/fail');
        };
    },

    //post new statement
    createStatement: (req, res) => {
        let cBalance = 0;
        let sBalance = 0;
        const id = req.user._id;
        let cAccount = {};
        let sAccount = {};
        const {selectMonth, account} = req.body;
        Checking.findOne({owner:id})
        .then((acct) => {
            cAccount = acct;
            cBalance = acct.balance;
        })
        Savings.findOne({owner:id})
            .then(sAcct =>{
                sAccount = sAcct;
                sBalance = sAcct.balance;
        })
        .then(acct => {
            if(account === 'checking'){
                CheckingTrans.find({owner:cAccount._id})
                .then(transactions => {
                    const transArray = [];
                    transactions.forEach(trans => {
                        const tDate = trans.date
                        if(selectMonth.length === 2){
                            if(tDate.slice(0,2) === selectMonth){
                                transArray.push(trans);
                            };
                        };
                        if(selectMonth.length === 1){
                            if(tDate.slice(0,1) === selectMonth){
                                transArray.push(trans);
                            };
                        }
                    });
                    return transArray;
                })
                .then(transArray => {
                    let count = 0;
                    let dupCheck = 0;
                    CheckingStatement.find({owner:cAccount._id})
                    .then(statements => {
                        statements.forEach(item => {
                            count++;
                            if(item.month === utils.alphMonth(selectMonth)){
                                dupCheck++;
                            }
                        })
                    })
                    .then(statements => {
                        if(count < 12 && dupCheck === 0){
                            const newStatement = new CheckingStatement();
                            newStatement.owner = cAccount._id;
                            newStatement.month = utils.alphMonth(selectMonth);
                            newStatement.transactions = [...transArray];
                            newStatement.save()
                        }
                    })
                })
                return res.redirect('/auth/statements');
            } else if(account === 'savings'){
                SavingsTrans.find({owner:sAccount._id})
                .then(transactions => {
                    const transArray = [];
                    transactions.forEach(trans => {
                        const tDate = trans.date
                        if(selectMonth.length === 2){
                            if(tDate.slice(0,2) === selectMonth){
                                transArray.push(trans);
                            };
                        };
                        if(selectMonth.length === 1){
                            if(tDate.slice(0,1) === selectMonth){
                                transArray.push(trans);
                            };
                        }
                    });
                    return transArray;
                })
                .then(transArray => {
                    let count = 0;
                    let dupCheck = 0;
                    SavingsStatement.find({owner:sAccount._id})
                    .then(statements => {
                        statements.forEach(item => {
                            count++;
                            if(item.month === utils.alphMonth(selectMonth)){
                                dupCheck++;
                            }
                        })
                    })
                    .then(statements => {
                        if(count < 12 && dupCheck === 0){
                            const newStatement = new SavingsStatement();
                            newStatement.owner = sAccount._id;
                            newStatement.month = utils.alphMonth(selectMonth);
                            newStatement.transactions = [...transArray];
                            newStatement.save()
                        }
                    })
                })
                return res.redirect('/auth/statements');
            }
        })
    },
    
    //render monthly statement
    monthlyStatement: (req, res) => {
        let cAccount = {};
        let sAccount = {};
        const {account, month} = req.params;
        if(account === 'checking'){
        Checking.findOne({owner:req.user._id})
        .then((acct) => {
            cAccount = acct
            CheckingStatement.find({owner:acct._id})
            .then(statements => {
                const statement = [];
                for(const item of statements){
                    if(item.month === month)
                        statement.push(item);
                }
                const transactions = statement[0].transactions
                return res.render('auth/monthlyStatement', {transactions, cAccount, sAccount:null, user:req.user, month})
            })
        })
        } else if (account === 'savings'){
            Savings.findOne({owner:req.user._id})
            .then((acct) => {
                sAccount = acct
                SavingsStatement.find({owner:acct._id})
                .then(statements => {
                    const statement = [];
                    for(const item of statements){
                        if(item.month === month)
                            statement.push(item);
                    }
                    const transactions = statement[0].transactions
                    return res.render('auth/monthlyStatement', {transactions, sAccount, cAccount:null, user:req.user, month})
                })
            })
        };     
    },

    //delete statement
    deleteStatement: (req, res) => {
        const {account, month} = req.params
        if(account === 'checking'){
        Checking.findOne({owner:req.user._id})
        .then(acct => {
            CheckingStatement.find({owner:acct._id})
            .then(statements => {
                const filteredStatements = statements.filter(item => item.month === month);
                const statement = filteredStatements[0];
                CheckingStatement.findByIdAndDelete({_id:statement._id})
                .then(statement => {
                res.redirect('/auth/statements');
                })
            })
        })
        } else if (account === 'savings'){
            Savings.findOne({owner:req.user._id})
        .then(acct => {
            SavingsStatement.find({owner:acct._id})
            .then(statements => {
                const filteredStatements = statements.filter(item => item.month === month);
                const statement = filteredStatements[0];
                SavingsStatement.findByIdAndDelete({_id:statement._id})
                .then(statement => {
                res.redirect('/auth/statements');
                })
            })
        })
        }   
    }
    
} 