

<style>
					#map {
					  height: 100%;
					  width: 100%;
					  z-index: 1;
					}
</style>

<script>
	import L from "leaflet";

	import { data, newCoords, markerClicked, markerDragedEnd, zoomToMarker} from "./store.js";
	import { onMount, setContext } from "svelte";
	import { createEventDispatcher } from "svelte";
	import { getIcon } from "./map.js";


	newCoords.subscribe(row => {
		const layers = FGroup.getLayers();
		const layer = layers.filter( l => l.id === row.id);
		if (layer[0]){
			FGroup.removeLayer(layer[0])
		}
		const marker = getMarker(row);
		marker.addTo(FGroup);
		// map.fitBounds(FGroup.getBounds()); 
	});

	zoomToMarker.subscribe(row => {
		if (row.coords && row.coords.lat){
			map.setView([row.coords.lat, row.coords.lng], 17)
		}
	});

	// import { setMap, getMap, initMap } from './map.js';
	const dispatch = createEventDispatcher();
	let map;
	let FGroup;

	onMount(() => {
			setTimeout(() => {
					  map = initMap(document.getElementById("map"));
	  				dispatch("domMapRady", map);
			}, 100);

	});

	const initMap = htmlElement => {
	  console.log(htmlElement);
	  map = L.map(htmlElement).setView([46, 5], 6);

	  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
	    attribution:
	      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);
		
		FGroup = L.featureGroup().addTo(map)

	  // for (let row of $data) {
	  //   console.log(row);
	  //   const marker = getMarker(row);
	  //   marker.addTo(map);

	  //   marker.on("click", e => {
	  //     const id = e.target.id;
	  //     console.log("click marker", id);
	  //   });
	  // }
	  // map.on("click", e => {
	  //   console.log(e);
	  // });

	  return map;
	};

	const getMarker = row => {
	  const icon = getIcon(row);

	  const marker = L.marker([row.coords.lat, row.coords.lng], {
	    draggable: true,
	    icon: icon
	  });
	  marker.id = row.id;

	  marker.on("click", e => {
	    markerClicked.next(marker.id);
	  });

	  marker.on("dragend", e => {
	    console.log(e.target.id);
	    markerDragedEnd.next(e.target.id);
	    $data = $data.map(d => {
	      if (d.id == e.target.id) {
	        const newCoords = e.target.getLatLng();
	        const newRow = { ...d, score: 100, geocoder: 'Manuel', coords: newCoords };
	        const marker = e.target;
	        const icon = getIcon(newRow);
	        marker.setIcon(icon);
	        console.log(e.target);
	        return newRow;
	      }
	      return d;
	    });
	    // const rowData = $data.filter( d => d.id = e.target.id)[0];
	    //  console.log(rowData);
	    //  console.log($data);
	    //  rowData.commune = 'hahaha';
	    //  data.update( c => {
	    // 	 return $data;
	    //  });
	    //  console.log($data);
	  });

	  return marker;
	  // lors du drag d'un marker
	  // marker.on("dragend", e => {
	  //             console.log(e);
	  //    var icon = L.icon({
	  //   iconUrl: "./assets/images/black.png",
	  //   shadowUrl: "./assets/images/markers-shadow.png",
	  //   iconSize: [30, 41],
	  //   iconAnchor: [15, 40],
	  //   shadowSize: [35, 16],
	  //   shadowAnchor: [5, 15]
	  // });
	  //     const marker = e.target;
	  //   marker.setIcon(icon)
	  //   console.log(e.target);
	  // });
	};
</script>



<div id="map"> </div>