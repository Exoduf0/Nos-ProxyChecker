// and please don't copy my shit... if you want to copy it use fork (: and don't change name 

const net = require('net');
const fs = require('fs');
const async = require('async');
var colors = require('colors/safe');

function readProxiesFromFile(filePath) {
  const proxies = fs.readFileSync(filePath, 'utf-8')
    .split('\n')
    .filter((proxy, index, self) => {
      return self.indexOf(proxy) === index;
    });

async.each(proxies, function(proxy, callback) {
    const [ip, port] = proxy.split(':');

checkProxyType(ip, port, function(err, proxyType) {
  if (err) {
    try {
      return callback();
    }
    catch (e) {
      // we don't like errors
    }
  }

  if (proxyType) {
    fs.appendFileSync(`${proxyType}.txt`, `${ip}:${port}\n`);
    console.log(colors.green('Valid:') + ` ${ip}:${port} [${proxyType}]`);
  } 
  try {
    callback();
  }
  catch (e) {
    // we don't like errors
  }
});
}, function(err) {
    if (err) {
      // we don't like errors
    } else {
      console.log(colors.green('Finished reading proxies.'));
    }
  });
}

function checkProxyType(ip, port, callback) {

  const socket = net.connect({ host: ip, port: port });

// if proxy checker don't work change hosts and add some hah all of these not counting google and github are just dstat sites from dstat.cc (don't add protected sites like cloudflare)

const hosts = ['google.com', 'github.com', '88.198.14.11', '50.7.232.90', '88.198.14.11', '88.198.48.45', '51.15.25.108', 'zetvideo.net', 'file.cunhua.today', 'ogcdn.mom', 's2-n10-nl-cdn.eporner.com', 's3-n10-nl-cdn.eporner.com', 's4-n10-nl-cdn.eporner.com', 'facebook.com']; 

socket.on('connect', function () {
  const randomIndex = Math.floor(Math.random() * hosts.length);
  const randomHost = hosts[randomIndex];

  socket.write(`GET / HTTP/1.1\r\nHost: ${randomHost}\r\n\r\n`);
});

socket.on('data', function (chunk) {
    const response = chunk.toString().split('\r\n');

if (response[0].includes('HTTP/1.')) {
  const protocol = response[0].split(' ')[0];
  if (protocol === 'HTTP/1.0') {
    callback(null, 'http');
  } else if (protocol === 'HTTP/1.1') {
    callback(null, 'https');
  } else {
    callback(null, false);
  }
} else if (response[0].includes('SOCKS')) {
  if (response[0] === 'SOCKS4') {
    callback(null, 'socks4');
  } else if (response[0] === 'SOCKS5') {
    callback(null, 'socks5');
  } else {
    callback(null, false);
  }
} else {
  callback(null, false);
}

socket.end();
});

socket.on('error', function (err) {
    callback(err, false);
  });
}

readProxiesFromFile('proxy.txt');

