export default class ApiError extends Error {
    status;
    errors;

    constructor(status, message, errors = []) {
        super(message);
        this.status = status;
        this.errors = errors;
    }

    static UnauthirizedError(){
        return new ApiError(401, 'Client didnt authorized')
    }

    static BadRequest(message, errors =[]) {
        return new ApiError(400, message, errors)
    }
}