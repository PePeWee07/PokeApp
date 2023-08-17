import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StatsComparisonPage } from './stats-comparison.page';

const routes: Routes = [
  {
    path: '',
    component: StatsComparisonPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StatsComparisonPageRoutingModule {}
