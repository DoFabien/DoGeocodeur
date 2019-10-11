import { Component, OnInit, Inject } from '@angular/core';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfigService } from 'src/app/services/config.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<DetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public configService: ConfigService) { }

  ngOnInit() {

    // // console.log(this.data)
  }

}
