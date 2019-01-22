import { NgModule } from '@angular/core';
import { ColorPickerComponent } from './color-picker/color-picker';
import {IonicModule} from "ionic-angular";
@NgModule({
	declarations: [ColorPickerComponent],
	imports: [
    IonicModule
  ],
	exports: [ColorPickerComponent]
})
export class ComponentsModule {}
