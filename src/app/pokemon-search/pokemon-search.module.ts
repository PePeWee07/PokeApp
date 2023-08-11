import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PokemonSearchPageRoutingModule } from './pokemon-search-routing.module';

import { PokemonSearchPage } from './pokemon-search.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PokemonSearchPageRoutingModule
  ],
  declarations: [PokemonSearchPage]
})
export class PokemonSearchPageModule {}
