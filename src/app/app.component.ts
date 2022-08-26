import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

import { Observable } from 'rxjs';
import { Page, Acr } from './data/page-data';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  showspiner = false;
  title = 'copa';
  listaAcr: Acr[] = [];
  listaOrder: string[] = [];
  listaAlfa: string[] = [];
  lista: Observable<any[]>;
  total : number = 0;
  uniq : number = 0;
  dups : number = 0;

  constructor(private firestore: AngularFirestore) {
    this.lista = firestore.collection('copa', ref => ref.orderBy('order')).valueChanges();
    firestore.collection("copa").get().forEach((querySnapshot) => {
      querySnapshot.forEach((doc) => {
          //console.log(`${doc.id} => ${doc.data()}`);
          let data : Page = doc.data() as Page;
          let stickerAcr = this.getAcr(data);
          let orderAcr = stickerAcr;
          if (stickerAcr == '000') {stickerAcr = '000'; orderAcr = '000'}
          else if (data.stickers[0] == 'FWC 8') { stickerAcr = 'fwc8-18'; orderAcr = '001'}
          else if (stickerAcr == 'FWC') { stickerAcr = 'fwc19-29'; orderAcr = 'zz1' }
          else if (stickerAcr == 'C') { stickerAcr = 'Coca'; orderAcr = 'zz2';}
          let pagetotal = data.stickers.length;
          let pageuniq = 0;
          let pagedups = 0;
          for (let index = 0; index < data.stickers.length; index++) {
            if (data.qtds[index] > 0) {
              pageuniq++;
              pagedups += (data.qtds[index]-1);
            }
          }
          this.total += pagetotal;
          this.uniq += pageuniq;
          this.dups += pagedups;
          if (this.listaAlfa.length == 0) this.listaAlfa.push(data.name);
          else if (data.name == 'Museu' || (data.name == 'PaginaInicial') || (data.name == 'Estadios')) console.log();
          else for (let i = 0; i < this.listaAlfa.length; i++) {
            if (data.name < this.listaAlfa[i]) {
              this.listaAlfa.splice(i, 0, data.name);
              break;
            } else if (i == this.listaAlfa.length - 1) {
              this.listaAlfa.push(data.name);
              break;
            }
          }
          if (this.listaAcr.length == 0) {
            this.listaAcr.push({ acr : stickerAcr, name : data.name, total : pagetotal, uniq : pageuniq, dups : pagedups });
            this.listaOrder.push(orderAcr);
          } else for (let i = 0; i < this.listaAcr.length; i++) {
            if (orderAcr < this.listaOrder[i]) {
              this.listaAcr.splice(i, 0, { acr : stickerAcr, name : data.name, total : pagetotal, uniq : pageuniq, dups : pagedups });
              this.listaOrder.splice(i, 0, orderAcr);
              break;
            } else if (i == this.listaAcr.length - 1) {
              this.listaAcr.push({ acr : stickerAcr, name : data.name, total : pagetotal, uniq : pageuniq, dups : pagedups });
              this.listaOrder.push(orderAcr);
              break;
            }
          }
      });
    });
  }
  getQtd(sticker : string, item : Page) {
    let i = item.stickers.indexOf(sticker);
    return item.qtds[i];
  }
  inc(sticker : string, item : Page) {
    this.showspiner = true;
    let i = item.stickers.indexOf(sticker);
    item.qtds[i]++;
    let itemDoc = this.firestore.doc<Page>('copa/'+item.name);
    itemDoc.update(item);
    this.showspiner = false;
  }
  dec(sticker : string, item : Page) {
    this.showspiner = true;
    let i = item.stickers.indexOf(sticker);
    if (item.qtds[i] > 0) {
      item.qtds[i]--;
      let itemDoc = this.firestore.doc<Page>('copa/'+item.name);
      itemDoc.update(item);
    }
    this.showspiner = false;
  }
  showvars(item : any) {
    console.log(JSON.stringify(item));
    return "";
  }
  getAcr(item : Page) {
    let a = item.stickers[0];
    let a1 = a.split(' ');
    return a1[0];
  }
  topFunction() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
  }
  getPageDesc(page: Page) {
    for (let i = 0; i < this.listaAcr.length; i++) {
      let acrItem = this.listaAcr[i];
      if (acrItem.name == page.name) {
        return page.name + ' - tem: ' + acrItem.uniq + ' - rep: ' + acrItem.dups;
      }
    };
    return page.name;
  }
}
