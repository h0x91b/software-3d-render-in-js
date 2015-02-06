THREE.Vector3.prototype.toInt = function() {
	this.x = ~~this.x;
	this.y = ~~this.y;
	this.z = ~~this.z;
	return this;
}

function TGAEmulator(width, height, wrapper) {
	this.flipVertically = false;
	this.wrapper = wrapper;
	this.width = width;
	this.height = height;
	this.canvas = document.createElement('canvas');
	this.canvas.setAttribute('width', width);
	this.canvas.setAttribute('height', height);
	this.canvas.style.float = 'left';
	this.wrapper.appendChild(this.canvas);
	this.ctx = this.canvas.getContext('2d');
	this.clear();

	var id = this.ctx.createImageData(1,1);
	function setPixel(x,y,r,g,b,a) {
		id.data[0] = r;
		id.data[1] = g;
		id.data[2] = b;
		id.data[3] = a;
		y = this.flipVertically ? this.height - y : y;
		this.ctx.putImageData( id, x, y );
	}
	this.setPixel = setPixel;
}

TGAEmulator.prototype = {
	clear: function() {
		this.ctx.fillRect(0, 0, this.width, this.height);
	},
	set: function(x,y,color) {
		this.setPixel(~~x,~~y,~~color[0],~~color[1],~~color[2],~~color[3]);
	},
	flip_vertically: function() {
		this.flipVertically = !this.flipVertically;
	}
};

function Model(txt, texture) {
	var self = this;
	this.texture = texture;
	this.faces = [];
	this.verts = [];
	this.norms = [];
	this.uvs = [];
	txt.split('\n').forEach(function(line){
		var t, n;
		var v, vt, vn;
		var prefix = line.substr(0, 2);
		switch(prefix) {
		case 'v ':
			t = line.split(' ');
			self.verts.push({
				x: parseFloat(t[1]),
				y: parseFloat(t[2]),
				z: parseFloat(t[3]),
			});
			break;
		case 'vt':
			//vt 0.476 0.777 0.000
			t = line.split(' ');
			self.uvs.push({
				u: parseFloat(t[1]),
				v: parseFloat(t[2]),
				w: parseFloat(t[3]) || 0,
			});
			break;
		case 'vn':
			t = line.split(' ');
			self.norms.push({
				x: parseFloat(t[1]),
				y: parseFloat(t[2]),
				z: parseFloat(t[3]),
			});
			break;
		case 'f ':
			t = line.split(' ');
			var p = [];
			for(var i=1;i<4;i++) {
				n = t[i].split('/');
				v = parseInt(n[0]) || 1;
				vt = parseInt(n[1]) || 1;
				vn = parseInt(n[2]) || 1;
				p.push({
					v: v - 1,
					vt: vt - 1,
					vn: vn - 1
				});
			}
			self.faces.push(p);
			break;
		}
	});
	
	this.uv = function(iface, nvert) {
		var idx = this.faces[iface][nvert].vt;
		return new THREE.Vector3(
			~~(this.uvs[idx].u*this.texture.width),
			this.texture.height-~~(this.uvs[idx].v*this.texture.height),
			0
		).toInt();
	}
	
	this.diffuse = function(vec) {
		if (vec.x<0 || vec.y<0 || vec.x>=this.texture.width || vec.y>=this.texture.height) {
			return {r:0,g:0,b:0,a:0};
		}
		var idx = ~~(vec.x + (vec.y*this.texture.width));
		return this.texture.image[idx];
	}
}

function loadTexture(base64, cb) {
	var imageObj = new Image();
	imageObj.src = base64;
	
	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');
	
	var data = null;
	var imageWidth = imageObj.width;
	var imageHeight = imageObj.height;
	canvas.width = imageWidth;
	canvas.height = imageHeight;
	//document.body.appendChild(canvas);
	context.drawImage(imageObj, 0, 0);
	data = context.getImageData(0, 0, imageWidth, imageHeight).data;
	imageObj.style.display = 'none';
	var image = [];
	for(var i=0;i<data.length;i+=4) {
		image.push({
			r: data[i+0],
			g: data[i+1],
			b: data[i+2],
			a: data[i+3]
		});
	}
	data = null;
	cb({
		width: imageWidth,
		height: imageHeight,
		image: image,
		imageObj: imageObj
	});
}