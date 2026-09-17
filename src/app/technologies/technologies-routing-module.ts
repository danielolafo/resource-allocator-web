import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TechnologiesList } from './technologies-list/technologies-list';
import { TechnologiesDetail } from './technologies-detail/technologies-detail';

const routes: Routes = [
  { path: '', component: TechnologiesList },
  { path: ':id', component: TechnologiesDetail },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TechnologiesRoutingModule {}