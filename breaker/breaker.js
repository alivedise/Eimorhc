steal( 'jquery/controller','jquery/view/ejs','./breaker.css' )
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
		this.img.src = 'pointer.png';  
	},
	img: null
},
/** @Prototype */
{
	vars: null,
	steped: [],
	init : function(){
		var self = this;
		this.vars = $.extend($('<div>')[0], {
			angle: 0,
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
		}
		steal.dev.log(this.puzzle);
	},
	renderClock: function(){
		var canvas = this.element.find('#canvas canvas')[0], self = this;
		var ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.save();
		var options = self.constructor.defaults.canvas;
		ctx.translate(options.x,options.y);
		ctx.rotate(this.vars.angle+2*Math.PI*(this.vars.plus/this.puzzle.length));
		ctx.drawImage(this.constructor.img,-5,-options.y/2+5);  
		ctx.restore();
		ctx.save();
		ctx.translate(options.x,options.y);
		ctx.rotate(this.vars.angle+2*Math.PI*(this.vars.minus/this.puzzle.length));
		ctx.drawImage(this.constructor.img,-5,-options.y/2+5);  
		ctx.restore();
		ctx.save();
		ctx.beginPath();
		ctx.arc(options.x,options.y,options.C,0,Math.PI*2,true); // 外圈
		ctx.font= 'bold 18px sans-serif';
		$.each(self.puzzle, function(index, value){
				ctx.fillStyle = self.constructor.defaults.color[value];
				ctx.fillText(value, options.x-6+options.r*Math.sin(2*Math.PI*index/(self.puzzle.length)), options.y+6-options.r*Math.cos(2*Math.PI*index/(self.puzzle.length)));   
			});
		ctx.stroke();
		ctx.restore();
	},
	renderPuzzle: function(a){
		var canvas = this.element.find('#canvas canvas')[0], self = this;
		var ctx = canvas.getContext("2d");
		var options = self.constructor.defaults.canvas;
		ctx.beginPath();
		ctx.fillStyle = "black";
		var b = new Array(a.length);
		$.each(a, function(index, value){
			b[value] = index+1;;
		});
		$.each(b, function(index, value){
			ctx.fillText(value, options.x-6+options.R*Math.sin(2*Math.PI*index/(a.length)), options.y+6-options.R*Math.cos(2*Math.PI*index/(a.length)));   
		});
		ctx.stroke();
	},
	'#reset click': function(){
		this.render();
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
			var dist_square = (x - X)*(x - X) + (y - Y)*(y - Y);
			if(dist_square <= 25*25)
			{
				if(self.steped[index])
				{
					return false;
				}
				steal.dev.log('match');
				var angle = Math.atan2((Y - options.y), (X - options.x))/ Math.PI * 180.0;
				(angle>=0 && angle <=180) ? angle += 90:((angle<0 && angle>=-90)? angle+=90: angle+=450);
				steal.dev.log(angle);
				self.steped[index] = true;
				$(self.vars).animate({ angle: Math.PI*angle/180, plus: 0, minus: 0 }, { duration: 2000}).queue(function(){	
					$(this).dequeue();
				}).animate({ angle: Math.PI*angle/180, plus: value, minus: -value }, { duration: 2000}).queue(function(){
					$(this).dequeue();
				});
				
				return false;
			}
		});
	}

})

});
