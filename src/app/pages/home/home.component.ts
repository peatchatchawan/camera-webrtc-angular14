import { WebrtcService } from './../../services/webrtc.service';
import { CameraComponent } from './../camera/camera.component';
import { AngularDeviceInformationService } from 'angular-device-information';
import { NativeService } from './../../services/native.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import CameraInfo from 'src/app/services/model/cameraInfo';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  @ViewChild('video') video: ElementRef<HTMLVideoElement>;
  statePermission: boolean;
  stateCamera: boolean = false;
  requestMsg: string;

  os: string;
  version: any;
  browser: any;
  browserVersion: any;
  userAgent: any;
  cpuCores: any;
  memory: any;

  ratio: string[];
  cameras: CameraInfo[] = [];

  constructor(
    private nativeService: NativeService,
    private webrtcService: WebrtcService,
    private modalController: ModalController,
    private deviceInformationService: AngularDeviceInformationService
  ) { }

  ngOnInit(): void {
    this.getDeviceInformation();
    this.CheckPermissions();
  }

  async getDeviceInformation(): Promise<void> {
    this.os = await this.deviceInformationService.getDeviceInfo().os;
    this.version = await this.deviceInformationService.getDeviceInfo().osVersion;
    this.browser = await this.deviceInformationService.getDeviceInfo().browser;
    this.browserVersion = await this.deviceInformationService.getDeviceInfo().browserVersion;
    this.userAgent = await this.deviceInformationService.getDeviceInfo().userAgent;
    this.cpuCores = navigator.hardwareConcurrency;
    this.memory = (navigator as any).deviceMemory;
  }

  CheckPermissions() {
    try {
      navigator.permissions.query(Object.assign({ name: 'camera' })).then(result => {
        if (result.state === 'granted') {
          this.requestMsg = 'อนุญาตแล้ว';
          this.statePermission = true;
        } else if (result.state === 'prompt') {
          this.requestMsg = 'พร้อมรับสิทธิ์';
        } else if (result.state === 'denied') {
          this.requestMsg = 'โปรดรีเซ็ตการตั้งค่าและขออนุญาติอีกครั้ง';
          this.statePermission = false;
        }
      });
    } catch (error) {
      console.error(error);
    }
  }

  requestPermissions(): void {
    this.nativeService.presentLoadingWithOutTime('กำลังขออนุญาต...');
    navigator.mediaDevices.getUserMedia({ video: true }).then(async (stream) => {
      if (stream) {
        this.requestMsg = 'อนุญาตแล้ว';
        this.statePermission = true;
      }
      await this.nativeService.dismissLoading();
    }).catch(async (err) => {
      console.log(err);
      this.requestMsg = 'การอนุญาตถูกปฏิเสธ โปรดรีเซ็ตการตั้งค่าและขออนุญาติอีกครั้ง';
      this.statePermission = false;
      setTimeout(async () => {
        this.nativeService.dismissLoading();
      }, 500);
    });
  }

  requestFilter() {
    this.nativeService.presentLoadingWithOutTime('กำลังฟิลเตอร์อุปกรณ์...');
    navigator.mediaDevices.getUserMedia({ video: true }).then(async (stream) => {
      this.webrtcService.stream = stream;
      this.video.nativeElement.srcObject = this.webrtcService.stream;
      this.video.nativeElement.onloadeddata = async () => {
        this.video.nativeElement.play();
        const { videoWidth, videoHeight } = this.video.nativeElement;
        const aspectRatio = videoWidth / videoHeight;
        console.log(aspectRatio);
        if (aspectRatio === 4 / 3 || aspectRatio === 16 / 9) {
          this.webrtcService.ratio = ['4:3', '16:9'];
          this.ratio = ['4:3', '16:9'];
        } else if (aspectRatio === 3 / 4 || aspectRatio === 9 / 16) {
          this.webrtcService.ratio = ['3:4', '9:16'];
          this.ratio = ['4:3', '16:9'];
        } else {
          this.webrtcService.ratio = [];
          this.ratio = [];
        }
      };
      await this.webrtcService.initializeCamera().then(() => {
        this.cameras = this.webrtcService.cameras;
        this.stateCamera = true;
      });
      await this.nativeService.dismissLoading();
    }).catch(async (err) => {
      console.error(err);
      setTimeout(async () => {
        this.nativeService.dismissLoading();
      }, 500);
    });
  }

  async openModal() {
    const modal = await this.modalController.create({
      component: CameraComponent,
    });
    await modal.present();
  }
}
