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
