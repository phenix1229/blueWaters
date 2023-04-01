const mongoose = require('mongoose');
const MemberSchema = mongoose.Schema({
    typeID: {
        // type: mongoose.Schema.Types.ObjectId,
        // ref: 'memberFees'
        type: Number,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    zipCode: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
    },
    cellNumber: {
        type: String,
    },
    email: {
        type: String,
        required: true,
    },
    dateJoined: {
        type: Date,
        default: Date.now,
        required: true
    },
    membershipType: {
        type: String,
        required: true
    },
    membershipStatus: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Member', MemberSchema);