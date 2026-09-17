import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DistributionRoutingModule } from './distribution-routing-module';
import { DistributionHome } from './distribution-home/distribution-home';

@NgModule({
  declarations: [DistributionHome],
  imports: [CommonModule, DistributionRoutingModule],
})
export class DistributionModule {}
