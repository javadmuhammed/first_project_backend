
class NodeItem {
    constructor(value) {
        this.value = value;
        this.next = null;
        this.prev = null;
    }
}

class RouterLinkedList {

    constructor() {
        this.list;
        this.tile = null;
        this.head = null;
    }

    addItem(value) {
        let node = new NodeItem(value);
        if (!node) {
            this.head = node;
            this.tile = node;
        } else {
            node.next = node;
            this.tile = node;
        }
    }

    isContainValue(number) {

        let current = this.head;
        let index = 0;

        while (current) {
            if (current.value == number || current.value > number) {
                return index;
            }
            index++;
            current = current.next;
        }

        
    }

    display() {
        let head = this.head;
        while (head) {
            console.log(head.value);
            head = head.next;
        }
    }
}

module.exports = RouterLinkedList;