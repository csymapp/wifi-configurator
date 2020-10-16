const os = require('os');
const EventEmitter = require('events').EventEmitter;
const watch = require('node-watch');
// const shell = require('shelljs');
const child_process = require('child_process');
const path = require('path');
const etc = require('node-etc')
const wifi = require('node-wifi');
const to = require("await-to-js").to
const checkInternetConnected = require('check-internet-connected');
const multicastdns = require('multicast-dns');
const portScanner = require('portscanner-sync');
const find = require('local-devices')
const http = require('http');
const express = require('express');
const app = express();

// const { resolve } = require('path');

const savedConfigFileName = 'wifiConfig.yaml'
const deviceConfigFileName = 'deviceConfig.yaml'

class wifiConfigurator extends EventEmitter {
    /**
     * constructor
     * Read configuration from mounted devices and save to config file
     * Check if connected to wifi. If not, scan available networks and try to connect using available credentials
     */
    constructor(init = true) {
        super()
        this.saveDefaults();
        this.mdns = multicastdns()
        this.netStatus = true;
        this.wifiStatus = true;
        this.networks = {};
        this.noInternetCounts = 0;
        this.internetChecksPaused = false;
        this.pauseWiFiReconnect = false;
        this.devices = this.getUsb();
        this.configs = {}
        this.firstWiFiCheck = true;
        this.firstInternetCheck = true;
        this.serverPort = 3074;

        let interfaces = os.networkInterfaces();
        let iface = Object.keys(interfaces).filter(item => item.match(/^wl/))[0] || null
        this.iface = iface;
        wifi.init({
            iface
        });
        if (init) {
            this.init();
        }
    }

    /**
     * list saved networks
     * @returns {String[]} - SSID and password
     */
    listSavedNetworks() {
        let savedCredentials = etc.parseYAML(savedConfigFileName);
        let ret = [];
        for (let i in savedCredentials) {
            let cred = savedCredentials[i]
            ret.push(cred);
        }
        return ret;
    }

    /**
     * removeSavedNetwork
     * @param {Object} options 
     * @param {string} options.SSID - SSID
     * @param {string} options.password - Password
     */
    removeSavedNetwork(options) {
        let savedNetworks = this.listSavedNetworks();
        if (!this.networkSaved(options)) {
            return false;
        }
        // let ret = [];
        let credentialstoSave = {};
        let index = 0;
        for (let dontcare in savedNetworks) {
            let ssid = Object.keys(savedNetworks[dontcare])[0]
            let password = Object.values(savedNetworks[dontcare])[0]
            if (ssid === options.SSID && password === options.password) {

            } else {
                credentialstoSave[index++] = savedNetworks[dontcare]
            }
        }
        etc.save('yaml', savedConfigFileName, credentialstoSave);
        return true
    }

    /**
     * edit network credentials
     * @param {*} optionsOld 
     * @param {string} optionsOld.SSID - SSID
     * @param {string} optionsOld.password - Password
     * @param {*} optionsNew 
     * @param {string} optionsNew.SSID - SSID
     * @param {string} optionsNew.password - Password
     */
    editNetwork(optionsOld, optionsNew) {
        let networkisSaved = this.networkSaved(optionsOld);
        if (!networkisSaved) {
            return false;
        }
        this.removeSavedNetwork(optionsOld);
        this.saveNetworkifNotExists(optionsNew);
        return true;
    }

    /**
     * save default network credentials
     */
    saveDefaults() {
        etc.createConfig(savedConfigFileName);
        etc.createConfig(deviceConfigFileName)
        etc.save('yaml', deviceConfigFileName, {
            DEVICENAME: 'nameless',
            USERS:
                { NOBODY: 'PASSWORD' }
        })
        let defaultSSID = 'wifi-configurator'
        let defaultPassword = 'wifi-config'
        this.saveNetworkifNotExists({
            SSID: defaultSSID,
            password: defaultPassword
        })
    }

    /**
     * Check if credentials are already saved
     * @param {Object} options 
     * @param {string} options.SSID - SSID
     * @param {string} options.password - Password
     */
    networkSaved(options) {
        const { SSID, password } = options
        if (!password) {
            password = ''
        }
        let savedCredentials = etc.parseYAML(savedConfigFileName);
        let ssidsAndPasswords = []
        for (let i in savedCredentials) {
            let cred = savedCredentials[i]
            ssidsAndPasswords.push(`${Object.keys(cred).toString()}_=_=_:${Object.values(cred).toString()}`)
        }
        let testStr = `${SSID}_=_=_:${password}`
        return ssidsAndPasswords.includes(testStr)
    }

    /**
     * Save network credentials if they do not exist already.
     * @param {Object} options 
     * @param {string} options.SSID - SSID
     * @param {string} options.password - Password
     */
    saveNetworkifNotExists(options) {
        let networkisSaved = this.networkSaved(options);
        if (networkisSaved) {
            return false;
        }
        const { SSID, password } = options
        if (!password) {
            password = ''
        }
        let savedCredentials = etc.parseYAML(savedConfigFileName);
        let credentialstoSave = {};
        let index = 0;
        credentialstoSave[index] = {}
        credentialstoSave[index++][SSID] = password;
        for (let i in savedCredentials) {
            let cred = savedCredentials[i]
            credentialstoSave[index++] = cred
        }
        etc.save('yaml', savedConfigFileName, credentialstoSave);
        return true
    }

    init() {
        etc.createConfig(savedConfigFileName);
        this.watchDrives()
        this.on('wifi', (msg) => this.wifiStatusProcess(msg))
        this.checkWifiStatus();

        this.on("unmounted", (mp) => console.log(`unmounted ${mp}`))
        this.on("mounted", (mp) => { console.log(`mounted ${mp}`) });
        this.on("wifi", (msg) => {
            switch (msg) {
                case "connected":
                    console.log('connected to wifi');
                    break;
                case "disconnected":
                    console.log('disconnected from wifi');
                    break;
            }
        })
        this.on("internet", (msg) => {
            switch (msg) {
                case "connected":
                    console.log('connected to internet');
                    break;
                case "disconnected":
                    console.log('disconnected from internet');
                    break;
            }
        })
        this.on('internet', (msg) => this.internetStatus(msg));
        this.httpserver()

    }

    /**
     * Servers a settings page that is accessible from another device to read/edit the settings on this device
     * @param {*} options 
     */
    async httpserver() {
        app.use(express.json());
        app.use(express.static("public"));
        app.use('/', function (req, res) {
            res.sendFile(path.join(process.cwd(), '/layouts/index.html'));
        });
        const server = http.createServer(app);
        // use only this port if nothing is running on it yet...
        let [err, care] = await to(portScanner.findAPortNotInUse(this.serverPort, '127.0.0.1'));//this.serverPort
        this.serverPort = care;
        console.log(this.serverPort)
        // process.exit();
        server.listen(this.serverPort);
        console.debug('Server listening on port ' + this.serverPort);
    }

    /**
     * get local server external IP address on given interface
     * @param {string} iface 
     */
    getLocalExternalIP(iface) {
        if (!iface) {
            iface = this.iface
        }
        return [].concat(...os.networkInterfaces()[iface])
            .find((details) => details.family === 'IPv4' && !details.internal)
            .address
    }

    /**
     * get local server external IP address on all interfaces
     * @param {string} iface 
     */
    getAllLocalExternalIP() {
        return [].concat(...Object.values(os.networkInterfaces()))
            .filter(details => details.family === 'IPv4' && !details.internal).map(item => item.address)
    }

    /**
     * mdns service discovery
     */
    async createAdvertisement() {
        let ips = this.getAllLocalExternalIP();
        let appName = etc.packageJson().name;
        let deviceName = etc.parseYAML(deviceConfigFileName).DEVICENAME || 'nameless';
        console.log(deviceName)
        let target = ips.map(item => `http://${item}:${this.serverPort}`)
        let response = {
            name: `${appName}-${deviceName}`,
            type: 'SRV',
            data: {
                port: this.serverPort,
                weigth: 0,
                priority: 10,
                target: target.join(','),
                name: 'SOME NAME'
            }
        }
        this.mdns.destroy();
        this.mdns = multicastdns();
        this.mdns.on('query', (query) => {
            if (query.questions[0] && query.questions[0].name === `${appName}-wifi-config.local`) {
                console.log(response)
                let ret = {
                    answers: [response]
                }
                this.mdns.respond(ret);
            }
        })
        // bonjour.publish(response)
    }

    /*
     * check if wifi is connected & connect if not connected
     */
    async checkWifiStatus() {
        let connections = await this.listConnections()
        let isConnected = connections.length
        if (isConnected === 0 && this.wifiStatus) {
            this.emit('wifi', 'disconnected')
        }
        if (isConnected === 1 && (!this.wifiStatus || this.firstWiFiCheck)) {
            this.firstWiFiCheck = false
            this.firstInternetCheck = true;
            this.emit('wifi', 'connected');
            this.createAdvertisement();
        }
        this.emit('wifi', 'checked')
    }

    /**
     * try connecting to wifi if is disconnected
     */
    wifiStatusProcess(status) {
        switch (status) {
            case "connected":
                this.wifiStatus = true;
                this.firstInternetCheck = true;
                this.pauseWiFiReconnect = false;
                this.checkInternetConnected();
                break;
            case "disconnected":
                this.wifiStatus = false;
                this.netStatus = false;
                // this.mdns.destroy();
                if (!this.pauseWiFiReconnect) {
                    this.connectToNetworks()
                }
                break;
            case 'failed':
                this.wifiStatus = false;
                this.netStatus = false;
                this.connectToNetworks()
                break;
            case "checked":
                this.checkWifiStatus();
                break;
        }
    }



    /**
     * disconnect from network and try another one if there is no internet
     */
    internetStatus(status) {
        switch (status) {
            case "disconnected":
                wifi.disconnect((error) => {
                    if (error) {
                    }
                });
                break;
            case "checked":
                this.checkInternetConnected();
                break;
        }
    }

    /**
     * Check if device has internet access
     * emits internet event with status:disconnected/connected and another internet event with checked to show that its done
     */
    checkInternetConnected() {
        checkInternetConnected()
            .then((result) => {
                this.noInternetCounts = 0;
                this.emit('internet', 'checked');
                if (!this.netStatus || this.firstInternetCheck) {
                    this.netStatus = true
                    this.firstInternetCheck = false;
                    if (this.wifiStatus) {
                        this.emit('internet', 'connected')
                    }
                }
            })
            .catch((ex) => {
                if (this.internetChecksPaused === true) {
                    this.noInternetCounts = 0;
                }
                this.emit('internet', 'checked')
                if (this.netStatus || this.firstInternetCheck) {
                    if (this.noInternetCounts > 10) {
                        this.noInternetCounts = 0;
                        this.netStatus = false
                        this.firstInternetCheck = false
                        // if (this.wifiStatus) {
                        this.emit('internet', 'disconnected')
                        // }
                    } else {
                        console.log(this.noInternetCounts)
                        this.noInternetCounts++
                    }
                }
            });
    }

    /**
     * Pause internet checks so that if does not disconnect from current network if there is no internet
     */
    pauseInternetChecks() {
        this.internetChecksPaused = true;
    }
    /**
     * Resume internet checks so that if may disconnect from current network if there is no internet
     */
    resumeInternetChecks() {
        this.internetChecksPaused = false;
    }

    /**
     * List mount points of all mounted drives
     * @returns {string[]} - array of locations where all mounted disks are mounted
     */
    getUsb() {
        // let usbJson = JSON.parse(shell.exec('lsblk --json', { silent: true }).stdout);
        let usbJson = JSON.parse(child_process.execSync('lsblk --json').toString());
        let dev = usbJson.blockdevices;
        let devices = [];
        dev.forEach(function (entry) {
            if (!entry.children) {
                entry.children = [entry]
            }

            entry.children.forEach(function (e) {
                if (e.mountpoint) {
                    devices.push(e.mountpoint);
                }
            })

        });
        return devices;
    }

    /**
     * Watch for mounting and unmounting of drives
     * @returns {null} - emits mounted/unmounted event with mounted/unmounted mount point
     */
    watchDrives() {
        watch('/dev/disk/by-id', { recursive: true }, (evt, name) => {
            let curr = this.getUsb();
            let add = curr.filter(item => !this.devices.includes(item))
            let rem = this.devices.filter(item => !curr.includes(item))
            if (add.length > 0) { // wait for all partitions on disk to be mounted
                setTimeout(() => {
                    curr = this.getUsb();
                    add = curr.filter(item => !this.devices.includes(item))
                    if (add.length > 0) {
                        add.map(mountPoint => this.emit("mounted", mountPoint))
                        // 
                        this.devices = curr;
                    }
                }, 5000)
            }
            if (rem.length > 0) {
                rem.map(mountPoint => this.emit("unmounted", mountPoint))
                this.devices = curr;
            }
        });
    }

    /**
     * Read configurations from drives and save then to ${savedConfigFileName}
     */
    readConfigurations() {
        let dirs = this.devices;
        let savedConfig = etc.readConfigData('yaml', savedConfigFileName);

        let savedConfigs = [];
        let configstoSave = [];
        for (let i in savedConfig) {
            let config = savedConfig[i]
            savedConfigs.push(`${Object.keys(config)}${Object.values(config)}`)
        }
        for (let dir of dirs) {
            let filePath = path.join(dir, savedConfigFileName);
            let configuration = etc.readConfigData('yaml', filePath);
            for (let i in configuration) {
                let config = configuration[i]
                config = `${Object.keys(config)}${Object.values(config)}`
                if (!savedConfigs.includes(config)) {
                    configstoSave.push(configuration[i])
                }
            }
        }
        savedConfigs = []
        for (let i in savedConfig) {
            let config = savedConfig[i]
            savedConfigs.push(config)
        }
        for (let i in configstoSave) {
            let config = configstoSave[i]
            savedConfigs.push(config)
        }
        let saveObj = {};
        for (let i in savedConfigs) {
            saveObj[i] = savedConfigs[i]
        }
        etc.save("yaml", savedConfigFileName, saveObj)
    }

    /**
     * Manage list of networks and try connecting one if not connected
     */
    async connectToNetworks() {
        this.readConfigurations();
        let connections = await this.listConnections()
        let isConnected = connections.length
        if (isConnected === 0) {
            let scannedNetworks = await this.scan();
            scannedNetworks = scannedNetworks.filter(item => item.ssid !== '')
            this.connect(scannedNetworks)
        } else {
            this.emit('wifi', 'connected')
            this.emit('connected')
        }
    }

    /**
     * scan available networks
    
     * @returns {Promise} which resolves with list of available networks
     */
    async scan() {
        return new Promise((resolve, reject) => {
            wifi.scan((error, networks) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(networks)
                }
            });
        })
    }

    /**
     * Connect to specific network
     * @param {Object} options 
     * @param {string} options.SSID - SSID
     * @param {string} options.password - Password
     */
    async connectToSpecificNetwork(options) {
        return new Promise(async (resolve, reject) => {
            this.pauseWiFiReconnect = true;
            await to(this.disconnect());
            wifi.connect({ ssid: options.SSID, password: options.password }, error => {
                if (error) {
                    reject(error)
                } else {
                    resolve(true)
                }
            });
        })
    }

    async disconnect() {
        return new Promise((resolve, reject) => {
            wifi.disconnect((error) => {
                if (error) {
                    return reject(error)
                }
                resolve(true)
            });
        })
    }

    /**
     * choose network to connect to
     * @param [Object] - scannedNetworks
     */
    async connect(scannedNetworks) {
        let ssid;
        let savedConfig = etc.readConfigData('yaml', savedConfigFileName);
        let allNetworks = {};
        for (let network of scannedNetworks) {
            ssid = network.ssid;
            let hasCrentials = false;
            for (let i in savedConfig) {
                let config = savedConfig[i]
                let tmp = [...Object.keys(config)].concat(...Object.values(config));
                if (tmp[0] === ssid) {
                    hasCrentials = true;
                    allNetworks[`${tmp[0]}__${tmp[1]}`] = { ssid: tmp[0], password: tmp[1] }
                }
            }
            if (!hasCrentials) {
                allNetworks[ssid] = { ssid }
            }
        }

        let selectedNetwork;
        for (let network in allNetworks) {
            if (!this.networks[network]) {
                selectedNetwork = allNetworks[network]
                this.networks[network] = selectedNetwork
                break;
            }
        }
        if (selectedNetwork) {
            console.log(selectedNetwork.ssid)
            this.emit('wifi', `Connecting to selected ${selectedNetwork.ssid}`)
        }
        if (!selectedNetwork) {
            if (Object.keys(allNetworks).length > 0) {
                this.networks = {};
            }
            this.emit('disconnected', true);
            return this.emit('wifi', 'failed')
        }

        try {
            let connect = async (credential) => {
                return new Promise((resolve, reject) => {
                    wifi.connect({ ssid: credential.ssid, password: credential.password }, error => {
                        if (error) {
                            reject(error)
                        } else {
                            resolve(true)
                        }
                    });
                })
            }
            let [err, care] = await to(connect(selectedNetwork));
            if (err) { // no network connected (=1)
                this.emit('disconnected', true);
                this.emit('wifi', 'failed')
            }
            if (care) {
                this.emit('connected', true);
                this.emit('wifi', 'connected')
            }
        } catch (error) {
            this.emit('disconnected', true);
            this.emit('wifi', 'failed')
        }
    }

    /**
     * Check if connected to WiFi network
     * @returns {Promise} which resolves with number of connections. 0 if no connection
     */
    async listConnections() {
        return new Promise((resolve, reject) => {
            wifi.getCurrentConnections((error, currentConnections) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(currentConnections)
                }
            });
        })
    }
}

module.exports = (init) => { return new wifiConfigurator(init); }