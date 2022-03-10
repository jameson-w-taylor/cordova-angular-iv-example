import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { VaultService } from '../vault.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  session = this.vault.state.session;

  constructor(private vault: VaultService, private router: Router) {}

  async handleLogout() {
    console.log('Log user out, remove value from Vault, simulate logout action');
    await this.vault.removeSession();
    console.log('removeSession success, navigate to Login');
    await this.router.navigate(['/login'], { replaceUrl: true });
  }

}
