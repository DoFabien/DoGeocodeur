<script>
  import { createEventDispatcher } from "svelte";
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { data } from "./store.js";

  import dragDrop from "drag-drop";

  let rawDataStr;
  let header;
  let rawData;
  let mapingFields = []; // num,  rue, commune, cp
  const labelMapingFields = ["numéro", "rue", "commune", "cp"]; // num,  rue, commune, cp
  let stepMaping = 0;
  let nav;
  let copyPastText = null;

  onMount(() => {
    fileimport.addEventListener("change", e => {
      console.log(e.target.files[0]);
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = function() {
        console.log(reader.result);
        rawDataStr = reader.result;
        importRawData(rawDataStr);
      };
    });

    nav = navigator;
    dragDrop(".modal", {
      onDrop: function(files, pos, fileList, directories) {
        const file = files[0];
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function() {
          console.log(reader.result);
          rawDataStr = reader.result;
          importRawData(rawDataStr);
        };
      },
      onDragEnter: e => {
        console.log(e);
      },
      onDragOver: e => {
        console.log(e);
      },
      onDragLeave: e => {
        console.log(e);
      }
    });
  });

  const dispatch = createEventDispatcher();

  const fromClipBoard = async () => {
    const text = await nav.clipboard.readText();
    rawDataStr = text;
    importRawData(rawDataStr);
  };

  const fromCopyPast = e => {
    rawDataStr = document.getElementById("copyPastTextArea").value;
    importRawData(rawDataStr);
  };

  const resetSelectType = e => {
    mapingFields = [];
    stepMaping = 0;
  };

  const findSeparatorFromRow = row => {
    var separateur = ";";
    if (row.split(",").length > row.split(";").length) {
      separateur = ",";
    }
    if (row.split(/\t/).length > row.split(",").length) {
      separateur = "\t";
    }
    return separateur;
  };

  const importRawData = rawDataStr => {
    var rows = rawDataStr.split("\n");
    const sep = findSeparatorFromRow(rows[0]);
    header = rows[0].split(sep).map(el => el.trim());
    let data = [];
    console.log("separator", sep);
    console.log(header);
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i].split(sep).map(el => el.trim());
      data.push(row);
    }

    rawData = data;
    console.log(rawData);
  };

  const selectCol = index => {
    mapingFields[stepMaping] = index;
    stepMaping = stepMaping + 1;
    if (stepMaping >= labelMapingFields.length) {
      stepMaping = -1;
      toJsonFormat();
    }
    console.log(index);
  };

  const toJsonFormat = () => {
    const result = [];
    let id = 0;
    for (let row of rawData) {
      const jsonRaw = {};
      for (let i = 0; i < row.length; i++) {
        const d = row[i];
        const name = header[i];
        jsonRaw[name] = d;
      }

      let formatedRow = {
        id: id,
        input: jsonRaw,
        num: row[mapingFields[0]] || '',
        adresse:  row[mapingFields[1]] || '',
        commune: row[mapingFields[2]] || '',
        cp: row[mapingFields[3]] || '',
        pays: "France",
        coords: undefined,
        score: undefined
      };
      id++;
      result.push(formatedRow);
    }

    return result;
  };

  const submit = () => {
    data.set(toJsonFormat());
    dispatch("close");
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

  .row {
    display: flex;
  }

  .column {
    flex: 50%;
  }

  .textexplication {
    display: block;
    padding: 5px;
    padding-bottom: 10px;
  }

  .textSelectDataType {
    font-size: 2em;
    margin-top: 10px;
    margin-bottom: 5px;
  }

  th, td{
        text-align: left
  }
  td, thead{
    cursor: pointer;
  }
</style>

<div
  class="modal-background"
  on:click={() => dispatch('close')}
  transition:fade={{ duration: 200 }} />

<div class="modal " transition:fly={{ y: -400, duration: 200 }}>
  <header class="mdl-layout__header">
    <div class="mdl-layout__header-row">
      <span class="mdl-layout-title">Importer des données à géocoder</span>
    </div>
  </header>

  <span class="textexplication">
    Vous pouvez glisser-déposer le csv dans cette fenetre, utiliser le selecteur
    de fichier ou utiliser le text copié depuis un fichier xls par exemple
  </span>

  <div id="importDiv" class="row">
    <div id="dragNdrop" class="column">
      <label for="fileimport">Séléctionnez un CSV ou déposez le ici :</label>
      <input type="file" id="fileimport" />
    </div>

    <div id="copyPast" class="column">
      {#if nav && nav.clipboard}
        <button
          class="mdl-button mdl-js-button mdl-button--raised
          mdl-js-ripple-effect "
          on:click={fromClipBoard}>
          Depuis le presse-papier
        </button>
      {:else}

        <div>
        Vous pouvez coller vos donnez ici !
        </div>
        
        <textarea id="copyPastTextArea" />

        <button
          class="mdl-button mdl-js-button mdl-button--raised
          mdl-js-ripple-effect "
          on:click={fromCopyPast}>
          Importer ces données
        </button>
      {/if}

    </div>

  </div>

  {#if header}
    {#if stepMaping !== -1}
      <div class="textSelectDataType">
        Selectionner la colonne correspondant :
        <b style="color:red"> {labelMapingFields[stepMaping]} </b>

          <button
          class="mdl-button mdl-js-button mdl-button--raised
          mdl-js-ripple-effect "
          style="display: inline;"
          on:click={() => selectCol(null) }>
          Ignorer
        </button>
      </div>
       
    {/if}

    <table class="mdl-data-table mdl-shadow--2dp">
      <thead>
        <tr>
          {#each header as h, i}
            <th on:click={() => selectCol(i)}>
               {h}
              {#if mapingFields.indexOf(i) !== -1}
                <span style="color:red;">
                   {labelMapingFields[mapingFields.indexOf(i)]}
                </span>
              {/if}
            </th>
          {/each}

        </tr>
      </thead>
      <tbody>
        {#each rawData as row, irow}
        {#if irow <= 5 }
          <tr>
            {#each row as c, i}
              <td on:click={() => selectCol(i)}>{c}</td>
            {/each}
          </tr>
          {/if}
        {/each}

      </tbody>
    </table>
  {/if}

{#if mapingFields.length > 0}
  <button
    class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect "
    on:click={resetSelectType}>
    Reinitialiser
  </button>
{/if}

  <button
    class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect
    mdl-button--accent"
    on:click={submit}>
    Valider
  </button>

  <button
    class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect
    mdl-button--accent"
    on:click={() => dispatch('close')}>
    close modal
  </button>
</div>
