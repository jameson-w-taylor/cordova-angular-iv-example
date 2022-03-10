import { Injectable, NgZone } from '@angular/core';
import {
  Vault,
  Device,
  DeviceSecurityType,
  VaultType,
  BrowserVault,
  IdentityVaultConfig,
} from '@ionic-enterprise/identity-vault';
import { Platform } from '@ionic/angular';
import { Observable, BehaviorSubject } from 'rxjs';

const dataKey = 'session';
const config: IdentityVaultConfig = {
  key: 'iv.example.cordova',
  type: VaultType.DeviceSecurity,
  deviceSecurityType: DeviceSecurityType.Biometrics
};

export interface VaultServiceState {
  session: string;
}

@Injectable({ providedIn: 'root' })
export class VaultService {
  private isBiometricsEnabledSubj = new BehaviorSubject<boolean>(false);
  private vault: Vault | BrowserVault;
  public state: VaultServiceState = {
    session: '',
  };
  public get isBiometricsEnabled$(): Observable<boolean> {
    return this.isBiometricsEnabledSubj.asObservable();
  }

  constructor(private platform: Platform, private ngZone: NgZone) {}

  async init() {
    await this.platform.ready();
    this.vault = this.platform.is('hybrid') ? new Vault(config) : new BrowserVault(config);

    const isBiometricsEnabled = await Device.isBiometricsEnabled();
    this.isBiometricsEnabledSubj.next(isBiometricsEnabled);
    this.platform.resume.subscribe(() => {
      this.ngZone.run(async () => {
        const isEnabled = await Device.isBiometricsEnabled();
        this.isBiometricsEnabledSubj.next(isEnabled);
      });
    });
  }

  async hasExistingSession(): Promise<boolean> {
    const isEmpty = await this.vault.isEmpty();
    return !isEmpty;
  }

  async setSession(value: string): Promise<void> {
    this.state.session = value;
    try {
      // TODO: Deprecated, but using to determine very first initial setValue call on fresh unused Vault
      if (await this.vault.doesVaultExist()) {
        console.log(`Existing Vault detected, setValue: "${value}", ${await this.getVaultStatus()}`);
        await this.vault.setValue(dataKey, value);
        console.log(`Value stored successfully, ${await this.getVaultStatus()}`);
      } else {
        console.log(`New untouched Vault detected, setValue: "${value}", ${await this.getVaultStatus()}`);
        await this.promptOnFirstSetValue(value);
        console.log(`Value stored successfully, ${await this.getVaultStatus()}`);
      }
    } catch (e) {
      console.error('setSession Error: ', e);
    }
  }

  async restoreSession(): Promise<void> {
    try {
      console.log(`getValue, ${await this.getVaultStatus()}`);
      const value = await this.vault.getValue(dataKey);
      console.log(`getValue success: "${value}", ${await this.getVaultStatus()}`);
      this.state.session = value;
    } catch (e) {
      console.error('restoreSession Error: ', e);
    }
  }

  async removeSession(): Promise<void> {
    this.state.session = '';
    try {
      console.log(`removeValue and lock Vault, ${await this.getVaultStatus()}`);
      await this.vault.removeValue(dataKey);
      await this.vault.lock();
      console.log(`removeValue success, ${await this.getVaultStatus()}`);
    } catch (e) {
      console.error('removeSession Error: ', e);
    }
  }

  private async promptOnFirstSetValue(value: string): Promise<void> {
    if (await this.vault.isLocked()) {
      try {
        // NOTE: setValue does not prompt to unlock vault on first call for a fresh unused Vault (all future calls on a locked vault WILL prompt)
        //       The very first setValue call is what actually creates the underlying Vault, so after that we can lock it since it now exists
        console.log(`Touch new Vault and lock it, ${await this.getVaultStatus()}`);
        await this.vault.setValue(dataKey, '');
        await this.vault.lock();
        console.log(`Vault touched and locked, ${await this.getVaultStatus()}`);
        console.log('Prompt for biometrics');
        // NOTE: Now that the Vault is locked, we can call setValue again with the real value to trigger the biometrics prompt
        await this.vault.setValue(dataKey, value);
        console.log(`setValue success, ${await this.getVaultStatus()}`);
      } catch (e) {
        console.error('promptOnFirstSetValue Error: ', e);
      }
    } else {
      await this.vault.setValue(dataKey, value);
    }
  }

  private async getVaultStatus(): Promise<string> {
    const isLocked = await this.vault.isLocked();
    const isEmpty = await this.vault.isEmpty();
    return `Vault is currently ${isLocked ? 'LOCKED' : 'UNLOCKED'} and ${isEmpty ? 'EMPTY' : 'NOT EMPTY'}`;
  }
}