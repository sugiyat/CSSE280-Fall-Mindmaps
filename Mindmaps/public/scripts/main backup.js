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
rhit.FB_COLLECTION_FOLDERS = "Folders";
rhit.FB_COLLECTION_MINDMAPS = "Mindmaps";
rhit.FB_COLLECTION_USERS = "Users";

rhit.FB_KEY_MINDMAPS_TITLE = "mindmapTitle";
rhit.FB_KEY_MINDMAPS_DESCRIPTION = "mindmapDesc";
rhit.FB_KEY_MINDMAPS_AUTHOR = "mindmapAuthor";
rhit.FB_KEY_MINDMAPS_ROOTBUBBLE = "rootBubbleID";
rhit.FB_KEY_MINDMAPS_PARENTFOLDER = "parentFolderID";
rhit.FB_KEY_MINDMAPS_TIMESTAMP = "lastTouched";

rhit.FB_KEY_FOLDERS_AUTHOR = "uid";
rhit.FB_KEY_FOLDERS_TITLE = "title";






// rhit.FB_KEY_USER_NAME = "username";
// rhit.FB_KEY_PROFILE_PICTURE_URL = "profilePictureURL";

rhit.fbBubbleManager = null;
rhit.fbMindmapManager = null;
rhit.fbFolderManager = null;

function htmlToElement(html) {
	var template = document.createElement("template");
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}

rhit.MindMap = class {
	constructor(id, title,description,author,rootBubbleID,parentFolderID){
		this.id = id;
		this.title = title;
		this.description = description;
		this.author = author;
		this.rootBubbleID = rootBubbleID;
		this.parentFolderID = parentFolderID;
	}

}

rhit.Folder = class {
	constructor(id, title, author) {
		this.id = id;
		this.title = title;
		this.author = author;
	}
}

rhit.FBFolderManager = class {

	constructor(uid) {
		console.log("created FbFolderManager");
		this._uid = uid;
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_FOLDERS);
		this._unsubsribe = null;
	}

	add(title) {
		console.log(`folder title: ${title}`);

		this._ref.add({
				[rhit.FB_KEY_FOLDERS_TITLE]: title,
				[rhit.FB_KEY_FOLDERS_AUTHOR]: this._uid,
			})
			.then(function (docRef) {
				console.log("Folder added with ID: ", docRef.id);
			})
			.catch(function (error) {
				console.error("Error adding folder: ", error);
			});
	}

	beginListening(changeListener) {
		let query = this._ref.orderBy(rhit.FB_KEY_FOLDERS_TITLE, "desc").limit(50);

		if (this._uid) {
			query = query.where(rhit.FB_KEY_FOLDERS_AUTHOR, "==", this._uid);
		}

		this._unsubsribe = query.onSnapshot((querySnapshot) => {
			console.log("Folder update!");

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

	getFolderAtIndex(index) {
		const docSnapshot = this._documentSnapshots[index];
		const folder = new rhit.Folder(
			docSnapshot.id,
			docSnapshot.get(rhit.FB_KEY_FOLDERS_TITLE),
			docSnapshot.get(rhit.FB_KEY_FOLDERS_AUTHOR),

		);
		return folder;
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
				// [rhit.FB_KEY_MINDMAPS_PARENTFOLDER]: rhit.fbFolderManager.docs,
				[rhit.FB_KEY_MINDMAPS_TIMESTAMP]: firebase.firestore.Timestamp.now(),
			})
			.then(function (docRef) {
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
			docSnapshot.get(rhit.FB_KEY_MINDMAPS_ROOTBUBBLE),
			null
		);
		return mindmap;
	}

}




rhit.HomePageController = class {
	constructor() {

		console.log("main page homePageController created");

		document.querySelector("#settingButton").addEventListener("click", (event) => {
			console.log("clicked setting button in homepage");
		});

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

		document.querySelector("#submitAddFolder").addEventListener("click", (event) => {
			const folderTitle = document.querySelector("#inputFolderTitle").value;
			rhit.fbFolderManager.add(folderTitle);
		});

		$("#addMindmapDialogue").on("show.bs.modal", (event) => {
			document.querySelector("#inputMindMapTitle").value = "";
			document.querySelector("#inputMindMapDescription").value = "";
		});

		$("#addMindmapDialogue").on("shown.bs.modal", (event) => {
			document.querySelector("#inputMindMapTitle").focus();
		});

		$("#addFolderDialogue").on("show.bs.modal", (event) => {
			document.querySelector("#inputFolderTitle").value = "";
		});

		$("#addFolderDialogue").on("shown.bs.modal", (event) => {
			document.querySelector("#inputFolderTitle").focus();
		});

		rhit.fbFolderManager.beginListening(this.updateList.bind(this));
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

	_createFolderCard(folder) {
		return htmlToElement(`        <div class="card">
		<div class="card-body">
		  <h5 class="card-title">${folder.title}</h5>
		</div>
	  </div>`);
	}

	updateList() {
		console.log("I need to update the list on the page");
		console.log(`Num folders = ${rhit.fbFolderManager.length}`);
		console.log(`Num mindmaps = ${rhit.fbMindmapManager.length}`);

		//make new containers
		const mindmapNewList = htmlToElement('<div id="mindmapContainer"></div>');
		const folderNewList = htmlToElement('<div id="folderContainer"></div>');


		//fill the folder container
		for (let i = 0; i < rhit.fbFolderManager.length; i++) {
			const folder = rhit.fbFolderManager.getFolderAtIndex(i);
			const folderNewCard = this._createFolderCard(folder);

			folderNewCard.onclick = (event) => {
				console.log("new folder card onclick implemented");
			}

			folderNewList.appendChild(folderNewCard);
		}

		//fill the mindmap container
		for (let i = 0; i < rhit.fbMindmapManager.length; i++) {
			const mindmap = rhit.fbMindmapManager.getMindmapAtIndex(i);
			const mindmapNewCard = this._createMindMapCard(mindmap);

			mindmapNewCard.onclick = (event) => {
				console.log("new card onclick implemented");
				window.location.href = `/bubble.html?uid=${rhit.uid}&&mindmapid=${mindmap.id}`;
			}

			mindmapNewList.appendChild(mindmapNewCard);
		}


		//Remove the old Containers
		const oldFolderList = document.querySelector("#folderContainer");
		oldFolderList.removeAttribute("id");
		oldFolderList.hidden = true;

		const oldMindmapList = document.querySelector("#mindmapContainer");
		oldMindmapList.removeAttribute("id");
		oldMindmapList.hidden = true;

		//Put in the new container
		oldFolderList.parentElement.appendChild(folderNewList);
		oldMindmapList.parentElement.appendChild(mindmapNewList);
	}
}

rhit.DocumentPageController = class {
	constructor() {

	}

	updateView() {

	}
}

rhit.MindmapPageController = class {
	constructor() {

	}

	updateView() {

	}
	createBubbleView(bubble) {

	}
}

rhit.FolderPageController = class {
	constructor() {

	}

	updateView() {

	}
	createMindmapCard(mindMap) {

	}
}

rhit.TrashPageController = class {
	constructor() {

	}

	updateView() {

	}
}

rhit.Bubble = class {
	constructor(document, name, parentID) {
		this.document = document;
		this.name = name;
		this.parentID = parentID;
	}

}





rhit.FBBubbleManager = class {
	constructor() {

	}
	add(name, parentID) {

	}
	delete() {

	}
	update(name, parentID) {

	}
	beginListening(changeListener) {

	}
	stopListening() {

	}

}


/* Main */
/** function and class syntax examples */
rhit.main = function () {
	console.log("Ready main page");

	const urlParams = new URLSearchParams(window.location.search);

	rhit.uid = urlParams.get("uid");


	rhit.fbFolderManager = new rhit.FBFolderManager(rhit.uid);
	rhit.fbMindmapManager = new rhit.FbMindmapManager(rhit.uid);

	new rhit.HomePageController();

	

};

rhit.main();