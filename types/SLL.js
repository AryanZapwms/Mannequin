class Node{
    constructor(data){
        this.data = data;
        this.next = null;
    }
}


class SLL{
    constructor(){
        this.head = null;
    }


    insertAtHead(data){
        let newNode = new Node(data);
        newNode.next =  this.head;
        this.head =  newNode;
    }

    insertAtTail(data){
        let newNode = new Node(data);
        if(!this.head){
            this.head = newNode;
            return;
        }

        let current =  this.head;
        while(current.next){
            current =  current.next;
        }
        current.next =  newNode;
    }

    printList(){
        let current =  this.head;
        while(current){
            console.log(current.data + "->");
            current =  current.next;
        }
    }


}

const list = new SLL();
list.insertAtHead(10);
list.insertAtHead(20);
list.insertAtTail(30);
list.insertAtTail(40);
list.printList();