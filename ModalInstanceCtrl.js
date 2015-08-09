//DEBUT DU CONTROLEUR ModalInstanceCtrl
var ModalInstanceCtrl = function ($scope, $modalInstance,data) {
    
    $scope.ok = function (data_to_send) {
        
        if ($scope.champs_geocod.rue == '' || $scope.champs_geocod.commune ==''){
         alert('Le champs "rue" et "commune" doivent être définies');   
        }
        else{
        $modalInstance.close([$scope.data_geocode, $scope.obj_field_ind, $scope.champs_geocod ]);
        }
    }
    
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };  
    
    $scope.text_coller = '';
    $scope.champs_geocod = {numero:'',rue:'',cp:'',commune:'',lat:'',lng:''};
    /*CHARGER LE FICHIER CSV*/
    $scope.onFileSelect = function($files) {
        var file = $files[0];
        var fr = new FileReader();
        fr.readAsText(file);
        fr.onload = function(event) {
            $scope.import_csv(event.currentTarget.result)
        };   
    }
    
    $scope.import_csv = function (str_full){
        str_full = str_full.replace(/\n/g,'');// on enleve le retour \n pour les systèmes windows
        var rows = str_full.split('\r');
        var separateur  = $scope.searchSeparateur(rows[0]);
        $scope.importer_text(rows,separateur,true);
    }
    
    $scope.import_text = function (str_full){
         var rows = str_full.split('\n');
        var separateur  = $scope.searchSeparateur(rows[0]);
        $scope.importer_text(rows,separateur,false);
    }
    
    $scope.searchSeparateur= function(row){
        var separateur =';';
        if(row.split(',').length >row.split(';').length ){separateur = ',';}
        if(row.split(/\t/).length >row.split(',').length  ){separateur = '\t';}
        return (separateur);
    }
    
    /*IMPORTER LE CSV*/
    $scope.obj_field_ind = [];
    $scope.field_for_select = [];
    $scope.importer_text = function(rows,separateur,scope_apply){
        $scope.data_geocode = [];
        var fields = rows[0].split(separateur); // champ
        $scope.obj_field_ind = []
        for (k=0;k<fields.length;k++){
            $scope.obj_field_ind[k] = {ind:'f'+k, lbl:fields[k]};
            $scope.field_for_select[k] = {ind:'f'+k, lbl:fields[k]};
        }
        $scope.obj_field_ind[fields.length] = {ind:'f'+fields.length, lbl:'Score'};
        $scope.obj_field_ind[fields.length+1] = {ind:'f'+(fields.length +1), lbl:'Geocoder'};
        $scope.obj_field_ind[fields.length+2] = {ind:'f'+(fields.length +2), lbl:'Lng'};
        $scope.obj_field_ind[fields.length+3] = {ind:'f'+(fields.length +3), lbl:'Lat'};
        
        $scope.champs_geocod.score = 'f'+fields.length;
        $scope.champs_geocod.geocoder = 'f'+(fields.length +1);
        $scope.champs_geocod.lng = 'f'+(fields.length +2);
        $scope.champs_geocod.lat = 'f'+(fields.length +3);
        
        for (i=1;i<rows.length;i++){
            if (rows[i].split(separateur).length >1){
                var array_rows = rows[i].split(separateur);
                var obj = new Object();
                for (j=0;j<$scope.obj_field_ind.length;j++){
                    obj[$scope.obj_field_ind[j].ind] = array_rows[j];
                }
                $scope.data_geocode.push(obj);
            }
        }
        if (scope_apply == true){
            $scope.$apply();
        }
    }
} //EOF CONTROLEUR ModalInstanceCtrl