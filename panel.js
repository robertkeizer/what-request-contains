$(document).ready( function( ){
	//create container
	var contentContainer = [];
	var settings = {};
	new Clipboard('.btn');

	//as each request comes in add the content to the container and add the url to the list
	chrome.devtools.network.onRequestFinished.addListener( function(request) {
		$('#req_list').append('<li>'+request.request.url+'</li>');

		request.getContent( function( content, encoding ){
			contentContainer.push( {
				request: request,
				content: content,
				encoding: encoding
			} );
		});
	});

	//TODO make this not gross
	$("#go").click( function( ){
		$("#res_list").html( "" );
		var searchStr = $("#search").val();
		var regex     = $("#regex").is(':checked');
		var bufferLength = 30;
		
		for( var i = 0; i < contentContainer.length; i++ ) {
			var loc     = -1;
			var length  = 0;
			var htmlStr = "";
			var url     = contentContainer[i].request.request.url;
			var content = contentContainer[i].content;

			if( regex ) {
				var expression = new RegExp( searchStr );
				var match      = expression.exec( contentContainer[i].content );
				
				if( match ){
					loc    = match.index;
					length = match[0].length;
				}
			} else {
				loc    = contentContainer[i].content.indexOf( searchStr );
				length = searchStr.length;
			}

			if( loc >= 0 ){
				htmlStr = '<li><table><tr><td class="header_cell">URL</td><td>' + url + '</td><td><button class="btn" data-clipboard-text="'+url+'">Copy Url</button></td></tr>';
			}

			while( loc >= 0 ){
				htmlStr += '<tr><td class="header_cell">Result</td><td>';
				htmlStr += content.substring( loc - bufferLength, loc );
				htmlStr += '<b>' + content.substring( loc, loc + length ) + '</b>';
				htmlStr += content.substring( loc + length, loc + length + bufferLength );
				htmlStr += '</td></tr>';

				if( regex ) {
					match = expression.exec( contentContainer[i].content );
					
					if( match ){
						loc    = match.index;
						length = match[0].length;
					} else {
						loc = -1;
					}
				} else {
					loc    = contentContainer[i].content.indexOf( searchStr, loc + 1 );
					length = searchStr.length;
				}
			}

			if( htmlStr !== "" ){ $("#res_list").append( htmlStr + '</table></li>' ); }
		}
	} );

	$("#flush").click( function( ){
		$("#res_list").html( "" );
		$("#req_list").html( "" );
		contentContainer = [];
	} );
} );
