const { Builder, By, Key, until } = require("selenium-webdriver")
const chrome = require("selenium-webdriver/chrome")
const options = new chrome.Options()

options.addArguments("user-data-dir=/home/ruri/.config/google-chrome")
options.addArguments("profile-directory=Default")
options.addArguments("--headless")

async function example(url) {
  let driver = await new Builder().forBrowser("chrome").setChromeOptions(options).build()

  await driver.get(url)
  const data = await driver.getPageSource()
  await driver.quit()
  return data
}

module.exports = example
