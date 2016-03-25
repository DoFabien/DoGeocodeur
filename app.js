var app = angular.module('myApp',['ngGrid', 'ui.bootstrap', 'angularFileUpload','chieffancypants.loadingBar']); 

// Fonction global accessible à tous les controleurs
app.run(function($rootScope,$modal) {
    $rootScope.data_geocode = [];
    $rootScope.field_lbl_ind = [];
    $rootScope.csv_full = '';
    $rootScope.champs_geocode = [];
});


//DEBUT DU CONTROLEUR 1
app.controller('Ctrl1', function($scope,$upload,$timeout,$modal, cfpLoadingBar) {
    var map = L.map('map', {maxZoom:20} ).setView([ init_lat,init_lng ], init_zoom);
    var FGroup = L.featureGroup().addTo(map); // featureGroup qui va accueillir les Markers 
    if(navigator.geolocation){navigator.geolocation.getCurrentPosition(get_position);}   

    function get_position(location){
        map.setView([ location.coords.latitude, location.coords.longitude], 8);
    }

    $scope.btn_disabled = true;
    $scope.show_btn_cancel = false;
    $scope.rows_selected = Array();
    $scope.marker_data =  [];
    $scope.adresse = '';
    $scope.scrore_min = 93;
    $scope.columnDefs = [{displayName: "En attente de données" ,enableCellEdit: false, width: "*"}];


    var base_osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',maxZoom: 20});
    var google =  L.tileLayer('http://khms0.googleapis.com/kh?v=145&hl=fr-FR&x={x}&y={y}&z={z}', {maxZoom: 20}) // 
    var ign_scan = L.tileLayer("http://gpp3-wxs.ign.fr/"+key_ign_domaine+"/wmts?LAYER=GEOGRAPHICALGRIDSYSTEMS.MAPS&EXCEPTIONS=text/xml&FORMAT=image/jpeg&SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&STYLE=normal&TILEMATRIXSET=PM&&TILEMATRIX={z}&TILECOL={x}&TILEROW={y}", {attribution : '&copy; <a href="http://www.ign.fr/">IGN</a>',maxZoom: 20});
    var ign_ortho = L.tileLayer( "http://gpp3-wxs.ign.fr/"+key_ign_domaine+"/wmts?LAYER=ORTHOIMAGERY.ORTHOPHOTOS&EXCEPTIONS=text/xml&FORMAT=image/jpeg&SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&STYLE=normal&TILEMATRIXSET=PM&&TILEMATRIX={z}&TILECOL={x}&TILEROW={y}", {attribution : '&copy; <a href="http://www.ign.fr/">IGN</a>',maxZoom: 20});
    var googleMaps = new L.Google('ROADMAP');
    var googleOrtho = new L.Google('SATELLITE');

    var baseMaps = {
        "OSM": base_osm,
        "Scan IGN": ign_scan,
        "Google Maps":googleMaps,
        "Ortho IGN": ign_ortho,
        "Ortho Google":googleOrtho,
    };
    base_osm.addTo(map)
    L.control.layers(baseMaps).addTo(map);

    /*GRID*/
    $scope.gridOptions = { 
        columnDefs: 'columnDefs', // 
        data: 'data_geocode', 
        multiSelect: false,
        enableCellEdit:true,

        sortable:true,
        selectedItems: $scope.rows_selected,
        beforeSelectionChange: function(row) {row.changed = true;return true;},
        afterSelectionChange: function (row, event) {if (row.changed){
            var lat = $scope.rows_selected[0][$scope.champs_geocode.lat];
            var lng = $scope.rows_selected[0][$scope.champs_geocode.lng]
            if(lat != undefined && lng!= undefined){ map.panTo({lat:lat, lng: lng});}
            row.changed=false;
        }
                                                    }
    };


    /*EVENTS*/
    FGroup.on('click', on_click_FGroup);// lors du click sur le marker

    /*EVENT ON CLICK SUR UN MARKER*/
    function on_click_FGroup(e) { 
        console.log(e);
        var id_leaflet = e.layer._leaflet_id;
        var index_selected = $scope.findWithAttr($scope.data_geocode,'leaflet_id',e.layer._leaflet_id);
        $scope.gridOptions.selectItem(index_selected,true);
        $scope.gridOptions.ngGrid.$viewport.scrollTop(Math.max(0, (index_selected))*$scope.gridOptions.ngGrid.config.rowHeight);
        $scope.$apply();
    }

    /*EVENT PENDANT LE DRAG*/
    function on_drag_Marker(e) { 
        var leaflet_id = e.target._leaflet_id;
        var ind = $scope.findWithAttr($scope.data_geocode,'leaflet_id',leaflet_id);
        $scope.gridOptions.selectItem(ind,true);
        $scope.data_geocode[ind][$scope.champs_geocode.lat] = e.target._latlng.lat;
        $scope.data_geocode[ind][$scope.champs_geocode.lng] = e.target._latlng.lng;
        $scope.data_geocode[ind][$scope.champs_geocode.score] = 100;
        $scope.data_geocode[ind][$scope.champs_geocode.geocoder] = 'Manuel';
        $scope.$apply();
    }
    /*EVENT A LA FIN DU DRAG*/
    function on_drag_end_Marker(e) { 
        var leaflet_id = e.target._leaflet_id;
        var index= $scope.findWithAttr($scope.data_geocode,'leaflet_id',leaflet_id);
        FGroup.removeLayer(leaflet_id);
        $scope.add_marker(e.target._latlng.lat,e.target._latlng.lng,index,100);
    }

    /*RETROURNE L'INDEX A PARTIR D'UN ATTRIBUT*/
    $scope.findWithAttr = function (array, attr, value) {for(var i = 0; i < array.length; i += 1) {if(array[i][attr] === value) {return i; } }}

    /*RETROURNE L'INDEX DE L'OBJET DANS UN TABLEAU == OBJ EN PARAMETRE l'objet dans un tableau == obj en paramètre */
    $scope.get_ind_obj = function(obj){
        var ind = -1;for (i=0;i<$scope.data_geocode.length;i++){if (obj == $scope.data_geocode[i]){ind = i; break;}}return ind;
    }


    /*GENERATION DU CSV*/
    $scope.generate_CSV = function (){
        $scope.data_geocode;
        $scope.field_lbl_ind;
        var csv ='';
        var headers =[];
        for (i=0;i<$scope.field_lbl_ind.length;i++){
            headers.push($scope.field_lbl_ind[i].lbl);
        }
        csv+=headers.join(';')+"\r\n";
        for (j=0;j<$scope.data_geocode.length;j++){
            var row =[];
            for (k=0;k<$scope.field_lbl_ind.length;k++){
                row.push($scope.data_geocode[j][$scope.field_lbl_ind[k].ind]);
            }
            csv+=row.join(';')+"\r\n";
        }
        return csv;
    }


    /*GENERATION DU KML*/
    $scope.generate_KML = function (){
        var head_kml = '<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom">\n        <Document>\n';
        var content_kml = '';
        for (j=0;j<$scope.data_geocode.length;j++)
        {
            var data ='<ExtendedData>\n';
            for (k=0;k<$scope.field_lbl_ind.length;k++)
            {
                var current_data_name = '<Data name="'+$scope.field_lbl_ind[k].lbl+'">\n';
                var current_data_value  = ' <value>'+$scope.data_geocode[j][$scope.field_lbl_ind[k].ind] + '</value>\n';
                var current_data = current_data_name + current_data_value + '</Data>\n';
                data += current_data;
            }
            data+='</ExtendedData>\n';
            var point = '<Point>\n     <coordinates>'+ $scope.data_geocode[j][$scope.champs_geocode.lng] +','+$scope.data_geocode[j][$scope.champs_geocode.lat]+'</coordinates>\n</Point>\n';
            var placemark = '<Placemark>\n <name></name>\n'+ data + point +'</Placemark>';
            content_kml += placemark;
        }
        var footer_kml = '    </Document> \n</kml>'
        var kml = head_kml + content_kml + footer_kml;
        return kml;
    }

    /*GENERATION DU GEOJSON*/
    $scope.generate_GEOJSON = function (){
        var features =[];
        for (j=0;j<$scope.data_geocode.length;j++)
        {
            var properties =[];
            for (k=0;k<$scope.field_lbl_ind.length;k++){
                var propertie = '"'+$scope.field_lbl_ind[k].lbl+'":"'+$scope.data_geocode[j][$scope.field_lbl_ind[k].ind]+'"';
                properties.push(propertie);
            }
            var properties_str ='"properties": {'+ properties.join(',')+'},';
            var geometry = '"geometry": { "type": "Point", "coordinates": ['+ $scope.data_geocode[j][$scope.champs_geocode.lng] +', '+$scope.data_geocode[j][$scope.champs_geocode.lat]+'] } }';
            var feature ='{ "type": "Feature", '+properties_str + geometry;
            features.push(feature);
        }
        var head_geojson = '{\n"type": "FeatureCollection",\n"crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },\n\n"features": [\n';
        var geojson = head_geojson + features.join(',\n') +'\n'+ ']}';
        return geojson;
    }

    /*EXPORT DU FICHIER ET PROPOSE LE TELECHARGEMENT*/
    $scope.export = function(content,nom_file,type_mime){
        var blob = new Blob([content], {type: type_mime});
        saveAs(blob, nom_file);

    }

    /*FORCE LE GEOCODAGE DE LA LIGNE MEME SI LE SCORE EST PLUS HAUT*/
    $scope.row_geocode_forcing = function (row,fct){
        var elem = row.entity;
        var ind = $scope.get_ind_obj(elem)
        var num = elem[$scope.champs_geocode.numero]; 
        var rue = elem[$scope.champs_geocode.rue];
        var cp = elem[$scope.champs_geocode.cp];
        var commune = elem[$scope.champs_geocode.commune];
        var pays = elem[$scope.champs_geocode.pays];
        fct(num,rue,cp,commune,pays,ind,true);
    }

    /*AJOUTER UN MARKER*/
    $scope.add_marker = function(lat,lng,ind,score){

        FGroup.removeLayer($scope.data_geocode[ind]['leaflet_id']);
        var url_marker ='';
        if (score > 99){url_marker='images/black.png';}
        else if (score > 89 && score < 100){url_marker='images/9x.png';}
        else if (score > 79 && score < 90){url_marker='images/8x.png';}
        else if (score > 69 && score < 80){url_marker='images/7x.png';}
        else if (score > 59 && score < 70){url_marker='images/6x.png';}
        else if (score > 49 && score < 60){url_marker='images/5x.png';}
        else if (score < 49){url_marker='images/2x.png';}
        var icon = L.icon({iconUrl: url_marker,shadowUrl: 'images/markers-shadow.png',iconSize:[30, 41], iconAnchor:[15, 40],shadowSize:[35, 16],shadowAnchor: [5, 15]});
        var marker =  L.marker([lat,lng],{draggable:true,icon: icon});
        marker.addTo(FGroup); 
        $scope.data_geocode[ind]['leaflet_id'] = marker._leaflet_id
        marker.on('drag', on_drag_Marker);// lors du drag d'un marker
        marker.on('dragend', on_drag_end_Marker);
    }
    
    /*GEOCODE UN TABLEAU D'OBJETS */
    $scope.process_geogoding_async = function(array_data,timmer,fct){
        var current_elem =0;
        cfpLoadingBar.start();
        cfpLoadingBar.set(0.01);
        $scope.show_btn_cancel = true;
        loop_asynch();

        function loop_asynch(){ // boucle asynchron avec un timer pour ne pas bloquer l'application et afficher la barre de progression         
            var num = array_data[current_elem][$scope.champs_geocode.numero];
            var rue = array_data[current_elem][$scope.champs_geocode.rue];
            var cp = array_data[current_elem][$scope.champs_geocode.cp];
            var commune = array_data[current_elem][$scope.champs_geocode.commune];
            var pays = array_data[current_elem][$scope.champs_geocode.pays];
            var score =  array_data[current_elem][$scope.champs_geocode.score];
              $scope.btn_disabled = false;

            if ((score<$scope.scrore_min || score == undefined) && $scope.show_btn_cancel == true ){
                fct(num,rue,cp,commune,pays,current_elem,false);
            }

            current_elem++;
            if(current_elem <array_data.length){
                cfpLoadingBar.set(current_elem/array_data.length)
                $timeout(function(){
                    loop_asynch(num,rue,cp,commune,pays)
                },timmer);
            }
            else{
                $scope.btn_disabled = false;
                $scope.show_btn_cancel = false;
                map.fitBounds(FGroup.getBounds());  
                cfpLoadingBar.complete()
            }
        }
    }


    /*GEOCODER GOOGLE*/
    $scope.geocode_google = function (num,rue,cp,commune,pays,i,forcing){
        var adresse = num+' ' + rue + ',' +cp +',' + commune +','+pays;
        var adresse_encoded = encodeURIComponent(adresse);
        var url = "http://maps.googleapis.com/maps/api/geocode/json?address="+adresse_encoded+"&sensor=true"
       
        $.ajax({
            type: "get",
            url:url ,
            async: false,
            success: result,
            dataType: "json"
        });
        function result(data){

            if (data.status == 'OK'){
                var score = 0;
                var score_type =0;
                var score_precision = 0;

                switch (data.results[0].types[0]) {
                    case 'street_number': score_type = 90 ;break;
                    case 'street_address':score_type = 90;break;
                    case 'point_of_interest':score_type = 80;break;
                    case 'route':score_type = 60;break;
                    case 'sublocality':score_type = 50;break;
                    case 'locality':score_type = 30;break;
                    case 'postal_code':score_type = 20;break;
                    case 'country':score_type = 10;break;
                    default: score_type = 0;break;
                }
                switch (data.results[0].geometry.location_type) {
                    case 'ROOFTOP': score_precision = 9 ;break;
                    case 'RANGE_INTERPOLATED':score_precision = 7;break;
                    case 'GEOMETRIC_CENTER':score_precision = 5;break;
                    case 'APPROXIMATE':score_precision = 3;break;
                    default: score_type = 0;break;
                }
                score = score_type+score_precision;
                if($scope.data_geocode[i][$scope.champs_geocode.score] < score || $scope.data_geocode[i][$scope.champs_geocode.score] == undefined || forcing==true){

                    $scope.data_geocode[i][$scope.champs_geocode.geocoder] = 'Google';
                    $scope.data_geocode[i][$scope.champs_geocode.lat] = data.results[0].geometry.location.lat;
                    $scope.data_geocode[i][$scope.champs_geocode.lng] = data.results[0].geometry.location.lng;
                    $scope.data_geocode[i][$scope.champs_geocode.score] = score;
                    $scope.add_marker(data.results[0].geometry.location.lat, data.results[0].geometry.location.lng, i,score);
                }
            }
        }
    }

    /*OUVERTURE DE LA POPUP D'IMPORT*/
    $scope.open_popup = function (_data) {
        var modalInstance = $modal.open({
            templateUrl: "template_html/popup_import_csv.html",
            controller: ModalInstanceCtrl,
            resolve: {
                data: function () {
                    return _data;
                }
            }
        });

        modalInstance.result.then(function (data) {
            // console.log(data);

            $scope.field_lbl_ind = data[1];
            $scope.data_geocode = data[0];
            $scope.champs_geocode = data[2];
            if($scope.data_geocode.length >0){
                $scope.btn_disabled = false;   
            }
            FGroup.clearLayers();
            var column = [];
            for (var i=0;i<$scope.field_lbl_ind.length;i++){
                if ($scope.field_lbl_ind[i].ind == $scope.champs_geocode.numero || $scope.field_lbl_ind[i].ind == $scope.champs_geocode.rue || $scope.field_lbl_ind[i].ind == $scope.champs_geocode.cp || $scope.field_lbl_ind[i].ind == $scope.champs_geocode.commune){
                    column.push({displayName: String($scope.field_lbl_ind[i].lbl) ,enableCellEdit: true ,field: String($scope.field_lbl_ind[i].ind), width:'*', cellTemplate: '<label class="ngCellText">{{row.getProperty(col.field)}}</label>'});
                }
                else{
                    column.push({displayName: String($scope.field_lbl_ind[i].lbl) ,enableCellEdit: false ,field: String($scope.field_lbl_ind[i].ind), width:'*'});
                }

            }
            var w_col_button = 16;
            column.push({ field: '', width:w_col_button, cellTemplate: '<img src="images/google.png" title="Geocoder cette ligne avec le service de Google!" ng-click="row_geocode_forcing(row,geocode_google)">' });
            $scope.columnDefs =  column;         


        }, function () {

        });

    } //EOF open_popu



});//EOF CONTROLEUR 1 
