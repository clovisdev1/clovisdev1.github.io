import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

import { Observable } from 'rxjs';
import { Page } from './data/page-data'
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  showspiner = false;
  title = 'copa';
  item$: Observable<any[]>;
  itemA$: Observable<any[]>;
  constructor(private firestore: AngularFirestore) {
    this.item$ = firestore.collection('copa', ref => ref.orderBy('order')).valueChanges();
    this.itemA$ = firestore.collection('copa', ref => ref.orderBy('name')).valueChanges();
    //this.adddocs();
  }
  adddocs() {/*
    let col = this.firestore.collection<Page>('copa');
    let page : Page = {
      order : 36,
      name : 'Coca-cola',
      stickers : ['C 1', 'C 2', 'C 3', 'C 4', 'C 5', 'C 6', 'C 7', 'C 8'],
      qtds: [0, 0, 0, 0, 0, 0, 0, 0]
    }
    col.doc('Coca-cola').set(page);*/
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
}
