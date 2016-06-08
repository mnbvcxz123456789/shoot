/*window.onload = function(){*/
	var mouseX = null,
		mouseY = null,
		canvas = document.getElementById("canvas"),
		ctx = canvas.getContext("2d"),
		tk = null,//坦克
		tankX = canvas.width*0.4,//坦克位置的起始X值
		tankY = canvas.height*0.93,  //坦克位置的起始y值
		tankColor = ["#000000","#696969"],//坦克颜色
		angle = 0;//坦克炮杆的旋转弧度
		ballArray = [];//存放页面上的小球
		bulletArray = [];//存放页面上的子弹
		level = 1,//游戏等级
		goal = 20000,//目标分数
		score = 0,//当前得分
		getBallTimer = null,
		runTimer = null,
		countdownTimer = null,
		countdown = 60;//倒计时
		w = window,
		requestFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;
	var game = (function(){
		return {
			init: function(){
				this.adjustCanvas();
				window.addEventListener("resize",function(e){
					game.adjustCanvas;
				});

				this.showInfo();
				tk = new tank(tankX,tankY,0,tankColor);
				tk.drowTank();
				shape.showShape();
				/*this.loop();*/
				shape.moveGun();
				this.countdown();
				
			},
			//游戏页面自适应屏幕
			adjustCanvas: function(){
				/*canvas.width = window.innerWidth*0.9;
                canvas.height = window.innerHeight*0.96;*/
			},
			clearFrame: function(){
				ctx.clearRect(0,0,canvas.width,canvas.height);
			},
			/*loop: function(){
				this.clearFrame();
				this.adjustCanvas();
				requestFrame.call(window,this.loop.bind(this));
			}*/
			//颜色格式
			toRGB: function(red,green,blue){
				rgbR = this.addZero(red.toString(16));
				rgbG = this.addZero(green.toString(16));
				rgbB = this.addZero(blue.toString(16));
				var rgb = "#"+rgbR+rgbG+rgbB;
				return rgb;
			},
			addZero: function(string){
				return string.length == 2?string:"0"+string;
			},
			showInfo: function(){
				$("#level").text(level);
				$("#goal").text(goal);
				$("#score").text(score);
				if(score >= goal){
					$('.success').show();
					window.clearInterval(getBallTimer);
					window.clearInterval(runTimer);
					window.clearInterval(countdownTimer);
					window.unbind();
				}
			},
			countdown:function(){
				$("#time").text(countdown);
				countdownTimer = setInterval(function(){
					$("#time").html(countdown);
					if(countdown == 0){
						$('.fail').show();
						window.clearInterval(getBallTimer);
						window.clearInterval(runTimer);
						window.clearInterval(countdownTimer);
						window.unbind();
					}
					countdown--;
				},1000);
			}
		}
	})();
	var shape  = {
		//移动炮杆
		moveGun: function(){
			//炮杆跟随鼠标移动
			window.onmousemove = function(e){
				if(e.target.tagName = "CANVAS"){
					mouseX = e.clientX - e.target.getBoundingClientRect().left;
					mouseY = e.clientY - e.target.getBoundingClientRect().top;
					var moveY = mouseY-tankY-15;
					var moveX = mouseX-tankX-18;  
					/*if(Math.abs(moveY) < 30 && Math.abs(moveX) < 30) {*/
						if(moveX >= 0){
							//炮杆向右转
							angle = Math.atan(Math.abs(moveX)/Math.abs(moveY));
						}else{
							//炮杆向左转
							angle = -Math.atan(Math.abs(moveX)/Math.abs(moveY));
						}
						tk = new tank(tankX,tankY,angle,tankColor);
						tk.drowTank();

						window.onclick = function(){

							var bt = new bullet(tankX+18,tankY+15,angle,30);
							bulletArray.push(bt);
						}
					/*}*/
				}else{
					mouseX = null;
					mouseY = null;
				}
			}
		},
		//获得小球
		getBall: function(){
			var bl = new ball(0,200+Math.random()*30,game.toRGB(parseInt(Math.random()*256),parseInt(Math.random()*256),parseInt(Math.random()*256)),15);
			ballArray.push(bl);
		},
		showShape: function(){
			shape.getBall();
			//小球隔2s释放一个
			getBallTimer = setInterval(function(){
				shape.getBall();
			},2000);
			//页面刷新
			runTimer = setInterval(function () {
                shape.drawBall();
                shape.runBall();

                shape.drawBullet();
                shape.runBullet();
                game.showInfo();
			},160);
		},
		//小球运动
		runBall: function(){
			ballArray.forEach(function(){
				if(this.x < 0 || this.x >= 480 || this.y <= 0 || this.y >= 530){
					//小球运动到游戏界面外
					this.isLive = false;
					var index = ballArray.indexOf(this);
					ballArray.splice(index,1);
					/*shape.getBall();*/
				}else{
					var rb = this;
					var flag = true;
					//遍历页面上所有子弹
					bulletArray.forEach(function(){
						var dx = Math.abs(this.x-rb.x);
						var dy = Math.abs(this.y-rb.y);
						if(Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2))<rb.radius+this.radius+5){
							//小球被子弹击中
							rb.isLive = false;
							this.isLive = false;
							var index = bulletArray.indexOf(this);
							bulletArray.splice(index,1);
							score+=500;
						}
					});
					if(this.isLive){
						this.x+=this.speed;
						if(Math.floor(Math.random()*10)%2){
							this.y+=Math.random()*15;
						}else{
							this.y-=Math.random()*15;
						}
					}else{
						rb.opacity = 0.5;
						rb.radius = 18;
						rb.color = "#ffffff";
						/*var rb_z = Math.sqrt(Math.pow(Math.abs(480-rb.x),2)+Math.pow(Math.abs(0-rb.y),2));
						var rb_sin = rb.y/rb_z;
						var rb_cos = rb.x/rb_z;
						rb.x += 50*rb_cos;
						rb.y -= 50*rb_sin;*/
						rb.y -= 30;
					}
				}
			});
		},
		//画小球
		drawBall: function(){
			ctx.clearRect(0,0,canvas.width,530);
			ballArray.forEach(function(){
				ctx.beginPath();
				ctx.fillStyle = this.color;
				ctx.globalAlpha = this.opacity;
				ctx.arc(this.x,this.y,this.radius,0,Math.PI*2,true);
				ctx.closePath();
				ctx.fill();
			});
		},
		//画子弹
		drawBullet: function(){
			ctx.clearRect(0,500,canvas.width,canvas.height);
			bulletArray.forEach(function(){
				ctx.beginPath();
				ctx.fillStyle = "#696969";
				ctx.arc(this.x,this.y,this.radius,0,Math.PI*2,true);
				ctx.closePath();
				ctx.fill();
			});

			tk = new tank(tankX,tankY,angle,tankColor);
			tk.drowTank();
		},
		//子弹飞行
		runBullet: function(){
			bulletArray.forEach(function(){
				if(this.isLive){
					if(this.x < 0 || this.x >= 480 || this.y <= 0){
						//×Óµ¯Í£Ö¹
						this.isLive = false;
						var index = bulletArray.indexOf(this);
						bulletArray.splice(index,1);
					}else{
						this.x+=this.speed*Math.sin(this.direct);
						this.y-=this.speed*Math.cos(this.direct);
					}
				}
			});
		}
	};
	//定义坦克对象
	var tank = function(x,y,direct,color){
		this.x = x;
		this.y = y;
		this.direct = direct;
		this.color = color;
	}
	tank.prototype = {
		drowTank: function(){
			ctx.clearRect(0,500,canvas.width,canvas.height);
			ctx.fillStyle = this.color[0];
			ctx.fillRect(this.x,this.y,10,40);//坦克左边矩形
			ctx.fillRect(this.x+25,this.y,10,40);//坦克右边矩形
			ctx.fillRect(this.x+10,this.y+7,25,28);//坦克中间矩形
			ctx.save();
			ctx.fillStyle = this.color[1];
			ctx.beginPath();
			ctx.arc(this.x+18,this.y+18,7,0,Math.PI*2,true);
			ctx.closePath();
			ctx.fill();
			ctx.restore();
			ctx.strokeStyle = this.color[1];
			ctx.lineWidth = 4;
			ctx.save();
			ctx.beginPath();
			ctx.translate(this.x+18,this.y+15);
			/*ctx.rotate(20*Math.PI/180);*/
			ctx.rotate(this.direct);
			ctx.moveTo(0,0);
			ctx.lineTo(0,-29);
			ctx.closePath();
			ctx.stroke();
			ctx.restore();

		}
	}
	//定义小球对象
	var ball = function(x,y,color,speed){
		this.x = x;
		this.y = y;
		this.color = color;
		this.speed = speed;
		this.timer = null;
		this.isLive = true;
		this.opacity = 1;
		this.radius = 10;
	}
	//定义子弹对象
	var bullet = function(x,y,direct,speed){
		this.x = x;
		this.y = y;
		this.direct = direct;
		this.speed = speed;
		this.isLive = true;
		this.radius = 3;
	}
	Array.prototype.forEach = function(callback){
        for(var i=0;i<this.length;i++){
            callback.call(this[i]);
        }
    }

	game.init();

/*}*/
