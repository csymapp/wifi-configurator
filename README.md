wifi-Configurator for Nodejs
========

A wifi configuration module for linux with GUI that uses default/open networks so that it does not have to create an access point. Other configuration options are provided such as using SD card, USB devices, (web bluetooth - not yet implemented).

[![Build Status](https://travis-ci.com/csymapp/wifi-configurator.svg?branch=master)](https://travis-ci.com/csymapp/wifi-configurator)

The most common way for configuring WiFi on a linux systems without any way of directly inputing the WiFi credentials into the device, such on a raspberry pi without I/O peripherals, is to have the device create an Access Point to which the user can connect and access a web page on which the credentials for a WiFi network can be entered and saved, such as happens with [Farmbot](https://github.com/FarmBot/farmbot_os). The farmbot wifi-configurator is now integrated into FarmbotOs, but it used to be [a separate piece of software](https://opensourcecompass.io/projects/farmbot/wifi-configurator). But we are persuaded that there are more efficient ways of doing this, since:
- It is time consuming as the device has to restart after the configuration to disable the Access Point and try connecting to the WiFi network. If the credentials are wrong, the device will restart again to create the Access Point, and restart again, ad infinitum.
- In the said system, it is not possible for the device to work without connecting to a network. This need not always be the case as some operations can be done offline.
- The user may not have a WiFi enabled device with which to connect to the linux system's device's Access Point to configure the network. Other options will then come in handy. 
- There are easier options which may be more preferable to a user.
- Even without an open network or the default network, the configuration server is still accessible through ethernet.

wifi-Configurator is a NodeJS module to configure WiFi on a linux system including Raspberry Pi providing several options, namely:
- Connecting to a default network. The user can create a network on his device called `wifi-configurator` with the password `wifi-config`. The device will try connecting to this network so that the user may be able to access the network configuration page.
- If the device is unable to connect to the the default network, it will try connecting to any open networks. It will loop through all open networks as long as there is no activity in them. This gives the user an option of either creating the default network on their device, or creating an open access point on their device.
- SD Card and USB devices. WiFi credentials can be saved on SD card/USB drives in a file called `wifiConfig.yaml` or `wifiConfig.yml` in the root directory of any of the drive partitions and inserted into the linux device. The credentials will be read as soon as the drive is connected and mounted.
-  Bluetooth Low Energy and Web Bluetooth - (not yet implemented). 

wifi-Configurator has been designed as part of the [csynage media kit](https://csynage.com)

The reasons for this can be found [here](http://www.hardill.me.uk/wordpress/2016/09/13/provisioning-wifi-iot-devices/)

Usage
------------

You need do nothing more than:

```bash
npm install wifi-configurator
```

```javascript
const wifi = require('wifi-configurator')();
```

WiFi configurator will run as soon as you run your application. See example in [examples](/examples/app.js). You can configure you wifi networks using any of these options, as already mentioned:

1. create a file called `wifiConfig.yaml` or `wifiConfig.yml` in a USB drive/SD card with the configuration for your WiFi network and insert it into your device. Optionally on a raspberry pi you can save this configuration file on the boot partition of your SD card. The configuration you have created will be read and saved in your device, and it will be used to connect to your network. This is the easiest way as it will require no further programming. Here is an example of the `yml` file:

```yaml
SSID1: "CARTO"
SSID2: "CARTO"
SSID3:
 - CARTO1
 - CARTO2
1:
 SSID4: CARTO1
2:
 SSID4: CARTO2
```
The network credentials should be saved as `SSID, PARAPHRASE` pairs (see sample configuration for `SSID1` and `SSID2`). But if there are two networks with the same SSID (and different passwords), then their passwords can be saved as an array which is the value for the SSID (see `SSID3` in sample configuration which has two networks with same SSID). The old configuration method is given for `SSID4`. But no comment shall be given about it as it has been deprecated due to its poor readability. It's however the configuration that is still used for saving the credentials internally.

2. create a wireless network on any device with the default wireless credentials for wifi-configurator `SSID: wifi-configurator` and `password:wifi-config`. The device will connect to this network. Optionally you can create an open network and the device will connect to it. Or you can connect the device to a network using an ethernet cable. Then you will be able to connect to the configuration page of the device. The address at which this page is served can be found by performing some device discovery. An example of how this can be done is given below (see [examples](/examples/discovery.js)):

```javascript
const mdns = require('multicast-dns')()
const etc = require('node-etc');
const appName = etc.packageJson().name;
 
mdns.on('response', function(response) {
  console.log('got a response packet:', response.answers)
  console.log(`server is running on ${response.answers[0].target}`)
})
 
mdns.query({
  questions:[{
    name: `${appName}-wifi-config.local`, // appName is the name of your application
    type: 'A'
  }]
})
```

The result obtained from the mdns query will be something like:

```javascript
{
    name: 'wifi-configurator-nameless',
    type: 'SRV',
    ttl: 0,
    class: 'IN',
    flush: false,
    data: {
      priority: 10,
      weight: 0,
      port: 3074,
      target: 'http://192.168.100.32:3074'
    }
  }
```

`data.url` will give the url where you can access the configuration server. If the device is connected to several networks, then it will be a comma separated list of urls. You should be able to identify which url is accessible from your network. The `name` will be `wifi-configurator-${deviceName}`. `deviceName`, as long as it has not be configured, will return `nameless`. The configuration page has a default username and password which should be changed on first log in.

The default username is `NOBODY` and password is `PASSWORD`. No mechanism is provided for retrieving lost passwords, except for addition of new users using the configuration file as described below.

### Changing Username/Password and DeviceName

#### 1. Using `deviceConfig.yaml`

In the same manner that `wifiConfig.yaml` is created, you can also optionally create another configuration file called `deviceConfig.yaml`. From this the wifi-configurator will be able to read the device name (after it has been correctly set) so as to be able to distinguish between several devices on a network. This makes it easier to know which exact device you are working on than when devices are merely identified using their hostnames so that where there are several devices on a single network they are simply known by their hostname and the number which is usually added after the hostname, such as `raspberrypi-1.local`, `raspberrypi-2.local`. After the first login you can be able to change the name of your device to have your devices identified with names that you assign to them, such as `sitting room TV`, `kitchen oven`, etc.

A sample configuration for this yaml file is:

```yaml
DEVICENAME: nameless
```

`USERS` provides credentials for those who will be able to log in to your device and change the settings. It can also be used by other modules of your application that need authentication. Such basic authentication is provided so as to enable offline operation where a more sophisticated authentication server such as [keycloak](https://www.keycloak.org/) cannot be accessed.

**NOTE:**
 - The password is provided in plain text, but stored encrypted.
 - After supplying the device name in the configuration file, it is best to delete it as it will overwrite any changes made from the server configuration page.

#### 2. Using the configuration page as described above.


### Examples of available functions

You can listen to events emitted:

```javascript
wifi.on("unmounted", (mp) => console.log(`unmounted ${mp}`))
wifi.on("mounted", (mp) => { console.log(`mounted ${mp}`) });
wifi.on("wifi", (msg) => {
    switch (msg) {
        case "connected":
            console.log('connected to wifi');
            break;
        case "disconnected":
            console.log('disconnected from wifi');
            break;
    }
})
wifi.on("internet", (msg) => {
    switch (msg) {
        case "connected":
            console.log('connected to internet');
            break;
        case "disconnected":
            console.log('disconnected from internet');
            break;

    }
})
```

Examples of other functions
```javascript
console.log(test.listSavedNetworks())
console.log(test.removeSavedNetwork({ SSID: 'GS', 'password': 'GS' }))
console.log(test.listSavedNetworks())
console.log(test.saveNetworkifNotExists({ SSID: 'GS', 'password': 'GS' }))
console.log(test.listSavedNetworks())
console.log(test.editNetwork({ SSID: 'GS', 'password': 'GS' }, { SSID: 'GS', 'password': 'GS1' }))
console.log(test.listSavedNetworks())
test.connectToSpecificNetwork({ SSID: 'GS', password: 'GS1' })
test.pauseInternetChecks()
```

You can also find user management function examples in [test.js](/test/test.js)

For all available functions, please refer to the [API](#API)


How it works
------------
If you add and run `wifi-configurator` as a module to your application, it will be able to read wifi configuration data from connected SD cards, USB drives and all mounted drives. The wifi configuration is  a `yaml/yml` file called  `wifiConfig.yaml` or `wifiConfig.yml` which is saved in the root directory of any of the drives. In raspberry pi, you can save this file in the `boot` partion.

A sample configuration for the `yaml` file is:

```yaml
SSID: PARAPHRASE
SSID: PARAPHRASE1
```

In JSON this would be:

```json
{
  "1": {
    "SSID1": "PARAPHRASE1"
  },
  "2": {
    "SSID2": "PARAPHRASE2"
  }
}
```

The number is given so that credentials can be saved for different networks having the same SSID.

The credentials from all drives are saved using [node-etc ](https://www.npmjs.com/package/node-etc) into `/etc/${appName}/wifiConfig.yaml` or `~/etc/${appName}/wifiConfig.yaml` depending on how the system is configigured. `appName` is the name of your application as given in your `package.json` file. It can easily be obtained using `node-etc`.

```javascript
const etc = require('node-etc');
let appName = etc.packageJson().name;
```

The module will scan available networks and connect to the first valid network whose credentials are stored or to the first open network. The module will its connection to the internet and disconnect from the network if it has no connection to the internet, and try connecting to the next network. Thus the network with the best connectivity to the internet is always the one that is connected to.






API
---

<a name="wifiConfigurator"></a>

## wifiConfigurator
**Kind**: global class  

* [wifiConfigurator](#wifiConfigurator)
    * [new wifiConfigurator()](#new_wifiConfigurator_new)
    * [.listSavedNetworks()](#wifiConfigurator+listSavedNetworks) ⇒ <code>Array.&lt;String&gt;</code>
    * [.removeSavedNetwork(options)](#wifiConfigurator+removeSavedNetwork)
    * [.editNetwork(optionsOld, optionsNew)](#wifiConfigurator+editNetwork)
    * [.saveDefaults()](#wifiConfigurator+saveDefaults)
    * [.networkSaved(options)](#wifiConfigurator+networkSaved)
    * [.saveNetworkifNotExists(options)](#wifiConfigurator+saveNetworkifNotExists)
    * [.changeDeviceName(deviceName)](#wifiConfigurator+changeDeviceName)
    * [.getConnectedNetwork()](#wifiConfigurator+getConnectedNetwork)
    * [.removeSavedNetworkv1(ssid, password)](#wifiConfigurator+removeSavedNetworkv1)
    * [.httpserver(options)](#wifiConfigurator+httpserver)
    * [.getLocalExternalIP(iface)](#wifiConfigurator+getLocalExternalIP)
    * [.getAllLocalExternalIP(iface)](#wifiConfigurator+getAllLocalExternalIP)
    * [.readDeviceConfig()](#wifiConfigurator+readDeviceConfig) ⇒ <code>object</code>
    * [.editDeviceName(deviceName)](#wifiConfigurator+editDeviceName)
    * [.encrypt(password)](#wifiConfigurator+encrypt)
    * [.addUser(username, password)](#wifiConfigurator+addUser)
    * [.listUsers()](#wifiConfigurator+listUsers) ⇒ <code>object</code>
    * [.removeUser(username, [force])](#wifiConfigurator+removeUser)
    * [.authenticateUser(username, password)](#wifiConfigurator+authenticateUser)
    * [.createAdvertisement()](#wifiConfigurator+createAdvertisement)
    * [.wifiStatusProcess()](#wifiConfigurator+wifiStatusProcess)
    * [.internetStatus()](#wifiConfigurator+internetStatus)
    * [.checkInternetConnected()](#wifiConfigurator+checkInternetConnected)
    * [.pauseInternetChecks()](#wifiConfigurator+pauseInternetChecks)
    * [.resumeInternetChecks()](#wifiConfigurator+resumeInternetChecks)
    * [.getUsb()](#wifiConfigurator+getUsb) ⇒ <code>Array.&lt;string&gt;</code>
    * [.watchDrives()](#wifiConfigurator+watchDrives) ⇒ <code>null</code>
    * [.readConfigurations()](#wifiConfigurator+readConfigurations)
    * [.connectToNetworks()](#wifiConfigurator+connectToNetworks)
    * [.listAvailbleNetworks()](#wifiConfigurator+listAvailbleNetworks)
    * [.scan()](#wifiConfigurator+scan) ⇒ <code>Promise</code>
    * [.connectToSpecificNetwork(options)](#wifiConfigurator+connectToSpecificNetwork)
    * [.disconnect()](#wifiConfigurator+disconnect)
    * [.connect([Object])](#wifiConfigurator+connect)
    * [.listConnections()](#wifiConfigurator+listConnections) ⇒ <code>Promise</code>

<a name="new_wifiConfigurator_new"></a>

### new wifiConfigurator()
constructor
Read configuration from mounted devices and save to config file
Check if connected to wifi. If not, scan available networks and try to connect using available credentials

<a name="wifiConfigurator+listSavedNetworks"></a>

### wifiConfigurator.listSavedNetworks() ⇒ <code>Array.&lt;String&gt;</code>
list saved networks

**Kind**: instance method of [<code>wifiConfigurator</code>](#wifiConfigurator)  
**Returns**: <code>Array.&lt;String&gt;</code> - - SSID and password  
<a name="wifiConfigurator+removeSavedNetwork"></a>

### wifiConfigurator.removeSavedNetwork(options)
removeSavedNetwork

**Kind**: instance method of [<code>wifiConfigurator</code>](#wifiConfigurator)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.SSID | <code>string</code> | SSID |
| options.password | <code>string</code> | Password |

<a name="wifiConfigurator+editNetwork"></a>

### wifiConfigurator.editNetwork(optionsOld, optionsNew)
edit network credentials

**Kind**: instance method of [<code>wifiConfigurator</code>](#wifiConfigurator)  

| Param | Type | Description |
| --- | --- | --- |
| optionsOld | <code>\*</code> |  |
| optionsOld.SSID | <code>string</code> | SSID |
| optionsOld.password | <code>string</code> | Password |
| optionsNew | <code>\*</code> |  |
| optionsNew.SSID | <code>string</code> | SSID |
| optionsNew.password | <code>string</code> | Password |

<a name="wifiConfigurator+saveDefaults"></a>

### wifiConfigurator.saveDefaults()
save default network credentials

**Kind**: instance method of [<code>wifiConfigurator</code>](#wifiConfigurator)  
<a name="wifiConfigurator+networkSaved"></a>

### wifiConfigurator.networkSaved(options)
Check if credentials are already saved

**Kind**: instance method of [<code>wifiConfigurator</code>](#wifiConfigurator)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.SSID | <code>string</code> | SSID |
| options.password | <code>string</code> | Password |

<a name="wifiConfigurator+saveNetworkifNotExists"></a>

### wifiConfigurator.saveNetworkifNotExists(options)
Save network credentials if they do not exist already.

**Kind**: instance method of [<code>wifiConfigurator</code>](#wifiConfigurator)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.SSID | <code>string</code> | SSID |
| options.password | <code>string</code> | Password |

<a name="wifiConfigurator+changeDeviceName"></a>

### wifiConfigurator.changeDeviceName(deviceName)
Change device name

**Kind**: instance method of [<code>wifiConfigurator</code>](#wifiConfigurator)  

| Param | Type |
| --- | --- |
| deviceName | <code>string</code> | 

<a name="wifiConfigurator+getConnectedNetwork"></a>

### wifiConfigurator.getConnectedNetwork()
Get connected network

**Kind**: instance method of [<code>wifiConfigurator</code>](#wifiConfigurator)  
<a name="wifiConfigurator+removeSavedNetworkv1"></a>

### wifiConfigurator.removeSavedNetworkv1(ssid, password)
remove saved network

**Kind**: instance method of [<code>wifiConfigurator</code>](#wifiConfigurator)  

| Param | Type |
| --- | --- |
| ssid | <code>string</code> | 
| password | <code>string</code> | 

<a name="wifiConfigurator+httpserver"></a>

### wifiConfigurator.httpserver(options)
Servers a settings page that is accessible from another device to read/edit the settings on this device

**Kind**: instance method of [<code>wifiConfigurator</code>](#wifiConfigurator)  

| Param | Type |
| --- | --- |
| options | <code>\*</code> | 

<a name="wifiConfigurator+getLocalExternalIP"></a>

### wifiConfigurator.getLocalExternalIP(iface)
get local server external IP address on given interface

**Kind**: instance method of [<code>wifiConfigurator</code>](#wifiConfigurator)  

| Param | Type |
| --- | --- |
| iface | <code>string</code> | 

<a name="wifiConfigurator+getAllLocalExternalIP"></a>

### wifiConfigurator.getAllLocalExternalIP(iface)
get local server external IP address on all interfaces

**Kind**: instance method of [<code>wifiConfigurator</code>](#wifiConfigurator)  

| Param | Type |
| --- | --- |
| iface | <code>string</code> | 

<a name="wifiConfigurator+readDeviceConfig"></a>

### wifiConfigurator.readDeviceConfig() ⇒ <code>object</code>
Read saved device configuration data, or return the default values

**Kind**: instance method of [<code>wifiConfigurator</code>](#wifiConfigurator)  
**Returns**: <code>object</code> - - {DEVICENAME, USERS:{USERNAME: PASSWORD}}  
<a name="wifiConfigurator+editDeviceName"></a>

### wifiConfigurator.editDeviceName(deviceName)
Change device name

**Kind**: instance method of [<code>wifiConfigurator</code>](#wifiConfigurator)  

| Param | Type | Default |
| --- | --- | --- |
| deviceName | <code>string</code> | <code>&quot;nameless&quot;</code> | 

<a name="wifiConfigurator+encrypt"></a>

### wifiConfigurator.encrypt(password)
encrypt password

**Kind**: instance method of [<code>wifiConfigurator</code>](#wifiConfigurator)  

| Param | Type |
| --- | --- |
| password | <code>string</code> | 

<a name="wifiConfigurator+addUser"></a>

### wifiConfigurator.addUser(username, password)
create a new user

**Kind**: instance method of [<code>wifiConfigurator</code>](#wifiConfigurator)  

| Param | Type |
| --- | --- |
| username | <code>string</code> | 
| password | <code>string</code> | 

<a name="wifiConfigurator+listUsers"></a>

### wifiConfigurator.listUsers() ⇒ <code>object</code>
List Users

**Kind**: instance method of [<code>wifiConfigurator</code>](#wifiConfigurator)  
<a name="wifiConfigurator+removeUser"></a>

### wifiConfigurator.removeUser(username, [force])
Remove a user

**Kind**: instance method of [<code>wifiConfigurator</code>](#wifiConfigurator)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| username | <code>string</code> |  |  |
| [force] | <code>boolean</code> | <code>false</code> | remove even if only single user is left |

<a name="wifiConfigurator+authenticateUser"></a>

### wifiConfigurator.authenticateUser(username, password)
Authenticate configuration user

**Kind**: instance method of [<code>wifiConfigurator</code>](#wifiConfigurator)  

| Param | Type |
| --- | --- |
| username | <code>string</code> | 
| password | <code>string</code> | 

<a name="wifiConfigurator+createAdvertisement"></a>

### wifiConfigurator.createAdvertisement()
mdns service discovery

**Kind**: instance method of [<code>wifiConfigurator</code>](#wifiConfigurator)  
<a name="wifiConfigurator+wifiStatusProcess"></a>

### wifiConfigurator.wifiStatusProcess()
try connecting to wifi if is disconnected

**Kind**: instance method of [<code>wifiConfigurator</code>](#wifiConfigurator)  
<a name="wifiConfigurator+internetStatus"></a>

### wifiConfigurator.internetStatus()
disconnect from network and try another one if there is no internet

**Kind**: instance method of [<code>wifiConfigurator</code>](#wifiConfigurator)  
<a name="wifiConfigurator+checkInternetConnected"></a>

### wifiConfigurator.checkInternetConnected()
Check if device has internet access
emits internet event with status:disconnected/connected and another internet event with checked to show that its done

**Kind**: instance method of [<code>wifiConfigurator</code>](#wifiConfigurator)  
<a name="wifiConfigurator+pauseInternetChecks"></a>

### wifiConfigurator.pauseInternetChecks()
Pause internet checks so that if does not disconnect from current network if there is no internet

**Kind**: instance method of [<code>wifiConfigurator</code>](#wifiConfigurator)  
<a name="wifiConfigurator+resumeInternetChecks"></a>

### wifiConfigurator.resumeInternetChecks()
Resume internet checks so that if may disconnect from current network if there is no internet

**Kind**: instance method of [<code>wifiConfigurator</code>](#wifiConfigurator)  
<a name="wifiConfigurator+getUsb"></a>

### wifiConfigurator.getUsb() ⇒ <code>Array.&lt;string&gt;</code>
List mount points of all mounted drives

**Kind**: instance method of [<code>wifiConfigurator</code>](#wifiConfigurator)  
**Returns**: <code>Array.&lt;string&gt;</code> - - array of locations where all mounted disks are mounted  
<a name="wifiConfigurator+watchDrives"></a>

### wifiConfigurator.watchDrives() ⇒ <code>null</code>
Watch for mounting and unmounting of drives

**Kind**: instance method of [<code>wifiConfigurator</code>](#wifiConfigurator)  
**Returns**: <code>null</code> - - emits mounted/unmounted event with mounted/unmounted mount point  
<a name="wifiConfigurator+readConfigurations"></a>

### wifiConfigurator.readConfigurations()
Read configurations from drives and save then to ${savedConfigFileName}

**Kind**: instance method of [<code>wifiConfigurator</code>](#wifiConfigurator)  
<a name="wifiConfigurator+connectToNetworks"></a>

### wifiConfigurator.connectToNetworks()
Manage list of networks and try connecting one if not connected

**Kind**: instance method of [<code>wifiConfigurator</code>](#wifiConfigurator)  
<a name="wifiConfigurator+listAvailbleNetworks"></a>

### wifiConfigurator.listAvailbleNetworks()
List avaialable networks

**Kind**: instance method of [<code>wifiConfigurator</code>](#wifiConfigurator)  
<a name="wifiConfigurator+scan"></a>

### wifiConfigurator.scan() ⇒ <code>Promise</code>
scan available networks

**Kind**: instance method of [<code>wifiConfigurator</code>](#wifiConfigurator)  
**Returns**: <code>Promise</code> - which resolves with list of available networks  
<a name="wifiConfigurator+connectToSpecificNetwork"></a>

### wifiConfigurator.connectToSpecificNetwork(options)
Connect to specific network

**Kind**: instance method of [<code>wifiConfigurator</code>](#wifiConfigurator)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.SSID | <code>string</code> | SSID |
| options.password | <code>string</code> | Password |

<a name="wifiConfigurator+disconnect"></a>

### wifiConfigurator.disconnect()
disconnect

**Kind**: instance method of [<code>wifiConfigurator</code>](#wifiConfigurator)  
<a name="wifiConfigurator+connect"></a>

### wifiConfigurator.connect([Object])
choose network to connect to

**Kind**: instance method of [<code>wifiConfigurator</code>](#wifiConfigurator)  

| Param | Description |
| --- | --- |
| [Object] | scannedNetworks |

<a name="wifiConfigurator+listConnections"></a>

### wifiConfigurator.listConnections() ⇒ <code>Promise</code>
Check if connected to WiFi network

**Kind**: instance method of [<code>wifiConfigurator</code>](#wifiConfigurator)  
**Returns**: <code>Promise</code> - which resolves with number of connections. 0 if no connection  


Developed by [CSECO](http://www.cseco.co.ke)
--------------------------------------------------------
CSECO is a mechatronics firm specializing in engineering technology to be cheap enough to be affordable to low income earners.


[http://www.cseco.co.ke](http://www.cseco.co.ke)

Todo
----
- [ ] finish configuration server and page
- [ ] add BLE and web bluetooth
- [ ] add CLI
- [ ] Reading configuration data from a connected phone
- [ ] Case insensitive usernames