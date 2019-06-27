

<script>

	import { fade } from 'svelte/transition';
	import { data,scoreMax, keys,
			newCoords, markerClicked, zoomToMarker } from './store.js';
	import Map from "./Map.svelte";
	import ModalImport from "./ModalImport.svelte";
	import Settings from "./Settings.svelte";
	import Export from "./Export.svelte";

	import { geocoderIgn, geocoderBan, geocoderBing, geocoderGoogle, geocoderMapbox } from './geocoderServices.js'
	import { timer } from 'rxjs';
	
	// let localStorage = localStorage;

	let showModalImport = true;
	let showModalSettings = false;
	let showExport = false;

// recupération des clés depuis le webstorages
	let lsKeys = localStorage.getItem('geocoderKeys');
	if (lsKeys){
		const keysJson = JSON.parse(lsKeys);
		for (let k in $keys){
			if (keysJson[k]){
				$keys[k] = keysJson[k];
			}
		}
	}
	
	


	markerClicked.subscribe(e => {
		console.log('Le marker a été clické', e);
	})

const wait = (delay) => {
    return new Promise(resolve => setTimeout(resolve, delay, null));
}
	

	const test = async () => {
		console.log($data)
		console.log(JSON.stringify($data));
	}



	const geocodeAll = async(geocoder, scoreMax, delay) => {
		console.log(scoreMax)
		for (let row of $data){
			if (row.score && row.score >= 93) continue;
			await geocodeRow(row, geocoder)
			await wait(delay)
		}
	}


	const geocodeRow = async (row, geocoder) => {
		console.log(row)

		let service = geocoderBan;
		if (geocoder === 'bing'){
			service = geocoderBing
		} else if (geocoder === 'google'){
			service = geocoderGoogle
		} else if (geocoder === 'mapbox'){
			service = geocoderMapbox
		}else if (geocoder === 'ign'){
			service = geocoderIgn
		}


		//  const res = await geocoderBan(row);
		 let  res = null;
		 try {
			 res =  await service(row);
		 } catch (error) {
			 throw(error);
		 }
		
		if (!res){
			return;
		}
		 console.log(res);
		 const new_data = [...$data];
		 const ind = new_data.findIndex( d => d.id === row.id );
		 new_data[ind] = res;

		 data.set(new_data) ;
		 newCoords.next(res)

	}
	

	const mapIsReady = (event) => {
	
	}

	function callbackFunction(event) {
		console.log(`Notify fired! Detail: ${event.detail}`)
	}

</script>

<style>

	.mapContenair{
		height: 50%;
	}

	#data{
		overflow: scroll;
		height: 50%;
	}


	table{
		width: 100%;
	}

	th,td{
		text-align: left !important;
	}

	.btnGeocode{
		margin-bottom: 5px;
	}

</style>


{#if showModalImport}
	<ModalImport on:close="{() => showModalImport = false}" >
		
	</ModalImport>
{/if}
{#if showModalSettings}
	<Settings on:close="{() => {
		showModalSettings = false;
		localStorage.setItem('geocoderKeys', JSON.stringify($keys))
		console.log($keys);
	
	}}" >
		
	</Settings>
{/if}

{#if showExport}
	<Export on:close="{() => {
		showExport = false;	
	}}" >
		
	</Export>
{/if}



<!-- The drawer is always open in large screens. The header is always shown,
  even in small screens. -->
<div class="mdl-layout mdl-js-layout mdl-layout--fixed-drawer
            mdl-layout--fixed-header">
  <header class="mdl-layout__header">
    <div class="mdl-layout__header-row">
      <div class="mdl-layout-spacer"></div>

    </div>
  </header>
  <div class="mdl-layout__drawer">
   
    <nav class="mdl-navigation">
      <!-- <a class="mdl-navigation__link" href="">Link</a> -->
			<button  class="mdl-button mdl-js-button" 
				on:click="{() => showModalImport = true}">
				Importer des données
			</button>

			<h4>Geocoder</h4>
			
			<button  class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored mdl-js-ripple-effect btnGeocode"
				on:click="{ () => geocodeAll('ign', $scoreMax, 200) }">
				IGN
			</button>
			<button class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored mdl-js-ripple-effect btnGeocode"
			 on:click="{ () => geocodeAll('ban', $scoreMax, 200) }">
				BAN
			</button>
				<button  class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored mdl-js-ripple-effect btnGeocode"
				on:click="{ () => geocodeAll('bing', $scoreMax, 400) }">
				Bing
			</button>
				<button class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored mdl-js-ripple-effect btnGeocode" 
				on:click="{ () => geocodeAll('google', $scoreMax, 500) }">
				Google
			</button>

			<button   class="mdl-button mdl-js-button"
			on:click="{() => showModalSettings = true}">
				Settings
			</button>

				<button   class="mdl-button mdl-js-button"
			on:click="{() => showExport = true}">
				Exporter
			</button>
		
    </nav>
  </div>
  <main class="mdl-layout__content" style="height: 100%;" >
    <div class="page-content" style="height: 100%;">

<div class="mapContenair">
  <Map on:domMapRady={mapIsReady}/>	
</div>

<div id="data">
<table class="mdl-data-table  mdl-shadow--2dp" >
  <thead>
    <tr>
			<th>Score</th>
      
		
			<th>Service</th>
			<th>Geocoder</th>
			<th> Adresse</th>
			<th> Attributs </th>

    </tr>
  </thead>
  <tbody>
  {#each $data as d}
    <tr on:click={ (e) => zoomToMarker.next(d) }>
			<td>{d.score || ''}</td>
			<td>{d.geocoder || ''}</td>
			<td>
				<button  on:click={ (e) => geocodeRow(d, 'ban') }> BAN</button>
				<button  on:click={ (e) => geocodeRow(d, 'bing') }> Bing</button>
				<button  on:click={ (e) => geocodeRow(d, 'google') }> Google</button>
				<button  on:click={ (e) => geocodeRow(d, 'mapbox') }> MapBox</button>
				<button  on:click={ (e) => geocodeRow(d, 'ign') }> IGN</button>
			</td>

			<td>{`${d.num} ${d.adresse}, ${d.commune} ${d.cp}, ${d.pays}`}</td>

			<td>{JSON.stringify(d.input)}</td>
    </tr>
	{/each}
    
  </tbody>
</table>



</div>





			</div>
  </main>
</div>






