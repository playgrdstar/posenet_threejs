var data = [];
var errors = [];
var P5 = new p5();
var total, boundary;
var epochs, alpha;

var predX = -100, predY = -100;

var predOut = 2;

var finalerror;

// Buttons
$('#generate').click(()=>{
    data = [];
    total = $('#total').val();
    boundary = $('#boundary').val();
    generateData(total,boundary,1,500);
});

$('#train').click(()=>{
    errors = [];
    epochs = 500;
    alpha = 0.2;
    train(epochs,alpha);
    // finalerror = 1+Math.round(errors.slice(-1)[0].error*100)/100;
});

$('#predict').click(()=>{
    predOut = predict(predX,predY);
    console.log(predOut);
});

// Plotting data
var sketch1 = function(p) {

p.setup = function(){
  p.createCanvas(500, 500);
  p.background(255,50);
  smooth();
}

p.draw = function(){

    p.background(212,150,167,50);
    data.forEach((d)=>{

        if (d.y==0){
            p.noStroke();
            p.fill(228,247,255);
            p.ellipse(d.x1, d.x2,5,5);
        } else if (d.y==1){
            p.noStroke();
            p.fill(108,212,255);
            p.ellipse(d.x1, d.x2,5,5);            
        }

    })

    // Predicted point

    predX = $('#pointX').val();
    predY = $('#pointY').val();
    p.noFill();
    p.stroke(255,0,0,100);
    p.ellipse(predX,predY,10,10);    

    if (predOut==0){
        p.noFill();
        p.stroke(228,247,255);
        p.ellipse(predX,predY,15,15);
    } else if (predOut==1){
        p.noFill();
        p.stroke(108,212,255);
        p.ellipse(predX,predY,15,15);            
    }

    // draw



}

};
new p5(sketch1, 'p5canvas1');


// Training metrics
var sketch2 = function(p) {

p.setup = function(){
  p.createCanvas(500, 500);
  p.background(255,50);
  setFrameRate(1);
}

p.draw = function(){

    p.background(212,150,167,50);
    errors.forEach((d)=>{

        p.noStroke();
        p.fill(228,247,255);
        p.ellipse(d.epoch, -d.error*p.height,2,2);

    })

    // Plot logistic curve
    var predY;
    var func;
    var out;
    for (var x=0;x<500;x++){
        func = A*x/100+B*x/100+C;
        predY = 1/(1+Math.exp(-func));
        p.noStroke();
        p.fill(108,212,255,255);
        p.ellipse(x,predY*p.height,1,1);       
    }

}

};

new p5(sketch2, 'p5canvas2');

var progresspercent;

// Utility functions
function generateData(total,boundary,upper,lower) {
    for (var i=0; i<total; i++){
        var X1, X2, Y;

        var cutoff = P5.random()*(upper-lower)+lower;

        if (i<=boundary){
            X1 = P5.random(lower,cutoff*0.9);
            X2 = P5.random(lower,cutoff*0.9);
            Y = 0;
        } else if (i>boundary){
            X1 = P5.random(cutoff*1.1,upper);
            X2 = P5.random(cutoff*1.1,upper);
            Y = 1;
        }

        data.push({x1:X1, x2:X2, y:Y});

    }

    var progresspercent = 0;

        $('.progress-bar').css('width', progresspercent+'%').attr('aria-valuenow', progresspercent);
    // console.log(data);
}

var A, B, C;

function train(epochs, alpha){

    console.log(data);

    errors =[];
    A = 0.0;
    B = 0.0;
    C = 0.0;

    var count =0;
    for (var i=0; i<epochs; i++){
        var error;
        
        data.forEach(d=>{

            var predY;
            var func;
            func = A*d.x1/100+B*d.x2/100+C;
            predY = 1/(1+Math.exp(-func));
            error = predY - d.y;
            tempA = A;
            tempB = B;
            tempC = C;

            A = tempA + alpha*-error*predY*(1-predY)*d.x1/100;
            B = tempB + alpha*-error*predY*(1-predY)*d.x2/100;
            C = tempC + alpha*-error*predY*(1-predY)*1.0;
            
            // errors.push({error:error, iteration:count});
            // count++;
        })

        console.log('A', A, 'B', B, 'C', C);
        console.log('Error', error);
        errors.push({error:error, epoch:i});

        var accuracy = 1+Math.round(error*100)/100;
        $('#accuracy').text(accuracy);


        var progresspercent = 100*i/500;

        $('.progress-bar').css('width', progresspercent+'%').attr('aria-valuenow', progresspercent);
    }

    console.log(errors);
    

}


function predict(x1,x2){

    var predY;
    var func;
    var out;
    func = A*x1/100+B*x2/100+C;
    predY = 1/(1+Math.exp(-func));

    if(predY>0.5){out=1}
    else if (predY<0.5){out=0};

    return out;
}
