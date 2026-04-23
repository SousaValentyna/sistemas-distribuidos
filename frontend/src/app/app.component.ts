import { Component }    from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule }  from 'primeng/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastModule],
  template: `
    <p-toast position="top-right" [baseZIndex]="9999"></p-toast>
    <div class="app-shell">
      <router-outlet></router-outlet>
    </div>
  `,
})
export class AppComponent {}
