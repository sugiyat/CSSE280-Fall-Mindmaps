/**
 * @fileoverview
 * Provides the JavaScript interactions for all pages.
 *
 * @author 
 * PUT_YOUR_NAME_HERE
 */

/** namespace. */
var rhit = rhit || {};

/** globals */
rhit.FB_COLLECTION_BUBBLES = "Bubbles";
rhit.FB_COLLECTION_FOLDERS = "Folders";
rhit.FB_COLLECTION_MINDMAPS = "Mindmaps";
rhit.FB_COLLECTION_USERS = "Users";
rhit.FB_KEY_DOCUMENT = "document";
rhit.FB_KEY_BUBBLE_NAME = "bubbleName";
rhit.FB_KEY_BUBBLE_PARENT_ID = "parentBubbleID";
rhit.FB_KEY_MINDMAP_IDS = "mindmapIDs";
rhit.FB_KEY_FOLDER_NAME = "folderName";
rhit.FB_KEY_FOLDER_PARENT_ID = "parentFolderID";
rhit.FB_KEY_DESCRIPTION = "description";
rhit.FB_KEY_MINDMAP_NAME = "mindmapName";
rhit.FB_KEY_ROOT_BUBBLE_ID = "rootBubbleID";
rhit.FB_KEY_USER_ID = "foldersIDs";
rhit.FB_KEY_PASSWORD = "password";
rhit.FB_KEY_USER_NAME = "username";
rhit.fbUserManager = null;
rhit.fbBubbleManager = null;
rhit.fbMindmapManager = null;
rhit.fbFolderManager = null;

rhit.HomePageController = class {
	constructor() {

	}

	updateView() {

	}
	createFolderCard(folder) {

	}
	createMindmapCard(mindMap) {

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

rhit.UserPageController = class {
	constructor() {

	}

	updateView() {

	}
}

rhit.TrashPageController = class {
	constructor() {

	}

	updateView() {

	}
}

rhit.User = class {
	constructor(username, password, folderIDs) {
		this.username = username;
		this.password = password;
		this.folderIDs = folderIDs;
	}

}

rhit.Bubble = class {
	constructor(document, name, parentID) {
		this.document = document;
		this.name = name;
		this.parentID = parentID;
	}

}

rhit.MindMap = class {
	constructor(description, name, rootBubbleID) {
		this.description = description;
		this.name = name;
		this.rootBubbleID = rootBubbleID;
	}

}

rhit.Folder = class {
	constructor(name, parentID, mindMapIDs) {
		this.name = name;
		this.parentID = parentID;
		this.mindMapIDs = mindMapIDs;
	}

}

rhit.FBUserManager = class {
	constructor() {
		
	}
	add(username, password) {

	}
	delete() {

	}
	update(username, password) {

	}
	beginListening(changeListener) {

	}
	stopListening() {

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

rhit.FBMindmapManager = class {
	constructor() {
		
	}
	add(name, description, rootBubbleID) {

	}
	delete() {

	}
	update(name, description) {

	}
	beginListening(changeListener) {

	}
	stopListening() {
		
	}

}

rhit.FBFolderManager = class {
	constructor() {
		
	}
	add(name, parentID) {

	}
	delete() {

	}
	update(name) {

	}
	beginListening(changeListener) {

	}
	stopListening() {
		
	}

}

/* Main */
/** function and class syntax examples */
rhit.main = function () {
	console.log("Ready");
};

rhit.main();
