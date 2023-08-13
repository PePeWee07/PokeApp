import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PokemonProfilePageRoutingModule } from './pokemon-profile-routing.module';

import { PokemonProfilePage } from './pokemon-profile.page';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PokemonProfilePageRoutingModule
  ],
  declarations: [PokemonProfilePage]
})
export class PokemonProfilePageModule {}
