import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import {MatListModule} from '@angular/material/list';

import { MatStepperModule } from '@angular/material/stepper';
import { HttpClientModule } from '@angular/common/http';
import { MatInputModule } from '@angular/material/input';

import { ImportDataComponent } from './components/import-data/import-data.component';
import { ExportComponent } from './components/export/export.component';
import { SettingsComponent } from './components/settings/settings.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatSliderModule} from '@angular/material/slider';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { DetailComponent } from './components/detail/detail.component';
import { KeysPipe } from './pipes/keysPipe';
import { NgxFileDropModule } from 'ngx-file-drop';
import { ResizableModule } from 'angular-resizable-element';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    ImportDataComponent,
    ExportComponent,
    SettingsComponent,
    DetailComponent,
    KeysPipe
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatButtonModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatIconModule,
    MatDialogModule,
    MatStepperModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatSliderModule,
    MatProgressSpinnerModule,
    MatListModule,
    NgxFileDropModule,
    ResizableModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })


  ],
  entryComponents: [
    ImportDataComponent,
    ExportComponent,
    SettingsComponent,
    DetailComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
