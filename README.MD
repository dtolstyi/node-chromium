# node-chromium [![Build Status](https://travis-ci.org/dtolstyi/node-chromium.svg?branch=master)](https://travis-ci.org/dtolstyi/node-chromium) [![XO code style](https://img.shields.io/badge/code_style-XO-blue.svg)](https://github.com/sindresorhus/xo) [![npm version](https://badge.fury.io/js/chromium.svg)](https://badge.fury.io/js/chromium) [![Platforms](https://img.shields.io/badge/platforms-Win/Linux/Mac-lightgrey.svg)](https://github.com/dtolstyi/node-chromium)
> Chromium binaries for your NodeJS project

**node-chromium** allows you to easily add [Chromium](https://www.chromium.org/) binaries to your project and use it for automation, testing, web scraping or just for fun.

## Why Chromium?
[Chromium](https://www.chromium.org/) is an open-source web browser developed and maintained by The Chromium Project. Google Chrome, also released in 2008, is a proprietary web browser developed and maintained by Google. The reason why Chrome and Chromium are tied to each other is that Chome borrows Chromium’s source code.  
The main benefit of using Chromium is that it **doesn't** include all the proprietary modifications made by Google, thus it's more lightweight and more suitable for automation purposes.  
You can see full list of differences in [Fossbytes article](https://fossbytes.com/difference-google-chrome-vs-chromium-browser/).

## Requirements

Starting from version `2.2.0` `node-chromium` is tested against and supports Node.js LTS and latest stable releases  
Versions `2.0.0` - `2.1.2` support Node.js 7+  
If you need to use older versions of Node.js try `node-chromium 1.x.x` releases.

## Usage
Depending on your needs, you can install module into **devDependencies** (`--save-dev`) or production **dependencies** (`--save`)

```
npm install --save chromium
```

During the installation process **node-chromium** will find the latest suitable build for your platform, download it and extract into libraries folder. As soon as installation is finished, you are ready to use Chromium in your project:

```js
const chromium = require('chromium');
const {execFile} = require('child_process');

execFile(chromium.path, ['https://google.com'], err => {
	console.log('Hello Google!');
});
```

### Proxy Configuration
When downloading the chromium binary **node-chromium** will use the proxy configured for `npm` to establish HTTP(S) connections. The proxy used by `npm` can be configured using 
```
npm config set proxy http://<username>:<password>@<the.proxy.hostname>:<port>
npm config set https-proxy http://<username>:<password>@<the.proxy.hostname>:<port
npm config set no-proxy localhost,127.0.0.1,example.org
```

Additionally proxy settings found in the environment variables `HTTP_PROXY`, `HTTPS_PROXY` and `NO_PROXY` will be used if they are not defined in the `.npmrc` file.

### Install a concrete revision
If you want to specify the revision of Chromium to be installed, just set the environment variable `NODE_CHROMIUM_REVISION` to the number of the revision you want to install, as in:
```shell script
export NODE_CHROMIUM_REVISION=729994
```

Note - may also be set in .npmrc like so:

```ini
node_chromium_revision=729994
```

### Use a Download Mirror
You may download a specific revision from an alternate download host using the environment variable `NODE_CHROMIUM_DOWNLOAD_HOST`, for example:

```bash
export NODE_CHROMIUM_REVISION=737027
export NODE_CHROMIUM_DOWNLOAD_HOST=https://npm.taobao.org/mirrors/chromium-browser-snapshots/

# If running on Linux x64 this will download binary from:
# https://npm.taobao.org/mirrors/chromium-browser-snapshots/Linux_x64/737027/chrome-linux.zip?alt=media
```

Notes on `NODE_CHROMIUM_DOWNLOAD_HOST`:

* The default download host is `https://www.googleapis.com/download/storage/v1/b/chromium-browser-snapshots/o/`
* Mirrors are expected to host binaries in the structure: `<NODE_CHROMIUM_DOWNLOAD_HOST>/<PLATFORM_ARCHITECTURE>/<REVISION>/<OS_CHROMIUM_FILE_NAME>.zip?alt=media` for example see the taobao mirror [chromium-browser-snapshots](https://npm.taobao.org/mirrors/chromium-browser-snapshots/).
* May also be set in .npmrc like so:

```ini
node_chromium_download_host=https://npm.taobao.org/mirrors/chromium-browser-snapshots/
node_chromium_revision=737027
```

## Selenium WebDriver Headless (without UI) tests
It's extremely easy to use **node-chromium** with **selenium-webdriver** to perform e2e tests without spawning browser UI.
First, install all dependencies

```
npm install --save chromium chromedriver selenium-webdriver
```

After the installation is finished, create simple script that opens Google Search home page and takes it's screenshot in headless mode.

```js
const fs = require('fs');
const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromium = require('chromium');
require('chromedriver');

async function start() {
    let options = new chrome.Options();
    options.setChromeBinaryPath(chromium.path);
    options.addArguments('--headless');
    options.addArguments('--disable-gpu');
    options.addArguments('--window-size=1280,960');

    const driver = await new webdriver.Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
		
    await driver.get('http://google.com');
    console.log('Hello Google!');
    await takeScreenshot(driver, 'google-start-page');
    
    await driver.quit();
}

async function takeScreenshot(driver, name) {
	await driver.takeScreenshot().then((data) => {
        fs.writeFileSync(name + '.png', data, 'base64');
        console.log('Screenshot is saved');
    });
}

start();
```

### Cache Downloaded Binaries
By default downloaded chromium binaries are cached in the appropriate cache directory for your operating system.

You may override the cache path by setting the `NODE_CHROMIUM_CACHE_PATH` environment variable to a directory path, for example:

```bash
export NODE_CHROMIUM_CACHE_PATH=/path/to/cache/dir/

# or in .npmrc like so:
# node_chromium_cache_path=/path/to/cache/dir/
```

You may disable caching by setting `NODE_CHROMIUM_CACHE_DISABLE` to `true`:

```bash
export NODE_CHROMIUM_CACHE_DISABLE=true

# or in .npmrc like so:
# node_chromium_cache_disable=true
```

### Skip Automatic Chromium Install

Chromium will ordinarily be installed when you exectute `npm install` however you may wish to skip this step if you are going to defer installation and perform it programatically at a later stage. Below is an example of how to do so.

```bash
export NODE_CHROMIUM_SKIP_INSTALL=true

# or in .npmrc like so:
# node_chromium_skip_install=true
```

Then install it programatically when you need it:

```js
chromium.install().then(function() {
    // do stuff...
});
```
## Contributors
<table>
  <tr style="background: #ffec86">
    <td align="center" style="border: 1px solid gold"><a href="https://github.com/ricksbrown"><img src="https://avatars0.githubusercontent.com/u/4993735?s=460&u=2920cd32369fa4767be1c4ed86c8996807b7977a&v=4" width="100px;" alt=""/><br /><sub><b>Rick Brown</b></sub></a></td>
  </tr>
</table>
<table>
  <tr>
    <td align="center"><a href="https://github.com/aschlosser-tf"><img src="https://avatars2.githubusercontent.com/u/32895827?s=460&v=4" width="100px;" alt=""/><br /><sub><b>Alex Schlosser</b></sub></a></td>
    <td align="center"><a href="https://github.com/psociety"><img src="https://avatars3.githubusercontent.com/u/29523682?s=460&u=51a0fc950ef63ebf7de73701454da97b29c4f9be&v=4" width="100px;" alt=""/><br /><sub><b>psociety</b></sub></a></td>
    <td align="center"><a href="https://github.com/dhAlcojor"><img src="https://avatars3.githubusercontent.com/u/567687?s=460&u=4fe23913c4a02531192701bc5ff393a296f38ac2&v=4" width="100px;" alt=""/><br /><sub><b>Daniel Hernández Alcojor</b></sub></a></td>
    <td align="center"><a href="https://github.com/rcooney"><img src="https://avatars3.githubusercontent.com/u/5251278?s=460&v=4" width="100px;" alt=""/><br /><sub><b>Ryan Cooney</b></sub></a></td>
    <td align="center"><a href="https://github.com/amilajack"><img src="https://avatars1.githubusercontent.com/u/6374832?s=460&u=8e2f43ba7405c7d991351d95854ec1c64e7e4d52&v=4" width="100px;" alt=""/><br /><sub><b>Amila Welihinda</b></sub></a></td>
    <td align="center"><a href="https://github.com/Timon0"><img src="https://avatars3.githubusercontent.com/u/26453313?s=460&v=4" width="100px;" alt=""/><br /><sub><b>Timon Kurmann</b></sub></a></td>
    <td align="center"><a href="https://github.com/Eghizio"><img src="https://avatars.githubusercontent.com/u/32049761?v=4" width="100px;" alt=""/><br /><sub><b>Jakub Wąsik</b></sub></a></td>
  </tr>
</table>

## License
MIT
