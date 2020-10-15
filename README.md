wifi-Configurator for Nodejs
========

A wifi configuration module for linux that uses default/open networks so that it does not have to create an access point. Other configuration options are provided such as using SD card, USB devices, (web bluetooth - not yet implemented).

[![Build Status](https://travis-ci.com/csymapp/wifi-configurator.svg?branch=master)](https://travis-ci.com/csymapp/wifi-configurator)

The most common way for configuring WiFi on a linux systems without any way of directly inputing the WiFi credentials into the device, such on a raspberry pi without I/O peripherals, is to have the device create an Access Point to which the user can connect and access a web page on which the credentials for a WiFi network can be entered and saved, such as happens with [Farmbot](https://github.com/FarmBot/farmbot_os). But we are persuaded that there are more efficient ways of doing this, since:
- It is time consuming since the device has to restart after the configuration to disable the Access Point and try connecting to the WiFi network. If the credentials are wrong, the device will restart again to create the Access Point, and restart again, ad infinitum.
- In the said system, it is not possible to the device to work without connecting to a network. This need not always be the case as some operations can be done offline.
- The user may not have a device which which to connect to the linux system's device's Access Point to configure the network. Other options will be handy. 
- There are easier options which may be more preferable to a user.
- Even without an open network of the default network, the configuration server is still accessible through ethernet.

wifi-Configurator is a NodeJS module to configure WiFi on a linux system including Raspberry Pi providing several options, namely:
- Connecting to a default network. The user can create a network on his device called `wifi-configurator` with the password `wifi-config`. The device will try connecting to this network so that the user may be able to access the network configuration page.
- If the device is unable to connect to the the default network, it will try connecting to any open networks. It will loop through all open networks as long as there is no activity in them.
- SD Card and USB devices. WiFi credentials can be saved on SD card/USB drives in a file called `wifiConfig.yaml` or `wifiConfig.yaml` in the root directory of any of the drive partitions and inserted into the linux device. The credentials will be read as soon as the drive is connected and mounted.
-  Bluetooth Low Energy and Web Bluetooth - (not yet implemented). 

wifi-Configurator has been designed as part of the [csynage media kit](https://csynage.com)

The reasons for this can be found [here](http://www.hardill.me.uk/wordpress/2016/09/13/provisioning-wifi-iot-devices/)


How it works
------------
If you add and run `wifi-configurator` as a module to you application, it will be able to read wifi configuration data from connected SD cards, USB drives and all mounted drives. The wifi configuration is  a `yaml/yml` file called  which is saved in the root directory of any of the drives.

A sample configuration for the `yaml` file is:
`wifiConfig.yaml` or `wifiConfig.yaml`
```yaml
'1':
  SSID: PARAPHRASE
'2':
  SSID: PARAPHRASE1
```

The number is given so that credentials can be saved for different networks having the same SSID.

The credentials from all drives are saved using [node-etc ](https://www.npmjs.com/package/node-etc) into `/etc/${appName}/wifiConfig.yaml` or `~/etc/${appName}/wifiConfig.yaml` depending on how the system is configigured.

The module will scan available networks and connect to the first valid network whose credentials are stored or to the first open network. The module will its connection to the internet and disconnect from the network if it has no connection to the internet, and try connecting to the next network. Thus the network with the best connectivity to the internet is always the one that is connected to.


How it works
------------

You need to do nothing more than:

```bash
npm install wifi-configurator
```

```javascript
const wifi = require('wifi-configurator');

```

You can then listen to event emitted:

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


API
---

Refer to the [documentation](/docs/ReadMe.md)

<a name="wifiConfigurator"></a>

## wifiConfigurator
**Kind**: global class  

* [wifiConfigurator](#wifiConfigurator)
    * [new wifiConfigurator()](#new_wifiConfigurator_new)
    * [.wifiStatusProcess()](#wifiConfigurator+wifiStatusProcess)
    * [.internetStatus()](#wifiConfigurator+internetStatus)
    * [.checkInternetConnected()](#wifiConfigurator+checkInternetConnected)
    * [.getUsb()](#wifiConfigurator+getUsb) ⇒
    * [.watchDrives()](#wifiConfigurator+watchDrives) ⇒ <code>null</code>
    * [.readConfigurations()](#wifiConfigurator+readConfigurations)
    * [.connectToNetworks()](#wifiConfigurator+connectToNetworks)
    * [.scan()](#wifiConfigurator+scan) ⇒ <code>Promise</code>
    * [.connect([Object])](#wifiConfigurator+connect)
    * [.listConnections()](#wifiConfigurator+listConnections) ⇒ <code>Promise</code>

<a name="new_wifiConfigurator_new"></a>

### new wifiConfigurator()
constructor
Read configuration from mounted devices and save to config file
Check if connected to wifi. If not, scan available networks and try to connect using available credentials

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
<a name="wifiConfigurator+getUsb"></a>

### wifiConfigurator.getUsb() ⇒
List mount points of all mounted drives

**Kind**: instance method of [<code>wifiConfigurator</code>](#wifiConfigurator)  
**Returns**: [string] - array of locations where all mounted disks are mounted  
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
<a name="wifiConfigurator+scan"></a>

### wifiConfigurator.scan() ⇒ <code>Promise</code>
scan available networks

**Kind**: instance method of [<code>wifiConfigurator</code>](#wifiConfigurator)  
**Returns**: <code>Promise</code> - which resolves with list of available networks  
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
- [ ] add BLE and web bluetooth
- [ ] add CLI
