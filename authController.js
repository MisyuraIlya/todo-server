// // GLOBAL
// import randtoken from 'rand-token';
// import { v4 as uuidv4 } from 'uuid';
// import nodemailer from 'nodemailer';
// import { compareSync, genSaltSync, hashSync } from 'bcrypt';
// import jwt from 'jsonwebtoken';
// import Schema from './schema.js'
// import dotenv from 'dotenv';
// import bcrypt from 'bcrypt'
// dotenv.config();

// // LOCAL
// import db from './config.js';
// import httpStatusCodes from './httpStatusCodes.js';
// import redis_client from './redis_connect.js'
// import tokenService from './service/token-service.js';

// let refreshTokens = [];
// function query(sql, params) {
//   return new Promise((resolve, reject) => {
//     db.query(sql, params, (err, result) => {
//       if (err) {
//         return reject(err);
//       }
//       return resolve(result);
//     });
//   });
// }

function sendResponse(response, data = null, status = null, error = null) {
  return response.status(httpStatusCodes.status[status]).json({ status: httpStatusCodes.status[status], data, error });
}

function sendEmail(email, token) {
  const mail = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'spetsar97ilya@gmail.com',
      pass: 'kpxoemypopltbmje',
    },
  });

  const mailOptions = {
    from: 'spetsar97ilya@gmail.com',
    to: email,
    subject: 'Email verification ',
    html: `<p>You requested for email verification, kindly use this <a href="http://dev.local:3000/verify-email?token=${token}">link</a> to verify your email address</p>`,
  };

  mail.sendMail(mailOptions, (error, info) => {
    if (error) {
      return 1;
    }
    return 0;
  });
}

// function sendEmailPassword(email, token) {
//   const mail = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: 'spetsar97ilya@gmail.com',
//       pass: 'kpxoemypopltbmje',
//     },
//   });

//   const mailOptions = {
//     from: 'spetsar97ilya@gmail.com',
//     to: email,
//     subject: 'Email update password ',
//     html: `<p>You requested for email reset password, kindly use this <a href="http://dev.local:3000/newpassword?token=${token}">link</a> to verify your email address</p>`,
    
//   };

//   mail.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       return 1;
//     }
//     return 0;
//   });
// }

// async function GenerateRefreshToken(email_id) {
//   const refresh_token = jwt.sign({ sub: email_id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_TIME });
//   // redis_client.get(email_id, (err, data) => {
//   //     if(err) throw err;
//   // })
//   await redis_client.set(email_id,  JSON.stringify({token: refresh_token}));
//   return refresh_token;
// }

// class authContoller {

//   async SignUp(request, response) {

//     try{
//       const {name, lastname, email, password, phone} = request.body;
//       const candidate = await Schema.Users.findOne({email})
//       console.log(candidate)
//       if (candidate) {
//         sendResponse(response, null, 'BAD_REQUEST', `this email ${email} used `);
//       } else {
//       const hashPassword = await bcrypt.hash(password, 3)
//       const activationLink = uuidv4();
//       const result = await Schema.Users.create({name:name, lastname:lastname, email:email, password:hashPassword, phone:phone })
//       await mailService.sendActivationMail(email, activationLink)
//       sendResponse(response, result, 'OK', null);
//       }
//     } catch(error) {
//       sendResponse(response, null, 'BAD_REQUEST', error);
//     }
//   }

//   async SendEmail(request, response) {
//     const { email } = request.body;
//     try {
//       const result = await Schema.Users.find({email : email})
//         const token = randtoken.generate(20);
//         const data = await Schema.Users.findOneAndUpdate({email : email}, {verifytoken: token})
//         sendEmail(email, token);
//         sendResponse(response, 'link send to email', 'OK', null);

//     } catch(error) {
//       sendResponse(response, null, 'BAD_REQUEST', error);
//     }
//   }

//   async VerifyEmail(request, response) {
//     const token = request.query;
//     try {
//       const result = await Schema.Users.findOneAndUpdate({verifytoken : token.token}, { confirmed: true}, {new: true})
//         sendResponse(response, 'Send mail to verefication', 'OK', null);
//     } catch(error) {
//       sendResponse(response, null, 'BAD_REQUEST', error);
//     }
//   }

//   async SignInPost(request, response) {
//     const email = request.body.email;
//     const password = request.body.password;
//     try{
//       const result = await Schema.Users.find({email: email, password:password})
//         console.log(result[0].name)
//         const access_token = jwt.sign({sub: result[0].id}, process.env.JWT_ACCESS_SECRET , {expiresIn: process.env.JWT_ACCESS_TIME})
//         const refresh_token = await GenerateRefreshToken(result[0].id);
//         // console.log('refresh token',await refresh_token)
//         sendResponse(response, [result[0].name,access_token] , 'OK', null);
//     } catch(error) {
//       sendResponse(response, null, 'BAD_REQUEST', error);
//     }
//   }

//   async Homepage(request, response) {
//     sendResponse(response, 'hello', 'OK', null);
//   }

//   async Token(request, response) {
//     const email_id =  request.userData.sub;
//     const access_token = jwt.sign({sub: email_id}, process.env.JWT_ACCESS_SECRET , {expiresIn: process.env.JWT_ACCESS_TIME})
//     const refresh_token = GenerateRefreshToken(email_id);
//     sendResponse(response, access_token, 'OK', null);
//   }

  
//   async VerifyToken(request, response, next){
//     try{
//       const token =  request.headers.authorization.split(' ')[1];
//       // console.log('verify token', token)

//       const decoded =  jwt.verify(token, process.env.JWT_ACCESS_SECRET);
//       const data  = await redis_client.get(decoded.sub)
//       request.userData = decoded;

//       request.token = token;
//       if(data.length > 0 & data != token) {
//         next();
//       } else {
//         sendResponse(response, null, 'BAD_REQUEST', 'blacklisted token');
//       }
//     } catch(error) {
//       sendResponse(response, null, 'BAD_REQUEST', error);
//     }
//   }

//   async VerifyRefreshToken(request, response, next){

//     const token = request.body.token;
//     console.log(request.body.token)
//     if ( token === null) return sendResponse(response, null, 'BAD_REQUEST', 'invalid request');
//     try{
//       const decoded =  jwt.verify(token, process.env.JWT_REFRESH_SECRET);
//       request.userData =  decoded
//     const data = await redis_client.get(decoded.sub)
//     if(JSON.parse(data).token.length > 0 & data != null  & JSON.parse(data).token == token ){
//       next();
//     } else {
//       sendResponse(response, null, 'BAD_REQUEST', 'invalid same token request');
//     }
//     } catch(error) {
//       sendResponse(response, null, 'BAD_REQUEST', 'verify denied');
//     }
//   }


//   async SignInGet(request, response){
//     // if (request.session.user) {
//     //   response.send({ loggedIn: true, user: request.session.user });
//     // } else {
//     //   response.send({ loggedIn: false, user: null });
//     // }
//     sendResponse(response, 'hello', 'OK', null);
//   }

//   async Home(request, response) {
//     if (request.session.loggedin) {
//       response.send(`Welcome back, ${request.session.username}!`);
//     } else {
//       response.send('Please login to view this page!');
//     }
//     response.end();
//   }

//   async LogOut(request, response) {
//     const user_id = request.userData.sub;
//     const token = request.token;

//     // remove the refresh token
//     await redis_client.del(user_id);

//     // blacklist current access token
//     await redis_client.set(user_id, token);
     
//     sendResponse(response, 'Logout success', 'OK', null);
//   }

  
//   async ResetPassword(request, response) {
//     const { email } = request.body;
//     const sql = 'SELECT * FROM users WHERE email = ? ';
//     db.query(sql, email, (err, result) => {
//       if (err) throw err;
//       if (result.length > 0) {
//         const token = randtoken.generate(20);
//         const sent = sendEmailPassword(email, token);
//         if (sent != '0') {
//           const sql = 'UPDATE users SET  token = ? WHERE email = ?';
//           db.query(sql, [token, email], (err, result) => {
//             if (err) throw err;
//           });
//           sendResponse(response, { type: 'success', msg: 'The reset password link has been sent to your email address' }, 'OK', null);
//         } else {
//           sendResponse(response, { type: 'error', msg: 'Something goes to wrong. Please try again' }, 'BAD_REQUEST', null);
//         }
//       } else {
//         sendResponse(response, { type: 'error', msg: 'The Email is not registered with us' }, 'BAD_REQUEST', null);
//       }
//     });
//   }

//   async UpdatePassword(request, response) {
//     const { token } = request.body;
    
//     const sql = 'SELECT * FROM users WHERE token = ?';
//     db.query(sql, token, (err, result) => {
//       if (err) throw err;
//       if (result.length > 0) {
//         const saltRounds = 10;
//         const salt = genSaltSync(15);
//         const password = hashSync(request.body.password, salt);
//         const sql2 = 'UPDATE users SET password = ?  WHERE email = ?';
//         db.query(sql2,  [password, result[0].email] , (err, result) => {
//           if (err) throw err;
//         });
//         sendResponse(response, 'Your password has been updated successfully', 'OK', null);
//       } else {
//         sendResponse(response, null , 'BAD_REQUEST', 'Invalid link; please try again');
//       }
//     });
//   }
// }

// export default new authContoller();
