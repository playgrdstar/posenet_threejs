
// organic is used to store the list of instances of Organic objects that we will create
var organics = [];
// The variable change stores the rate of rotation and the y coordinate for noise later
var change, colorsPalette;


function setup() {
  createCanvas(800, 800);
  background(0,255);
  change = 0;
  colorsPalette = [color(146, 167, 202,30),
            color(186, 196, 219,30),
            color(118, 135, 172,30),
            color(76, 41, 81,30),
            color(144, 62, 92,30),
            color(178, 93, 119,30),
            color(215, 118, 136,30),
            color(246, 156, 164,30),];

  for (var i=0;i<110;i++){
    organics.push(new Organic(0.1+1*i,width/2,height/2,i*1,i*random(90),colorsPalette[floor(random(8))]));
  }
  



  // organic[0].show();
  // noLoop();
}

function draw() {
  background(159,65,115,30);
  for(var i=0; i<organics.length;i++){
      organics[i].show(change);
  }

  change+=0.01;

}

function Organic(radius,xpos,ypos,roughness,angle,color){

  this.radius = radius; //radius of blob
  this.xpos = xpos; //x position of blob
  this.ypos = ypos; // y position of blob
  this.roughness = roughness; // magnitude of how much the circle is distorted
  this.angle = angle; //how much to rotate the circle by
  this.color = color; // color of the blob

  this.show = function(change){

    noStroke(); // no stroke for the circle
    // strokeWeight(0.1); //We can use this to set thickness of the stroke if necessary
    // stroke(200); //We can use this to set the color of the stroke if necessary
    fill(this.color); //color to fill the blob

    push(); //we enclose things between push and pop so that all transformations within only affect items within
    translate(xpos, ypos); //move to xpos, ypos
    rotate(this.angle+change); //rotate by this.angle+change
    beginShape(); //begin a shape based on the vertex points below
    //The lines below create our vertex points
    var off = 0;
    for (var i = 0; i < TWO_PI; i += 0.1) {
      var offset = map(noise(off, change), 0, 1, -this.roughness, this.roughness);
      var r = this.radius + offset;
      var x = r * cos(i);
      var y = r * sin(i);
      vertex(x, y);
      off += 0.1;
    }
    endShape(); //end and create the shape
    pop();

    }
}