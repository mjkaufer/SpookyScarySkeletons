var data = {};

data = JSON.parse(Assets.getText("credentials.json"));
xml = Assets.getText("call.xml");
Acc_SID = data.sid;
Auth_token = data.authToken;
var phoneNumber = data.from;

twilioClient = Twilio(Acc_SID, Auth_token);

Meteor.Paypal.config({
	'host': Meteor.absoluteUrl(),
	'port': 80,
	'client_id': data.ppcid,
	'client_secret': data.pps
});


var token;
token = EJSON.parse(Meteor.http.post("https://api.sandbox.paypal.com/v1/oauth2/token", {
	headers: {
		"Accept": "application/json",
		"Accept-Language": "en_US"
	},
	auth: data.ppcid + ":" + data.pps,
	params: {
		"grant_type": "client_credentials"
	}
}).content).access_token;


Meteor.absoluteUrl("/",{replaceLocalhost:true,rootUrl:"http://sss.ngrok.com"})


// Meteor.users.allow({
// 	insert:function(){return false;},
// 	update:function(){return false;},
// 	remove:function(){return false;}
// })

Meteor.methods({
	'sendCall':function(number){
		
		// Meteor.call('callback',this.userId + ":" + this.userId(),true);		
		console.log("abc");
		console.log(this.userId)
		
		if(this.userId == undefined)
			return "You need to be logged in, sneaky!";
		
		if(Meteor.users.findOne(this.userId).profile && Meteor.users.findOne(this.userId).profile.credits <= 0)
			return "You don't have enough credits!";
		
		
		Meteor.users.update({_id:this.userId},{$inc:{"profile.credits":-1}});//subtract credits
		
		twilioClient.makeCall({
			url: "http://twimlets.com/echo?Twiml=" + encodeURIComponent(xml),
			to: number,
			from: phoneNumber
		}, function(err, call) {
			console.log(err, call);
			Meteor.call('callback',"Your call to " + number + " has been completed!",(err===undefined || err==="" || err===null));
		});

		return "Great success!"
		
	}, 'test':function(){
			console.log(this.userId);
			user = Meteor.users.findOne(this.userId);
	}, 'buySingleItem': function() {
		var payment, result;
		console.log("Starting new payment, user id: " + this.userId);

		Future = Npm.require('fibers/future');
		var myFuture = new Future();

		result = Meteor.http.post("https://api.sandbox.paypal.com/v1/payments/payment", {
			headers: {
				"Authorization": "Bearer " + token,
				"Content-Type": "application/json"
			},
			data: {
				"intent": "sale",
				"redirect_urls": {
					"return_url": Meteor.absoluteUrl(),
					"cancel_url": Meteor.absoluteUrl()
				},
				"payer": {
					"payment_method": "paypal"
				},
				"transactions": [
					{
						"amount": {
							"total": "0.05",
							"currency": "USD"
						},
						"description": "Spooky calls!"
					}
				]
			}
		}, function(e,r){
			if(e)
				console.log(e)
			payment = result.data;
			console.log("PayPal redirect: " + payment.links[1].href);
			myFuture.return(payment.links[1].href);
		});

		return myFuture.wait()

	}
})