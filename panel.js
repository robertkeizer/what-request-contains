$(document).ready( function( ){
	/**
	 * WORK FUNCTIONS
	 */

	var getContents = function( contentObj ){
		var out = [];

		if( settings.reqHeaders ){
			var reqHeaders = contentObj.request.request.headers
			for( var i = 0; i < reqHeaders.length; i++ ){
				if( reqHeaders[i].value ){
					out.push( reqHeaders[i].value );
				}
			}
		}

		if( settings.resHeaders ){
			var resHeaders = contentObj.request.response.headers
			for( var i = 0; i < resHeaders.length; i++ ){
				if( resHeaders[i].value ){
					out.push( resHeaders[i].value );
				}
			}
		}

		if( settings.searchContent && contentObj.content ){
			out.push( contentObj.content );
		}

		return out;
	};

	var regexSearch = function( content, searchStr ){
		var htmlStr    = "";
		var expression = new RegExp( searchStr, 'g' );
		var match;

		while ((match = expression.exec( content )) !== null) {
			htmlStr += generateResultRow( content, match.index, match[0].length );
		}
		
		return htmlStr;
	};

	var stringSearch = function( content, searchStr ){
		var loc     = content.indexOf( searchStr );
		var length  = searchStr.length;
		var htmlStr = "";

		while( loc >= 0 ){
			htmlStr += generateResultRow( content, loc, length );
			loc    = content.indexOf( searchStr, loc + 1 );
			length = searchStr.length;
		}

		return htmlStr;			
	}

	var generateUrlRow = function( url ){
		var clipText = url.substring( url.lastIndexOf('/')+1 );

		 return '<tr><td class="header-cell">URL</td><td>' + url + 
		 	'</td><td><button class="clip-btn" data-clipboard-text="' + clipText + 
		 	'">Copy Url</button></td></tr>';
	};

	//TODO this should indicate if the result was found in a header or the content
	var generateResultRow = function( content, loc, length ){
		var htmlStr = "";

		htmlStr += '<tr><td class="header-cell">Result</td><td>';
		htmlStr += content.substring( loc - settings.bufferLength, loc );
		htmlStr += '<b>' + content.substring( loc, loc + length ) + '</b>';
		htmlStr += content.substring( loc + length, loc + length + settings.bufferLength );
		htmlStr += '</td></tr>';

		return htmlStr;
	};

	var generateResultListItem = function( result, url ){
		var htmlStr = "";

		if( result !== "" ){
			htmlStr += '<li><table>'
			htmlStr += generateUrlRow( url );
			htmlStr += result;
			htmlStr += '</table></li>';
		}

		return htmlStr;
	};

	/**
	 * INITIALIZATION
	 */

	//initialize container
	var contentContainer = [];

	//initialize settings
	var settings = { bufferLength: 30, listen: true, searchContent: true };
	var searcher = stringSearch;

	//Initialize clipboard button listener
	new Clipboard('.clip-btn');

	/**
	 * LISTENERS
	 */

	//as each request comes in add the content to the container and add the url to the list
	chrome.devtools.network.onRequestFinished.addListener( function(request) {
		if( settings.listen ){
			request.getContent( function( content, encoding ){
				$('#req-list').append('<li>'+request.request.url+'</li>');

				contentContainer.push( {
					request: request,
					content: content,
					encoding: encoding
				} );
			} );
		}
	} );

	$("#go").click( function( ){
		$("#res-list").html( "" );
		var searchStr = $("#search").val();
		
		for( var i = 0; i < contentContainer.length; i++ ) {
			var url      = contentContainer[i].request.request.url;
			var contents = getContents( contentContainer[i] );
			var results  = "";

			for( var j = 0; j < contents.length; j++ ){
				results += searcher( contents[j], searchStr );
			}

			$("#res-list").append( generateResultListItem( results, url ) );
		}
	} );

	$("#flush").click( function( ){
		$("#res-list").html( "" );
		$("#req-list").html( "" );
		contentContainer = [];
	} );

	$("#regex").click( function( ){
		if( $("#regex").is(':checked') ){
			searcher = regexSearch;
		} else {
			searcher = stringSearch;
		}
	} );

	$("#req-header-toggle").click( function( ){
		settings.reqHeaders = $("#req-header-toggle").is(':checked');
	} );

	$("#res-header-toggle").click( function( ){
		settings.resHeaders = $("#res-header-toggle").is(':checked');
	} );

	$("#res-header-toggle").click( function( ){
		settings.searchContent = $("#content-toggle").is(':checked');
	} );

	$("#stop").click( function( ){
		//TODO make this a toggle
		settings.listen = false;
	} );
} );
