const router = require("express").Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


//create token
function createToken(user) {
    var tokenData = {
      _id: user._id,
      email: user.email,
      password: user.password,
    };
  
  var token = jwt.sign(tokenData, process.env.JWT_SECRET, {
    expiresIn: "100 days"
  });
  return token;
}

//verify token 
function verifyToken(req,res,next){
  const bearerHeader = req.headers['authorization'];
  if(typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  }else{
    return res.json({ status: 'error', message: 'Invalid token' })
  }
}


router.post("/Register", async (req, res) => {
  const { name,email,password,phone  } = req.body
	if (!name || typeof name !== 'string') {
		return res.json({ status: 'error', message: 'Invalid username' })
	}

  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if(!re.test(String(email).toLowerCase()))
  {
    return res.json({ status: 'error', message: 'Invalid email' })
  }

	if (!password || typeof password !== 'string') {
		return res.json({ status: 'error', message: 'Invalid password' })
	}

	if (password.length < 6) {
		return res.json({
			status: 'error',
			error: 'Password too small. Should be atleast 6 characters'
		})
	}

  var phoneno = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  if(!phone.match(phoneno)) {
    return res.json({ status: 'error', message: 'check your phone' })
  }
 
	let modifiedpassword = await bcrypt.hash(password, 10)

 await User.find({ email: email }, function (err, user) {
    if (err)
      res.json({ success: false, error: err, message: 'Error in server!' });
    else {
      if(user.length === 0){
        req.body.password = modifiedpassword
        var new_user = new User(req.body);
        new_user.save(function (err, user) {
          if (err) {
            res.json({ success: false, message: "error in mongodb", err: err });
          } else {
            res.json({ success: true, status: 'success', message: 'User Successfully Registered' });
          }
        })
      }else{
        res.json({ success: false, status: 'error', message: 'User already exists' });
      }
    }
  })

  });

  router.post("/Login", async (req, res) => {
    const {email, password} = req.body
    await User.findOne({ email: email })
      .exec(function (err, user) {
        if (err) {
          res.json({ success: false, error: err });
        } else {
          if (bcrypt.compare(password, user.password)) {
            var token = createToken(user);
            res.json({ success: true, token:token, message: "Login successfull" });
          }
        }
  })
})

router.get("/GetList", verifyToken,  async (req, res) => {
  jwt.verify(req.token, process.env.JWT_SECRET, (err, authData) => {
    if(err) {
      return res.json({ status: 'error', message: 'Invalid token' })
    } else {
      User.find({}, function (err, user) {
        if (err)
          res.json({ success: false, error: err, message: 'something went wrong' });
    
        res.json({ success: true, data: user });
      });
    }
  });
})

router.delete("/DeleteUser",verifyToken, async (req, res) => {
  jwt.verify(req.token, process.env.JWT_SECRET, (err, authData) => {
    if(err) {
      return res.json({ status: 'error', message: 'Invalid token' })
    } else {
      const {id} = req.body;
      User.deleteOne({ _id: id }, function (err, user) {
        if (err)
          res.json({ success: false, error: err });
    
        res.json({ success: true, message: 'Successfully Deleted' });
      });
    }
  })
})




  module.exports = router;