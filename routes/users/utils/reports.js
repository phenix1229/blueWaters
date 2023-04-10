const Member = require('../../../models/Member');
const MemberFee = require('../../../models/MemberFee');
const Transaction = require('../../../models/Transaction');

module.exports = {

    //convert number month to letter month
     alphMonth: (numMonth) => {
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
    },

    getTransactions: (id, year, month) => {
        const transArray = [];
        Transaction.find({memberID:id}).then(transactions => {
            transactions.forEach(item => {
                const tDate = String(item.date);
                if(tDate.slice(11,15) === year){
                    if(tDate.slice(4,7) === month){
                        transArray.push(item.amount);
                    }
                }
            })
            // console.log(`this is from getTransactions: ${transArray}`);
            return transArray;
        })
            return transArray;
    },

    addAll: (arr) => {
        let total = 0;
        if(arr !== null && arr !== undefined && arr !== ''){
            for(item of arr){
                total += item
            }
        }
        return total;
    },

    compareCharges: (member) => {
        const fee = MemberFee.findOne({membershipType:member.membershipType});
        const transactions = Transaction.find({memberID});

    }
}