module.exports = {
    onlyNumbers: (val) => {
        return val.match(/\d{1,6}/) !== null && val.match(/[a-zA-Z\s\.]/) === null && val.match(/(\d{7,})/) === null;
    },

    properAmount: (val) => {
        return val.match(/(\d{1,6}\.\d{2})/) !== null && val.match(/[a-zA-Z\s]/) === null && val.match((/(\.\d{3,})/)) === null && val.match((/(\d{7,})/)) === null;
    }
}