class DataPayload {
    constructor(status = false, message = "", data = {}){
        this.status = status;
        this.message = message;
        this.data = data
    }
}

module.exports = DataPayload