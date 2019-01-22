import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { File } from '@ionic-native/file';
import { SignaturePadModule } from 'angular2-signaturepad';

import { MyApp } from './app.component';
import { ShareProvider } from '../providers/share/share';
import {ComponentsModule} from "../components/components.module";
import {CommonModule} from "@angular/common";
import {CameraPreview} from "../../myPlugin/ionic-native_camera-preview/index";
import { FileTransfer} from '@ionic-native/file-transfer';

@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    BrowserModule,
    ComponentsModule,
    CommonModule,
    SignaturePadModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    StatusBar,
    SplashScreen,
    File,
    CameraPreview,
    FileTransfer,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    ShareProvider
  ]
})
export class AppModule {}
