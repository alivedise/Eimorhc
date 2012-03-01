steal('funcunit').then(function(){

module("Eimorhc.Breaker", { 
	setup: function(){
		S.open("//eimorhc/breaker/breaker.html");
	}
});

test("Text Test", function(){
	equals(S("h1").text(), "Eimorhc.Breaker Demo","demo text");
});


});