import ApiError from "../exceptions/api-error.js";
import tokenService from "../service/token-service.js";
export default function (request, response, next){
    try{
        const authorizationHeader = request.headers.authorization;
        console.log('this',authorizationHeader)
        if(!authorizationHeader){
            return next(ApiError.UnauthirizedError());
        }
        const accessToken = authorizationHeader.split(' ')[1];
        if(!accessToken){
            return next(ApiError.UnauthirizedError());
        }
        const userData = tokenService.validateAccessToken(accessToken);
        console.log(userData)
        if(!userData){
            return next(ApiError.UnauthirizedError());
        }
        request.user = userData;
        next();

    } catch(error){
        return next(ApiError.UnauthirizedError());
    }
}