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



// Meteor.users.allow({
// 	insert:function(){return false;},
// 	update:function(){return false;},
// 	remove:function(){return false;}
// })

Meteor.methods({
	'sendCall':function(number){
		
		Meteor.call('callback',this.userId + ":" + this.userId(),true);		

		
		if(this.userId == undefined)
			return Meteor.call('callback',"You need to be logged in, sneaky!",true);
		
		if(Meteor.users.find(this.userId()).profile.credits <= 0)
			return Meteor.call('callback',"You don't have enough credits!",true);
		
			
		
		Meteor.users.update({_id:this.userId},{$inc:{"profile.credits":-1}});//subtract credits
		
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