const wifi = require('../index')

it("Should emit event", () => {
    wifi.once('wifi', (msg) => {
        process.exit();
    })
})