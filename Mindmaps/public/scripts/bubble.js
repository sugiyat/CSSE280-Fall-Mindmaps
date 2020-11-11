
let bubbles = document.getElementsByClassName("bubble");
let isDragging = false;
let isLongPress = false;
var pressTimer;

createBubbles(bubbles);
addBubbleGestures(bubbles);

function createBubbles(bubbles) {
    for(i = 0; i < bubbles.length; i++) {
        const diameter = bubbles[i].offsetWidth + 16;
        bubbles[i].style.width = `${diameter}px`;
        bubbles[i].style.height = `${diameter}px`;
    }
}


function addBubbleGestures(bubbles) {
    var bubbleX = 0, bubbleY = 0, cursorX = 0, cursorY = 0;
    for(i = 0; i < bubbles.length; i++) {
        let bubble = bubbles[i];
        const maxWidth = document.getElementById("bubblePage").offsetWidth - bubble.offsetWidth;
        const maxHeight = document.getElementById("bubblePage").offsetHeight - bubble.offsetWidth;

        bubble.onmousedown = (downEvent) => {
            downEvent = downEvent || window.event;
            downEvent.preventDefault();

            this.isDragging = false;
            this.isLongPress = false;

            cursorX = downEvent.clientX;
            cursorY = downEvent.clientY;

            document.onmouseup = () => {
                document.onmouseup = null;
                document.onmousemove = null;
            };

            document.onmousemove = (moveEvent) =>  {
                moveEvent = moveEvent || window.event;
                moveEvent.preventDefault();
    
                this.isDragging = true;
    
                bubbleX = cursorX - moveEvent.clientX;
                bubbleY = cursorY - moveEvent.clientY;
                cursorX = moveEvent.clientX;
                cursorY = moveEvent.clientY;
                if ((bubble.offsetTop - bubbleY >= 0) && (bubble.offsetLeft - bubbleX >= 0) && (bubble.offsetLeft - bubbleX <= maxWidth) && (bubble.offsetTop - bubbleY <= maxHeight)) {
                    bubble.style.top = (bubble.offsetTop - bubbleY) + "px";
                    bubble.style.left = (bubble.offsetLeft - bubbleX) + "px";
                }
            };

            pressTimer = window.setTimeout(function() {
                if (!this.isDragging) {
                    console.log("Long Press");
                    this.isLongPress = true;

                    //document.getElementById("editBubbleDialogue").modal(focus);
                    $('#editBubbleDialogue').modal('show');
                }
                
            },1500);
            
        };

        bubble.onmouseup = (e) =>  {
            clearTimeout(pressTimer);
            
            if (!this.isDragging && !this.isLongPress && e.button === 0) {
                console.log('Press');

                window.location.href = `/document.html`;
                window.location.href = `/document.html?id=${document.id}`;
            }

            this.isLongPress = false;
            this.isDragging = false;
        };
    }
}