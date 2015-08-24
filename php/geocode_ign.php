<?php
$key_ign = 'hv3tzig6301xdwffd4ds92g4';
if(isset($_GET['numero'])){ $numero= $_GET['numero'];}else{ $numero='';}
if(isset($_GET['rue'])){ $rue= $_GET['rue'];}else{ $rue='';}
if(isset($_GET['cp'])){ $cp= $_GET['cp'];}else{ $cp='';}
if(isset($_GET['commune'])){ $commune= $_GET['commune'];}else{ $commune='';}


$nb_res = 1;

$req = '<?xml version="1.0" encoding="UTF-8"?> 
<XLS 
 xmlns:xls="http://www.opengis.net/xls" 
 xmlns:gml="http://www.opengis.net/gml" 
 xmlns="http://www.opengis.net/xls" 
 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
 version="1.2" 
 xsi:schemaLocation="http://www.opengis.net/xls 
http://schemas.opengis.net/ols/1.2/olsAll.xsd"> 
 <RequestHeader/> 
 <Request requestID="1" version="1.2" methodName="LocationUtilityService"> 
 <GeocodeRequest returnFreeForm="false"> 
 <Address countryCode="StreetAddress"> 
 <StreetAddress> 
 <Street>'.$numero.' '.$rue.'</Street> 
 </StreetAddress> 
 <Place type="Municipality">'.$commune.'</Place> 
 <PostalCode>'.$cp .'</PostalCode> 
 </Address> 
 </GeocodeRequest> 
 </Request> 
</XLS>';


$url = 'http://gpp3-wxs.ign.fr/'.$key_ign .'/geoportail/ols?';


$opts = array('http' =>array('method'  => 'POST','header'  => 'Content-Type: application/xml;charset=utf-8','content' => $req));
$context  = stream_context_create($opts);
$xmlstr = file_get_contents($url , false, $context);


preg_match('#<Place\stype="Qualite".*</Place>#i', $xmlstr, $matches);


$qualite = str_replace('<Place type="Qualite">','',$matches[0]);
$qualite = str_replace('</Place>','',$qualite);



$xmlstr = str_replace('gml:Point','gmlPoint',$xmlstr);
$xmlstr = str_replace('gml:pos','gmlpos',$xmlstr);
//print_r ($xmlstr);

$g = new SimpleXMLElement($xmlstr);


$GeocodedAddress = $g->Response->GeocodeResponse->GeocodeResponseList->GeocodedAddress;
$accuracy = (string) $GeocodedAddress->GeocodeMatchCode['accuracy'][0];
$matchType = (string) $GeocodedAddress->GeocodeMatchCode['matchType'][0];


$latlng = $GeocodedAddress->gmlPoint->gmlpos;
$lat = explode(' ',$latlng )[0];
$lng = explode(' ',$latlng )[1];
//echo($lat .'| '. $lng);
  
echo json_encode(array("lat"=> $lat, "lng"=>$lng, "qualite" =>$qualite, "accuracy"=>$accuracy, "matchType" =>$matchType));

?>