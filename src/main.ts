import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { AppComponent } from './app/app.component';
import { routesConfig } from './app/routes';
import { ConfirmationService } from 'primeng/api';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routesConfig),
    provideHttpClient(),
    provideAnimations(),
    ConfirmationService,
  ],
}).catch((err) => console.error(err));
