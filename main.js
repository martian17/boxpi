var boxCollision = function({m1,m2,x1,x2,v1,v2},draw){
    var dataCache = {};
    dataCache.old = {t:0,m1,m2,x1,x2,v1,v2};
    dataCache.new = {t:0,m1,m2,x1,x2,v1,v2};
    var tt = 0;
    var cnt = 0;
    var terminated = false;
    
    var animated = false;
    var start = 0;
    var animate = function(t){
        if(start === 0)start = t;
        var dt = start-t;
        start = t;
        //hmm maybe dont use dt this time
        var [xt1,xt2] = getPosition(t);//name because: x in real time
        //draw the boxes
        if(dataCache.new.t < t && terminated){
            draw(xt1,xt2,cnt);
        }else{
            draw(xt1,xt2,cnt-1);
        }
        
        if(animated)requestAnimationFrame(animate);
    };
    this.startAnimation = function(){
        animated = true;
        requestAnimationFrame(animate);
    };
    this.pauseAnimation = function(){
        animated = false;
    };
    
    var getPosition = function(t){
        if(dataCache.new.t < t && !terminated){//cache too old, need to renew
            dataCache.old = dataCache.new;
            //side effect function, changes {t:tt,m1,m2,x1,x2,v1,v2}
            terminated = calculateNewPosition(t);//return if tt exceeds t or terminationg condition is met
            dataCache.new = {t:tt,m1,m2,x1,x2,v1,v2};
        }
        if(dataCache.new.t < t && terminated){//special case to prevent ghosting
            var n = dataCache.new;
            var xt1 = n.x1+(t-n.t)*n.v1;
            var xt2 = n.x2+(t-n.t)*n.v2;
            return [xt1,xt2];
        }else{
            //interpolate the result from the cache
            var o = dataCache.old;
            var n = dataCache.new;
            var xt1 = o.x1+(t-o.t)/(n.t-o.t)*(n.x1-o.x1);
            var xt2 = o.x2+(t-o.t)/(n.t-o.t)*(n.x2-o.x2);
            return [xt1,xt2];
        }
    }
    var calculateNewPosition = function(t){
        while(true){
            if(v2 >= 0 && v1>v2){
                return true;//true means ended
            }
            if(tt > t){
                return false;
            }
            cnt++;
            var dtBox = -(x2-x1)/(v2-v1);
            var dtWall1 = -x1/v1;
            dtBox = dtBox<=0?Infinity:dtBox;
            dtWall1 = dtWall1<=0?Infinity:dtWall1;
            if(dtBox < dtWall1){//collision between the boxes
                x1 = x2 = dtBox*v1+x1;
                var vavg = (v1*m1+v2*m2)/(m1+m2);
                v1 = 2*vavg-v1;
                v2 = 2*vavg-v2;
                tt += dtBox;
            }else{//collision between b2 and the wall
                if(v2 > 0){
                    console.log("error1");
                    console.log(v2);
                    return true;
                }
                var dtWall2 = -x2/v2;
                x2 = 0;
                v2 = -v2;
                x1 = x1+dtWall2*v1;
                tt += dtWall2;
            }
        }
    }
};


var canvas = document.getElementById("canvas");
var width = window.innerWidth;
var height = window.innerHeight-20;
canvas.width = width;
canvas.height = height;
var b1w = width/10;
var b2w = width/20;
var ctx = canvas.getContext("2d");
ctx.font = '16px arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

var simulation = new boxCollision({
    m1:10000000000,
    m2:1,
    x1:(width-b2w)/2,
    x2:(width-b2w)/5,
    v1:-0.1,//0.1 px per milliseconds, 100px per second
    v2:0
},function(x1,x2,cnt){
    ctx.clearRect(0,0,width,height);
    ctx.fillStyle = "#555";
    ctx.fillRect(x2,height-b2w,b2w,b2w);
    ctx.fillStyle = "#55f";
    ctx.fillRect(x1+b2w,height-b1w,b1w,b1w);
    ctx.fillStyle = "#000";
    ctx.fillText("1kg",x2+b2w/2,height-10);
    ctx.fillText("1e+10kg",x1+b2w+b1w/2,height-10);
    //console.log(cnt);
    document.getElementById("display").innerHTML = cnt+" collisions  pi = "+cnt/100000;
});

simulation.startAnimation();


