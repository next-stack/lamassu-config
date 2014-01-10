// TODO: We need 2 separate configs: RO config and user config

module.exports = {
  brain: {
    qrTimeout: 60000,
    goodbyeTimeout: 2000,
    billTimeout: 60000,
    completedTimeout: 60000,
    networkTimeout: 20000,
    machineInfoPath: '/usr/local/share/sencha/config/machineinfo.json',
    secureConfigPath: '/usr/local/share/sencha/config/local.conf',
    infoPath: '/usr/local/share/sencha/config/info.json',
    idleTime: 100000,
    checkIdleTime: 20000,
    maxProcessSize: 104857600,
    childResetInterval: 300000
  },
  wifi: {
    connectionTimeout: 20000, checkInterval: 1000,
    scanInterval: 5000, minSignal: -100, 
    maxSignal: -50, truncateLength: 16,
//    wpa: {socket: '/tmp/wpa_supplicant'}
    wpa: {socket: null}
  },
  id003: {
    timeout: 60000,
    rs232: {
//      device: '/dev/ttyUSB0'
      device: '/dev/pts/9'
    }
  },
  qrScanner: {device: '/dev/video2'},
  updater: {
    caFile: '/usr/local/share/sencha/certs/lamassu.pem',
    certFile: '/usr/local/share/sencha/keys/client.pem',
    keyFile: '/usr/local/share/sencha/keys/client.key',
    port: 8000,
    host: 'updates.lamassu.is',
    downloadDir: '/tmp/download',
    extractDir: '/tmp/extract',
    updateInterval: 30000,
    deathInterval: 600000,
    extractor: {
      lamassuPubKeyFile: '/usr/local/share/sencha/pubkeys/lamassu.pub.key',
      sigAlg: 'RSA-SHA256',
      hashAlg: 'sha256'
    }
  },
  trader: {
    tickerInterval: 60000,
    fastTickerInterval: 5000,
    balanceInterval: 60000,
    tradeInterval: 10000,
    retryInterval: 5000,
    retries: 3,
    lowBalanceMargin: 1.05,
    transactionFee: 10000,
    commission: 1.00,
    tickerDelta: 0,   // was 500 satoshis
    tickerProvider: 'bitpay',
    transferProvider: 'blockchain',
    providers: {
      mtgox: {
        minimumTrade: 1000000,
      },
      bitstamp: {
        customerId: null,
        password: null
      }
    }
  }
};
