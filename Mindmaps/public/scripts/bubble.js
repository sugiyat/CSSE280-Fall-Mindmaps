

createBubbles(document.getElementsByClassName("bubble"));
dragBubble(document.getElementsByClassName("bubble"));

function createBubbles(bubbles) {
    for(i = 0; i < bubbles.length; i++) {
        const diameter = bubbles[i].offsetWidth + 16;
        bubbles[i].style.width = `${diameter}px`;
        bubbles[i].style.height = `${diameter}px`;
    }
}

function dragBubble(bubbles) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    for(i = 0; i < bubbles.length; i++) {
        let bubble = bubbles[i];
        const maxWidth = document.getElementById("bubblePage").offsetWidth - bubble.offsetWidth;
        const maxHeight = document.getElementById("bubblePage").offsetHeight - bubble.offsetWidth;
        bubble.onmousedown = (e1) => {
            e1 = e1 || window.event;
            e1.preventDefault();
            
            pos3 = e1.clientX;
            pos4 = e1.clientY;

            document.onmouseup = () => {
                document.onmouseup = null;
                document.onmousemove = null;
            };


            document.onmousemove = (e2) => {
                e2 = e2 || window.event;
                e2.preventDefault();
                
                pos1 = pos3 - e2.clientX;
                pos2 = pos4 - e2.clientY;
                pos3 = e2.clientX;
                pos4 = e2.clientY;
                if ((bubble.offsetTop - pos2 >= 0) && (bubble.offsetLeft - pos1 >= 0) && (bubble.offsetLeft - pos1 <= maxWidth) && (bubble.offsetTop - pos2 <= maxHeight)) {
                    bubble.style.top = (bubble.offsetTop - pos2) + "px";
                    bubble.style.left = (bubble.offsetLeft - pos1) + "px";
                }

                console.log("top:", bubble.style.top);
                console.log("left:",bubble.style.left);
            };
        };
    }
}