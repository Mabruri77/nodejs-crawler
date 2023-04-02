const axios = require("axios")
const cheerio = require("cheerio")
const fs = require("fs")
const { argv } = require("process")
var originalSite = fs.createWriteStream("originalSite.txt", { flags: "a" })
var otherSite = fs.createWriteStream("otherSite.txt", { flags: "a" })
const LinkedList = require("./linkedlist")
const runCrawl = async (uri) => {
  if (!uri.endsWith("/")) {
    uri = uri + "/"
  }
  const stack = new LinkedList()
  const seen = {}
  const { data, status } = await axios.get(uri, {
    withCredentials: true,
  })
  const $ = cheerio.load(data)
  $("a").map((i, el) => {
    if (!seen[el.attribs.href] && el.attribs.href) {
      if (el.attribs.href.startsWith(uri)) {
        stack.push(el.attribs.href)
        seen[el.attribs.href] = true
      } else {
        if (!el.attribs.href.startsWith("https") && !el.attribs.href.startsWith("http")) {
          stack.push(uri + el.attribs.href)
          seen[el.attribs.href] = true
        } else {
          otherSite.write(el.attribs.href + "\n")
          seen[el.attribs.href] = true
        }
      }
    }
  })
  while (stack.length) {
    try {
      const { val } = stack.unshift()
      const { data, status } = await axios.get(val, {
        withCredentials: true,
      })
      const $ = cheerio.load(data)
      $("a").map((i, el) => {
        if (!seen[el.attribs.href] && el.attribs.href) {
          if (el.attribs.href.startsWith(uri)) {
            stack.push(el.attribs.href)
            seen[el.attribs.href] = true
          } else {
            if (!el.attribs.href.startsWith("https") && !el.attribs.href.startsWith("http")) {
              stack.push(uri + el.attribs.href)
              seen[el.attribs.href] = true
            } else {
              otherSite.write(el.attribs.href + "\n")
              seen[el.attribs.href] = true
            }
          }
        }
      })
      originalSite.write(val + "\n")
    } catch (error) {}
  }
}
runCrawl(argv[2])
