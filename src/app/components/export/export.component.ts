import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GeocoderService } from 'src/app/services/geocoder.service';
import fileSaver from "file-saver";
import tokml from "tokml";

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss']
})
export class ExportComponent implements OnInit {

  dataGeocoded

  constructor(public dialogRef: MatDialogRef<ExportComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public geocoderService: GeocoderService) { }

  ngOnInit() {
    if (this.geocoderService.data){
      this.dataGeocoded = this.geocoderService.data.filter(d => d.coords)
    }
  }


  toGeojson() {
    const features = [];
    for (let i = 0; i < this.dataGeocoded.length; i++) {
      const d = this.dataGeocoded[i];
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

 

  exportToGeojson(){
    const geojson = this.toGeojson();
    // // console.log(geojson);
    const blob = new Blob([JSON.stringify(geojson)], {
      type: "text/plain;charset=utf-8"
    });
    let date = new Date().toISOString().split('T')[0]
    fileSaver.saveAs(blob, `Dogeocodeur_${this.dataGeocoded.length}_${date}.geojson`);
  };

  exportToKML() {
    
    const geojson = this.toGeojson();
    const kml = tokml(geojson);
    const blob = new Blob([kml], { type: "text/plain;charset=utf-8" });
    let date = new Date().toISOString().split('T')[0]
    fileSaver.saveAs(blob, `Dogeocodeur_${this.dataGeocoded.length}_${date}.kml`);
  };

  exportToCSV() {
    const header = Object.keys( this.dataGeocoded[0].input );
    header.push('_score','_service', '_lng', '_lat')
    let csvData = []
    csvData.push(header.join(';'))
    const features = [];
    for (let i = 0; i < this.dataGeocoded.length; i++) {
      const d = this.dataGeocoded[i];
      let currentRow = []
      for (let key in d.input){
        currentRow.push(d.input[key].replace('"','""') )
      }
      currentRow.push(d._score, d.geocoder, d.coords.lng, d.coords.lat );
      csvData.push(currentRow.join(';'))
    }
    const csv = csvData.join('\r')

    const blob = new Blob([csv], { type: "text/plain;charset=utf-8" });
    let date = new Date().toISOString().split('T')[0]
    fileSaver.saveAs(blob, `Dogeocodeur_${this.dataGeocoded.length}_${date}.csv`);
  };

}
