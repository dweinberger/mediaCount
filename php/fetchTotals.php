<?php
	
ini_set('display_errors','On');
error_reporting(E_ALL);

function debugPrint($s){
	if (1==2){
		error_log($s);
	}
}

function doQuery($query){
	$ch = curl_init(); 
	curl_setopt($ch, CURLOPT_URL, $query);
	debugPrint("query= $query");
	// Return the transfer as a string 
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
	// $output contains the output string 
	$ret = curl_exec($ch); 
	$recorddecoded = json_decode($ret);
	curl_close($ch);
	$num = $recorddecoded->pagination->numFound;
	debugPrint("num: $num");
	return $num; 
}

$searchterms = $_REQUEST['searchterms'];
$terms = json_decode($searchterms);

$basequery = "http://api.lib.harvard.edu/v2/items.json?subject=";

$bigarray = array();

for ($i = 0 ; $i < count($terms); $i++){
	$termraw = $terms[$i];
	$term = urlencode($termraw);
	$a = array();
	
	$prequery = $basequery . $term . "&resourceType=";
	$text = doQuery($prequery . "text");
	$recording = doQuery($prequery . "sound");
	$map = doQuery($prequery . "cartographic");
	$movie = doQuery($prequery . "moving");
	$image = doQuery($prequery . "still");
	$d3 = doQuery($prequery . "three");
	
	$a=array(
		"searchterm" => $term,
		"text" => $text,
		"recording" => $recording,
		"map" => $map,
		"movie" => $movie,
		"image" => $image,
		"d3" => $d3
		);
		
	$bigarray[] = $a;

}

echo json_encode($bigarray);

?>