const mongoose = require('mongoose');
const TransactionSchema = mongoose.Schema({
    memberID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'members'
    },
    date: {
        type: Date,
        default: Date.now
    },
    location: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model('Transaction', TransactionSchema);