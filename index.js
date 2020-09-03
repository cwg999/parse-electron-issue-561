const express = require('express');
const http = require('http')
const https = require('https')
const path = require('path')
const fs = require('fs')

const app = express();
const serveStatic = require('serve-static')
const bodyParser = require('body-parser')
  
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())


const ParseServer = require('parse-server').ParseServer;
// var ParseDashboard = require('parse-dashboard');

const electron = require('electron')

const user = '';
const pass = '';
const mongouser = (user&&pass) ? `${user}:${password}@` : ''
const host = 'localhost'
const port = 3000;
const serverHost = 'http://'+host+':'+port;
const parseServerMount = '/parse'
const db = 'test'
const startUpUrl = serverHost+'/'

const parseConfig = {
  enableSingleSchemaCache:    true,
  // databaseURI:                `mongodb+srv://${mongouser}${host}/${db}?retryWrites=true&w=majority`,
  databaseURI:                'mongodb://localhost:27017/test',
  cloud:                      __dirname + '/cloud.js',
                              // length 40, crypto.randomBytes(20).toString('hex')
  appId:                      '4f43186de482c81ae40c5ec45ddcae400ec0cee3', 
  masterKey:                  '5a68e8af74160e119d0ce31db1ce5fc38f3e8812', 
  javascriptKey:              'b5b66b88142962eaa05e3688bf53a03c8e20885f',
  serverURL:                  serverHost+parseServerMount,
  databaseOptions: { maxTimeMS: 10000 },
}

const parseServer = new ParseServer(parseConfig);

app.use(parseServerMount, parseServer)



app.get('/', (req, res) => {
  console.log('here');
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/index-html.js', (req, res) => {
  res.sendFile(path.join(__dirname + '/index-html.js'));
});

app.use('/js/', serveStatic(__dirname+'/node_modules/axios/dist/'));


class TestClass extends Parse.Object {
  constructor(attr, options = {}) {
    super('TestClass', attr, options)
    this.useMasterKey = options.useMasterKey
    this.sessionToken = options.sessionToken
  }
}

class TestClassSub extends Parse.Object {
  constructor(attr, options = {}) {
    super('TestClassSub', attr, options)
    this.useMasterKey = options.useMasterKey
    this.sessionToken = options.sessionToken
  }
  static async _SetState(oTestClass,{Test=false,Action = ''}){
    const {sessionToken, useMasterKey } = this;
    const serialNo = oTestClass.get('SerialNo')
    if(serialNo===undefined){
      throw new Error('TestClass has no SerialNo')
    }
    const qTestClassSub = await new Parse.Query(TestClassSub)
    qTestClassSub.equalTo('SerialNo', serialNo)

    let oSub = await qTestClassSub.first({ sessionToken, useMasterKey })
    if (!oSub) {
      oSub = new TestClassSub()
      oSub.set('SerialNo', serialNo)
    }
    oSub.set('Action', Action)

    await oSub.save(null, {
      sessionToken,
      useMasterKey,
    })
    if (!oTestClass.get('TestClassSub')) {
      // Then need to set pointer data
      oTestClass.set('TestClassSub', oSub)
      try {
        await oTestClass.save(null, { sessionToken, useMasterKey })
      } catch (err) {
        console.error(
          'TestClass does not have TestClassSub Pointer, but it failed to save.',
          err
        )
      }
    }

  }
  static async Test(oTestClass, { sessionToken, useMasterKey }){
    await this._SetState(
      oTestClass,
      {
        Test: true,
        Action: 'Test',
      },
      { sessionToken, useMasterKey }
    )
  }
  static async Test2(oTestClass, { sessionToken, useMasterKey }){
    await this._SetState(
      oTestClass,
      {
        Test2: true,
        Action: 'Test2',
      },
      { sessionToken, useMasterKey }
    )
  }
}

const randomBytes = require('util').promisify(require('crypto').randomBytes);

app.listen(port,function(){
  console.log(`Express/ParseServer listening on port ${port}`)

  process.env.PARSE_DB_APP_URL = parseConfig.serverURL;
  // process.env.PARSE_DB_APP_JSKEY = '';
  process.env.PARSE_DB_APP_ID = parseConfig.appId;
  process.env.PARSE_DB_APP_JSKEY = parseConfig.javascriptKey;
  process.env.PARSE_DB_APP_MASTERKEY = parseConfig.masterKey;
  const Parse = require('./m-parse')

  

  app.post('/api/parse/TestClass', async function(req,res,next){
    try{
      const o = new Parse.Object('TestClass',req.body.attr)
      const serial = (await randomBytes(40)).toString('hex')
      o.set('SerialNo', serial)
      await o.save(null, {useMasterKey:true});
      res.json(o);
    }catch(err){
      console.error('POST /api/parse/TestClass Error: ' ,err)
      res.status(500).json({
        status:500,
        errorMessage:err.message || 'A server error occurred'
      })
    }
  })

  app.get('/api/parse/TestClass/:id', async function(req,res,next){
    try{
      const {id} = req.params;
      const q = new Parse.Query('TestClass')
      q.equalTo("objectId",id)
      q.include('TestClassSub');
      const o = await q.first({useMasterKey:true})
      res.json(o);
    }catch(err){
      console.error('GET /api/parse/TestClass Error: ' ,err)
      res.status(500).json({
        status:500,
        errorMessage:err.message || 'A server error occurred'
      })
    }
  })

  app.post('/api/parse/TestClassSub/static/:fn', async function(req,res,next){
    try{
      const { fn } = req.params
      let o = req.body;
      o = new TestClass(o,{sessionToken:undefined, useMasterKey:true});
      await o.fetch({sessionToken:undefined,useMasterKey:true});
      await TestClassSub[fn](o,{sessionToken:undefined,useMasterKey:true});
      res.json({completed:o.id});
    }catch(err){
      console.error('POST /api/parse/TestClass Error: ' ,err)
      res.status(500).json({
        status:500,
        errorMessage:err.message || 'A server error occurred'
      })
    }
  })

  
  function startElectron(){
    try{
      /*
        ** Electron
      */
      let win = null // Current window
  
      const app = electron.app
  
      const newWin = async () => {
        win = new electron.BrowserWindow({
          // https://www.electronjs.org/docs/tutorial/security#why
          // Do not use nodeIntegration, nodeIntegrationInWorker
          icon: path.join(__dirname, '../static/icon.png'),
        })
        win.maximize()
        win.on('closed', () => (win = null))
        return win.loadURL(startUpUrl)
      }
      const readyCheck = setInterval(() => {
        if (!app.isReady()) {
          console.log('Not ready')
        } else {
          console.log('Ready!')
          clearInterval(readyCheck)
          newWin()
        }
      }, 1000)
  
      // ISSUES.MD#3
      // if you find this is not loading for some reason,
      // https://stackoverflow.com/questions/57614066/electron-app-onready-never-being-called-and-electron-window-never-showing
      // May be your answer (delete %appdata%/[project])
      // Might just need to delete "DevTool Extensions" file
      // app.on('ready', newWin)
  
      app.on('window-all-closed', () => {
        app.quit()
      })
      app.on('activate', () => {
        win === null && newWin()
      })
    } catch (mainErr) {
      console.error('Main Program Exception:', mainErr)
    }
  }
  if(process.env.START_ELECTRON){
    startElectron();
  }

})

