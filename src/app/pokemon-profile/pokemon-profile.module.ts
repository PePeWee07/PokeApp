import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PokemonProfilePageRoutingModule } from './pokemon-profile-routing.module';

import { PokemonProfilePage } from './pokemon-profile.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PokemonProfilePageRoutingModule
  ],
  declarations: [PokemonProfilePage]
})
export class PokemonProfilePageModule {}
