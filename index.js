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

const savedConfigFileName = 'wifiConfig.yaml'

class wifiConfigurator extends EventEmitter {
    /**
     * constructor
     * Read configuration from mounted devices and save to config file
     * Check if connected to wifi. If not, scan available networks and try to connect using available credentials
     */
    constructor(init = true) {
        super()
        this.netStatus = true;
        this.wifiStatus = true;
        this.networks = {};
        this.noInternetCounts = 0;
        this.devices = this.getUsb();
        this.configs = {}
        this.firstWiFiCheck = true;
        this.firstInternetCheck = true;

        let interfaces = os.networkInterfaces();
        let iface = Object.keys(interfaces).filter(item => item.match(/^wl/))[0] || null
        wifi.init({
            iface
        });
        if (init) {
            this.init();
        }

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
            this.emit('wifi', 'connected')
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
                this.checkInternetConnected();
                break;
            case "disconnected":
                this.wifiStatus = false;
                this.netStatus = false;
                this.connectToNetworks()
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
     * List mount points of all mounted drives
     * @returns [string] - array of locations where all mounted disks are mounted
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
            this.emit('wifi', `Connecting to selected ${Network.ssid}`)
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