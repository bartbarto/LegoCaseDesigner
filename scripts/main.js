'use strict';

$(function() {
    var caseSize;
    var caseWidth;
    var caseHeight;

    calcCaseSize(7, 15);

    var pixels = []
    var roundedPixels = []
    var sortedBlocks;

    var imageDataURL;

    var canvas = document.getElementById('canvas-main');
    canvas.width = caseWidth;
    canvas.height = caseHeight;
    var ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle="#FFFFFF";
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clears the canvas

    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        // Great success! All the File APIs are supported.
    } else {
        alert('The File API is not supported in this browser, please upgrade to a newer browser like google chrome or firefox');
    }

    function handleFileSelect(evt) {

    	var files = evt.target.files;

        if (files && files[0]) {

           	var reader = new FileReader();

           	//for putting on canvas
           	var image = new Image();

            reader.onload = function(e) {
               $('#blah').attr('src', e.target.result);
               image.src = e.target.result;
            }

            reader.readAsDataURL(files[0]);

            image.onload = function() {

            	var iW = image.width;
            	var iH = image.height;

            	var scaleFactorW = caseWidth / iW;
            	var scaleFactorH = caseHeight / iH;

            	// scaleFactorH *= 1;
            	// scaleFactorW *= 1;

			    ctx.drawImage(image, 0, 0, image.width * scaleFactorW, image.height * scaleFactorH);

			    // Reset all drawing Params
			    clickX = [];
			    clickY = [];
			    clickDrag = [];
				clickColor = [];
			};
        }
    }

    document.getElementById('image').addEventListener('change', handleFileSelect, false);


    // Read in the image file as a data URL.


    $('#set').click(function(){
    	calcCaseSize();
    // 	setBlocks(caseWidth, caseHeight);
    // 	makeStuffSnappable();
    });

    $('#count').click(function(){
    	var pixelData = ctx.getImageData(0,0, canvas.width, canvas.height).data;
    	// console.log(pixelData);

    	var a, r, g, b;
    	var j = 0;
    	pixels = [];

    	for (var i=0;i<pixelData.length;i+=4)
		  {
		  r = pixelData[i];
		  g = pixelData[i+1];
		  b = pixelData[i+2];
		  a = pixelData[i+3];

		  pixels[j] = {a: a, r: r, g: g, b: b, hex: rgbToHex( r, g, b)};

		  // $('#pxPrev').append('<div style="float: left; width:10px; height:10px; display: block;background-color:'+pixels[j].hex+';">')

		   j++;
		  }

		roundToNearestColors(pixels, function(roundedPixels, nameArray){

			$('#pxPrev').empty();

			for (var i = 0; i < roundedPixels.length; i++) {

				$('#pxPrev')
				.append('<div class="lego" style="float: left; width:30px; height:30px; display: block;background-color:'
					+ roundedPixels[i]
					+ ';">');

			};

			var sortedBlocks = sortToObj(nameArray);

			$('.blocksToBuy').empty();
			$('.blocksToBuy').append('To build this case you need:<br />');

			var last = Object.keys(sortedBlocks)[Object.keys(sortedBlocks).length-1];

			for (var color in sortedBlocks) {
				// console.log(color, '->',sortedBlocks[color]);

				if (color !== last){
					$('.blocksToBuy').append('<strong>' + sortedBlocks[color] + '</strong> ' + color + ' blocks, <br />');
				}else{
					$('.blocksToBuy')
					.append('and <strong>' + sortedBlocks[color] + '</strong> ' + color + ' blocks.<br />');
				}


			};
		});

    })

	var legoColors = {
		black: '#000',
		white: '#fff',
	  	red: '#f00',
	  	yellow: '#ff0',
	  	blue: '#00f',
	  	gray: '#AFAFAF',
		green: '#008000',
		lightblue: '#ADD8E6',
		orange: '#ffa500',
		pink: '#FFB6C1',
		purple: '#800080',
		brown: '#7F3F00',
		darkgrey: '#52534E',
		gold: '#C0C427'
	};

	nearestColor = nearestColor.from(legoColors);


    function roundToNearestColors(colorArray, callback){

    	var res;
    	var nameArray = [];

    	for (var i = 0; i < colorArray.length; i++) {
    		res = nearestColor(colorArray[i].hex);
    		colorArray[i] = res.value;
    		nameArray[i] = res.name;
    	};

    	callback(colorArray, nameArray);
    }

    function calcCaseSize(caseWidthP, caseHeightP) {

    	caseWidth = $('#case-width').val() || caseWidthP;
    	caseHeight = $('#case-height').val() || caseHeightP;
    	caseSize = caseWidth * caseHeight;

    	canvas = document.getElementById('canvas-main');
    	canvas.width = caseWidth;
    	canvas.height = caseHeight;
    	ctx = canvas.getContext("2d");
    	ctx.imageSmoothingEnabled = false;

    }

    /*************************************
    * Stuff so we can draw on the canvas *
    **************************************/
    var paint = false;
    var clickX = [];
    var clickY = [];
    var clickDrag = [];
    var curColor = "#008000";
    var clickColor = [];

    ctx.strokeStyle = "#008000";

    $('#canvas-main').mousedown(function(e){
	  // var mouseX = e.pageX - this.offsetLeft;
	  // var mouseY = e.pageY - this.offsetTop;

	  var coords = canvas.relMouseCoords(e);
		var mouseX = coords.x;
		var mouseY = coords.y;

	  paint = true;
	  addClick(mouseX, mouseY);
	  redraw();
	});

	$('#canvas-main').mouseup(function(e){
	  paint = false;
	});

	$('#canvas-main').mouseleave(function(e){
	  paint = false;
	});

	$('#canvas-main').mousemove(function(e){
	  if(paint){
	  	var coords = canvas.relMouseCoords(e);
		var mouseX = coords.x;
		var mouseY = coords.y;

	    addClick(mouseX, mouseY, true);
	    redraw();
	  }
	});

	function addClick(x, y, dragging)
	{
	  clickX.push(x);
	  clickY.push(y);
	  clickDrag.push(dragging);
	  clickColor.push(curColor);
	}

	function redraw(){
	  ctx.lineJoin = "square";
	  ctx.lineWidth = 0.3;


	  for(var i=0; i < clickX.length; i++) {
	    ctx.beginPath();
	    if(clickDrag[i] && i){
	      ctx.moveTo(clickX[i-1], clickY[i-1]);
	     }else{
	       ctx.moveTo(clickX[i]-1, clickY[i]);
	     }
	     ctx.lineTo(clickX[i], clickY[i]);
	     ctx.closePath();
	     ctx.strokeStyle = clickColor[i];
	     ctx.stroke();
	  }
	}

	$('.tile').click(function(){
		curColor = $(this).data().color;
	})

});

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function sortToObj(a){
	var result = { };
	for(var i = 0; i < a.length; ++i) {
	    if(!result[a[i]])
	        result[a[i]] = 0;
	    ++result[a[i]];
	}

	return result;

	console.log(result);
}

function relMouseCoords(event){
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = this;

    do{
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    }
    while(currentElement = currentElement.offsetParent)

    canvasX = event.pageX - totalOffsetX ;
    canvasY = event.pageY - totalOffsetY;

    return {x: 7 - Math.abs(canvasX/40), y:Math.round((canvasY/40))}
}
HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;