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
