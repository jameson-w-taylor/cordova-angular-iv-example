import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { VaultService } from '../vault.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  readonly sessionValue = 'someSessionValue';
  biometricsEnabled$ = this.vault.isBiometricsEnabled$;
  hasExistingSession = this.vault.hasExistingSession();

  constructor(private vault: VaultService, private router: Router) {}

  async handleLogin() {
    console.log(`New session detected, store "${this.sessionValue}" in Vault, simulate login action for new user`);
    await this.vault.setSession(this.sessionValue);
    console.log('setSession success, navigate to Home');
    await this.router.navigate(['/home'], { replaceUrl: true });
  }

  async handleUnlock() {
    console.log('Previous session detected, restore value from Vault, simulate resume action for existing user');
    await this.vault.restoreSession();
    console.log('restoreSession success, navigate to Home');
    await this.router.navigate(['/home'], { replaceUrl: true });
  }
}
