const mongoose = require('mongoose');
const MemberFeeSchema = mongoose.Schema({
    typeID: {
        type: Number,
        required: true
    },
    
    membershipType: {
        type: String,
        required: true
    },
    monthlyFee: {
        type: Number,
        required: true
    },
    minMonthlyCharge: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model('MemberFee', MemberFeeSchema);