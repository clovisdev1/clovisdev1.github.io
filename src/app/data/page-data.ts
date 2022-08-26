import { NonNullableFormBuilder } from "@angular/forms";

export interface Page {
  name: string;
  order: number;
  stickers: string[];
  qtds: number[];
}
export interface Acr {
  name : string;
  acr : string;
  total : number;
  uniq : number;
  dups : number;
}
