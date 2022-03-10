# Ionic Cordova based Angular Application using Identity Vault
This application shows a working example of storing/removing a value from a Vault as needed during an example user story. It should prompt for biometrics before calling `setValue` and should prompt for biometrics upon re-entering the app.

## Developer Setup
1. Since this project uses `@ionic-enterprise/identity-vault` you'll need to copy your `.npmrc` file from one of your existing apps that contains the product key required for installtation.

2. You'll also need to follow the Cordova specific instructions to add each platform ([iOS](https://ionicframework.com/docs/developing/ios) | [android](https://ionicframework.com/docs/developing/android)), since unlike Capacitor the native files are not committed to the repository.

3. Prior to using the application, enroll in biometrics on your device. If it detects that biometrics are not enabled, the app will display a message and not allow you to use it.

4. You must test this app on a real device, as Identity Vault does not work on simulators/emulators.

5. Attach the developer tools appropriate for the platform you're testing on device ([iOS](https://ionicframework.com/docs/developing/ios#debugging-ios-apps) | [android](https://ionicframework.com/docs/developing/android#debugging-android-apps)) to view the numerous `console.log()` statements describing what is occuring.

## Notes
This app has been tested and verified to work as expected on a _2020 iPhone SE_ with `iOS 15.3.1` installed.