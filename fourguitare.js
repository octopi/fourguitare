$(document).ready(function() {	
	/*$("#canvas").mousemove(function(e) {
		var x;
		var y;
		if (e.pageX || e.pageY) { 
		  x = e.pageX;
		  y = e.pageY;
		}
		else { 
		  x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
		  y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
		} 
		x -= canvas.offsetLeft;
		y -= canvas.offsetTop;
		x /= 2.7;
		y /= 4.1;
		$("#loc").html(x+", "+y);
	});		*/
	var noteMap = {
		'e': 82.41, // e
		'f': 87.31, // f
		'f#': 92.5, //f#
		'g': 98, // g
		'g#': 103.83, // g#
		'a': 110, // a
		'a#': 116.54, // a#
		'b': 123.47, // b
		'c': 130.81, // c
		'c#': 138.59, // c#
		'd': 146.83 // d
	};
	var testingMap = ['e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b', 'c', 'c#', 'd'];
	
	
	var validCheckins = [];
	var go_on = true;
	var crosses = ["btn", "btwn", "btw", "at","between"];
	//var streets = ["St.", "St", "st"];
	var streets = [];
	for(var i=34;i<56;i++) {
		if((i-3)%10 === 0) {
			streets.push(i+"rd");
		} else if((i-2)%10 == 0) {
			streets.push(i+"nd");
		} else if((i-1)%10 == 0) {
			streets.push(i+"st");
		} else {
			streets.push(i+"th");
		}
	}
	
	var aves = ['8th', '7th', '6th', '5th', 'Madison', 'Park'];
	//console.log(streets);
	
	var context = new webkitAudioContext();
	var sinewave = new SineWave(context);
	$.get('https://api.foursquare.com/v2/venues/trending?ll=40.7497824,-73.9877574&radius=2000&limit=50&oauth_token=3G4PCNIMEGXQL0IODV5IKFZKN2UKWMGXPDZLBYDVP1ENQ4O3&v=20111001', function(data) {
		for(var v in data.response.venues) {
			var venue = data.response.venues[v];
			var thisVenue = {
				name: null,
				streets: [],
				aves: []
			};
			
			var fullAddr = venue.location.address+ " "+venue.location.crossStreet;
			//console.log(fullAddr+": ");
			
			var fullAddrSplit = fullAddr.split(' ');
			for(var i in streets) {
				if(fullAddrSplit.indexOf(streets[i]) !== -1) {
					thisVenue.streets.push(fullAddrSplit[fullAddrSplit.indexOf(streets[i])]);
				}
			}
			
			for(var i in aves) {
				if(fullAddrSplit.indexOf(aves[i]) !== -1) {
					thisVenue.aves.push(fullAddrSplit[fullAddrSplit.indexOf(aves[i])]);
				}
			}
			
			/*for(var c in crosses) {
				if(fullAddr.match(new RegExp('\ '+crosses[c]+'\ ', 'gi'))) {
					var addrParts = fullAddr.split(crosses[c]+' ');
					var firstParts = addrParts[0].split(" ");
					var secondParts = addrParts[1].split(" ");
					for(var i in streets) {
						if(firstParts.indexOf(streets[i]) !== -1) {
							thisVenue.streets.push(firstParts[firstParts.indexOf(streets[i])]);
						}
						if(secondParts.indexOf(streets[i]) !== -1) {
							thisVenue.streets.push(secondParts[secondParts.indexOf(streets[i])]);
						}
					}
					
					for(var i in aves) {
						if(firstParts.indexOf(aves[i]) !== -1) {
							thisVenue.aves.push(firstParts[firstParts.indexOf(aves[i])]);
						}
						if(secondParts.indexOf(aves[i]) !== -1) {
							thisVenue.aves.push(secondParts[secondParts.indexOf(aves[i])]);
						}
					}
					
					
					console.log(addrParts[0]);
					console.log(addrParts[1]);
					break;
				} // end if match a cross identifier
			} // end looping through crosses*/
			
			if(thisVenue.streets.length > 0 && thisVenue.aves.length > 0) {
				thisVenue.name = venue.name;
				//console.log(venue.name+": "+parseInt(thisVenue.streets[0])+" "+thisVenue.aves[0]);
				//console.log(addrToHz(thisVenue));
				validCheckins.push(thisVenue);
			}
			
			//console.log(thisVenue);
			//console.log("=================");
		} // end loop through venues
		
		if(validCheckins.length < 1) {
			go_on = false;
			$("#curr_playing").html("Nothing's trending right now, so there's no music to play :(");
		} else {
			//console.log(validCheckins);
			var currPlaying = "";
			for(var j in validCheckins) {
				currPlaying += "<li style='margin:0;padding:0;text-align:left;'>"+validCheckins[j].name+"</li>";
			} 
			$("#curr_playing").html("<h2>Currently playing</h2><ul style='margin:0 auto;'>"+currPlaying+"</ul>");
			
			var k=0;
			var interval = setInterval(function() {
				if($("#randomized").is(":checked")) {
					console.log("randomized");
					var currCheckin = validCheckins[Math.floor(Math.random()*validCheckins.length)];
				} else {
					var currCheckin = validCheckins[(k++)%validCheckins.length];
				}
				console.log(currCheckin);
				draw(currCheckin.streets[0], currCheckin.aves[0]);
				sinewave.setFrequency(addrToHz(currCheckin));
				sinewave.play();
				//console.log(addrToHz(validCheckins[i++]));
			}, 1000);
			
		} // end check for validCheckins length
	}); // end $.get()
	
	
	var oct = 24;
	
	//sinewave.setFrequency(noteMap['e']*4);
	//sinewave.play();
	var stringNotes = ['e', 'a', 'd', 'g', 'b', 'e'];
	function addrToHz(venue) {
		var street = parseInt(venue.streets[0]);
		var ave = venue.aves[0];
		var stringMap = {
			'8th': 0,
			'7th': 5,
			'6th': 10,
			'5th': 15,
			'Madison': 19,
			'Park': 24
		};
		var streetOffset = Math.abs(street-56);
		//console.log(streetOffset);
		//console.log(stringMap[ave]);
		var index = stringMap[ave]+streetOffset;
		console.log("index: "+index);
		console.log()
		console.log("frequency: "+(noteMap[testingMap[index%12]]*Math.floor((index+12)/12)));
		return (noteMap[testingMap[index%12]]*Math.floor((index+12)/12));
	}
	function draw(str, ave) {
		var isectToLoc = {
			56: {
				"8th": {"x": 140, "y": -5},
				"7th": {"x": 172, "y": 6},
				"6th": {"x": 207, "y":18},
				"5th": {"x": 247, "y":32},
				"Madison": {"x": 266, "y":40},
				"Park": {"x": 286, "y":46}
			},
			55: {
				"8th": {"x": 130, "y":0},
				"7th": {"x": 166, "y": 13},
				"6th": {"x": 201, "y":25},
				"5th": {"x": 241, "y": 39},
				"Madison": {"x": 260, "y":45},
				"Park": {"x": 280, "y":52}
			},
			54: {
				"8th": {"x": 126, "y":7},
				"7th": {"x": 160, "y":20},
				"6th": {"x": 194, "y":32},
				"5th": {"x": 235, "y":45},
				"Madison": {"x": 255, "y": 52},
				"Park": {"x": 275, "y": 60}
			},
			53: {
				"8th": {"x": 119, "y": 14},
				"7th": {"x": 155, "y": 26},
				"6th": {"x": 190, "y":38},
				"5th": {"x": 228, "y":52},
				"Madison": {"x": 249, "y": 58},
				"Park": {"x": 268, "y": 65}
			},
			52: {
				"8th": {"x": 114, "y": 20},
				"7th": {"x": 150, "y":33},
				"6th": {"x": 183, "y":45},
				"5th": {"x": 223, "y": 57},
				"Madison": {"x": 244, "y": 65},
				"Park": {"x": 264, "y": 72}
			},
			51: {
				"8th": {"x": 108, "y": 27},
				"7th": {"x": 143, "y":39},
				"6th": {"x": 178, "y":52},
				"5th": {"x": 217, "y": 67},
				"Madison": {"x": 237, "y": 72},
				"Park": {"x": 257, "y": 78}
			},
			50: {
				"8th": {"x": 102, "y": 34},
				"7th": {"x": 136, "y":47},
				"6th": {"x": 171, "y":59},
				"5th": {"x": 212, "y": 71},
				"Madison": {"x": 231, "y": 78},
				"Park": {"x": 251, "y": 84}
			},
			49: {
				"8th": {"x": 97, "y": 40},
				"7th": {"x": 131, "y":51},
				"6th": {"x": 166, "y":66},
				"5th": {"x": 204, "y": 79},
				"Madison": {"x": 228, "y": 85},
				"Park": {"x": 244, "y": 90}
			},
			48: {
				"8th": {"x": 91, "y": 46},
				"7th": {"x": 125, "y":59},
				"6th": {"x": 161, "y":70},
				"5th": {"x": 200, "y": 84},
				"Madison": {"x": 220, "y": 90},
				"Park": {"x": 240, "y": 97}
			},
			47: {
				"8th": {"x": 87, "y": 52},
				"7th": {"x": 121, "y":64},
				"6th": {"x": 157, "y":77},
				"5th": {"x": 197, "y": 90},
				"Madison": {"x": 215, "y": 97},
				"Park": {"x": 234, "y": 103}
			},
			46: {
				"8th": {"x": 83, "y": 58},
				"7th": {"x": 115, "y":70},
				"6th": {"x": 150, "y":83},
				"5th": {"x": 188, "y": 97},
				"Madison": {"x": 208, "y": 104},
				"Park": {"x": 228, "y": 110}
			},
			45: {
				"8th": {"x": 77, "y": 64},
				"7th": {"x": 110, "y":76},
				"6th": {"x": 146, "y":89},
				"5th": {"x": 184, "y": 103},
				"Madison": {"x": 203, "y": 111},
				"Park": {"x": 224, "y": 118}
			},
			44: {
				"8th": {"x": 71, "y": 71},
				"7th": {"x": 105, "y":84},
				"6th": {"x": 138, "y":97},
				"5th": {"x": 176, "y": 110},
				"Madison": {"x": 198, "y": 116},
				"Park": {"x": 212, "y": 120}
			},
			43: {
				"8th": {"x": 65, "y": 78},
				"7th": {"x": 99, "y":90},
				"6th": {"x": 131, "y":102},
				"5th": {"x": 174, "y": 114},
				"Madison": {"x": 194, "y": 123},
				"Park": {"x": 202, "y": 128}
			},
			42: {
				"8th": {"x": 58, "y": 85},
				"7th": {"x": 92, "y":97},
				"6th": {"x": 128, "y":109},
				"5th": {"x": 166, "y": 123},
				"Madison": {"x": 185, "y": 127},
				"Park": {"x": 207, "y":135}
			},
			41: {
				"8th": {"x": 51, "y": 91},
				"7th": {"x": 85, "y":102},
				"6th": {"x": 121, "y":116},
				"5th": {"x": 162, "y": 130},
				"Madison": {"x": 179, "y": 136},
				"Park": {"x": 200, "y":142}
			},
			40: {
				"8th": {"x": 47, "y": 96},
				"7th": {"x": 82, "y":109},
				"6th": {"x": 117, "y":122},
				"5th": {"x": 155, "y": 134},
				"Madison": {"x": 175, "y": 142},
				"Park": {"x": 195, "y":149}
			},
			39: {
				"8th": {"x": 40, "y": 103},
				"7th": {"x": 75, "y":115},
				"6th": {"x": 109, "y":127},
				"5th": {"x": 149, "y": 140},
				"Madison": {"x": 170, "y": 149},
				"Park": {"x": 200, "y":160}
			},
			38: {
				"8th": {"x": 36, "y": 109},
				"7th": {"x": 71, "y":120},
				"6th": {"x": 104, "y":133},
				"5th": {"x": 144, "y": 147},
				"Madison": {"x": 200, "y": 160},
				"Park": {"x": 200, "y":160}
			},
			37: {
				"8th": {"x": 30, "y": 117},
				"7th": {"x": 65, "y":127},
				"6th": {"x": 100, "y":139},
				"5th": {"x": 200, "y": 160},
				"Madison": {"x": 200, "y": 160},
				"Park": {"x": 200, "y":160}
			},
			36: {
				"8th": {"x": 24, "y": 122},
				"7th": {"x": 59, "y":134},
				"6th": {"x": 94, "y":146},
				"5th": {"x": 200, "y": 160},
				"Madison": {"x": 200, "y": 160},
				"Park": {"x": 200, "y":160}
			},
			35: {
				"8th": {"x": 20, "y": 127},
				"7th": {"x": 53, "y":140},
				"6th": {"x": 200, "y":160},
				"5th": {"x": 200, "y": 160},
				"Madison": {"x": 200, "y": 160},
				"Park": {"x": 200, "y":160}
			},
			34: {
				"8th": {"x": 13, "y": 134},
				"7th": {"x": 49, "y":146},
				"6th": {"x": 200, "y":160},
				"5th": {"x": 200, "y": 160},
				"Madison": {"x": 200, "y": 160},
				"Park": {"x": 200, "y":160}
			}
		};
		//console.log("currently drawing: "+str+" "+ave);
		var canvas = document.getElementById("canvas");
		canvas.width = canvas.width;
		if(canvas.getContext) {
			var ctx = canvas.getContext("2d");
			var image = new Image();
			image.src = "4sqpin.png";
//				ctx.beginPath();
			ctx.drawImage(image, isectToLoc[parseInt(str)][ave].x-5, isectToLoc[parseInt(str)][ave].y-10, 10, 10);
//						ctx.arc(isectToLoc[parseInt(str)][ave].x, isectToLoc[parseInt(str)][ave].y, 3, 0, Math.PI*2, true);
//					ctx.stroke();
		}
	}
});