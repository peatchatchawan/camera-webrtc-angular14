import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IonicModule } from '@ionic/angular';
import { HomeComponent } from './pages/home/home.component';
import { NativeService } from './services/native.service';
import { AngularDeviceInformationService } from 'angular-device-information';
import { CameraComponent } from './pages/camera/camera.component';
import { WebrtcService } from './services/webrtc.service';
import { CommonModule } from '@angular/common';
import { ImageComponent } from './pages/image/image.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    CameraComponent,
    ImageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    FormsModule,
    IonicModule.forRoot()
  ],
  providers: [NativeService, WebrtcService, AngularDeviceInformationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
