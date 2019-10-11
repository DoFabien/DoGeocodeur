import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  defaultKeys = {
    ign: 'hv3tzig6301xdwffd4ds92g4',
    bing: 'ApGNBLFopxSDAUAGO6L8uf6Cj9m-E25CS1OLbVxatLrFVLU89ISYatcs_qPSLrHY',
    google: 'AIzaSyCRu8pjG5diwFHKXcaMxxIM2jILJdnOKwI',
    mapbox: 'pk.eyJ1IjoiZG9mIiwiYSI6IlZvQ3VNbXcifQ.8_mV5dw1jVkC9luc6kjTsA'
  }

  userKeys = {
    ign: null,
    bing: null,
    google: null,
    mapbox: null
  }

  scoreMax = 93;

  constructor() { 
    this.restorUserKey()
  }

  ngOnInit(): void {
    
    
  }

  getKey(service){
    if (this.userKeys && this.userKeys[service] && this.userKeys[service].trim().length > 3){
      return this.userKeys[service].trim();
    } else {
      return this.defaultKeys[service];
    }
  }

  saveUserKeys(){
    localStorage.setItem('geocoderKeys', JSON.stringify(this.userKeys))
  }

  restorUserKey(){
   let keys =  localStorage.getItem('geocoderKeys');
   // console.log(keys);
   this.userKeys = JSON.parse(keys);
  }

}
