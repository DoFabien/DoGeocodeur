import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { ConfigService } from 'src/app/services/config.service';
import { NgxFileDropEntry, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';

@Component({
  selector: 'app-import-data',
  templateUrl: './import-data.component.html',
  styleUrls: ['./import-data.component.scss']
})
export class ImportDataComponent implements OnInit {
  @ViewChild('stepper', { static: true }) private myStepper: MatStepper

  rawData;
  splitedData
  mapingFields = []; // num,  rue, commune, cp
  labelMapingFields = ["numéro", "rue", "commune", "cp"]; // num,  rue, commune, cp
  stepMaping = 0;

  clipboarEnable = true

  public files: NgxFileDropEntry[] = [];

  constructor(
    public dialogRef: MatDialogRef<ImportDataComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public configService: ConfigService) { }

  async ngOnInit() {
    if (navigator.clipboard.readText){
      this.clipboarEnable = true;
      
    } else {
      this.clipboarEnable = false;
    
    }


  }

  public dropped(files: NgxFileDropEntry[]) {
    this.files = files;
    for (const droppedFile of files) {
 
      // Is it a file?
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          // Here you can access the real file
          const reader = new FileReader();

          reader.onload = (e: any) => {
            this.rawData = e.target.result;
            this.splitedData = this.splitData(this.rawData)
            this.myStepper.next();
          };
    
          reader.readAsText(file);
        });
      } 
    }
  }
 
  public fileOver(event){
    // // console.log(event);
  }
 
  public fileLeave(event){
    // // console.log(event);
  }


  onFileSelected() {
    const inputNode: any = document.querySelector('#file');

    if (typeof (FileReader) !== 'undefined') {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.rawData = e.target.result;
        this.splitedData = this.splitData(this.rawData)
        this.myStepper.next();
      };

      reader.readAsText(inputNode.files[0]);
    }
  }

  async fromClipBoard() {
    const text = await navigator.clipboard.readText();
    this.rawData = text;

    this.splitedData = this.splitData(this.rawData)
    // console.log(this.splitedData)
    this.myStepper.next();

  };


  findSeparatorFromRow(row) {
    let separateur = ";";
    if (row.split(",").length > row.split(";").length) {
      separateur = ",";
    }
    if (row.split(/\t/).length > row.split(",").length) {
      separateur = "\t";
    }
    return separateur;
  };

  splitData(rawDataStr, separator = null) {
    this.resetMapingField()
    const rows = rawDataStr.split("\n");

    const sep = (!separator || separator == '') ? this.findSeparatorFromRow(rows[0]) : separator;
    let header = rows[0].split(sep).map(el => el.trim());
    let data = [];
    // console.log("separator", sep);
    // console.log(header);
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i].split(sep).map(el => el.trim());
      data.push(row);
    }

    return { header: header, data: data };
  };


  toJsonFormat() {
    const result = [];
    let id = 0;
    for (let row of this.splitedData.data) {
      const jsonRaw = {};
      for (let i = 0; i < row.length; i++) {
        const d = row[i];
        const name = this.splitedData.header[i];
        jsonRaw[name] = d;
      }

      let formatedRow = {
        id: id,
        input: jsonRaw,
        num: row[this.mapingFields[0]] || '',
        adresse: row[this.mapingFields[1]] || '',
        commune: row[this.mapingFields[2]] || '',
        cp: row[this.mapingFields[3]] || '',
        pays: "France",
        coords: undefined,
        score: undefined
      };
      id++;
      result.push(formatedRow);
    }

    return result;
  };


  selectCol(index) {
    // console.log(index);
    this.mapingFields.push(index);
    this.stepMaping++

    if (this.stepMaping === this.labelMapingFields.length) {

      let json = this.toJsonFormat();
      //reset ?
      this.close(json)
    }
  }

  resetMapingField() {
    this.mapingFields = [];
    this.stepMaping = 0;
  }

  close(data = null) {
    this.dialogRef.close(data)
  }


}
