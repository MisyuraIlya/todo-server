import ApiError from "../exceptions/api-error.js";
import tokenService from "../service/token-service.js";
export default function (request, response, next){
    try{
        const authorizationHeader = request.headers.authorization;
        if(!authorizationHeader){
            return next(ApiError.UnauthirizedError());
        }
        const accessToken = authorizationHeader.split(' ')[1];
        if(!accessToken){
            return next(ApiError.UnauthirizedError());
        }
        const userData = tokenService.validateAccessToken(accessToken);
        if(!userData){
            return next(ApiError.UnauthirizedError());
        }
        request.user = userData;
        next();

    } catch(error){
        return next(ApiError.UnauthirizedError());
    }
}