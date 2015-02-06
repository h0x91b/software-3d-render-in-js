function Matrix(r, c) {
	this.rows = r;
	this.cols = c;
	
	this.m = Array(r);
	for(var i=0;i<r;i++) {
		this.m[i] = Array(c);
		for(var j=0;j<c;j++)
			this.m[i][j] = 0.
	}
}

Matrix.identity = function(dimensions){
	var E = new Matrix(dimensions, dimensions);
	for (var i=0; i<dimensions; i++) {
		for (var j=0; j<dimensions; j++) {
			E.row(i)[j] = (i==j ? 1. : 0.);
		}
	}
	return E;
}

Matrix.prototype = {
	row: function(r) {
		return this.m[r];
	},
	mul: function(a) {
		var rows = this.rows;
		var cols = this.cols;
		var result = new Matrix(rows, a.cols);

		for (var i=0; i<rows; i++) {
			for (var j=0; j<a.cols; j++) {
				result.row(i)[j] = 0.;
				for (var k=0; k<cols; k++) {
					result.row(i)[j] += this.row(i)[k]*a.row(k)[j];
				}
			}
		}
		return result;
	}
}