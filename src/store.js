import { writable } from 'svelte/store';
import { Subject } from 'rxjs';

export const data = writable(
    []
);

export const scoreMax = writable(93);

export const keys = writable({
    ign:null,
    bing:null,
    google:null,
    mapbox:null
});

export const subject = new Subject();
export const newCoords = new Subject()

export const markerClicked = new Subject();
export const markerDragedEnd = new Subject();
export const zoomToMarker = new Subject();