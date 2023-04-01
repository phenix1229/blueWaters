const express = require('express');
const router = express.Router();
require('../../lib/passport');

const userController = require('./controllers/userController');
const userValidation = require('./utils/userValidation');

// render register page
router.get('/register', (req, res) => {
  res.render('users/register', { error:null});
});

//register new user
router.post('/saveMember', userController.saveMember);

//create new member
router.post('/newMember', userController.newMember);

//find member
router.post('/findMember', userController.findMember);


//render login page
router.get('/login', userController.loginPage);

//render members page
router.get('/members', userController.membersPage);

//render member info page
router.get('/memberInfo', userController.memberInfoPage);

//login user
router.post('/login', userController.login);

//render login error page
router.get('/loginError', userController.loginError);

//render profile page
router.get('/profile', userController.profilePage);

//update profile
router.put('/updateProfile', (req, res, next) => {
  userController
    .updateProfile(req.body, req.user._id)
    .then(user => {
      return res.redirect('/api/users/profile');
    })
    .catch(err => {
      console.log(err);
      return res.redirect('/api/users/updateProfile');
    });
});

//render update profile page
router.get('/updateProfile', userController.updateProfilePage)

//update password
router.put('/updatePassword', userController.updatePassword);

//logout user
router.get('/logout', userController.logout);

module.exports = router;