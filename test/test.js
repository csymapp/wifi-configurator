const wifi = require('../index')(false)
const cryptoRandomString = require('crypto-random-string');


it("Should emit event", () => {
    wifi.once('wifi', (msg) => {
        wifi = {};
        return true
        // process.exit();
    })
})

it("Should change device name", () => {
    let deviceName = 'new Name';
    wifi.editDeviceName(deviceName);
    // setTimeout(() => {
    //     if (wifi.readDeviceConfig().DEVICENAME !== deviceName) {
    //         throw 1
    //     }
    // }, 1000)
})

let userName = cryptoRandomString({ length: 10, type: 'alphanumeric' });
let password = cryptoRandomString({ length: 16, type: 'alphanumeric' });
let userName1 = cryptoRandomString({ length: 10, type: 'alphanumeric' });

it("Should add, list users", () => {
    wifi.addUser(userName, password);
    wifi.addUser(userName1, password);
    let users = wifi.listUsers();
    if (users[userName] === undefined || users[userName1] == undefined) {
        throw 1
    }
})

it("Should authenticate users", () => {
    if (!wifi.authenticateUser(userName, password) || !wifi.authenticateUser(userName1, password)) {
        throw new Error(`authentication error`);
    }
})
it("Should remove users", () => {
    wifi.removeUser(userName)
    wifi.removeUser(userName1, true)
    users = wifi.listUsers();
    if (users[userName] !== undefined || users[userName1] !== undefined) {
        throw 1
    }
})
