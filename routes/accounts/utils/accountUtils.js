const User = require('../../users/models/User');
const Checking = require('../models/Checking');
const CheckingTrans = require('../models/CheckingTransaction');
const CheckingStatement = require('../models/CheckingStatement');
const Savings = require('../models/Savings');
const SavingsTrans = require('../models/SavingsTransaction');
const SavingsStatement = require('../models/SavingsStatement');
const registerErrors = (arr) => {const errArr = []; for(i of arr){errArr.push(` ${i.msg}`)}; return errArr};


//generate random number inclusive of min and max
const randomGen = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

//generate random account number
const generateAccountNumber = () => {
    let acctArr = [];
    while(acctArr.length < 9){
        acctArr.push(randomGen(0, 9));
    };
    return acctArr.join('');
};

//validate input contains only numbers and at most 1 dot
const checkForNumbers = (val) => {
    if(val.trim() === ''){
        return true
    }
    let notNumbers = 0;
    let dot = 0;
    for (const i of val){
        if(isNaN(Number(i)) && i !== '.'){
            notNumbers++;
        }
        if(i === '.'){
            dot++
        }
    }
    return dot > 1 || notNumbers > 0;
};


//convert number month to letter month
const alphMonth = (numMonth) => {
    let month = '';
        if(numMonth === '1'){
            month = 'Jan';
        } else if(numMonth === '2'){
            month = 'Feb';
        } else if(numMonth === '3'){
            month = 'Mar';
        } else if(numMonth === '4'){
            month = 'Apr';
        } else if(numMonth === '5'){
            month = 'May';
        } else if(numMonth === '6'){
            month = 'Jun';
        } else if(numMonth === '7'){
            month = 'Jul';
        } else if(numMonth === '8'){
            month = 'Aug';
        } else if(numMonth === '9'){
            month = 'Sep';
        } else if(numMonth === '10'){
            month = 'Oct';
        } else if(numMonth === '11'){
            month = 'Nov';
        } else if(numMonth === '12'){
            month = 'Dec';
        }
    return month;
};

//convert dollar amount to proper format
const adjAmount = (dollarAmount) => {
    if(dollarAmount.includes('.')){
        const phase1 = dollarAmount.slice(0, (dollarAmount.indexOf('.') + 3));
        return Number(phase1).toFixed(2)
    };
    return Number(dollarAmount).toFixed(2);
};

//get account balances
const getBalances = (id) => {
    Checking.findOne({owner:id})
        .then((acct) => {
            cBalance = acct.balance;
            return cBalance
            .then(Savings.findOne({owner:id})
                .then(sAcct =>{
                    sBalance = sAcct.balance;
                    return sBalance;
                })
            )
        })
        .catch(err => err)
};

module.exports = {
    generateAccountNumber,
    checkForNumbers,
    alphMonth,
    adjAmount,
    registerErrors,
    getBalances
}