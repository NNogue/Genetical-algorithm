var endpos;
var Pop
var lifespan = 500;
var count = 0;
var lifeP;
var generation = 1;
var genP;
var indNum = 100;

var rt = 350;
var rl = 200;
var rh = 100;
var rw = 400;

function setup() {
	createCanvas(800,800);
	ind = new Ind();
	Pop = new Population();
	lifeP = createP()
	genP = createP()
	endpos = createVector(width/2, 100);
}


function draw() {
	background(0);
	noStroke();
	rect(rl,rt,rw,rh);
	ellipse(endpos.x,endpos.y,20,20);
	Pop.run()
	lifeP.html(count);
	genP.html("Generation: " + generation);
	count++;
	if (count == lifespan){
		Pop.evaluate();
		Pop.selection();
		count = 0;
		generation++;
	}
}

//######################################## DNA Function #############################################################################

function DNA(genes) {
	if (genes) {
		this.genes = genes;
	} else {
		this.genes = [];
		for (var i = 0; i < lifespan; i++) {
			this.genes[i] = p5.Vector.random2D();
			this.genes[i].setMag(0.1);
		}
	}

	this.crossover = function(partner) {
		var newGenes = [];
		var mid = floor(random(this.genes.length));
		for (var i = 0; i < this.genes.length; i++) {
			if (i > mid) {
				newGenes[i] = this.genes[i];
			} else {
				newGenes[i] = partner.genes[i];
			}
		}
		return new DNA(newGenes);
	}

	this.mutation = function() {
		for (var i = 0; i < this.genes.length; i++) {
			if (random(1) < 0.01) {
				this.genes[i] = p5.Vector.random2D();
				this.genes[i].setMag(0.1);
			}
		}
	}
}



//########################################### Population Function #####################################################################
function Population() {
	this.inds = [];
	this.popsize = indNum;
	this.matingpool = [];

	for (var i = 0; i < this.popsize; i++) {
		this.inds[i] = new Ind();
	}

	this.run = function() {
		for (var i = 0; i < this.popsize; i++) {
			this.inds[i].update();
			this.inds[i].show();
		}
	}

	this.selection = function() {
		var newInds = [];
		for (var i = 0; i < indNum; i++) {
			var parA = random(this.matingpool).dna;
			var parB = random(this.matingpool).dna;
			var child = parA.crossover(parB);
			child.mutation();
			newInds[i] = new Ind(child)
		}
		this.inds = newInds;

	}

	this.evaluate = function() {
		var maxfit = 0;


		for (var i = 0; i < this.popsize; i++) {
			this.inds[i].calcFitness();
			if (this.inds[i].fitness > maxfit) {
				maxfit = this.inds[i].fitness;
			}
		}

		console.log(maxfit)

		for (var i = 0; i < this.popsize; i++) {
			this.inds[i].fitness /= maxfit;
		}

		this.matingpool = [];

		/*for (var i = 0; i < this.popsize; i++) {
			var n = this.inds[i].fitness*100;
			for (j = 0; j < n; j++) {
				this.matingpool.push(this.inds[i]);
			}
		}*/
		for (var i = 0; i < this.popsize; i++) {
			if (random(1) < this.inds[i].fitness) {
				this.matingpool.push(this.inds[i]);
			}
		}
	}
}


//######################################## Individual Function ######################################################################
function Ind(dna) {
	this.pos = createVector(width/2,height - 5);
	this.vel = createVector();
	this.acc = createVector();
	this.completed = false;
	this.crashed = false;
	if(dna) {
		this.dna = dna;
	} else {
		this.dna = new DNA();
	}
	this.fitness = 0;
	this.applyForce = function(force) {
		this.acc.add(force);
	}

	this.update = function() {
		var d = dist(this.pos.x, this.pos.y, endpos.x,endpos.y);
		if (d < 10) {
			this.completed = true;
			this.pos.x = endpos.x;
			this.pos.y = endpos.y;
		}

		if (this.pos.y > rt && this.pos.y < rt+rh && this.pos.x > rl && this.pos.x < rl+rw || this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height){
			this.crashed = true;
		}
		if (!this.completed && !this.crashed) {
			this.applyForce(this.dna.genes[count])
			this.count++;
			this.vel.add(this.acc);
			this.pos.add(this.vel);
			this.acc.mult(0);
		}
	}

	this.show = function() {
		push();
		translate(this.pos.x, this.pos.y);
		rotate(this.vel.heading());
		rectMode(CENTER);
		fill(255, 200)
		rect(0,0, 25,5);
		pop();
	}

	this.calcFitness = function(){
		var d = dist(this.pos.x, this.pos.y, endpos.x,endpos.y);

		this.fitness = map(d, 0, width, width, 0);
		if (this.completed) {
			this.fitness *= 10;
		}

		if (this.crashed) {
			this.fitness *= 0.2;
		}

	}
}
