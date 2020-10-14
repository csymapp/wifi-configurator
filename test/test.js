var wifi = require('../index')(false)

it("Should emit event", () => {
    wifi.once('wifi', (msg) => {
        wifi = {};
        return true
        // process.exit();
    })
})