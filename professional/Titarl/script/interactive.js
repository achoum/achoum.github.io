var matrix_name_list = new Array();
matrix_name_list.push( new Array( 'Co-occurence matrix' , 'coocurence' ) );
matrix_name_list.push( new Array( 'Co-probability matrix' , 'coprobability' ) );
matrix_name_list.push( new Array( 'Smoothed co-probability matrix ' , 'smoothedcoprobability' ) );
matrix_name_list.push( new Array( 'Distance matrix' , 'distance' ) );	
matrix_name_list.push( new Array( 'Graph' , 'graph' ) );	
matrix_name_list.push( new Array( 'Coloration clustering' , 'colorationclustering' , true ) );	
matrix_name_list.push( new Array( 'Matrix clustering' , 'clustering' , true ) );	

function interactive(e)
	{
	loadCode( e  );
	link_interactive( e  );
	}

function loadCode( e )
	{
	var a = $( e );
	
	var content = '\
	<div class="title">Hidden rules</div>\
	\
	<div class="interactive_rule">\
	<b>Rule 1 :</b> A[t] &rarr; B[ t + <input type="text" class="rule1_left" value="5">, t + <input type="text" class="rule1_right" value="11"> ]\
	confidence: <input type="text" class="rule1_conf" value="90">%<br />\
	Temporal distribution of head : <select class="rule1_distribution" >\
		 <option value="uniform">Uniform</option>\
		 <option value="normal">Normal</option>\
		 <option value="expo">Exponential decay</option>\
	</select>\
	<!-- <input type="checkbox" class="rule1_normal">Use normal distribution instead of uniform distribution -->\
	\
	</div>\
	\
	<div class="interactive_rule">\
	<b>Rule 2 :</b> A[t] &rarr; B[ t + <input type="text" class="rule2_left" value="9">, t + <input type="text" class="rule2_right" value="15"> ]\
	confidence: <input type="text" class="rule2_conf" value="80">%<br />\
	Temporal distribution of head : <select class="rule2_distribution" >\
		 <option value="uniform">Uniform</option>\
		 <option value="normal">Normal</option>\
		 <option value="expo">Exponential decay</option>\
	</select>\
	<!-- <input type="checkbox" class="rule2_normal" >Use normal distribution instead of uniform distribution -->\
	\
	</div>\
	\
	<div class="title">Dataset</div>\
	<div class="interactive_dataset">\
	<div>Duration of the dataset : <input type="text" class="dataset_duration" value="1000000"></div>\
	<div>Number of As : <input type="text" class="number_of_a" value="10000"></div>\
	<div>Number of extra Bs (in addition to the hidden rules) : <input type="text" class="noise_b" value="1000"></div>\
	</div>\
	\
	<div><input type="button" value="Refresh" class="mybutton"></div>\
	\
	<div class="title">Snap-shop of events</div>\
	\
	<div class="snapshop" ></div>\
	<div class="info_snapshop">(You can use the mouse to navigate)</div>\
	\
	<div class="title">Rule to divide</div>\
	<div class="interactive_rule">\
	<b>Rule 3 :</b> A[t] &rarr; B[ t + 0, t + 20 ] <span class="evaluated_confidence">?</span>%\
	</div>\
	<div class="title">Density distribution of the rule to divide</div>\
	<div class="density_distribution" ></div>';

	for( var i = 0 ; i < matrix_name_list.length ; i++ )
		{
		var label = matrix_name_list[ i ][0];
		var key = matrix_name_list[ i ][1];
		content += '\
			<div class="plotcontainer">\
			<div class="title">'+label+' <a class="mysmallbutton showbutton '+key+'_matrix_showbutton" href="" onClick="return false;" >Show</a></div>\
			<div class="'+key+'_matrix_contener hidden">\
			<canvas class="'+key+'_matrix matrix" width="250" height="250" ></canvas>';
		
		
		if( matrix_name_list[ i ].length == 3 )
			content += '<br /><input type="checkbox" class="fade_'+key+'" value="1">Fade with density';
			
		
		content += '</div>\
			<div class="'+key+'_matrix_anticontener antihidden"> *Press show to display* </div>';
		content += '</div>';
		}
	
	content += '<br style="clear:both;"/>';
	
	a.html(content);
	
	}

function switchVisibility(e,name)
	{
	var a = $( e + ' .'+name+'_contener');
	a.toggle(1000);
	var b = $( e + ' .'+name+'_anticontener');
	b.toggle();
	}

function link_interactive(e)
	{
	console.log("Init "+e);
	
	var a = $( e + ' .refresh_button');
	
	a.on('click', function() {
	    refresh(this,e);
	    });

	$( e + ' input').on('keypress', function (event)
		{
        if(event.which == '13')
        	{
        	refresh(a,e);
        	}
		});
	
	// === show buttons ===

	for( var i = 0 ; i < matrix_name_list.length ; i++ )
		{
		var label = matrix_name_list[ i ][0] + "";
		var key = matrix_name_list[ i ][1];
		$( e + ' .' + key +'_matrix_showbutton')
		.on('click', (function(k)
				{
				return function() {
					switchVisibility(e,k+"_matrix");
					}
				}(key))
			);
		}

	refresh(a,e);
	
	}

function minmax(v,mini, maxi)
	{
	return Math.max( mini , Math.min( maxi , v) );
	}

function makePlotArray(input,y/*,begin,end*/)
	{
	output = [];
	for (var i = 0; i < input.length; i++)
		{
		v = input[i];
		//if( v >= begin && v <= end)
			{
			output.push([ v , y ]);
			}
		}
	return output;
	}

function rnd_normal()
	{
	return Math.cos(2 * Math.PI * Math.random()) * Math.sqrt(-2 * Math.log(Math.random()));
	}

function gaussian(x,sigma2,center)
	{
	return Math.exp(-(x-center)*(x-center)/(2*sigma2)) / Math.sqrt(2.*Math.PI*sigma2);
	}

function buildSymetricNormalisedGaussianFilter( ndcases, sigma2 )
	{

	var ndcases2 = Math.floor(ndcases / 2); // arrondi en dessous
	
	var r = new Array();
	var sum = 0.;

	for(var i=ndcases2;i>=0;i--)
		{
		var v = gaussian(i,sigma2,0);
		r.push(v);
		sum += v;
		}

	for(var i=ndcases2-1;i>=0;i--)
		{
		var v = r[i];
		r.push(v);
		sum += v;
		}

	sum = 1./sum;

	for(var i=0;i<r.length;i++)
		r[i] *= sum;

	return r;
	}

function draw_matrix_clusters_to_canvas( clusters , e , canvas , range_rule , fade , matrix , matrix_width )
	{
	var coocurence_matrix = $( e + ' .' + canvas)[0];
	var width = coocurence_matrix.width;
	var height = coocurence_matrix.height;

	var borderTopLeft = 20;
	var borderBotRight = 10;

	var ctx=coocurence_matrix.getContext('2d');
	
	var maxHisto = 0;
	if( fade )
		{
		for( var i = 0 ; i < matrix_width ; i++ )
			{
			var v = matrix[ i + i * matrix_width ];
			if( v > maxHisto )
				maxHisto = v;
			}
		}
	
	// clear the canvas
	coocurence_matrix.width = coocurence_matrix.width;
	
	ctx.strokeRect(
			borderBotRight+0.5
			,borderTopLeft+0.5
			,width-borderBotRight-borderBotRight+0.5
			,height - borderBotRight-borderTopLeft+0.5
			);
	
	var ids = [];
	
	var number_of_elements = 1;
	for( var i = 0 ; i < clusters.length ; i++ )
		{
		for( id in clusters[ i ] )
			{
			id = parseInt( id );
			
			if( ids.indexOf(id) < 0 )
				ids.push( id );
			
			if( clusters[ i ][id].length > number_of_elements )
				number_of_elements = clusters[ i ][id].length;
			}
		}
	
	for( var y = 0 ; y < clusters.length ; y++ )
		{
		for( id in clusters[ y ] )
			{
			id = parseInt( id );
			for( var j = 0 ; j < clusters[ y ][id].length ; j++ )
				{
				var x = clusters[ y ][id][j]
				
				var color = ids.indexOf(id) * 255 / ids.length;
				
				//var color = Math.floor( id * 255  / number_of_elements);

				if( color > 255 )
					color = 255;
				if( color < 0 )
					color = 0;

				//colorText = "rgb(255,"+(255-color)+","+(255-color)+")";
				
				if( color == 0 && ! fade)
					continue;
				else
					{
					
					l = 55;
					
					if( fade )
						{
						var v = 50 * matrix[ x + x * matrix_width ] / maxHisto;
						l = Math.floor( 100 - v );
						}
					
					colorText = "hsl("+color+",90%,"+l+"%)";
					}
				
				ctx.fillStyle = colorText;

				ctx.fillRect(
						borderBotRight + x * ( width - borderBotRight - borderBotRight ) / number_of_elements+0.5
						,borderTopLeft + ( clusters.length -  y - 1) * ( height - borderTopLeft - borderBotRight ) / clusters.length+0.5
						, ( width - borderBotRight - borderBotRight ) / number_of_elements+0.5
						, ( height - borderTopLeft - borderBotRight ) / clusters.length+0.5
						);
				
				}
			}
		}

	for( var y = 0 ; y < clusters.length ; y++ )
		{
		var yc = Math.floor( borderTopLeft + y * ( height - borderTopLeft - borderBotRight ) / clusters.length ) + 0.5;
		ctx.moveTo(borderBotRight+0.5,yc);
		ctx.lineTo(width-borderBotRight+0.5,yc);
		ctx.stroke();
		//ctx.fillText(v,borderTopLeft-tickSize-7,x);
		}
	
	// ctx.font="20px Georgia";
	ctx.fillStyle = "#000000";
	ctx.textAlign = 'center';
	var ticks = 5;
	var tickSize = 2;
	for( var i = 0 ; i < ticks ; i++ )
		{
		var v = Math.floor( i * range_rule / ( ticks - 1 ) );
		var x = borderBotRight + v / range_rule * ( width - borderBotRight - borderBotRight )+0.5;
		
		ctx.moveTo(x,borderTopLeft);
		ctx.lineTo(x,borderTopLeft-tickSize);
		ctx.stroke();
		
		ctx.fillText(v,x,borderTopLeft-tickSize-4);
		}	
	}

function draw_matrix_to_canvas(matrix,matrix_width,range_rule,e,canvas,separateDiagonal)
	{
	var maxvdiag = 0;
	var maxvnondiag = 0;
	for( var x = 0 ; x < matrix_width ; x++ )
	for( var y = 0 ; y < matrix_width ; y++ )
		{
		var index = x + y * matrix_width;
		if( x != y )
			{
			if( matrix[index] > maxvnondiag )
				maxvnondiag = matrix[index];
			}
		else
			{
			if( matrix[index] > maxvdiag )
				maxvdiag = matrix[index];
			}
		}
	
	if( ! separateDiagonal )
		{
		if( maxvdiag > maxvnondiag )
			maxvnondiag = maxvdiag;
		if( maxvdiag < maxvnondiag )
			maxvdiag = maxvnondiag;
		}
	
	// drawing
	
	var coocurence_matrix = $( e + ' .' + canvas)[0];
	//var width = coocurence_matrix.scrollWidth;
	//var height = coocurence_matrix.scrollHeight;
	var width = coocurence_matrix.width;
	var height = coocurence_matrix.height;

	var borderTopLeft = 20;
	var borderBotRight = 10;

	var ctx=coocurence_matrix.getContext('2d');
	
	// clear the canvas
	coocurence_matrix.width = coocurence_matrix.width;
	
	ctx.strokeRect(
			borderTopLeft+0.5
			,borderTopLeft+0.5
			,width-borderBotRight-borderTopLeft+0.5
			,height - borderBotRight-borderTopLeft+0.5
			);

	for( var x = 0 ; x < matrix_width ; x++ )
	for( var y = 0 ; y < matrix_width ; y++ )
		{

		var v = matrix[ x + y * matrix_width ];

		if( x == y )
			var color = Math.floor(v * 255 / maxvdiag);
		else
			var color = Math.floor(v * 255 / maxvnondiag);
		
		if( color > 255 )
			color = 255;
		if( color < 0 )
			color = 0;

		if( separateDiagonal && x == y )
			colorText = "rgb("+(255-color)+","+(255-color)+",255)";
		else
			colorText = "rgb(255,"+(255-color)+","+(255-color)+")";
		
		ctx.fillStyle = colorText;

		ctx.fillRect(
				borderTopLeft + x * ( width - borderTopLeft - borderBotRight ) / matrix_width+0.5
				,borderTopLeft + y * ( height - borderTopLeft - borderBotRight ) / matrix_width+0.5
				, ( width - borderTopLeft - borderBotRight ) / matrix_width+0.5
				, ( height - borderTopLeft - borderBotRight ) / matrix_width+0.5
				);
		
		}
	
	// ctx.font="20px Georgia";
	ctx.fillStyle = "#000000";
	ctx.textAlign = 'center';
	
	var ticks = 5;
	var tickSize = 2;
	for( var i = 0 ; i < ticks ; i++ )
		{
		var v = Math.floor( i * range_rule / ( ticks - 1 ) );
		var x = borderTopLeft + v / range_rule * ( width - borderTopLeft - borderBotRight )+0.5;
		
		ctx.moveTo(x,borderTopLeft);
		ctx.lineTo(x,borderTopLeft-tickSize);
		ctx.stroke();
		
		ctx.fillText(v,x,borderTopLeft-tickSize-4);
		
		ctx.moveTo(borderTopLeft,x);
		ctx.lineTo(borderTopLeft-tickSize,x);
		ctx.stroke();
		
		ctx.fillText(v,borderTopLeft-tickSize-7,x);
		
		}	
	}

function computeHierarchicalClustering( dist , width , layers)
	{
	
	var save_dist = dist;
	dist = new Array();
	for( var i = 0 ; i < save_dist.length ; i++ )
		dist.push( save_dist[i] );
	
	var height = dist.length / width;

	//map< int , vector< int > > clusters;
	var clusters = {}
	
	for( var i = 0 ; i  < width ; i++ )
		clusters[i] = [ i ];
	
	var ret = new Array();
	
	for( var c = 0 ; c < width - 1 ; c++ )
		{
	
		// = trouver les deux clusters les plus proche =
		var best1 = -1;
		var best2 = -1;
		var bestScore = Infinity;
		
		for(var it1 in clusters)
		for(var it2 in clusters)
			{
			it1 = parseInt( it1 );
			it2 = parseInt( it2 );
			if( it2 > it1 ) 
				{
	
				var d = dist[ it1 + width * it2 ];
		
				if( d < bestScore )
					{
					bestScore = d;
					best1 = it1;
					best2 = it2;
					}
		
				}
			}
	
		// = mettre a jour la matrice de distance --  Maximum or complete linkage clustering =
		var best1it = clusters[ best1 ];
		var best2it = clusters[ best2 ];

		for(var it3 in clusters)
			{
			it3 = parseInt( it3 );
			dist[ it3 + best1 * width ]
				= dist[ it3 * width + best1 ]
				= Math.max( dist[ it3 + best1 * width ] , dist[ it3 + best2 * width ]  );
			}
	
		// = fusionner les clusters =
		
		for( var i = 0 ; i < clusters[ best2 ].length ; i++ )
			clusters[ best1 ].push( clusters[ best2 ][i] );

		delete clusters[ best2 ];

		// = sauver les resultats si besoin
		if( c >= width - 1 - layers )
			ret.push( jQuery.extend(true, {}, clusters) );
		}
	
	return ret;
	}

// ==============

function compute_threshold_graph( weightedGraph , width , threshold)
	{
	graph = new Array();
	
	for( var i = 0 ; i < weightedGraph.length ; i++ )
		{
		if( weightedGraph[i] > threshold )
			graph.push( 1 );
		else
			graph.push( 0 );
		}

	return graph;
	}

function color_graph( graph , width )
	{
	var graph_colors = new Array();
	
	for( var i = 0 ; i < width ; i++ )
		graph_colors.push( i );
	
	return graph_colors;
	}

function draw_graph( width , weightedGraph , graph , graph_colors , e , canvas , range_rule)
	{
	
	var canvas_object = $( e + ' .' + canvas)[0];
	var canvas_width = canvas_object.width;
	var canvas_height = canvas_object.height;

	var border = 15;
	var ctx=canvas_object.getContext('2d');
	
	// clear the canvas
	canvas_object.width = canvas_object.width;
	
	// ctx.font="20px Georgia";
	ctx.fillStyle = "#000000";
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	
	node_coord = function(i,b)
		{
		var angle = 2 * Math.PI * i / width;
		var x = canvas_width/2 + (canvas_width/2-border - b) * Math.sin( angle ) ;
		var y = canvas_width/2 + (canvas_width/2-border - b) * Math.cos( angle ) ;
		return [x,y];
		}
	
	for( var i = 0 ; i < width ; i++ )
		{
		c = node_coord( i , 0 );
		
		var color = 0;
		for( var j = 0 ; j < graph_colors.length ; j++ )
		if( graph_colors[j].indexOf(i) != -1 )
			{
			color = j;
			break;
			}
		
		color = color * 255 / graph_colors.length;
		
		var colorText = "hsl("+color+",90%,55%)";
		ctx.fillStyle = colorText;
		
		ctx.beginPath();
		ctx.arc(c[0],c[1], 8, 0, Math.PI*2, true); 
		ctx.closePath();
		ctx.fill();
		
		ctx.fillStyle = "#000000";
		
		ctx.fillText(i  / width * range_rule,c[0],c[1]);

		}
	
	ctx.fillStyle = "#000000";
	
	ctx.lineWidth=0.1;
	
	for( var x = 0 ; x < width ; x++ )
	for( var y = 0 ; y < width ; y++ )
		{
		var v = weightedGraph[ x + y * width];
		//var vt = graph[ x + y * width];
		
		if( v < 0.03 )
			continue;
		
		//var color = (v - 0.04) * 255 / 0.09
		//if( color > 255 )
		//	color = 255;
		//var color = 0;
		
		//var colorText = "hsl("+color+",90%,55%)";
		
		ctx.strokeStyle = "rgba(0,0,0,0.5)";
		
		cx = node_coord( x , 10 );
		cy = node_coord( y , 10 );
		
		ctx.moveTo(cx[0],cx[1]);
		ctx.lineTo(cy[0],cy[1]);
		ctx.stroke();
		
		}
	
	ctx.lineWidth=1;
	}

function compute_color_clusters2( graph , width , thValue )
	{
	var color = new Array(); // The output
	
	var colors = new Array();
	var edges = Array();
	var sats = new Array();
	var remaining = new Array();
	
	// compute edges
	for( var x = 0 ; x < width ; x++ )
		{
		var tmp = new Array();
		
		for( var y = 0 ; y < width ; y++ )
		if( x != y )
			{
			var v = graph[ x + y * width];
			if( v > thValue )
				tmp.push( y );
			}
		
		edges.push( tmp );
		}

	// init
	for(var i = 0 ; i < edges.length ; i++ )
		{
		color.push( -1 );
		sats.push( 0 );
		remaining.push( i );
		}

	while( remaining.length > 0)
		{
		
		var betterIndex = 0;
		var better = remaining[ betterIndex ];
		for( var i = 1 ; i < remaining.length ; i++ )
			{
			var comp;
			
			var current = remaining[ i ];
			
			if(sats[current]>sats[better])
				comp = true;
			else if(sats[current]<sats[better])
				comp = false;
			else if(edges[current].length>edges[better].length)
				comp = true;
			else
				comp = false;

			if(comp)
				{
				better = current;
				betterIndex = i;
				}
			}

		remaining.splice( betterIndex, 1 );

		for( var i = 0 ; i < colors.length ; i++ )
			colors[ i ] = false;
		
		for( var i = 0 ; i < edges[better].length ; i++ )
			{
			if(color[ edges[better][i] ]!=-1)
				colors[ color [ edges[better][i] ] ] = true;
			}

		var c;
		for( c = 0 ; c < colors.length ; c++ )
			if( ! colors [ c ] )
				break;

		if( c == colors.length )
			colors.push(false);

		color[better] = c;
		
		
		//list < pair < int , float > >::iterator itn2;	
		//for(itn=edges[better].begin();itn!=edges[better].end();itn++)
		for( var i = 0 ; i < edges[better].length ; i++ )
			{
			
			 var other = edges[better][i];
				
			//fill(colors.begin(),colors.end(),false);
			for( var j = 0 ; j < colors.length ; j++ )
				colors[ j ] = false;
			
			
			//for(itn2=edges[itn->first].begin();itn2!=edges[itn->first].end();itn2++)
			for( var j = 0 ; j < edges[ other ].length ; j++ )
				{
				var v = color[ edges[ other ][j] ];
				if( v != -1 )
					colors[ v ] = true;
				}

			var newSat = 0;
			for(var j=0;j<colors.length;j++)
				if(colors[i])
					newSat++;
                    
           // sats[ other ] = newSat;
			
			}
		
		}

	return color;
	}

function color2cluster( col )
	{
	var clu = new Array();
	
	var allColors = [];
	for(var j=0;j<col.length;j++)
		{
		if( allColors.indexOf( col[j] ) == -1 )
			allColors.push( col[j] );
		}
	
	for(var i=0;i<allColors.length;i++)
		{
		var tmp = [];
		
		for(var j=0;j<col.length;j++)
			if( col[j] == allColors[i] )
				tmp.push( j );
		
		clu.push( tmp );
		}
	
	return clu;
	}

function compute_color_clusters( graph , width )
	{
	var ret = new Array();
	
	var minValue = 1;
	var maxValue = 0;
	
	// === min/max ===
	for( var x = 0 ; x < width ; x++ )
	for( var y = 0 ; y < width ; y++ )
	if( x != y )
		{
		var v = graph[ x + y * width];
		
		if( v < minValue )
			minValue = v;
		if( v > maxValue ) 
			maxValue = v;
		}

	
	var number_of_th = 8;
	for( var th = 0 ; th < number_of_th ; th++ )
		{
		var thValue = th / number_of_th * ( maxValue - minValue) + minValue;
		var col = compute_color_clusters2( graph , width , thValue);
		var clu = color2cluster( col );
		ret.push( clu );
		}
	
	/*
	var col = compute_color_clusters2( graph , width , 0.03);
	var clu = color2cluster( col );
	ret.push( clu );
	*/
	
	return ret;
	}

function refresh(me,e)
	{
	setTimeout(function()
			{
			sync_refresh( me , e );
			}, 0);
	}

function random(a,b,distribution)
	{
	switch( distribution )
		{
	case "uniform":
		return a + ( b - a ) * Math.random();
	case "normal":
		return (a + b)/2 + rnd_normal() * ( b - a )/2/2;
	case "expo":
		return a - Math.log( Math.random() ) / (  5 / ( b - a ) );
	default:
		console.log("Unknow distribution " + distribution );
		}
	}

function sync_refresh(me,e)
	{
	// ====== loading params =====
	
	var number_of_a =  parseInt( $( e + ' .number_of_a').val() );
	var noise_b = parseInt(  $( e + ' .noise_b').val() );
	var range_rule = 20;
	var histo_binds = 40;
	
	var duration_snap_shot = 200;
	var start_snap_shot = 100;
	
	var r1_left = parseFloat($( e + ' .rule1_left').val());
	var r1_right = parseFloat($( e + ' .rule1_right').val());
	var r1_conf = parseFloat($( e + ' .rule1_conf').val()) / 100;
	//var r1_normal = $( e + ' .rule1_normal').is(':checked');
	var r1_distribution = $( e + ' .rule1_distribution').val();
	
	var r2_left = parseFloat($( e + ' .rule2_left').val());
	var r2_right = parseFloat($( e + ' .rule2_right').val());
	var r2_conf = parseFloat($( e + ' .rule2_conf').val()) / 100;
	//var r2_normal = $( e + ' .rule2_normal').is(':checked');
	var r2_distribution = $( e + ' .rule2_distribution').val();
	
	var dataset_duration = parseFloat( $( e + ' .dataset_duration').val() );
	
	var fade_colorationclustering = $( e + ' .fade_colorationclustering').is(':checked');
	var fade_clustering = $( e + ' .fade_clustering').is(':checked');

	// ====== gen dataset =========
	
	var data_a = new Array();
	var data_b = new Array();
	
	for( var i = 0 ; i < number_of_a ; i++ )
		{
		var ta = Math.random() * dataset_duration;
		data_a.push( ta );
		
		if( i == 0 )
			start_snap_shot = ta - duration_snap_shot / 2;
		
		if( Math.random() < r1_conf )
			{
			var tb = ta + random( r1_left , r1_right , r1_distribution );
			/*
			if( r1_normal )
				tb = ta + (r1_left + r1_right)/2 + rnd_normal() * ( r1_right - r1_left )/2/2;
			else
				tb = ta + r1_left + ( r1_right - r1_left ) * Math.random();
			*/
			data_b.push( tb );
			}
		
		if( Math.random() < r2_conf )
			{
			var tb = ta + random( r2_left , r2_right , r2_distribution );
			/*
			if( r2_normal )
				tb = ta + (r2_left + r2_right)/2 + rnd_normal() * ( r2_right - r2_left )/2/2;
			else
				tb = ta + r2_left + ( r2_right - r2_left ) * Math.random();
			*/
			data_b.push( tb );
			}
		
		}
	
	for( var i = 0 ; i < noise_b ; i++ )
		{
		data_b.push( Math.random() * dataset_duration );
		}

	data_a.sort(function(a,b){return a-b});
	data_b.sort(function(a,b){return a-b});

	// ===== display snap-shot ====

	var snapshop = $( e + ' .snapshop');

	data_a_draw = makePlotArray( data_a , 1 );// , start_snap_shot , start_snap_shot + duration_snap_shot);
	data_b_draw = makePlotArray( data_b , 2 );//, start_snap_shot , start_snap_shot + duration_snap_shot);

	$.plot(snapshop,
			[
			{
				 data: data_a_draw
			 	 , label:"a"
			},{
				data: data_b_draw
				, label:"b"
			}
			]
			,{ yaxis: { show: false , min:0 , max:3 , zoomRange: false , panRange: false }
			, xaxis: { min:start_snap_shot , max:start_snap_shot + duration_snap_shot }
		    , series: {
		        points: { show: true }
		    	}
		    ,zoom: {
				interactive: true
			}
			,pan: {
				interactive: true
			}
			});

	
	// ======== density =============
	
	var differences = new Array();
	
	var number_of_match = 0;
	
	for( var i = 0 ; i < data_a.length ; i++ )
		{
		var at = data_a[i];
		var match = false;
		for( var j = 0 ; j < data_b.length ; j++ )
			{
			var bt = data_b[j];
			if( bt > at + range_rule)
				break;
			if( bt > at)
				{
				differences.push( bt - at );
				match = true;
				}
			}
		if( match )
			number_of_match++;
		}

	var confidence = number_of_match / data_a.length;
	$( e + ' .evaluated_confidence').html( Math.floor( confidence * 100 ) );

	if( confidence < 0.1 )
		var a = 1;
	
	var histo_difference = new Array();
	for( var i = 0 ; i < histo_binds ; i++ )
		{
		histo_difference.push( [ i / histo_binds * range_rule , 0 ] );
		}
	
	for( var i = 0 ; i < differences.length ; i++ )
		{
		v = differences[i];
		index = Math.floor( v / range_rule * histo_binds );
		histo_difference[ index ][1]++;
		}

	var density_distribution = $( e + ' .density_distribution');

	$.plot(density_distribution, [ histo_difference ], {
			series: {
				bars: {
					show: true,
					barWidth: range_rule / histo_binds,
					align: "left"
				}
			},
			xaxis: {
			}
		});
	
	// ==== co-occurence matrix =====

	var coocurence = new Array();
	for (var i = 0; i < histo_binds*histo_binds; i++)
		coocurence.push(0);
	
	// A -> several B
	for( var i = 0 ; i < data_a.length ; i++ )
		{
		var at = data_a[i];
		var matches = new Array();
		for( var j = 0 ; j < data_b.length ; j++ )
			{
			var bt = data_b[j];
			if( bt > at + range_rule)
				break;
			if( bt > at)
				{
				var index = Math.floor( ( bt - at ) / range_rule * histo_binds );
				matches.push( index );
				}
			}
		for( var j = 0 ; j < matches.length ; j++ )
		for( var k = 0 ; k < matches.length ; k++ )
			{
			coocurence[ matches[j] + matches[k] * histo_binds ]++;
			}
		}
	
	// several A -> B
	/*
	for( var i = 0 ; i < data_b.length ; i++ )
		{
		var bt = data_b[i];
		var matches = new Array();
		for( var j = 0 ; j < data_a.length ; j++ )
			{
			var at = data_a[j];
			if( at > bt )
				break;
			if( at > bt - range_rule)
				{
				var index = Math.floor( ( bt - at ) / range_rule * histo_binds );
				matches.push( index );
				}
			}
		for( var j = 0 ; j < matches.length ; j++ )
		for( var k = 0 ; k < matches.length ; k++ )
			{
			coocurence[ matches[j] + matches[k] * histo_binds ]++;
			}
		}
	*/
	
	// ==== normalization n�1 ====

	var coprobability = new Array();
	for (var i = 0; i < histo_binds*histo_binds; i++)
		coprobability.push(0);
	
	//var z_confidence_interval = 1.96;
	var z_confidence_interval = 0;
	//var z_confidence_interval = 3.0;
	
	for( var x = 0 ; x < histo_binds ; x++ )
	for( var y = 0 ; y < histo_binds ; y++ )
		{
		var index = x + y * histo_binds;
		var vout = 0;
		
		if( x != y )
			{
			var vout = 0;
			var p1 = 0;
			var p2 = 0;

			if( coocurence[ x + x * histo_binds ] > 0 )
				{
				var n = coocurence[ x + x * histo_binds ]
				p1 = coocurence[ index ] / n;
				p1 = p1 - z_confidence_interval * Math.sqrt( p1 * ( 1 - p1 ) / n );
				}

			/*
			if( coocurence[ y + y * histo_binds ] > 0 )
				{
				p2 = coocurence[ index ] / coocurence[ y + y * histo_binds ];
				p2 = p2 - z_confidence_interval * Math.sqrt( p2 * ( 1 - p2 ) / coocurence[ y + y * histo_binds ] );
				}
			
			vout = Math.min( v1 , v2 );
			*/
			vout = p1;
			}
		else
			vout = 0;

		coprobability[ index ] = vout;
		}
	
	//coprobability = coocurence; // DEBUG
	
	// === gaussian smooth ===
	
	var smoothedcoprobability = new Array();
	for (var i = 0; i < histo_binds*histo_binds; i++) smoothedcoprobability.push(0);
	
	var cache = new Array();
	for (var i = 0; i < histo_binds*histo_binds; i++) cache.push(0);
	
	smoothedcoprobability = coprobability; // DEBUG
	
	// ANTI DEBUG
	/*
	var sigma = 0.7;
	var noCases = Math.ceil(4 * sigma) + 1;
	var filter = buildSymetricNormalisedGaussianFilter( noCases, sigma * sigma );

	var minussubHalf = - Math.floor(filter.length / 2);

	for( var y = 0 ; y < histo_binds ; y++ )
	for( var x = 0 ; x < histo_binds ; x++ )
		{
		var v = 0;
		var weigth = 0;
		for(var i=0;i<filter.length;i++)
			{
			var v2 = coprobability[ minmax(x + i + minussubHalf, 0 , histo_binds - 1 ) + y * histo_binds ];
			if( v2 >= 0 )
				{
				v += filter[i] * v2;
				weigth += filter[i];
				}
			}
		
		cache[ x + y * histo_binds ] = v / weigth;
		}

	for( var y = 0 ; y < histo_binds ; y++ )
	for( var x = 0 ; x < histo_binds ; x++ )
		{
		var v = 0;
		var weigth = 0;
		for(var i=0;i<filter.length;i++)
			{
			v += filter[i] * cache[ x + minmax(y + i + minussubHalf, 0 , histo_binds - 1 ) * histo_binds ];
			weigth += filter[i];
			}
		smoothedcoprobability[ x + y * histo_binds ] = v / weigth;
		}
	*/
	
	// === distance matrix ===
	
	var distance = new Array();
	for (var i = 0; i < histo_binds*histo_binds; i++) distance.push(0);
	
	for( var y1 = 0 ; y1 < histo_binds ; y1++)
	for( var y2 = 0 ; y2 < histo_binds ; y2++)
		{
		var error = 0;

		if( y1 != y2 )
			{
			// = distance euclidiene =
			for( var x = 0 ; x < histo_binds ; x++ )
				{
				var v = ( smoothedcoprobability[ x + y1 * histo_binds ] - smoothedcoprobability[ x + y2 * histo_binds ] );
				//var v = ( coocurence[ x + y1 * histo_binds ] - coocurence[ x + y2 * histo_binds ] );
				error += v * v;
				}
			error = Math.sqrt(error);
			// = =
			}

		distance[ y1 + y2 * histo_binds ] = distance[ y2 + y1 * histo_binds ] = error;
		}
	
	// ==== matrix clustering ===

	clusters = computeHierarchicalClustering( distance , histo_binds , 8 );
	
	console.log( clusters );

	draw_matrix_clusters_to_canvas( clusters , e , 'clustering_matrix' , range_rule , fade_clustering , coocurence , histo_binds );
	
	// === graph clustering ===
	
	var graph_clusters = compute_color_clusters( smoothedcoprobability , histo_binds );

	/*
	var graph = compute_threshold_graph( smoothedcoprobability , histo_binds , 0.3);

	//var graph = compute_threshold_graph( smoothedcoprobability , histo_binds , 0.03);
	
	//var graph_colors = color_graph( graph , histo_binds );
	*/
	
	draw_matrix_clusters_to_canvas( graph_clusters , e , 'colorationclustering_matrix' , range_rule , fade_colorationclustering , coocurence , histo_binds);
	
	draw_graph( histo_binds , smoothedcoprobability , null , graph_clusters[ graph_clusters.length / 2 ] , e , 'graph_matrix' , range_rule);
	
	// ==========================

	draw_matrix_to_canvas( coocurence , histo_binds , range_rule , e , 'coocurence_matrix' , true );
	
	draw_matrix_to_canvas( coprobability , histo_binds , range_rule , e , 'coprobability_matrix' , false );
	
	draw_matrix_to_canvas( smoothedcoprobability , histo_binds , range_rule , e , 'smoothedcoprobability_matrix'  , false );
	
	draw_matrix_to_canvas( distance , histo_binds , range_rule , e , 'distance_matrix' , false  );

	}