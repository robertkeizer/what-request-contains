$(document).ready( function( ){
	function updatePanel( ){

		alert( "I have search of " );
		alert( $("#search").val() );

		chrome.devtools.network.getHAR( function( harLog ){
			$("#debug").html( JSON.stringify( harLog ) );
			alert( JSON.stringify( harLog ) );
		} );
	};

	$("#debug").html( "Loading.." );

	$("#go").click( function( ){
		updatePanel( );
	} );
} );
