import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TechnologiesRoutingModule } from './technologies-routing-module';
import { TechnologiesList } from './technologies-list/technologies-list';
import { TechnologiesDetail } from './technologies-detail/technologies-detail';

@NgModule({
  declarations: [TechnologiesList, TechnologiesDetail],
  imports: [CommonModule, TechnologiesRoutingModule],
})
export class TechnologiesModule {}
