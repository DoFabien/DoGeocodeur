import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfigService } from 'src/app/services/config.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  keys = {
    "ign": null,
    "google": null,
    "bing": null,
    "mapbox": null
  };
  scoreMax

  constructor(public dialogRef: MatDialogRef<SettingsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public configService: ConfigService) { }

  ngOnInit() {
    const userKeys = {...this.configService.userKeys};
    if (userKeys){
      this.keys = userKeys
    }

    this.scoreMax = this.configService.scoreMax;

    const sub = this.dialogRef.beforeClosed().subscribe(e => {
      sub.unsubscribe();
      this.save()
    })

  }

  scoreMaxChange(e) {
    this.scoreMax = e.value
  }

  keyChange(newValue, keyId) {
    this.keys[keyId] = newValue;

  }

  save() {
    this.configService.userKeys = this.keys;
    this.configService.saveUserKeys();
    this.configService.scoreMax = this.scoreMax;
    this.dialogRef.close();
  }



}
