import { Injectable, EventEmitter, Output } from '@angular/core';
import * as L from 'leaflet'
import { GeocoderService } from './geocoder.service';

@Injectable({
  providedIn: 'root'
})
export class MapService {
 selectedId  = new EventEmitter();

  map;
  FGroup
  
  constructor(
    public geocoderService: GeocoderService
  ) { 

    this.geocoderService.eventNewCoords.subscribe(d =>  this.newCoords(d.row, d.fitbounds))


  }


  initMap(mapContenair) {

    const coords = [46.856285, 2.350625];
    const zoom = 5;
    this.map = L.map(mapContenair)
      .setView(coords, zoom);


    const key_ign_domaine ='7w0sxl9imubregycnsqerliz';
    const base_osm = L.tileLayer('//{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',maxZoom: 20});
    const ign_scan = L.tileLayer("https://gpp3-wxs.ign.fr/"+key_ign_domaine+"/wmts?LAYER=GEOGRAPHICALGRIDSYSTEMS.MAPS&EXCEPTIONS=text/xml&FORMAT=image/jpeg&SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&STYLE=normal&TILEMATRIXSET=PM&&TILEMATRIX={z}&TILECOL={x}&TILEROW={y}", {attribution : '&copy; <a href="http://www.ign.fr/">IGN</a>',maxZoom: 20});
    const ign_ortho = L.tileLayer( "https://wxs.ign.fr/pratique/geoportail/wmts?LAYER=ORTHOIMAGERY.ORTHOPHOTOS&EXCEPTIONS=text/xml&FORMAT=image/jpeg&SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&STYLE=normal&TILEMATRIXSET=PM&&TILEMATRIX={z}&TILECOL={x}&TILEROW={y}", {attribution : '&copy; <a href="http://www.ign.fr/">IGN</a>',maxZoom: 20});


    var baseMaps = {
        "OSM": base_osm,
        "Ortho IGN": ign_ortho,
        "Scan IGN": ign_scan
      
    };
    base_osm.addTo(this.map)
    L.control.layers(baseMaps).addTo(this.map);



    // L.tileLayer('//{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
    //   attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    // }).addTo(this.map);

    this.FGroup = L.featureGroup().addTo(this.map)
  }

  getIcon(row) {
    let url_marker = '';
    const score = row.score;
    if (score > 99) { url_marker = './assets/images/black.png'; }
    else if (score > 89 && score < 100) { url_marker = './assets/images/9x.png'; }
    else if (score > 79 && score < 90) { url_marker = './assets/images/8x.png'; }
    else if (score > 69 && score < 80) { url_marker = './assets/images/7x.png'; }
    else if (score > 59 && score < 70) { url_marker = './assets/images/6x.png'; }
    else if (score > 49 && score < 60) { url_marker = './assets/images/5x.png'; }
    else if (score < 49) { url_marker = './assets/images/2x.png'; }

    const icon = L.icon({
      iconUrl: url_marker,
      shadowUrl: "./assets/images/markers-shadow.png",
      iconSize: [30, 41],
      iconAnchor: [15, 40],
      shadowSize: [35, 16],
      shadowAnchor: [5, 15]
    });
    return icon;
  }

  createMarker(row){
    const icon = this.getIcon(row);

	  const marker = L.marker([row.coords.lat, row.coords.lng], {
	    draggable: true,
	    icon: icon
	  });
	  marker.id = row.id;

	  marker.on("click", e => {
      this.geocoderService.selectedId = marker.id;
      // console.log(this.geocoderService.selectedId)
      this.selectedId.emit(marker.id)
	    // markerClicked.next(marker.id);
	  });

	  marker.on("dragend", e => {
      const id = e.target.id;
      let index = this.geocoderService.data.findIndex( d => d.id == id);
      const newCoords = e.target.getLatLng();
      this.geocoderService.data[index] = { ...this.geocoderService.data[index], score: 100, geocoder: 'Manuel', coords: newCoords };
      const marker = e.target;
	    const icon = this.getIcon(this.geocoderService.data[index]);
	    marker.setIcon(icon);
	  });

	  return marker;
  }

  resetMap(){
    this.FGroup.clearLayers()
  }

  newCoords(row, fitbounds = false){
    const layers = this.FGroup.getLayers();
		const layer = layers.filter( l => l.id === row.id);
		if (layer[0]){
			this.FGroup.removeLayer(layer[0])
		}
		const marker = this.createMarker(row);
    marker.addTo(this.FGroup);
    if (fitbounds){
      this.map.fitBounds(this.FGroup.getBounds(), {padding:[15,15]});
    }

  }

  zoomToRow(row){
    let latlng = row.coords;
    this.map.setView(latlng, 18)

  }


}
