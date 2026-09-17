import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AlertsList } from './alerts-list/alerts-list';

const routes: Routes = [{ path: '', component: AlertsList }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AlertsRoutingModule {}