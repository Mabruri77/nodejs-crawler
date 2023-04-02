class Node {
  constructor(data) {
    this.val = data
    this.next = null
  }
}

class LinkedList {
  constructor() {
    this.head = null
    this.tail = null
    this.length = 0
  }
  push(val) {
    const newNode = new Node(val)
    if (!this.head) {
      this.head = newNode
      this.tail = newNode
    } else {
      this.tail.next = newNode
      this.tail = newNode
    }
    this.length++
  }
  unshift() {
    const next = this.head.next
    const temp = this.head
    this.head = next
    this.length--
    return temp
  }
}

module.exports = LinkedList
