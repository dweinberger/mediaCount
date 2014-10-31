// thank you http://blog.teamtreehouse.com/writing-your-own-jquery-plugins

(function ( $ ) {
	$.fn.parseItemJSON = function( action,returntype ) {
		// turns results from an item in a results list from
		// the LibraryCloud item API into an array of useful results
		
		// -- Subject
		if (action === "subject"){
			var subjarray = new Array();
			var item = this[0]["mods"]["subject"];
			if (item == undefined){
				return [];
			}
			if ($.isArray(item)){
				// first, flatten the array
				item = $.map(item, function recurs(n) {
    				return ($.isArray(n["topic"]) ? $.map(n, recurs): n);
				});
					for (var j=0; j < item.length; j++){
						var subjpair = item[j];
						// is there a "topic" keyword?
						if (subjpair["topic"] !== undefined){
							subjarray.push(subjpair["topic"])
						}
					}
				}
				else { // subjectInfo is not an array
					var topic = item["topic"];
					subjarray.push(topic);
				} // end subject
		
		return subjarray;
		
		}
		
		if (action === "author"){
			var item = this[0]["mods"]["name"];
			if (item == undefined){
				return [];
			}
			if ($.isArray(item)){
				var autharray = new Array();
				for (var j=0; j < item.length; j++){
					var authpair = item[j];
					// is there a "name" keyword and is it personal?
					if ((authpair["namePart"] !== undefined) && (authpair["type"] == "personal")){
						// namePart can also be an array. If so, we want the 0 element, which should be the name
						if ($.isArray(authpair["namePart"])){
							autharray.push(authpair["namePart"][0]);
						}
						else { // namePart is not itself an array
							autharray.push(authpair["namePart"]);
						}
					}
				}	
			  }
			else { // name is not an array
				var autharray = new Array();
				var name = item["namePart"];
				autharray.push(name);
			} 
			return autharray;	
		}
		
		
		if (action === "title"){
			var item = this[0]["mods"]["titleInfo"];
			if (item == undefined){
				return [];
			}
			if ($.isArray(item)){
				var titlearray = new Array();
				for (var j=0; j< item.length; j++){
					var titlepair = item[j];
					// is there a "title" keyword?
					if (titlepair["title"] !== undefined){
						titlearray.push(titlepair["title"])
					}
				}
			}
			else { // titleInfo is not an array
				var titlearray = new Array();
				var title = item["title"];
				titlearray.push(title);
			} 
			return titlearray;
		}
	
	

	};
	
}( jQuery ));
