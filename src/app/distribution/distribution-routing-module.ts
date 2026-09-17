import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DistributionHome } from './distribution-home/distribution-home';

const routes: Routes = [{ path: '', component: DistributionHome }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DistributionRoutingModule {}