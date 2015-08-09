<?php
if(isset($_GET['url'])){ $url= $_GET['url'];}else{ $url='';}

//$url = 'http://dev.virtualearth.net/REST/v1/Locations/FR/75008/Paris/55%20Rue%20du%20Faubourg%20Saint-Honor%C3%A9?o=json&key=AiCo2LZ6EoHgIqhAdgyY09xb02RTjjZTX9SGPITa4m144x_QhETFaU5COqm56TYJ';
$req = file_get_contents($url);
//http://dev.virtualearth.net/REST/v1/Locations?q=1%20Microsoft%20Way%20Redmond%20WA%2098052&o=json&key=AiCo2LZ6EoHgIqhAdgyY09xb02RTjjZTX9SGPITa4m144x_QhETFaU5COqm56TYJ
echo $req;

?>