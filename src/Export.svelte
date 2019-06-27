<script>
	import { createEventDispatcher } from "svelte";
	import { onMount } from 'svelte';
  import { fade, fly } from "svelte/transition";
  import { data } from "./store.js";
  import fileSaver from "file-saver";
	import tokml from "tokml";
	


	const dispatch = createEventDispatcher();
	let dataGeocoded = null;
	let dataLength  = null;
	let dataGeocodedLength  = null;

	onMount(() => {
		dataLength = $data.length;
		 dataGeocoded = $data.filter(d => d.coords);
		 dataGeocodedLength = dataGeocoded.length;
		console.log('the component has mounted');
	});

  const toGeojson = () => {

    const features = [];

    for (let i = 0; i < dataGeocoded.length; i++) {
      const d = dataGeocoded[i];
      features.push({
        type: "Feature",
        properties: { ...d.input, _score: d.score, _service: d.geocoder },
        geometry: {
          type: "Point",
          coordinates: [d.coords.lng, d.coords.lat]
        }
      });
    }
    return {
      type: "FeatureCollection",
      features: features
    };
  };

  const exportToGeojson = () => {
    const geojson = toGeojson();
    const blob = new Blob([JSON.stringify(geojson)], {
      type: "text/plain;charset=utf-8"
    });
    fileSaver.saveAs(blob, "result_geocode.geojson");
  };

  const exportToKML = () => {
    const geojson = toGeojson();
    const kml = tokml(geojson);
    const blob = new Blob([kml], { type: "text/plain;charset=utf-8" });
    fileSaver.saveAs(blob, "result_geocode.kml");
  };

  const submit = () => {
    dipatch("close");
  };
</script>

<style>
  .modal-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    z-index: 150;
  }

  .modal {
    z-index: 151;
    position: fixed;
    left: 50px;
    top: 50px;
    bottom: 50px;
    right: 50px;
    /* width: calc(100vw - 4em);
	  max-width: 32em;
	  max-height: calc(100vh - 4em); */
    overflow: auto;
    /* transform: translate(-50%, -50%); */
    padding: 0;
    border-radius: 0.2em;
    background: white;
  }

  button {
    display: block;
  }
</style>

<div
  class="modal-background"
  on:click={() => dispatch('close')}
  transition:fade={{ duration: 200 }} />

<div class="modal " transition:fly={{ y: -400, duration: 200 }}>
  <header class="mdl-layout__header">
    <div class="mdl-layout__header-row">
      <span class="mdl-layout-title">Exporter le resultat</span>
    </div>

  </header>

  <button
    class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect "
    on:click={() => exportToGeojson()}>
    GeoJson
  </button>

  <button
    class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect "
    on:click={() => exportToKML()}>
    KML
  </button>

  <button
    class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect
    mdl-button--accent"
    on:click={() => dispatch('close')}>
    close modal
  </button>
</div>
