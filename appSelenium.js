const axios = require("axios")
const cheerio = require("cheerio")
const fs = require("fs")
const { argv } = require("process")
var originalSite = fs.createWriteStream("originalSite.txt", { flags: "a" })
var otherSite = fs.createWriteStream("otherSite.txt", { flags: "a" })
const LinkedList = require("./linkedlist")
const selenium = require("./selenium")

const runCrawl = async (uri) => {
  if (!uri.endsWith("/")) {
    uri = uri + "/"
  }
  const queue = new LinkedList()
  const seen = {}
  const data = await selenium(uri)
  const $ = cheerio.load(data)
  $("a").map((i, el) => {
    if (!seen[el.attribs.href] && el.attribs.href) {
      if (el.attribs.href.startsWith(uri)) {
        originalSite.write(el.attribs.href + "\n")
        queue.push(el.attribs.href)
        seen[el.attribs.href] = true
      } else {
        if (!el.attribs.href.startsWith("https") && !el.attribs.href.startsWith("http")) {
          originalSite.write(uri + el.attribs.href + "\n")
          queue.push(uri + el.attribs.href)
          seen[el.attribs.href] = true
        } else {
          otherSite.write(el.attribs.href + "\n")
          seen[el.attribs.href] = true
        }
      }
    }
  })
  while (queue.length) {
    try {
      const { val } = queue.unshift()
      const dataMap = await selenium(val)
      const $ = cheerio.load(dataMap)
      $("a").map((i, el) => {
        if (!seen[el.attribs.href] && el.attribs.href) {
          if (el.attribs.href.startsWith(uri)) {
            originalSite.write(el.attribs.href + "\n")
            queue.push(el.attribs.href)
            seen[el.attribs.href] = true
          } else {
            if (!el.attribs.href.startsWith("https") && !el.attribs.href.startsWith("http")) {
              originalSite.write(uri + el.attribs.href + "\n")
              queue.push(uri + el.attribs.href)
              seen[el.attribs.href] = true
            } else {
              otherSite.write(el.attribs.href + "\n")
              seen[el.attribs.href] = true
            }
          }
        }
      })
    } catch (error) {}
  }
}
runCrawl(argv[2])
