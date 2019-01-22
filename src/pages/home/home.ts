import { Component } from '@angular/core';
import {ModalController, IonicPage} from "ionic-angular";

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(private modalCtrl:ModalController) {

  }

  showPreviewCamera() {
    const params:any = {

    };

    let modal = this.modalCtrl.create('CameraPreviewPage', {params: params});

    modal.onDidDismiss((data:any) => {
      console.log('data: ', data);
    });

    modal.present();
  }
}
