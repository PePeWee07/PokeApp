import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PokemonProfilePage } from './pokemon-profile.page';

const routes: Routes = [
  {
    path: '',
    component: PokemonProfilePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PokemonProfilePageRoutingModule {}
