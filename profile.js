var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var csurf = require('csurf');
var express = require('express');
var extend = require('xtend');
var forms = require('forms');
var User = require('./models');

var profileForm = forms.create({
    givenName: forms.fields.string({ required: true }),
    surname: forms.fields.string({ required: true }),
    streetAddress: forms.fields.string(),
    city: forms.fields.string(),
    state: forms.fields.string(),
    zip: forms.fields.string()
});

function renderForm(req, res, locals) {
	console.log(req.user);
    res.render('profile', extend({
        title: 'My Profile',
        csrfToken: req.csrfToken(),
        givenName: req.user.name.givenName,
        surname: req.user.name.familyName
        /*streetAddress: req.user.customData.streetAddress,
        city: req.user.customData.city,
        state: req.user.customData.state,
        zip: req.user.customData.zip*/
    }, locals || {}));
}

module.exports = function profile() {

    var router = express.Router();
    router.use(cookieParser());
	router.use(bodyParser.urlencoded({ extended: true }));
	router.use(csurf({ cookie: true }));
	router.all('/', function(req, res) {
		profileForm.handle(req, {
 			success: function(form) {
 				var address = new User();
 				address.givenName = req.user.name.givenName;
 				address.surname = req.user.name.familyName;
				address.save(function(err) {
					if (err) {
 						if (err.developerMessage){
 							console.error(err);
 						}
 						renderForm(req, res, {
 							errors: [{
 								error: err.userMessage ||
 								err.message || String(err)
 							}]
 						});
 					} else {
 						renderForm(req, res, {
 							saved: true
 						});
 					}
 				});          
 			},
 			empty: function() {
 				renderForm(req, res);
 			}
 		});
  	  });
	return router;
};
