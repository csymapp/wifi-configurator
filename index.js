const os = require('os');
const EventEmitter = require('events').EventEmitter;
const watch = require('node-watch');
const clone = require('clone')
// const shell = require('shelljs');
const child_process = require('child_process');
const path = require('path');
const etc = require('node-etc')
const wifi = require('node-wifi');
const to = require("await-to-js").to
const checkInternetConnected = require('check-internet-connected');
const multicastdns = require('multicast-dns');
const portScanner = require('portscanner-sync');
const cryptoRandomString = require('crypto-random-string');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const saltRounds = 10;
const http = require('http');
const express = require('express');
const app = express();

// const { resolve } = require('path');

const savedConfigFileName = 'wifiConfig.yaml'
const deviceConfigFileName = 'deviceConfig.yaml'
const defaultDeviceConfig = {
    DEVICENAME: 'nameless',
    USERS:
        { NOBODY: 'PASSWORD' }
}

class wifiConfigurator extends EventEmitter {
    /**
     * constructor
     * Read configuration from mounted devices and save to config file
     * Check if connected to wifi. If not, scan available networks and try to connect using available credentials
     */
    constructor(init = true) {
        super()
        this.saveDefaults();
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
        defaultDeviceConfig.USERS.NOBODY = this.encrypt(defaultDeviceConfig.USERS.NOBODY)
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
        etc.createConfig(deviceConfigFileName);
        try {
            etc.addConfig('yaml', deviceConfigFileName, {
                ACCESS_TOKEN_SECRET: cryptoRandomString({ length: 20, type: 'base64' }),
                ACCESS_TOKEN_LIFE: 1800
            })
        } catch (error) {

        }
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
        this.mdns = multicastdns()
        etc.createConfig(savedConfigFileName);
        this.watchDrives()
        this.on('wifi', (msg) => this.wifiStatusProcess(msg))
        this.checkWifiStatus();

        this.on("unmounted", (mp) => { console.log(`unmounted ${mp}`) })
        this.on("mounted", (mp) => { this.readConfigurations(); console.log(`mounted ${mp}`) });
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
        const cors = require('cors')
        app.use(cors())
        app.use(express.json());
        app.use(express.static(path.join(__dirname,"layouts")));
        let deviceConfig = this.readDeviceConfig();
        const verify = function (req, res, next) {
            if (!req.headers.Authorization && !req.headers.authorization) {
                if (req.body.token)
                    req.headers['authorization'] = `bearer ${req.body.token}`
                else if (req.query.token)
                    req.headers['authorization'] = `bearer ${req.query.token}`
            }
            let accessToken = req.headers['authorization']
            if (!accessToken) {
                return res.status(403).send()
            }

            let payload;
            accessToken = accessToken.replace(/[B]*[b]*earer /, '');
            try {
                payload = jwt.verify(accessToken, deviceConfig.ACCESS_TOKEN_SECRET)
                next()
            }
            catch (error) {
                return res.status(401).send()
            }
        }
        app.get('/app', cors(), (req, res) => {
            res.json({ app: etc.packageJson().name })
        })
        app.get('/device', cors(), (req, res) => {
            res.json({ device: deviceConfig.DEVICENAME })
        })
        app.post('/token', cors(), verify, (req, res) => {
            let accessToken = (req.headers['authorization'] || '').replace(/[B]*[b]*earer /, '')
            let tokenData = jwt.decode(accessToken);
            let username = tokenData.username;
            let payload = { username }
            accessToken = jwt.sign(payload, deviceConfig.ACCESS_TOKEN_SECRET, {
                algorithm: "HS256",
                expiresIn: deviceConfig.ACCESS_TOKEN_LIFE
            })
            res.json({ device: deviceConfig.DEVICENAME, app: etc.packageJson().name, token: accessToken, username })
        })
        app.get('/users', cors(), verify, (req, res) => {
            let users = this.listUsers();
            let ret = Object.keys(users)
            res.json({ users: ret})
        })
        app.get('/savednetworks', cors(), verify, (req, res) => {
            let networks = this.listSavedNetworks();
            res.json({ networks})
        })
        app.get('/availablenetworks', cors(), verify, async (req, res) => {
            let networks = await this.listAvailbleNetworks();
            res.json({ networks})
        })
        app.post('/login', (req, res) => {
            let params = req.body || {};
            if (!params.username) {
                return res.status(422).json({ error: `username missing` })
            }
            if (!params.password) {
                return res.status(422).json({ error: `password missing` })
            }
            let authenticate = this.authenticateUser(params.username, params.password)
            if (!authenticate) {
                return res.status(401).json({ error: `wrong username or password` })
            }

            let payload = { username: params.username }
            let accessToken = jwt.sign(payload, deviceConfig.ACCESS_TOKEN_SECRET, {
                algorithm: "HS256",
                expiresIn: deviceConfig.ACCESS_TOKEN_LIFE
            })
            res.send({ token: accessToken })
        })
        app.post('/password', (req, res) => {
            let params = req.body || {};
            let accessToken = (req.headers['authorization'] || '').replace(/[B]*[b]*earer /, '')
            let tokenData = jwt.decode(accessToken);
            let userName = tokenData.username;
            let authenticated = this.authenticateUser(userName, params.password);
            if(!authenticated){
                return res.status(422).json({ error: `wrong password` })
            }
            this.removeUser(userName, true);
            this.addUser(userName, params.newPassword);
            res.json({message: 'Password has been changed'})
        })
        app.post('/user', (req, res) => {
            let params = req.body || {};
            let accessToken = (req.headers['authorization'] || '').replace(/[B]*[b]*earer /, '')
            let tokenData = jwt.decode(accessToken);
            let userName = tokenData.username;
            try{
                this.addUser(params.username, params.password)
                return res.json({message: 'User has been added'})
            }catch(error){
                return res.status(422).json({ error: error })
            }
        }) 
        app.delete('/user/:username', (req, res) => {
            try{
                this.removeUser(req.params.username)
                return res.json({message: 'User has been removed'})
            }catch(error){
                return res.status(422).json({ error: error })
            }
            // let params = req.body || {};
            // let accessToken = (req.headers['authorization'] || '').replace(/[B]*[b]*earer /, '')
            // let tokenData = jwt.decode(accessToken);
            // let userName = tokenData.username;
            // try{
            //     this.addUser(params.username, params.password)
            //     return res.json({message: 'User has been added'})
            // }catch(error){
            //     return res.status(422).json({ error: error })
            // }
        })

        app.post('/add', verify, (req, res) => {
        })
        app.get('/', function (req, res) {
            res.sendFile(path.join(__dirname, '/layouts/index.html'));
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
     * Read saved device configuration data, or return the default values
     * @returns {object} - {DEVICENAME, USERS:{USERNAME: PASSWORD}}
     */
    readDeviceConfig() {
        let dirs = this.devices
        let deviceConfig = {};
        let savedDeviceConfig = etc.parseYAML(deviceConfigFileName);
        let deviceConfigInitial = clone(savedDeviceConfig);
        for (let dir of dirs) {
            let filePath = path.join(dir, deviceConfigFileName);
            let configurationRead = etc.readConfigData('yaml', filePath);
            if (configurationRead.DEVICENAME !== undefined) {
                deviceConfig.DEVICENAME = configurationRead.DEVICENAME;
            }
            if (!configurationRead.USERS) {
                configurationRead.USERS = {}
            }
            if (!deviceConfig.USERS) {
                deviceConfig.USERS = {}
            }
            if (Object.keys(configurationRead.USERS).length === 0) {
                configurationRead.USERS = {}
            }
            if (Object.keys(deviceConfig.USERS) === 0) {
                deviceConfig.USERS = {}
            }
            for (let i in configurationRead.USERS) {
                let userName = i
                let password = this.encrypt(configurationRead.USERS[userName]);
                deviceConfig.USERS[userName] = password
            }
            if (configurationRead.DEVICENAME !== undefined) {
                savedDeviceConfig.DEVICENAME = configurationRead.DEVICENAME;
            }
        }
        if (!savedDeviceConfig.USERS) {
            savedDeviceConfig.USERS = {}
        }
        for (let userName in deviceConfig.USERS) {
            savedDeviceConfig.USERS[userName] = deviceConfig.USERS[userName]
        }

        let arraysAreEqual = (arr1, arr2) => arr1.length === arr2.length && !arr1.some((v) => arr2.indexOf(v) < 0) && !arr2.some((v) => arr1.indexOf(v) < 0)
        // save if changes
        if (deviceConfigInitial.DEVICENAME !== savedDeviceConfig.DEVICENAME || !arraysAreEqual(Object.keys(deviceConfigInitial.USERS) || [], Object.keys(savedDeviceConfig.USERS) || [])) {
            etc.save("yaml", deviceConfigFileName, savedDeviceConfig);
        }
        try {
            deviceConfig = etc.parseYAML(deviceConfigFileName)
            if (Object.keys(deviceConfig).length === 0) {
                throw "not found"
            }
        } catch (error) {
            deviceConfig = defaultDeviceConfig
        }
        return deviceConfig
    }


    /**
     * Change device name
     * @param {string} deviceName 
     */
    editDeviceName(deviceName = 'nameless') {
        let deviceConfig = etc.parseYAML(deviceConfigFileName)
        deviceConfig.DEVICENAME = deviceName;
        etc.save("yaml", deviceConfigFileName, deviceConfig);
        return true
    }

    encrypt(password) {
        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(password, salt);
        return hash
    }

    /**
     * create a new user
     * @param {string} username 
     * @param {string} password 
     */
    addUser(username, password) {
        if (!username || !password) {
            throw `missing username or password`
        }
        let deviceConfig = etc.parseYAML(deviceConfigFileName);
        if (!deviceConfig.USERS) {
            deviceConfig['USERS'] = {};
        }
        if (deviceConfig.USERS[username] !== undefined) {
            throw `${username} already exists`
        }
        deviceConfig.USERS[username] = this.encrypt(password);
        etc.save("yaml", deviceConfigFileName, deviceConfig);
        return true;
    }

    /**
     * List Users
     * @returns {object}
     */
    listUsers() {
        let deviceConfig = etc.parseYAML(deviceConfigFileName);
        if (!deviceConfig.USERS) {
            deviceConfig['USERS'] = {};
        }
        return deviceConfig.USERS
    }

    /**
     * Remove a user
     * @param {string} username 
     * @param {boolean} [force] - remove even if only single user is left
     */
    removeUser(username, force = false) {
        if (!username) {
            throw `missing username`
        }
        let users = this.listUsers();
        if(!Object.keys(users).includes(username)){
            throw 'User does not exist!'
        }
        let deviceConfig = etc.parseYAML(deviceConfigFileName);
        if (!deviceConfig.USERS) {
            deviceConfig['USERS'] = {};
        }
        if (Object.keys(deviceConfig.USERS).length <= 1 && !force) {
            throw `Only one user left. Can't remove`
        }
        delete deviceConfig.USERS[username];
        etc.save("yaml", deviceConfigFileName, deviceConfig);
        return true;
    }

    /**
     * Authenticate configuration user
     * @param {string} username 
     * @param {string} password 
     */
    authenticateUser(username, password) {
        if (!username || !password) {
            throw `missing username or password`
        }
        let deviceConfig = etc.parseYAML(deviceConfigFileName);
        if (!deviceConfig.USERS) {
            deviceConfig['USERS'] = {};
        }
        if (Object.keys(deviceConfig.USERS).length === 0) {
            deviceConfig.USERS = defaultDeviceConfig.USERS
        }
        let comparePassword = deviceConfig.USERS[username] || ''
        let autheticate = bcrypt.compareSync(password, comparePassword);
        return autheticate;
    }

    /**
     * mdns service discovery
     */
    async createAdvertisement() {
        let ips = this.getAllLocalExternalIP();
        let appName = etc.packageJson().name;
        let deviceName = this.readDeviceConfig().DEVICENAME;
        let target = ips.map(item => `http://${item}:${this.serverPort}`)
        let response = {
            name: `${appName}-${deviceName}`,
            type: 'SRV',
            data: {
                port: this.serverPort,
                weigth: 0,
                priority: 10,
                target: target.join(',')
            }
        }
        this.mdns.destroy();
        this.mdns = multicastdns();
        this.mdns.on('query', (query) => {
            if (query.questions[0] && query.questions[0].name === `${appName}-wifi-config.local`) {
                // console.log(response)
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
            if (add.length >= 0) { // wait for all partitions on disk to be mounted
                setTimeout(() => {
                    curr = this.getUsb();
                    add = curr.filter(item => !this.devices.includes(item))
                    if (add.length > 0) {
                        this.devices = curr;
                        add.map(mountPoint => this.emit("mounted", mountPoint))
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
        this.readDeviceConfig();
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
            let configurationRead = etc.readConfigData('yaml', filePath);
            let configuration = {};
            let tmpConfiguration = [];
            for (let key in configurationRead) {
                let value = configurationRead[key]
                if (typeof value !== 'object') {
                    let obj = {}
                    obj[key] = value;
                    tmpConfiguration.push(obj)
                } else { // is an object/array.. how to distinguish between an object and an array...
                    for (let innerKey in value) {
                        let innerValue = value[innerKey]
                        if (typeof innerValue !== 'object') { // is a string
                            let tmp = [];
                            try { // is an array
                                tmp = [...value];
                                let obj = {}
                                obj[key] = innerValue;
                                tmpConfiguration.push(obj)
                            } catch (error) { // is an object 
                                tmpConfiguration.push(value)
                            }
                        }
                    }
                }
            }
            for (let i in tmpConfiguration) {
                configuration[i] = tmpConfiguration[i]
            }
            // for (let i in configuration)
            for (let i in configuration) {
                let config = configuration[i]
                if (typeof config === 'object') {
                    config = `${Object.keys(config)}${Object.values(config)}`
                } else {
                    // console.log(key, o)
                    config = `${key}${config}`
                }

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
     * List avaialable networks
     */
    async listAvailbleNetworks(){
        let scannedNetworks = await this.scan();
        scannedNetworks = scannedNetworks.filter(item => item.ssid !== '')
        return scannedNetworks
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