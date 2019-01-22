import {Component, ViewChild} from '@angular/core';
import {IonicPage, NavParams, ViewController} from 'ionic-angular';
import {CameraPreview} from "../../../myPlugin/ionic-native_camera-preview/index";
import {DomSanitizer} from "@angular/platform-browser";
import {File} from '@ionic-native/file';
import {Platform} from "ionic-angular";
import {StatusBar} from "@ionic-native/status-bar";
import {ShareProvider} from "../../providers/share/share";
import {SignaturePad} from "angular2-signaturepad/signature-pad";
import { FileTransfer} from '@ionic-native/file-transfer';

@IonicPage()
@Component({
  selector: 'page-camera-preview',
  templateUrl: 'camera-preview.html',
})
export class CameraPreviewPage {
  @ViewChild(SignaturePad) signaturePad: SignaturePad;
  @ViewChild('previewVideo') previewVideo: any;
  params: any = {};
  flashMode: string = 'off';
  switchCameraOn: boolean = false;
  cameraDirection: string = 'front';
  signature: string = '';
  signaturePadOptions: any;
  drawsData: any = [''];
  isDrawing: boolean = false;
  allowDraw: boolean = true;
  showPicker: boolean = false;
  showPenSize: boolean = false;
  penWidth: number = 2;
  color: string = '#000000';
  recordingVideo: boolean = false;
  setupVideo: boolean = false;
  recordTimer: number = 16;
  recordTimerInterval: any;
  mediaType: string = 'image';
  previewFile: any;
  permissionsToRequest: any = [];
  cameraStarted: boolean = false;
  takePictureOptions:any = {};
  recordAudio:boolean = true;
  videoHasData:boolean = false;

  constructor(private platform: Platform, public navParams: NavParams, private viewCtrl: ViewController, private statusBar: StatusBar,
              private domSanitizer: DomSanitizer, private file: File, private cameraPreview: CameraPreview,
              public sharedProvider: ShareProvider, private transfer: FileTransfer) {
    this.params = this.navParams.get('params');

    if (this.params.initMediaType) {
      this.mediaType = this.params.initMediaType;
    }

    this.signaturePadOptions = {
      'minWidth': this.penWidth,
      'canvasWidth': this.platform.width(),
      'canvasHeight': this.platform.height(),
      'penColor': this.color
    };
  }

  ngAfterViewInit() {
    this.resetPad();
    this.allowDraw = false;
    this.signaturePad.off();

    this.platform.ready().then(() => {
      this.statusBar.hide();
      this.sharedProvider.isCameraOn = true;
      this.setBackButtonToCloseModal();
      this.openCamera(true);
    });
  }

  resetPad() {
    this.clearPad();
    this.setPadColor('#FFFFFF');
  }

  clearPad() {
    this.signaturePad.clear();
  }

  setPadColor(selectedColor) {
    this.color = selectedColor;
    this.signaturePad.set('penColor', selectedColor);
  }

  penWidthChange(e) {
    this.penWidth = e.value;
    this.setPenWidth(e.value);
  }

  undo() {
    if (this.drawsData.length > 2) {
      this.drawsData.pop();
      let prevData = this.drawsData[this.drawsData.length - 1];
      this.signaturePad.clear();
      this.signaturePad.fromDataURL(prevData);
    } else {
      this.drawsData = [''];
      this.signaturePad.clear();
    }
  }

  setPenWidth(size) {
    this.signaturePad.set('minWidth', size);
  }

  drawComplete() {
    this.isDrawing = false;
    this.drawsData.push(this.signaturePad.toDataURL('image/png', 1.0));
  }

  drawStart() {
    this.showPicker = false;
    this.showPenSize = false;
    this.isDrawing = true;
  }

  openCamera(isInit:boolean = false) {
    this.sharedProvider.isCameraOn = true;
    let options = {
      x: 0,
      y: 0,
      width: this.platform.width(),
      height: this.platform.height() + 25,
      camera: this.cameraDirection == 'front' ? this.cameraPreview.CAMERA_DIRECTION.FRONT : this.cameraPreview.CAMERA_DIRECTION.BACK,
      toBack: true,
      tapPhoto: false,
      tapFocus: true,
      previewDrag: false,
      disableExifHeaderStripping: false,
    };
    this.takePictureOptions = {
      width: options.width * 2,
      height: options.height * 2,
      quality: 100
    };
    this.signaturePadOptions = {
      minWidth: this.penWidth,
      canvasWidth: options.width,
      canvasHeight: options.height,
      penColor: this.color
    };

    this.cameraPreview.startCamera(options).then(() => {
      this.cameraStarted = true;
      if (!isInit && this.cameraDirection == 'back') {
        this.cameraPreview.setFlashMode(this.flashMode);
      }
    }, (err) => {
      if (err == 'Camera already started') {
        this.cameraStarted = true;
        this.cameraPreview.show();
      }
    });
  }

  switchCamera() {
    this.switchCameraOn = !this.switchCameraOn;
    this.cameraPreview.switchCamera();
    this.cameraDirection = this.cameraDirection == 'back' ? 'front' : 'back';

    if (this.cameraDirection == 'back') {
      this.cameraPreview.setFlashMode(this.flashMode);
    }
  }

  changeFlashMode() {
    const flashMode = this.flashMode == 'off' ? 'on' : 'off';

    this.cameraPreview.setFlashMode(flashMode).then((res) => {
      this.flashMode = flashMode;
      console.log('flashmode res: ', res);
    }, (err) => {
      console.log('flashmode err: ', err);
    });
  }

  setBackButtonToCloseModal() {
    this.platform.registerBackButtonAction(() => {
      this.closeModal();
    });
  }

  setBackButtonToCancelRecord() {
    this.platform.registerBackButtonAction(() => {
      this.cancelRecord();
    });
  }

  setBackButtonToTakeOtherPicture() {
    this.platform.registerBackButtonAction(() => {
      this.takeOtherPicture();
    });
  }

  takeOtherPicture() {
    this.allowDraw = false;
    this.videoHasData = false;
    this.setupVideo = false;
    this.signaturePad.off();
    this.cameraPreview.show();
    this.setBackButtonToCloseModal();
    this.openCamera();
  }

  toggleAllowDraw() {
    this.allowDraw = !this.allowDraw;

    if (this.allowDraw) {
      this.signaturePad.on();
    } else {
      this.signaturePad.off();
    }
  }

  setMediaType(type) {
    this.mediaType = type;
  }

  takeMedia() {
    if (this.mediaType == 'image') {
      this.takeImage();
    } else if (!this.recordingVideo) {
      this.startRecord();
    } else {
      this.stopRecord();
    }
  }

  takeImage() {
    this.cameraPreview.takePicture(this.takePictureOptions).then((base64:any) => {
      this.previewFile = this.domSanitizer.bypassSecurityTrustUrl('data:image/jpeg;base64,' + base64[0]);
      console.log('this.previewFile: ', this.previewFile)
      this.setEditMode();
    }, (err) => {
      console.log('err: ', err);
    })
  }

  startRecordTimer() {
    if (this.recordTimerInterval) {
      window.clearInterval(this.recordTimerInterval);
    }

    this.recordTimerInterval = window.setInterval(() => {
      if (this.recordTimer > 0) {
        this.recordTimer--;
      } else {
        window.clearInterval(this.recordTimerInterval);
        this.stopRecord();
      }
    }, 1000);
  }

  startRecord() {
    this.recordTimer = 15;

    this.setBackButtonToCancelRecord();
    this.backgroundVideoStart().then((res:any) => {
      console.log('backgroundVideoStart res: ', res);
      this.recordingVideo = true;
      this.startRecordTimer();
    }, (err) => {
      console.log('start err: ', err);
    })
  }

  backgroundVideoStart() {
    return new Promise((resolve, reject) => {
      let options:any = {
        cameraDirection: this.cameraDirection,
        width: this.platform.width(),
        height: this.platform.height() + 25,
        quality: 100,
        withFlash: this.flashMode == 'on'
      };

      this.cameraPreview.startRecordVideo(options).then((res:any) => {
        console.log('startRecordVideo res: ', res);
        resolve(res);
      }, (err) => {
        console.log('startRecordVideo: err ', err);
        reject(err);
      });
    })
  }

  backgroundVideoStop() {
    return new Promise((resolve, reject) => {
      this.cameraPreview.stopRecordVideo().then((res:any) => {
        console.log('stopRecordVideo res: ', res);
        resolve(res);
      }, (err) => {
        console.log('stopRecordVideo: err ', err);
        reject(err);
      });
    })
  }

  cancelRecord() {
    window.clearInterval(this.recordTimerInterval);
    this.backgroundVideoStop().then(() => {
      this.recordingVideo = false;
      this.sharedProvider.isCameraOn = true;
      this.cameraPreview.hide();
      this.cameraPreview.stopCamera().then(() => {
        this.openCamera();
      });
      this.setBackButtonToCloseModal();
    }, (err) => {
      console.log('backgroundVideoStop err: ', err);
    });
  }

  stopRecord() {
    this.setupVideo = true;
    this.videoHasData = false;
    window.clearInterval(this.recordTimerInterval);
    this.backgroundVideoStop().then((res: any) => {
      if (this.platform.is('android')) {
        this.previewFile = (<any>window).Ionic.WebView.convertFileSrc('file://' + res);
        this.videoHasData = true;
        this.setEditMode();
      } else {//ios
        let path = res.split('/');
        const fileName = path[path.length -1];
        this.file.readAsDataURL(this.file.cacheDirectory, fileName).then((base64) => {

          console.log('read success');
          let blob = this.b64toBlob(base64, 'video/mp4');
          this.saveBlobToFile(blob);
        }, (err) => {
          console.log('read err: ', err);
        })
      }

    }, (err) => {
      this.setupVideo = false;
      console.log('backgroundVideoStop err: ', err);
    });
  }

  b64toBlob(b64Data, contentType) {
    b64Data = b64Data.split(',')[1];
    contentType = contentType || '';
    const sliceSize = 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, {type: contentType});
  }

  saveBlobToFile(blob) {
    const fileName = 'tmp.mp4';

    const dirPlatform = this.platform.is('android') ? this.file.externalDataDirectory : this.file.syncedDataDirectory;

    this.file.writeFile(dirPlatform, fileName, blob, {replace: true}).then((res:any) => {
      let imagePath = res.nativeURL;
      var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
      var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
      const tmpName =  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      this.copyFileToLocalDir(correctPath, currentName, tmpName + '.mp4');
    }, err => {
      console.log('saveBlobToFile errr: ', err);
    })
  }

  copyFileToLocalDir(namePath, currentName, newFileName) {
    const dirPlatform = this.platform.is('android') ? this.file.externalDataDirectory : this.file.syncedDataDirectory;
    this.file.copyFile(namePath, currentName, dirPlatform, newFileName).then(success => {
      this.previewFile = this.domSanitizer.bypassSecurityTrustResourceUrl(this.file.externalDataDirectory + newFileName);
      this.videoHasData = true;
      this.setEditMode();
      console.log('copyFileToLocalDir success:', success);
      console.log('this.previewFile:', this.previewFile);
    }, error => {

      console.log('err:', error);
    });
  }

  videoDataLoaded() {
    console.log('loadeddata')
    this.setupVideo = false;


    setTimeout(() => {
      this.previewVideo.nativeElement.play();
    }, 100);
  }

  setEditMode() {
    this.recordingVideo = false;
    this.sharedProvider.isCameraOn = false;
    this.cameraPreview.hide();
    this.cameraPreview.stopCamera();
    this.cameraStarted = false;
    this.videoHasData = true;
    this.setupVideo = false;
    this.setBackButtonToTakeOtherPicture();
  }


  closeModal() {
    this.viewCtrl.dismiss();
    if (this.cameraStarted) {
      this.cameraPreview.hide();
      this.cameraPreview.stopCamera();
    }

    this.statusBar.show();
    this.sharedProvider.isCameraOn = false;
  }
}
