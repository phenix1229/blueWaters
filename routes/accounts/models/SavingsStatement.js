const mongoose = require('mongoose');

const SavingsStatementSchema = new mongoose.Schema({
    owner:{type:mongoose.Schema.Types.ObjectId, ref:'Savings'},
    month:{type:String},
    transactions:[]
});

module.exports = mongoose.model('SavingsStatement', SavingsStatementSchema);