import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AlertsRoutingModule } from './alerts-routing-module';
import { AlertsList } from './alerts-list/alerts-list';

@NgModule({
  declarations: [AlertsList],
  imports: [CommonModule, AlertsRoutingModule],
})
export class AlertsModule {}
