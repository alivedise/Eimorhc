steal( 'jquery/controller','jquery/view/ejs','./breaker.css','resource/jquery/excanvas' )
	.then( './views/init.ejs', function($){

/**
 * @class Eimorhc.Breaker
 */
$.Controller('Eimorhc.Breaker',
/** @Static */
{
	defaults : {
		canvas: {
			C : 50,
			R : 50 + 10,
			r : 50 - 10,
			x : 75,
			y : 75
		},
		timeline: {
			C: 60,
			R: 50,
			x: 75,
			y: 75,
			r: 40
		},
		color: ['black', 'red', 'orange', 'green', 'blue', 'purple', 'yellow']
	},
	init: function(){
		this.img = new Image();  
		this.img.src = './y.png';  
	},
	img: null
},
/** @Prototype */
{
	vars: null,
	steped: [],
	available: [],
	init : function(){
		var self = this;
		this.vars = $.extend($('<div>')[0], {
			angle: 0,
			plus: 0,
			minus: 0,
			end: false,
			customAnimate: true,
			updated: true
		});

		var $_fx_step_default = $.fx.step._default;
		$.fx.step._default = function (fx) {
			if (!fx.elem.customAnimate) return $_fx_step_default(fx);
			fx.elem[fx.prop] = fx.now;
			fx.elem.updated = true;
		};
		this.element.html("./views/init.ejs",{}, this.callback('render'));
	},
	render: function(){
		var self = this;
		setInterval(function(){
			if (!self.vars.updated) return;
			self.vars.updated = false;					
			self.renderClock();
		}, 30);
		this.generateRandomPuzzle();
		$('#result').html('SYNCHRONIZE THE TIMELINE!').css({color: 'black'});
		$(this.vars).animate({ angle: 0, plus: 0, minus: 0 }, { duration: 2000, queue: false });
	},
	generateRandomPuzzle: function(){
		this.puzzle = new Array(5+Math.floor(8*Math.random()));
		var token = this.puzzle.slice();
		for(var i = 0; i < this.puzzle.length; i++)
		{
			token[i] = i;
		}
		token.sort(function(){return Math.random()>0.5?-1:1;});
		steal.dev.log(token);
		for(var i = 0; i < token.length; i++)
		{
			this.puzzle[token[i]] = (token.length+token[i]-token[(i+1)%token.length])%token.length > (token.length+token[(i+1)%token.length]-token[i])%token.length ? (token.length+token[(i+1)%token.length]-token[i])%token.length: (token.length+token[i]-token[(i+1)%token.length])%token.length;
			this.steped[i] = false;
			this.available[i] = true;
		}
		steal.dev.log(this.puzzle);
	},
	renderClock: function(){
		var canvas = this.element.find('#canvas canvas')[0], self = this;
		var ctx = canvas.getContext("2d");
		var options = self.constructor.defaults.canvas;
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		ctx.beginPath();
		ctx.arc(options.x,options.y,options.C,0,Math.PI*2,true); // 外圈
		ctx.fillStyle = 'black';
		ctx.font= 'bold 18px sans-serif';
		ctx.fill();
		var slice = index/self.puzzle.length;
		$.each(self.puzzle, function(index, value){
				if(self.available[index] && !self.steped[index])
				{
					ctx.beginPath();
					ctx.fillStyle = "#0186d1";
					ctx.strokeStyle = "#0186d1";
					ctx.arc(options.x+options.r*Math.sin(2*Math.PI*slice), options.y-options.r*Math.cos(2*Math.PI*slice), 10, 0, Math.PI*2, true);   
					ctx.fill();
					ctx.closePath();
				}
				if(!self.steped[index])
				{
					ctx.fillStyle = self.constructor.defaults.color[value];
					ctx.fillText(value, options.x-6+options.r*Math.sin(2*Math.PI*slice), options.y+6-options.r*Math.cos(2*Math.PI*slice));   
				}
			});
		ctx.save();


		ctx.translate(options.x,options.y);
		ctx.rotate(2*Math.PI*((this.vars.plus+this.vars.angle)/this.puzzle.length));
		ctx.drawImage(this.constructor.img,-4,-options.y/2+5,7,37);  
		ctx.restore();
		ctx.save();
		ctx.translate(options.x,options.y);
		ctx.rotate(2*Math.PI*((this.vars.angle+this.vars.minus)/this.puzzle.length));
		ctx.drawImage(this.constructor.img,-4,-options.y/2+5,7,37);  
		ctx.restore();
		ctx.save();
	},
	renderPuzzle: function(a){
		var canvas = this.element.find('#canvas canvas')[0], self = this;
		var ctx = canvas.getContext("2d");
		var options = self.constructor.defaults.canvas;
		ctx.beginPath();
		ctx.fillStyle = "black";
		var l = a.length;
		var b = new Array(a.length);
		$.each(a, function(index, value){
			b[value] = index+1;;
		});
		$.each(b, function(index, value){
			var sl = index/l;
			ctx.fillText(value, options.x-6+options.R*Math.sin(2*Math.PI*sl), options.y+6-options.R*Math.cos(2*Math.PI*sl));   
		});
		ctx.stroke();
	},
	'#new click': function(){
		this.render();
	},
	'#reset click': function(){
		var self = this;
		$.each(this.puzzle, function(i, v){
			self.steped[i] = false;
			self.available[i] = true;
		});
		$(self.vars).animate({ angle: 0, plus: 0, minus: 0 }, { duration: 2000}).queue(function(){	
			$(this).dequeue();
		});
	},
	checkResult: function(){
		var res = true;
		$.each(this.steped, function(i, v){
			res = res && v;
		});
		return res;
	},
	checkSurvive: function(){
		var res = false, self = this;
		$.each(this.steped, function(i, v){
			if(!v && self.available[i])
			{
				res = true;
				return false;
			}
		});
		return res;
	},
	'canvas click': function(el, ev){
		var self = this;
		var x = ev.pageX-$("#canvas canvas").offset().left;
		var y = ev.pageY-$("#canvas canvas").offset().top;
		steal.dev.log(x, y);
		var options = this.options.canvas;
		$.each(this.puzzle, function(index, value){
			var X = options.x-6+options.r*Math.sin(2*Math.PI*index/(self.puzzle.length));
			var Y = options.y+6-options.r*Math.cos(2*Math.PI*index/(self.puzzle.length));   
			steal.dev.log(X, Y);
			var dist_square = (x - X)*(x - X) + (y - Y)*(y - Y);
			if(dist_square <= 12*12)
			{
				if(self.steped[index] || !self.available[index])
				{
					return false;
				}
				steal.dev.log(index, value, X, Y);
				self.steped[index] = true;
				$.each(self.steped, function(i, v)
				{
					if(!self.steped[i] && ((index+value)%self.puzzle.length == i) ||((self.puzzle.length+index-value)%self.puzzle.length == i))
					{
						self.available[i] = true;
					}
					else
					{
						self.available[i] = false;
					}
				});
				steal.dev.log(self.puzzle);
				steal.dev.log(self.steped);
				steal.dev.log(self.available);
				if(self.checkResult())
				{
					$('#result').html('TIMELINE SYNCHRONIZED!').css({color: '#0186d1'});
					$(self.vars).animate({ angle: index, plus: 0, minus: 0 }, { duration: 2000}).queue(function(){	
						$(this).dequeue();
					}).animate({ angle: 0, plus: 0, minus: 0 }, { duration: 2000}).queue(function(){
						$(this).dequeue();
					});
				}
				else if(!self.checkSurvive())
				{
					$(self.vars).animate({ angle: index, plus: 0, minus: 0 }, { duration: 2000}).queue(function(){	
						$('#result').html('TIMELINE CORRUPTED!').css({color: 'red'});
						$(this).dequeue();
					});
				}
				else
				{
					$(self.vars).animate({ angle: index, plus: 0, minus: 0 }, { duration: 2000}).queue(function(){	
						$(this).dequeue();
					}).animate({ angle: index, plus: value, minus: -value }, { duration: 2000}).queue(function(){
						$(this).dequeue();
					});
				}
				return false;
			}
		});
	}

})

});
