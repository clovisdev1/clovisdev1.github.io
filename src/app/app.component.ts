import { Breakpoints } from '@angular/cdk/layout';
import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import {MatSnackBar} from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { Page, Acr } from './data/page-data';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'copa';
  listaAcr: Acr[] = [];
  listaOrder: string[] = [];
  listaAlfa: string[] = [];
  lista: Observable<any[]>;
  total : number = 0;
  uniq : number = 0;
  dups : number = 0;
  expOpened : string = 'PaginaInicial';
  identifyer = (index:number, item:any) => item.name; // para não renderizar o expansion panel sempre que mudar o texto dentro dele


  constructor(private firestore: AngularFirestore, private _snackBar: MatSnackBar) {
    this.lista = firestore.collection('copa2', ref => ref.orderBy('order')).valueChanges();
    // const newCollection = firestore.collection<Page>('copa2');
    const collection = firestore.collection("copa2");
    collection.get().forEach((querySnapshot) => {
      querySnapshot.forEach((doc) => {
          //console.log(`${doc.id} => ${doc.data()}`);
          let data : Page = doc.data() as Page;
          // newCollection.doc(data.name).set(data);
          let stickerAcr = this.getAcr(data);
          let orderAcr = stickerAcr;
          if (stickerAcr == '000') {stickerAcr = '000'; orderAcr = '000'}
          else if (data.stickers[0] == 'FWC 8') { stickerAcr = 'fwc8-18'; orderAcr = '001'}
          else if (stickerAcr == 'FWC') { stickerAcr = 'fwc19-29'; orderAcr = 'zz1' }
          else if (stickerAcr == 'C') { stickerAcr = 'Coca'; orderAcr = 'zz2';}
          let pagetotal = data.stickers.length;
          let pageuniq = 0;
          let pagedups = 0;
          //if (!data.qtdsG) data.qtdsG = [];
          //if (!data.qtdsO) data.qtdsO = [];
          //while (data.qtdsG.length < data.stickers.length) data.qtdsG.push(0);
          //while (data.qtdsO.length < data.stickers.length) data.qtdsO.push(0);
          //collection.doc<Page>(data.name).update(data);
          for (let index = 0; index < data.stickers.length; index++) {
            let qtds = data.qtdsG[index] + data.qtdsO[index];
            if (qtds > 0) {
              pageuniq++;
              pagedups += (qtds-1);
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
    return item.qtdsG[i] + item.qtdsO[i];
  }
  getQtdO(sticker : string, item : Page) {
    let i = item.stickers.indexOf(sticker);
    return item.qtdsO[i];
  }
  getQtdG(sticker : string, item : Page) {
    let i = item.stickers.indexOf(sticker);
    return item.qtdsG[i];
  }
  async updatePage(item : Page) {
    let itemDoc = await this.firestore.doc<Page>('copa2/'+ item.name);
    await itemDoc.update(item);
  }
  getAcrItem(page: Page) : Acr {
    for (const acrItem of this.listaAcr) {
      if (acrItem.name == page.name) {
        return acrItem;
      }
    };
    return this.listaAcr[0];
  }
  async inc(sticker : string, item : Page, isGabi : boolean) {
    let i = item.stickers.indexOf(sticker);
    if (isGabi) item.qtdsG[i]++;
    else item.qtdsO[i]++;
    await this.updatePage(item);
    let acr = this.getAcrItem(item);
    if (item.qtdsG[i] + item.qtdsO[i] > 1) {
      this.dups++;
      acr.dups++;
    } else {
      this.uniq++;
      acr.uniq++;
    }
  }
  async dec(sticker : string, item : Page, isGabi : boolean) {
    let i = item.stickers.indexOf(sticker);
    let qtd = isGabi ? item.qtdsG[i] : item.qtdsO[i];
    if (qtd > 0) {
      if (isGabi) item.qtdsG[i]--;
      else item.qtdsO[i]--;
      await this.updatePage(item);
      let acr = this.getAcrItem(item);
      if (item.qtdsG[i] + item.qtdsO[i] == 0) {
        this.uniq--;
        acr.uniq--;
      } else {
        this.dups--;
        acr.dups--;
      }
    } else {
      this._snackBar.open('Impossível diminuir pois ' + (isGabi ? 'Gabi' : 'Omaro') + ' não possui', 'fechar', {
        duration: 15 * 1000,
      });
    }
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
    this.expOpened = '';
  }
  getPageDesc(page: Page) {
    for (let i = 0; i < this.listaAcr.length; i++) {
      let acrItem = this.listaAcr[i];
      if (acrItem.name == page.name) {
        return page.name + ' ' + acrItem.uniq + ';rep:' + acrItem.dups;
      }
    };
    return page.name;
  }
  openPanel(name: string) {
    this.expOpened = name;
    var n = name;
    window.setTimeout(() => { document.getElementById(n)?.scrollIntoView() }, 100);
  }
}
