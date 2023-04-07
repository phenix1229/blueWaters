const Member = require('../../../models/Member');
const MemberFee = require('../../../models/MemberFee');
const Transaction = require('../../../models/Transaction');

module.exports = {
    compareCharges: (member) => {
        const fee = MemberFee.findOne({membershipType});
        
    }
}