/**
 * @fileoverview
 * Provides the JavaScript interactions for all pages.
 *
 * @author 
 * Mory Chen and Taisuke Sugiyama
 */

/** namespace. */

var rhit = rhit || {};

/** globals */


rhit.uid = "";


rhit.FB_COLLECTION_BUBBLES = "Bubbles";
rhit.FB_COLLECTION_MINDMAPS = "Mindmaps";
rhit.FB_COLLECTION_USERS = "Users";

rhit.FB_KEY_MINDMAPS_TITLE = "mindmapTitle";
rhit.FB_KEY_MINDMAPS_DESCRIPTION = "mindmapDesc";
rhit.FB_KEY_MINDMAPS_AUTHOR = "mindmapAuthor";
rhit.FB_KEY_MINDMAPS_PARENTFOLDER = "parentFolderID";
rhit.FB_KEY_MINDMAPS_TIMESTAMP = "lastTouched";
rhit.FB_KEY_MINDMAPS_ISTRASH = "isTrash"

rhit.FB_KEY_BUBBLE_DOCUMENT = "document";
rhit.FB_KEY_BUBBLE_NAME = "name";
rhit.FB_KEY_BUBBLE_USER_ID = "bubbleUserID";
rhit.FB_KEY_BUBBLE_MINDMAP_ID = "bubbleMindmapID";
rhit.FB_KEY_BUBBLE_PARENT_ID = "parentID";
rhit.FB_KEY_BUBBLE_XPOS = "xPos";
rhit.FB_KEY_BUBBLE_YPOS = "yPos";



rhit.fbBubbleManager = null;
rhit.fbMindmapManager = null;
rhit.TrashBagPageController = null;

function htmlToElement(html) {
	var template = document.createElement("template");
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}

rhit.MindMap = class {
	constructor(id, title, description, author, isTrash, parentFolderID) {
		this.id = id;
		this.title = title;
		this.description = description;
		this.author = author;
		this.isTrash = isTrash;
		this.parentFolderID = parentFolderID;
	}

}

rhit.FbMindmapManager = class {

	constructor(uid) {
		console.log("created FbMindmapManager");
		this._uid = uid;
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_MINDMAPS);
		this._unsubsribe = null;
	}

	add(title, description) {
		console.log(`title: ${title}`);
		console.log(`description: ${description}`);

		this._ref.add({
			[rhit.FB_KEY_MINDMAPS_TITLE]: title,
			[rhit.FB_KEY_MINDMAPS_DESCRIPTION]: description,
			[rhit.FB_KEY_MINDMAPS_AUTHOR]: this._uid,
			[rhit.FB_KEY_MINDMAPS_ISTRASH]: false,
			[rhit.FB_KEY_MINDMAPS_TIMESTAMP]: firebase.firestore.Timestamp.now(),
		})
		.then(docRef => {
			console.log("Mindmap added with ID: ", docRef.id);
		})
		.catch(function (error) {
			console.error("Error adding mindmap: ", error);
		});


	}
	beginListening(changeListener) {
		let query = this._ref.orderBy(rhit.FB_KEY_MINDMAPS_TIMESTAMP, "desc").limit(50);
		if (this._uid) {
			query = query.where(rhit.FB_KEY_MINDMAPS_AUTHOR, "==", this._uid);
		}


		this._unsubsribe = query.onSnapshot((querySnapshot) => {
			console.log("Mindmap update!");

			this._documentSnapshots = querySnapshot.docs;
			changeListener();
		})
	}
	stopListening() {
		this._unsubsribe();
	}
	// delete(id) { }
	get length() {
		return this._documentSnapshots.length;
	}
	getMindmapAtIndex(index) {
		const docSnapshot = this._documentSnapshots[index];
		const mindmap = new rhit.MindMap(
			docSnapshot.id,
			docSnapshot.get(rhit.FB_KEY_MINDMAPS_TITLE),
			docSnapshot.get(rhit.FB_KEY_MINDMAPS_DESCRIPTION),
			docSnapshot.get(rhit.FB_KEY_MINDMAPS_AUTHOR),
			docSnapshot.get(rhit.FB_KEY_MINDMAPS_ISTRASH),
			null
		);
		return mindmap;
	}
	getMindmapFromID(id) {
		for (let i = 0; i < this._documentSnapshots.length; i++) {
			let docSnapshot = this._documentSnapshots[i];
			
			if (docSnapshot.id === id) {
				const mindmap = new rhit.MindMap(
					docSnapshot.id,
					docSnapshot.get(rhit.FB_KEY_MINDMAPS_TITLE),
					docSnapshot.get(rhit.FB_KEY_MINDMAPS_DESCRIPTION),
					docSnapshot.get(rhit.FB_KEY_MINDMAPS_AUTHOR),
					docSnapshot.get(rhit.FB_KEY_MINDMAPS_ISTRASH),
					null
				);
				return mindmap;
			}
		}
		console.log("Invalid ID");
	}

	moveToTrash(mindmapID) {
		this._ref.doc(mindmapID).update({
				[rhit.FB_KEY_MINDMAPS_ISTRASH]: true
			})
			.then(function () {
				console.log("mindmap successfully move to trash!");
				window.location.href = `/mainPage.html?uid=${rhit.uid}`
			})
			.catch(function (error) {
				// The document probably doesn't exist.
				console.error("Error moving mindmap to trash: ", error);
			});
	}

	restoreMindmap(mindmapID) {
		this._ref.doc(mindmapID).update({
				[rhit.FB_KEY_MINDMAPS_ISTRASH]: false
			})
			.then(function () {
				console.log("mindmap successfully move out from trash!");
				window.location.href = `/mainPage.html?uid=${rhit.uid}`
			})
			.catch(function (error) {
				// The document probably doesn't exist.
				console.error("Error moving mindmap out from trash: ", error);
			});
	}

	delete(mindmapID) {
		this._ref.doc(mindmapID).delete().then(function () {
			console.log("Document with id " + mindmapID + "successfully deleted!");
			console.log("should go back to homepage");
			window.location.href = `/mainPage.html?uid=${rhit.uid}`
		}).catch(function (error) {
			console.error("Error removing document with id " + mindmapID + ": , error");
		});
	}

	update(mindmapID, title, description) {
		this._ref.doc(mindmapID).update({
				[rhit.FB_KEY_MINDMAPS_TITLE]: title,
				[rhit.FB_KEY_MINDMAPS_DESCRIPTION]: description
			})
			.then(function () {
				console.log("mindmap information successfully updated!");
				window.location.href = `/mainPage.html?uid=${rhit.uid}`
			})
			.catch(function (error) {
				// The document probably doesn't exist.
				console.error("Error updating mindmap information: ", error);
			});
	}
}




rhit.HomePageController = class {
	constructor() {

		console.log("main page homePageController created");

		document.querySelector("#trashButton").addEventListener("click", (event) => {
			console.log("go to trash bag page");
			window.location.href = `/trashBag.html?uid=${rhit.uid}`
		});

		document.querySelector("#profileButton").addEventListener("click", (event) => {
			window.location.href = `/userHomePage.html?uid=${rhit.uid}`
		});

		document.querySelector("#submitAddMindmap").addEventListener("click", (event) => {
			const mindMapTitle = document.querySelector("#inputMindMapTitle").value;
			const mindMapDesc = document.querySelector("#inputMindMapDescription").value;

			rhit.fbMindmapManager.add(mindMapTitle, mindMapDesc);
		});


		$("#addMindmapDialogue").on("show.bs.modal", (event) => {
			document.querySelector("#inputMindMapTitle").value = "";
			document.querySelector("#inputMindMapDescription").value = "";
		});

		$("#addMindmapDialogue").on("shown.bs.modal", (event) => {
			document.querySelector("#inputMindMapTitle").focus();
		});

		rhit.fbMindmapManager.beginListening(this.updateList.bind(this));

	}

	_createMindMapCard(mindmap) {
		return htmlToElement(`        <div class="card">
		<div class="card-body">
		  <h6 class="card-subtitle mb-2 text-muted">Mindmap</h6>
		  <h5 class="card-title">${mindmap.title}</h5>
		  <p class="card-text">${mindmap.description}</p>
		</div>
	  </div>`);
	}

	updateList() {

		//make new containers
		const mindmapNewList = htmlToElement('<div id="mindmapContainer"></div>');

		//fill the mindmap container
		for (let i = 0; i < rhit.fbMindmapManager.length; i++) {
			const mindmap = rhit.fbMindmapManager.getMindmapAtIndex(i);
			console.log("is the mindmap trash: " + mindmap.id + "  " +mindmap.isTrash);
			if (!mindmap.isTrash) {
				console.log("this mindmap is not trash");
				const mindmapNewCard = this._createMindMapCard(mindmap);

				mindmapNewCard.onclick = (event) => {
					console.log("new card onclick implemented");
					window.location.href = `/bubble.html?uid=${rhit.uid}&&mindmapid=${mindmap.id}`;
				}

				mindmapNewList.appendChild(mindmapNewCard);
			} else {
				console.log("this mindmap is trash");
			}
		}

		const oldMindmapList = document.querySelector("#mindmapContainer");
		oldMindmapList.removeAttribute("id");
		oldMindmapList.hidden = true;

		//Put in the new container
		oldMindmapList.parentElement.appendChild(mindmapNewList);
	}
}

rhit.DocumentPageController = class {

	constructor() {
		const urlParams = new URLSearchParams(window.location.search);
		this.bubbleID = urlParams.get("documentid");
		
		document.querySelector("#submitDocument").addEventListener("click", (event) => {
			let bubble = rhit.fbBubbleManager.getBubbleFromID(this.bubbleID);
			const documentText = document.querySelector("#documentText").value;

			rhit.fbBubbleManager.updateBubbleFromID(this.bubbleID, documentText, bubble.name, bubble.parentID, bubble.xPos, bubble.yPos);
		});

		document.querySelector("#doneDocument").addEventListener("click", (event) => {
			let bubble = rhit.fbBubbleManager.getBubbleFromID(this.bubbleID);
			window.location.href = `/bubble.html?uid=${rhit.uid}&&mindmapid=${bubble.mindmapID}`;
		});

		rhit.fbBubbleManager.beginListening(this.updateView.bind(this));
	}

	updateView() {
		let bubble = rhit.fbBubbleManager.getBubbleFromID(this.bubbleID);
		document.querySelector("#documentText").value = bubble.document;
	}
}


rhit.MindmapPageController = class {
	constructor() {
		const urlParams = new URLSearchParams(window.location.search);
		this.mindmapID = urlParams.get("mindmapid");

		document.querySelector("#submitAddBubble").addEventListener("click", (event) => {
			const name = document.querySelector("#inputAddTitle").value;

			rhit.fbBubbleManager.add(name, this.mindmapID);
		});

		document.querySelector("#profileButton").addEventListener("click", (event) => {
			window.location.href = `/userHomePage.html?username=${rhit.uid}`
		});

		$("#addBubbleDialogue").on('show.bs.modal', (event) => {
			document.querySelector("#inputAddTitle").value = "";
		});

		$("#addBubbleDialogue").on('shown.bs.modal', (event) => {
			document.querySelector("#inputAddTitle").focus();
		});

		document.querySelector("#trashButton").addEventListener("click", (event) => {
			console.log("go to trash bag page");
			window.location.href = `/trashBag.html?uid=${rhit.uid}`
		});

		rhit.fbBubbleManager.beginListening(this.updateView.bind(this));
	}

	updateView() {
		const area = document.getElementById("bubblePage");
		const bubbleContainer = htmlToElement('<div id="bubbleContainer"></div>');
		const lines = [];
		var pressBackgounrd = true;
		var pressBackgounrdFlag = 0;

		for(let i = 0; i < rhit.fbBubbleManager.length; i++) {
			const bubble = rhit.fbBubbleManager.getBubbleFromIndex(i);
			if(bubble.mindmapID === this.mindmapID) {
				const bubbleElement = this._createBubble(bubble);

				bubbleElement.style.top = bubble.yPos;
				bubbleElement.style.left = bubble.xPos;

				bubbleElement.style.width = `${bubble.diameter}px`;
				bubbleElement.style.height = `${bubble.diameter}px`;

				const parent = rhit.fbBubbleManager.getBubbleFromID(bubble.parentID);
				if (parent) {
					const line = htmlToElement(`<div id="line"></div>`);
					this._drawLine(
						parseInt(bubble.xPos) + (bubble.diameter/2), 
						parseInt(bubble.yPos) + (bubble.diameter/2), 
						parseInt(parent.xPos) + (parent.diameter/2), 
						parseInt(parent.yPos) + (parent.diameter/2),
						line
					);
					bubbleContainer.appendChild(line);
					lines.push([line, parent, bubble]);
				}

				let isDragging = false;
				let isLongPress = false;
				let pressTimer;

				var bubbleX = 0, bubbleY = 0, cursorX = 0, cursorY = 0;

				const maxWidth = area.offsetWidth - bubbleElement.offsetWidth;
				const maxHeight = area.offsetHeight - bubbleElement.offsetWidth;

				bubbleElement.onmousedown = (downEvent) => {
					downEvent = downEvent || window.event;
					downEvent.preventDefault();
					pressBackgounrd = false;

					isDragging = false;
					isLongPress = false;

					cursorX = downEvent.clientX;
					cursorY = downEvent.clientY;

					document.onmouseup = () => {
						document.onmouseup = null;
						document.onmousemove = null;
					};

					document.onmousemove = (moveEvent) =>  {
						moveEvent = moveEvent || window.event;
						moveEvent.preventDefault();
			
						isDragging = true;
			
						bubbleX = cursorX - moveEvent.clientX;
						bubbleY = cursorY - moveEvent.clientY;
						cursorX = moveEvent.clientX;
						cursorY = moveEvent.clientY;
						if ((bubbleElement.offsetTop - bubbleY >= 0) && (bubbleElement.offsetLeft - bubbleX >= 0) && (bubbleElement.offsetLeft - bubbleX <= maxWidth) && (bubbleElement.offsetTop - bubbleY <= maxHeight)) {
							bubbleElement.style.top = (bubbleElement.offsetTop - bubbleY) + "px";
							bubbleElement.style.left = (bubbleElement.offsetLeft - bubbleX) + "px";

							for (let j = 0; j < lines.length; j++) {
								if (lines[j][1].id === bubble.id) {
									this._drawLine(
										parseInt(bubbleElement.style.left) + (bubble.diameter/2), 
										parseInt(bubbleElement.style.top) + (bubble.diameter/2), 
										parseInt(lines[j][2].xPos) + (lines[j][2].diameter/2), 
										parseInt(lines[j][2].yPos) + (lines[j][2].diameter/2),
										lines[j][0]
									);
								} else if (lines[j][2].id === bubble.id) {
									this._drawLine(
										parseInt(bubbleElement.style.left) + (bubble.diameter/2), 
										parseInt(bubbleElement.style.top) + (bubble.diameter/2), 
										parseInt(lines[j][1].xPos) + (lines[j][1].diameter/2), 
										parseInt(lines[j][1].yPos) + (lines[j][1].diameter/2),
										lines[j][0]
									);
								}
							}
						}
					};

					pressTimer = window.setTimeout(() => {
						if (!isDragging) {
							console.log("Long Press");
							isLongPress = true;

							document.querySelector("#bubbleID").innerHTML = bubble.id;
							console.log(bubble.parentID)
							this._createModalOptions(bubble, "inputEditParent");
							document.querySelector("#inputEditTitle").value = bubble.name;

							$("#editBubbleDialogue").on('shown.bs.modal', (event) => {
								document.querySelector("#inputEditTitle").focus();

								document.querySelector("#submitEditBubble").addEventListener("click", (event) => {
									if (document.querySelector("#bubbleID").innerHTML === bubble.id) {
										const name = document.querySelector("#inputEditTitle").value;
										const parentID = document.querySelector("#inputEditParent").value;

										rhit.fbBubbleManager.updateBubbleFromID(bubble.id, bubble.document, name, parentID, bubble.xPos, bubble.yPos);
									}
								});

								document.querySelector("#submitDeleteBubble").addEventListener("click", (event) => {
									if (document.querySelector("#bubbleID").innerHTML === bubble.id) {
										rhit.fbBubbleManager.deleteBubbleFromID(bubble.id);
									}
								});
							});

							$('#editBubbleDialogue').modal('show');
							pressBackgounrdFlag = 1;
						}
						
					},700);
					
				};

				bubbleElement.onmouseup = (e) =>  {
					clearTimeout(pressTimer);
					
					if (!isDragging && !isLongPress && e.button === 0) {
						window.location.href = `/document.html?uid=${rhit.uid}&&documentid=${bubble.id}`;
					}

					if (isDragging) {
						rhit.fbBubbleManager.updateBubbleFromID(bubble.id, bubble.document, bubble.name, bubble.parentID, bubbleElement.style.left, bubbleElement.style.top);
					}
		
					isLongPress = false;
					isDragging = false;
				};

				bubbleContainer.appendChild(bubbleElement);
			}
		}

		var pressTimerforBackground;
		var bubblePage = document.querySelector("#bubblePage");
		var bubbles = document.getElementsByClassName(".bubble");


		bubbles.onmousedown = () => {
			// console.log("you are pressing bubbles not background");
			console.log("the bubbles are not null: ", bubbles);
			pressBackgounrd = false;
		}

		bubblePage.onmousedown = (e) => {
			pressTimerforBackground = window.setTimeout(function () {
				console.log("long pressed backgournd");
				if (pressBackgounrd) {
					$("#editOrDeleteMindmapDialog").modal("show");
				}
				if (pressBackgounrdFlag == 1) {
					pressBackgounrd = true;
					pressBackgounrdFlag = 0;
				}
			}, 700);
		};

		bubblePage.onmouseup = (e) => {
			clearTimeout(pressTimerforBackground);
		};

		document.querySelector("#submitEditMindmapButton").addEventListener("click", (event) => {

			const title = document.querySelector("#inputEditMindmapTitle").value;
			const descr = document.querySelector("#inputEditDescription").value;

			console.log("should update a mindmap's information");
			console.log("this mindmap's id is: ", this.mindmapID);
			console.log("this mindmap's new title is: ", title);
			console.log("this mindmap's new des is: ", descr);
			rhit.fbMindmapManager.update(this.mindmapID, title, descr);
		});

		document.querySelector("#deleteMindmapButton").addEventListener("click", (event) => {
			console.log("should move this mindmap to trash folder: ", this.mindmapID);
			rhit.fbMindmapManager.moveToTrash(this.mindmapID);
		});


		const oldBubbleContainer = document.querySelector("#bubbleContainer");
		oldBubbleContainer.removeAttribute("id");
		oldBubbleContainer.hidden = true;

		oldBubbleContainer.parentElement.appendChild(bubbleContainer);
	}

	_drawLine(x1, y1, x2, y2, line) {
		const distance = Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));

		const xMid = (x1+x2)/2;
		const yMid = (y1+y2)/2;

		const slope = Math.atan2(y1-y2, x1-x2) * 180 / Math.PI;

		line.style.width = `${distance}px`;
		line.style.top = `${yMid}px`;
		line.style.left = `${xMid - (distance/2)}px`;
		line.style.transform = `rotate(${slope}deg)`;
	}

	_createModalOptions(bubble, modalParentInputID) {
		const optionsContainer = htmlToElement(`<select class="custom-select" id="${modalParentInputID}"></select>`);
		optionsContainer.appendChild(htmlToElement(`<option value="">NONE</option>`));

		for(let i = 0; i < rhit.fbBubbleManager.length; i++) {
			const optionBubble = rhit.fbBubbleManager.getBubbleFromIndex(i);

			if (!(optionBubble.id === bubble.id) && (optionBubble.mindmapID === bubble.mindmapID)) {
				console.log(bubble.parentID, optionBubble.parentID);
				if(bubble.parentID === optionBubble.id) {
					const bubbleOption = this._createSelectedOption(optionBubble);
					optionsContainer.appendChild(bubbleOption);
				} else {
					const bubbleOption = this._createOption(optionBubble);
					optionsContainer.appendChild(bubbleOption);
				}
			}
		}

		const oldOptionsContainer = document.querySelector(`#${modalParentInputID}`);
		oldOptionsContainer.removeAttribute("id");
		oldOptionsContainer.hidden = true;

		oldOptionsContainer.parentElement.appendChild(optionsContainer);
	}

	_createBubble(bubble) {
		return htmlToElement(
			`<div class="bubble">${bubble.name}</div>`
		);
	}

	_createSelectedOption(bubble) {
		return htmlToElement(
			`<option value="${bubble.id}" selected>${bubble.name}</option>`
		);
	}

	_createOption(bubble) {
		return htmlToElement(
			`<option value="${bubble.id}">${bubble.name}</option>`
		);
	}
}

rhit.TrashBagPageController = class {
	constructor() {
		console.log("created trashbagpageController");


		document.querySelector("#backIcon").onclick = (event) => {
			console.log("go back to home page");
			window.location.href = `/mainPage.html?uid=${rhit.uid}`;

		};

		document.querySelector("#profileButton").onclick = (event) => {
			console.log("clicked profile button");
			window.location.href = `/userHomePage.html?username=${firebase.auth().currentUser.email}`;
		};

		rhit.fbMindmapManager.beginListening(this.updateList.bind(this));
	}

	_createMindMapCard(mindmap) {
		return htmlToElement(`        <div class="card" data-mid="${mindmap.id}">
		<div class="card-body">
		  <h6 class="card-subtitle mb-2 text-muted">Mindmap</h6>
		  <h5 class="card-title" id="mindmapTitleText">${mindmap.title}</h5>
		  <p class="card-text" id="mindmapDescText">${mindmap.description}</p>
		</div>
	  </div>`);
	}

	updateList() {
		console.log("I need to update the list on trash page");
		console.log(`Num mindmaps = ${rhit.fbMindmapManager.length}`);

		//make new containers
		const mindmapNewList = htmlToElement('<div id="trashContainer"></div>');

		//fill the mindmap container
		for (let i = 0; i < rhit.fbMindmapManager.length; i++) {
			const mindmap = rhit.fbMindmapManager.getMindmapAtIndex(i);
			if (mindmap.isTrash) {
				console.log("this mindmap is trash");
				const mindmapNewCard = this._createMindMapCard(mindmap);

				mindmapNewCard.onclick = (event) => {
					console.log("trash card onclick implemented");

					$("#restoreOrDeleteDialog").modal("show");

					document.querySelector("#restoreTrashButton").addEventListener("click", (event) => {
						console.log("need to restore this trash");
						rhit.fbMindmapManager.restoreMindmap(mindmap.id);
			
					});
			
					document.querySelector("#deleteTrashButton").addEventListener("click", (event) => {
						console.log("delete this trash permanantly");
						rhit.fbMindmapManager.delete(mindmap.id);
					});

				}

				mindmapNewList.appendChild(mindmapNewCard);
			} else {
				console.log("this mindmap is trash");
			}
		}

		const oldMindmapList = document.querySelector("#trashContainer");
		oldMindmapList.removeAttribute("id");
		oldMindmapList.hidden = true;

		//Put in the new container
		oldMindmapList.parentElement.appendChild(mindmapNewList);
	}



}

rhit.Bubble = class {
	constructor(id, mindmapID, document, name, parentID, xPos, yPos) {
		this.id = id;
		this.mindmapID = mindmapID;
		this.document = document;
		this.name = name;
		this.parentID = parentID;
		this.xPos = xPos;
		this.yPos = yPos;
	}

	get diameter() {
		return 7.5*this.name.length + 16;
	}
}

rhit.FBBubbleManager = class {
	constructor(uid) {
		this._uid = uid;
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_BUBBLES);
		this._unsubsribe = null;
	}

	add(name, mindmapID) {
		if (name == "") {
			return;
		}

		this._ref.add({
			[rhit.FB_KEY_BUBBLE_DOCUMENT]: "",
			[rhit.FB_KEY_BUBBLE_NAME]: name,
			[rhit.FB_KEY_BUBBLE_USER_ID]: this._uid,
			[rhit.FB_KEY_BUBBLE_MINDMAP_ID]: mindmapID,
			[rhit.FB_KEY_BUBBLE_PARENT_ID]: "",
			[rhit.FB_KEY_BUBBLE_XPOS]: 0,
			[rhit.FB_KEY_BUBBLE_YPOS]: 0,
		})
		.then(function (docRef) {
			console.log("Bubble written with ID: ", docRef.id);
		})
		.catch(function (error) {
			console.log("Error adding document: ", error);
		});
	}

	beginListening(changeListener) {
		let query = this._ref;
		if (this._uid) {
			query = query.where(rhit.FB_KEY_BUBBLE_USER_ID, "==", this._uid);
		}

		this._unsubsribe = query.onSnapshot((querySnapshot) => {
			this._documentSnapshots = querySnapshot.docs;
			changeListener();
		})
	}
	stopListening() {
		this._unsubsribe();
	}
	updateBubbleFromID(bubbleID, document, name, parentID, xPos, yPos) {
		const bubble = this._ref.doc(bubbleID);
		if(bubble) {
			bubble.update({
				[rhit.FB_KEY_BUBBLE_DOCUMENT]: document,
				[rhit.FB_KEY_BUBBLE_NAME]: name,
				[rhit.FB_KEY_BUBBLE_PARENT_ID]: parentID,
				[rhit.FB_KEY_BUBBLE_XPOS]: xPos,
				[rhit.FB_KEY_BUBBLE_YPOS]: yPos,
			});
		} else {
			console.log("Invalid ID");
		}
	}
	deleteBubbleFromID(bubbleID) {
		const bubble = this._ref.doc(bubbleID);
		for (let i = 0; i < this.length; i++) {
			const docSnapshot = this._documentSnapshots[i];
			if (docSnapshot.get(rhit.FB_KEY_BUBBLE_PARENT_ID) === bubbleID) {
				this.updateBubbleFromID(
					docSnapshot.id, 
					docSnapshot.get(rhit.FB_KEY_BUBBLE_DOCUMENT), 
					docSnapshot.get(rhit.FB_KEY_BUBBLE_NAME), 
					"",
					 docSnapshot.get(rhit.FB_KEY_BUBBLE_XPOS), 
					 docSnapshot.get(rhit.FB_KEY_BUBBLE_YPOS));
			}
		}
		bubble.delete();
	}
	getBubbleFromID(bubbleID) {
		for (let i = 0; i < this.length; i++) {
			const docSnapshot = this._documentSnapshots[i];
			if (docSnapshot.id === bubbleID) {
				return this.getBubbleFromIndex(i);
			}
		}
	}
	getBubbleFromIndex(index) {
		const docSnapshot = this._documentSnapshots[index];
		const bubble = new rhit.Bubble(
			docSnapshot.id, 
			docSnapshot.get(rhit.FB_KEY_BUBBLE_MINDMAP_ID), 
			docSnapshot.get(rhit.FB_KEY_BUBBLE_DOCUMENT), 
			docSnapshot.get(rhit.FB_KEY_BUBBLE_NAME), 
			docSnapshot.get(rhit.FB_KEY_BUBBLE_PARENT_ID), 
			docSnapshot.get(rhit.FB_KEY_BUBBLE_XPOS),
			docSnapshot.get(rhit.FB_KEY_BUBBLE_YPOS)
		);
		return bubble;
	}
	get length() {
		return this._documentSnapshots.length;
	}

}

rhit.initializePage = function () {
	console.log("initialize pages");

	if (document.querySelector("#mainPage")) {
		console.log("main page");
		rhit.HomePageController = new rhit.HomePageController();
	}

	if (document.querySelector("#trashBagPage")) {
		console.log("trash bag page");
		rhit.TrashBagPageController = new rhit.TrashBagPageController();
	}

	if (document.querySelector("#bubblePage")) {
		console.log("bubble page");
		new rhit.MindmapPageController();
		document.querySelector("#navHomeButton").addEventListener("click", (event) => {
			window.location.href = `/mainPage.html?uid=${rhit.uid}`
		});
	}

	if (document.querySelector("#documentPage")) {
		console.log("document page");
		new rhit.DocumentPageController();
	}

}


/* Main */
/** function and class syntax examples */
rhit.main = function () {

	console.log("Ready main page");

	const urlParams = new URLSearchParams(window.location.search);
	rhit.uid = urlParams.get("uid");

	rhit.fbBubbleManager = new rhit.FBBubbleManager(rhit.uid);

	rhit.fbMindmapManager = new rhit.FbMindmapManager(rhit.uid);



	// new rhit.HomePageController();

	rhit.initializePage();

};

rhit.main();