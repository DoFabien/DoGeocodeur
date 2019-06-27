<script>
  import { createEventDispatcher } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { data, scoreMax, keys } from "./store.js";

  const dispatch = createEventDispatcher();
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

  .clearIcon {
    color: red;
    cursor: pointer;
  }

  #scoreMax {
    max-width: 400px;
    display: inline-flex;
  }

  .content{
    padding: 5px;
  }
</style>

<div
  class="modal-background"
  on:click={() => dispatch('close')}
  transition:fade={{ duration: 200 }} />

<div class="modal " transition:fly={{ y: -400, duration: 200 }}>
  <header class="mdl-layout__header">
    <div class="mdl-layout__header-row">
      <span class="mdl-layout-title">Paramètres</span>
    </div>

  </header>

  <div class="content">
    <div id="scoreMax">
      <span>Score Max</span>
      <input
        class="mdl-slider mdl-js-slider"
        type="range"
        min="0"
        max="100"
        bind:value={$scoreMax}
        tabindex="0" />
      <span>{$scoreMax} </span>
    </div>

    <h4>Clés API</h4>
    <table>
      <thead>
        <tr>
          <th>Services</th>
          <th>Clé</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Google Maps</td>
          <td>
            <div class="mdl-textfield mdl-js-textfield ">
              <input class="mdl-textfield__input" bind:value={$keys.google} />
              <label class="mdl-textfield__label">Clé Google Maps</label>
            </div>
            <i
              on:click={() => ($keys.google = null)}
              class="material-icons clearIcon">
              clear
            </i>
          </td>
        </tr>

        <tr>
          <td>Bing Maps</td>
          <td>
            <div class="mdl-textfield mdl-js-textfield ">
              <input class="mdl-textfield__input" bind:value={$keys.bing} />
              <label class="mdl-textfield__label">Clé Bing Maps</label>
            </div>
            <i
              on:click={() => ($keys.bing = null)}
              class="material-icons clearIcon">
              clear
            </i>
          </td>
        </tr>

        <tr>
          <td>IGN</td>
          <td>
            <div class="mdl-textfield mdl-js-textfield ">
              <input class="mdl-textfield__input" bind:value={$keys.ign} />
              <label class="mdl-textfield__label">Clé IGN</label>
            </div>
            <i
              on:click={() => ($keys.ign = null)}
              class="material-icons clearIcon">
              clear
            </i>
          </td>
        </tr>

        <tr>
          <td>Mapbox</td>
          <td>
            <div class="mdl-textfield mdl-js-textfield ">
              <input class="mdl-textfield__input" bind:value={$keys.mapbox} />
              <label class="mdl-textfield__label">Clé Mapbox</label>
            </div>
            <i
              on:click={() => ($keys.mapbox = null)}
              class="material-icons clearIcon">
              clear
            </i>
          </td>
        </tr>
      </tbody>
    </table>

    <button
      class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect
      mdl-button--accent"
      on:click={() => dispatch('close')}>
      close modal
    </button>

  </div>

</div>
