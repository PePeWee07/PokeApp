import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'folder/Inbox',
    pathMatch: 'full'
  },
  {
    path: 'folder/:id',
    loadChildren: () => import('./folder/folder.module').then( m => m.FolderPageModule)
  },
  {
    path: 'pokemon',
    loadChildren: () => import('./pokemon/pokemon.module').then( m => m.PokemonPageModule)
  },
  {
    path: 'pokemon-profile',
    children: [
      {
        path: ':id',
        loadChildren: () => import('./pokemon-profile/pokemon-profile.module').then(m => m.PokemonProfilePageModule)
      }
    ]
  },
  {
    path: 'pokemon-search',
    loadChildren: () => import('./pokemon-search/pokemon-search.module').then( m => m.PokemonSearchPageModule)
  },
  {
    path: 'stats-comparison',
    children: [
      {
        path: ':id',
        loadChildren: () => import('./stats-comparison/stats-comparison.module').then( m => m.StatsComparisonPageModule)
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
