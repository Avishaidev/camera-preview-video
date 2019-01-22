import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CameraPreviewPage } from './camera-preview';
import {ComponentsModule} from "../../components/components.module";
import {SignaturePadModule} from "angular2-signaturepad";

@NgModule({
  declarations: [
    CameraPreviewPage,
  ],
  imports: [
    IonicPageModule.forChild(CameraPreviewPage),
    ComponentsModule,
    SignaturePadModule
  ],
})
export class CameraPreviewPageModule {}
