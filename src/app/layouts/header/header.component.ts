import {ApplicationRef, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {DataService} from '../../services/data.service';
import {BarcodeScanner} from '@awesome-cordova-plugins/barcode-scanner/ngx';
import {Ndef, NFC} from "@awesome-cordova-plugins/nfc/ngx";
import {tick} from "@angular/core/testing";
import {error} from "protractor";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss', '../../app.component.scss'],
})
export class HeaderComponent implements OnInit {
  constructor(
    private dataService: DataService,
    private barcodeScanner: BarcodeScanner,
    private nfc: NFC,
    private ndef: Ndef,
    private ref: ChangeDetectorRef,
    private appRef: ApplicationRef
  ) { }

ngOnInit() {
}
  readQr() {
    this.barcodeScanner.scan().then(barcodeData => {
      this.dataService.clearNfcList();
      // console.log('Barcode data', barcodeData);
      const qrArray = barcodeData.text.split('|');
      console.log(qrArray.length, "qrarray")
      if (qrArray.length === 3){
        this.dataService.qrCode = barcodeData.text;
        this.dataService.tokenId = parseInt(qrArray[1], 10);
        this.dataService.difference = (parseInt(qrArray[2], 10) - parseInt(qrArray[1], 10))+1;
        this.dataService.to = parseInt(qrArray[2], 10);
      }else { alert('Unsupported QR code'); }

    }).catch(err => {
      console.log('Error', err);
    });
  }

  readNFC() {
    this.dataService.nfcId = '';
    this.dataService.readingNfc = true;
    const flags = this.nfc.FLAG_READER_NFC_A | this.nfc.FLAG_READER_NFC_V;

    this.nfc.readerMode(flags).subscribe(
      async (tag) => {
        if (this.dataService.readingNfc) {
          this.dataService.nfcId = this.nfc.bytesToHexString(tag.id).match(/.{2}/g).join(':').toUpperCase();
          this.dataService.nfcArray$.next([...this.dataService.nfcArray$.getValue(), this.dataService.nfcId.toUpperCase()])
          this.dataService.readingNfc = false;

          this.appRef.tick()
        }
      },
      err => console.log('Error reading tag', err)
    );
  }
}

