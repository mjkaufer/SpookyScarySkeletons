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


Meteor.methods({
	'sendCall':function(number){
		
		/*if(Meteor.users.find(this.userId()).profile.credits <= 0)
			Meteor.call('callback',"You don't have enough credits!",true);
		*/
		
		twilioClient.makeCall({
			url: "http://twimlets.com/echo?Twiml=" + encodeURIComponent(xml),
			to: number,
			from: phoneNumber
		}, function(err, call) {
			console.log(err, call);
			Meteor.call('callback',"Your call to " + number + " has been completed!",(err===undefined || err==="" || err===null));
		});
		
	}, 'test':function(){
			console.log(this.userId);
			user = Meteor.users.findOne(this.userId);
	}
})