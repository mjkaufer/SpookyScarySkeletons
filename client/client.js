Meteor.methods({
	'callback':function(message,worked){
		if(worked)//call went through without errors
			alert(message);
		else
			alert("Call didn't go through - some error");
	}
});

  Template.paypalCreditCardForm.events({
    'submit #paypal-payment-form': function(evt, tmp){
      evt.preventDefault();

      var card_data = Template.paypalCreditCardForm.card_data();

// {
//   "type": "Card Type",
//   "name": "",
//   "number": "",
//   "expire_month": "03",
//   "expire_year": "2016",
//   "cvv": ""
// }


      //Probably a good idea to disable the submit button here to prevent multiple submissions.
      console.log(card_data)
      Meteor.Paypal.purchase(card_data, {total: '0.15', currency: 'USD'}, function(err, results){
        if (err) console.error(err);
        else console.log(results);
      });
    }
  });

Template.buttons.events({
	'click #button': function(){
		var number = document.getElementById('number').value;
		alert("Sending call to " + number)
		Meteor.call('sendCall',number, function(e,r){
			alert(r);
		});
	}
})