const mdns = require('multicast-dns')()
const etc = require('node-etc');
const appName = etc.packageJson().name;

mdns.on('response', function(response) {
  console.log('got a response packet:', response.answers)
  console.log(`server is running on ${response.answers[0].target}`)
})

console.log(`${appName}-wifi-config.local`)
mdns.query({
  questions:[{
    name: `${appName}-wifi-config.local`, // appName is the name of your application
    type: 'A'
  }]
})