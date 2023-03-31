const mongoose = require('mongoose');

const CheckingStatementSchema = new mongoose.Schema({
    owner:{type:mongoose.Schema.Types.ObjectId, ref:'Checking'},
    month:{type:String},
    transactions:[]
});

module.exports = mongoose.model('CheckingStatement', CheckingStatementSchema);