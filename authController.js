// GLOBAL
import randtoken from 'rand-token';
import nodemailer from 'nodemailer';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import Schema from './schema.js'
import dotenv from 'dotenv';
dotenv.config();

// LOCAL
import db from './config.js';
import httpStatusCodes from './httpStatusCodes.js';
import redis_client from './redis_connect.js'

let refreshTokens = [];
function query(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
}

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

function sendEmailPassword(email, token) {
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
    subject: 'Email update password ',
    html: `<p>You requested for email reset password, kindly use this <a href="http://dev.local:3000/newpassword?token=${token}">link</a> to verify your email address</p>`,
    
  };

  mail.sendMail(mailOptions, (error, info) => {
    if (error) {
      return 1;
    }
    return 0;
  });
}

async function GenerateRefreshToken(email_id) {
  const refresh_token = jwt.sign({ sub: email_id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_TIME });
  // redis_client.get(email_id, (err, data) => {
  //     if(err) throw err;
  // })
  await redis_client.set(email_id,  JSON.stringify({token: refresh_token}));
  return refresh_token;
}

class authContoller {

  async SignUp(request, response) {
    try{
      const {name, lastname, email, password, phone} = request.body;
      const result = await Schema.Users.create({name:name, lastname:lastname, email:email, password:password, phone:phone })
      sendResponse(response, result, 'OK', null);
    } catch(error) {
      sendResponse(response, null, 'BAD_REQUEST', error);
    }
  }

  async SendEmail(request, response) {
    const { email } = request.body;
    const sql = 'SELECT * FROM verefication WHERE email = ?';
    const result = await query(sql, email);
    if (result.length > 0) {
      const token = randtoken.generate(20);
      if (result[0].verify == 0) {
        const sent = sendEmail(email, token);
        if (sent != '0') {
          const sql = 'UPDATE verefication SET token = ? WHERE email = ? ';
          db.query(sql, [token, email], (error, result) => {
            if (error) throw error;
          });
          sendResponse(response, { type: 'success', msg: 'The verefication link has been sent to your email address' }, 'OK', null);
        } else {
          sendResponse(response, { type: 'error', msg: 'Something goes wrong. Please try again' }, 'BAD_REQUEST', null);
        }
      }
    } else {
      sendResponse(response, { type: 'error', msg: 'The Email is not registered' }, 'BAD_REQUEST', null);
    }
  }

  async VerifyEmail(request, response) {
    const { token } = request.query;
    const sql = 'SELECT * FROM verefication WHERE token = ?';
    db.query(sql, token, (err, result) => {
      if (err) throw err;
      if (result.length > 0) { 
      if (result[0].verify == 0) {
        if (result.length > 0) {
          const sql = 'UPDATE verefication SET verify = 1 WHERE email = ? ';
          db.query(sql, [result[0].email] , (err, result) => {
            if (err) throw err;
          });
          sendResponse(response, { type: 'success', msg: 'Your email has been verified' }, 'OK', null);
        } else {
          sendResponse(response, { type: 'success', msg: 'The email has already verified' }, 'OK', null);
        }
      } else {
        sendResponse(response, { type: 'error', msg: 'The email has been already verified' }, 'BAD_REQUEST', null);
      }
    } else {
      sendResponse(response, { type: 'error', msg: 'this token didnt contain in db' }, 'BAD_REQUEST', null);
    }
    });
  }

  async SignInPost(request, response) {
    const email = request.body.email;
    const password = request.body.password;
    console.log(email,password)
    try{
      const result = await Schema.Users.find({email: email, password:password})
      if (result.length > 0) {
        const access_token = jwt.sign({sub: result[0].id}, process.env.JWT_ACCESS_SECRET , {expiresIn: process.env.JWT_ACCESS_TIME})
        const refresh_token = GenerateRefreshToken(result[0].id);

        sendResponse(response, {access_token, refresh_token}, 'OK', null);
      } else {
        sendResponse(response, null, 'BAD_REQUEST', 'Wrong email or password');
      }
    } catch(error) {
      sendResponse(response, null, 'BAD_REQUEST', error);
    }
  }

  async Homepage(request, response) {
    sendResponse(response, 'hello', 'OK', null);
  }

  async Token(request, response) {
    const email_id =  request.userData.sub;
    const access_token = jwt.sign({sub: email_id}, process.env.JWT_ACCESS_SECRET , {expiresIn: process.env.JWT_ACCESS_TIME})
    const refresh_token = GenerateRefreshToken(email_id);
    sendResponse(response, [access_token,refresh_token], 'OK', null);
  }

  
  async VerifyToken(request, response, next){
    try{
      const token =  request.headers.authorization.split(' ')[1];
      const decoded =  jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const data  = await redis_client.get(decoded.sub)
      if(data.length > 0 & data != token) {
        next();
      } else {
        sendResponse(response, null, 'BAD_REQUEST', 'blacklisted token');
      }
    } catch(error) {
      sendResponse(response, null, 'BAD_REQUEST', error);
    }
  }

  async VerifyRefreshToken(request, response, next){
    const token = request.body.token;
    console.log(token)
    if ( token === null) return sendResponse(response, null, 'BAD_REQUEST', 'invalid request');
    try{
      const decoded =  jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      request.userData =  decoded
    const data = await redis_client.get(decoded.sub)
    console.log(data)
    if(JSON.parse(data).token.length > 0 & data != null & JSON.parse(data).token != token){
      next();
    } else {
      sendResponse(response, null, 'BAD_REQUEST', 'invalid same token request');
    }
    } catch(error) {
      sendResponse(response, null, 'BAD_REQUEST', 'verify denied');
    }
  }


  async SignInGet(request, response){
    if (request.session.user) {
      response.send({ loggedIn: true, user: request.session.user });
    } else {
      response.send({ loggedIn: false, user: null });
    }
  }

  async Home(request, response) {
    if (request.session.loggedin) {
      response.send(`Welcome back, ${request.session.username}!`);
    } else {
      response.send('Please login to view this page!');
    }
    response.end();
  }

  async LogOut(request, response) {
    const email_id = request.userData.sub

    //remove the refresh token
    await redis_client.del(email_id.toString())

    //blacklist current access token
    await redis_client.set('BL_' + email._id.toString(), token );
     
    sendResponse(response, 'Logout success', 'OK', null);
  }

  
  async ResetPassword(request, response) {
    const { email } = request.body;
    const sql = 'SELECT * FROM users WHERE email = ? ';
    db.query(sql, email, (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
        const token = randtoken.generate(20);
        const sent = sendEmailPassword(email, token);
        if (sent != '0') {
          const sql = 'UPDATE users SET  token = ? WHERE email = ?';
          db.query(sql, [token, email], (err, result) => {
            if (err) throw err;
          });
          sendResponse(response, { type: 'success', msg: 'The reset password link has been sent to your email address' }, 'OK', null);
        } else {
          sendResponse(response, { type: 'error', msg: 'Something goes to wrong. Please try again' }, 'BAD_REQUEST', null);
        }
      } else {
        sendResponse(response, { type: 'error', msg: 'The Email is not registered with us' }, 'BAD_REQUEST', null);
      }
    });
  }

  async UpdatePassword(request, response) {
    const { token } = request.body;
    
    const sql = 'SELECT * FROM users WHERE token = ?';
    db.query(sql, token, (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
        const saltRounds = 10;
        const salt = genSaltSync(15);
        const password = hashSync(request.body.password, salt);
        const sql2 = 'UPDATE users SET password = ?  WHERE email = ?';
        db.query(sql2,  [password, result[0].email] , (err, result) => {
          if (err) throw err;
        });
        sendResponse(response, 'Your password has been updated successfully', 'OK', null);
      } else {
        sendResponse(response, null , 'BAD_REQUEST', 'Invalid link; please try again');
      }
    });
  }
}

export default new authContoller();
