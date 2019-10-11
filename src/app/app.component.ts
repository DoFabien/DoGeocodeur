import { Component, Inject } from '@angular/core';
import { MapService } from './services/map.service';
import { MatDialog } from '@angular/material/dialog';
import { ImportDataComponent } from './components/import-data/import-data.component';
import { GeocoderService } from './services/geocoder.service';
import { ExportComponent } from './components/export/export.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ConfigService } from './services/config.service';
import { DetailComponent } from './components/detail/detail.component';
import { ResizeEvent } from 'angular-resizable-element';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(
    @Inject(DOCUMENT) document,
    public mapService: MapService,
    public dialog: MatDialog,
    public geocoderService: GeocoderService,
    public configService: ConfigService) {

  }

  actionDivIsHidden = false;

  ngAfterViewInit(): void {
    this.mapService.initMap('map');

    this.mapService.selectedId.subscribe( id => {
      this.mapSelectedId(id)
    })

  }

  onResizeEnd(event: ResizeEvent): void {
    // // console.log('Element was resized', event);
  }

  geocodeAll(service, scoreMax, delay){
    this.geocoderService.geocodeAll(service, scoreMax, delay)
      .then( e => {
        this.geocoderService.isGeocoding = false;
      })
  }
  

  openImportDataDialog(): void {
    const dialogRef = this.dialog.open(ImportDataComponent, {
      width: '80%',
      height: '80%'

    });

    dialogRef.afterClosed().subscribe(jsonData => {
      if (jsonData){
        this.mapService.resetMap()
        this.geocoderService.data = jsonData;
      }
 

    });
  }

  openExportDialog(): void {
    const dialogRef = this.dialog.open(ExportComponent, {
      width: '80%',
      height: '80%'

    });

  }

  openSEttingsDialog(): void {
    const dialogRef = this.dialog.open(SettingsComponent, {
      width: '80%',
      height: '80%',

    });

  }

  openDetailDialog(data):void{
    const dialogRef = this.dialog.open(DetailComponent, {
      width: '80%',
      height: '80%',
      data: data
    });
  }


  mapSelectedId(id):void{
    const elId = `el${id}`
    const element = document.getElementById(elId);
    element.scrollIntoView();

  }

  toggleActionDiv(){
    this.actionDivIsHidden = !this.actionDivIsHidden;
    setTimeout(
      ()=> {
        this.mapService.map.invalidateSize()
      }
      ,  30);
  }



}
