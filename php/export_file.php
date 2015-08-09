<?php
$content = $_POST['content'];
$nom_file = $_POST['nom_file'];
$type_mime = $_POST['type_mime'];

header("Cache-Control: public");
header("Content-Description: File Transfer");
//header("Content-Length: ". filesize("$content").";");
header("Content-Disposition: attachment; filename=$nom_file");
header("Content-Type: $type_mime; "); 
header("Content-Transfer-Encoding: binary");

echo $content;
?>