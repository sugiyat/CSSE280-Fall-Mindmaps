/**
 * @fileoverview
 * Provides the JavaScript interactions for all pages.
 *
 * @author 
 * Mory Chen and Taisuke Sugiyama
 */

/** namespace. */
var user = user || {};

/** globals */

user.FB_COLLECTION_USERS = "Users";
user.FB_KEY_USER_EMAIL = "email";
user.FB_KEY_USER_PROFILE = "profilePictureURL";
user.fbUserManager = null;

user.LogInPageController = null;
user.changePasswordPageController = null;
user.userHomePageController = null;
user.fbAuthManager = null;
user.email = "test";
user.uid = null;

/** function and class syntax examples */
user.functionName = function () {
	/** function body */
};

user.ClassName = class {
	constructor() {

	}

	methodName() {

	}
}

user.FbAuthManager = class {
	constructor() {
		this._user = null;
	}

	beginListening(changeListener) {
		console.log("fbAuthManager begins listening");

		firebase.auth().onAuthStateChanged((user) => {

			this._user = user;
			changeListener();

		});

	}

	signIn(email, password) {
		console.log(`log in for email : ${email} password: ${password}`);
		firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
			var errorCode = error.code;
			var errorMessage = error.message;
			console.log("existing account log in error ", errorCode, errorMessage);

		});

	}

	signUp(email, password) {
		console.log(`create account for email : ${email} password: ${password}`);

		firebase.auth().createUserWithEmailAndPassword(email, password).catch(function (error) {
			var errorCode = error.code;
			var errorMessage = error.message;
			console.log("create account error ", errorCode, errorMessage);
		});

		user.fbUserManager.add(email);
		this.signIn(email, password);

	}

	changePassword(newPassword) {
		console.log("change Password");
		this._user.updatePassword(newPassword).catch((error) => {
			var errorCode = error.code;
			var errorMessage = error.message;
			console.log("change password error ", errorCode, errorMessage);
		});

		this.signOut();
	}

	signOut() {
		console.log("sign out");

		firebase.auth().signOut().then(function () {
			console.log("signed out");
			window.location.href = "/index.html";
		}).catch(function (error) {
			console.log("sign out error");
		});
	}

	get isSignedIn() {
		//return this._user != null;
		return !!this._user;
	}

	get uid() {
		return this._user.uid;
	}

}

user.FBUserManager = class {

	constructor() {
		console.log("created FBUserManager");
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(user.FB_COLLECTION_USERS);
		this._unsubsribe = null;
	}

	add(email) {
		console.log(`email: ${email}`);

		this._ref.add({
				[user.FB_KEY_USER_EMAIL]: email,
			})
			.then(function (docRef) {
				console.log("User added with ID: ", docRef.id);
			})
			.catch(function (error) {
				console.error("Error adding user in fb: ", error);
			});
	}

	addProfileURL(uid, profileURL) {
		this._ref.doc(uid).update({
				[user.FB_KEY_USER_PROFILE]: profileURL
			})
			.then(function () {
				console.log("Document successfully updated!");
			})
			.catch(function (error) {
				// The document probably doesn't exist.
				console.error("Error updating document: ", error);
			});

	}

	beginListening(changeListener) {
		this._ref.onSnapshot((doc) => {
			if (doc.exists) {
				console.log("Document data:", doc.data());
				this._documentSnapshot = doc;
				changeListener();
			} else {
				// doc.data() undefined in this case
				console.log("No such document");
				// window.location.href = "/";
			}
		});
	}

	stopListening() {
		this._unsubsribe();
	}

	// profileURL(uid) {
	// 	// const testUID = UserDefaults.standard.value(forKey: "uid") as String ?? "Null";
	// 	console.log("trying to get profileURL for uid: ", uid);
	// 	var docRef = this._ref.doc(uid);

	// 	docRef.get().then(function(querySnapshot) {
	// 		querySnapshot.forEach(function(doc) {
	// 			console.log(doc.id, " => ", doc.data());
	// 			console.log("--------found object, returning : ", doc.data().profilePictureURL);

	// 		});
	// 	});

	// 	console.log("the doc is: ", docRef.data);
	// 	var toReturn = "";
	// 	console.log("got the profile URL for uid: " + uid + " and the profile URL is: " + toReturn);
	// 	return toReturn;
	// }

	getProfileURL(username) {
		console.log("trying to get prifilePictureURL for username : ", username);
		var toReturn = null;

		this._ref.where("email", "==", username)
			.get()
			.then(function (querySnapshot) {
				querySnapshot.forEach(function (doc) {
					// doc.data() is never undefined for query doc snapshots
					// console.log(doc.id, " => ", doc.data());
					console.log("found object, returning : ", doc.data().profilePictureURL);
					toReturn = doc.data().profilePictureURL;
					user.userHomePageController.updateProfile(toReturn);
					// return doc.data().profilePictureURL;
					// return doc.profilePictureURL;
				});
			})
			.catch(function (error) {
				console.log("Error getting documents: ", error);
			});

		return toReturn;
	}

}


user.LogInPageController = class {

	constructor() {

		const inputEmailEl = document.querySelector("#inputEmail");
		const inputPasswordEl = document.querySelector("#inputPassword");

		document.querySelector("#signUpButton").onclick = (event) => {
			console.log("clicked sign up button");

			user.fbAuthManager.signUp(inputEmailEl.value, inputPasswordEl.value);

		};

		document.querySelector("#logInButton").onclick = (event) => {
			console.log("clicked log in button");
			user.fbAuthManager.signIn(inputEmailEl.value, inputPasswordEl.value);

		};

	}



}

user.changePasswordPageController = class {
	constructor() {
		document.querySelector("#confirmPasswordButton").onclick = (event) => {
			console.log("try to change Password");
			const oldPassword = document.querySelector("#oldPasswordInput").value;
			const newPassword = document.querySelector("#newPasswordInput").value;
			const confirmPassword = document.querySelector("#confirmPasswordInput").value;

			var credential = firebase.auth.EmailAuthProvider.credential(
				firebase.auth().currentUser.email,
				oldPassword
			);

			user.fbAuthManager._user.reauthenticateWithCredential(credential).then(function () {
				// User re-authenticated.
				if (newPassword == confirmPassword) {
					user.fbAuthManager.changePassword(newPassword);
				} else {
					console.log("change password reauthenticate failed");
				}
			}).catch(function (error) {
				// An error happened.
				console.log("err: ", error);
			});

		};

		document.querySelector("#profileButton").onclick = (event) => {
			console.log("clicked profile button");
			window.location.href = `/userHomePage.html?username=${firebase.auth().currentUser.email}`;
		};

	}
}

user.userHomePageController = class {
	constructor() {

		// var profileUrl = "profileImage.png";
		console.log("this is user home page");

		document.querySelector("#signOutButton").onclick = (event) => {
			user.fbAuthManager.signOut();
		};

		document.querySelector("#changePasswordButton").onclick = (event) => {

			console.log("go to change password html");
			window.location.href = `/userChangePassword.html?uid=${user.fbAuthManager.uid}`;

		};

		document.querySelector("#profileImage").onclick = (event) => {
			console.log("clicked profile image");
			console.log("TODO: need to implement");

			$('#uploadProfileDialog').modal('show');

			// console.log(url);

			// const element = document.querySelector('.element')
			// const style = getComputedStyle(element)

			// location.reload();

		};

		document.querySelector("#uploadProfileButton").addEventListener("click", (event) => {

			const newProfileURL = document.querySelector("#inputProfileURL").value;
			user.fbUserManager.addProfileURL(firebase.auth().currentUser.uid, newProfileURL);

			this.updateProfile(newProfileURL);
		});


		document.querySelector("#backIcon").onclick = (event) => {

			console.log("go back to home page");
			window.location.href = `/mainPage.html?uid=${user.fbAuthManager.uid}`;

		};

		var url = user.fbUserManager.getProfileURL(firebase.auth().currentUser.email);
		document.querySelector("#usernameText").innerHTML = firebase.auth().currentUser.email;
	}

	updateProfile(profile){
		console.log("should update profile");
		$("#profileImage").attr("src", profile);
	}
}

user.checkForRedirects = function () {

	console.log("check for redirect");
	if (document.querySelector("#loginPage") && user.fbAuthManager.isSignedIn) {
		window.location.href = `/mainPage.html?uid=${user.fbAuthManager.uid}`;
	}

}

user.initializePage = function () {
	console.log("initialize pages");

	// const urlParams = new URLSearchParams(window.location.search);

	if (document.querySelector("#userHomaPage")) {
		console.log("user home page");
		user.userHomePageController = new this.userHomePageController();
	}

	if (document.querySelector("#changePasswordPage")) {
		console.log("change password page");

		user.changePasswordPageController = new this.changePasswordPageController();

	}

	if (document.querySelector("#loginPage")) {
		console.log("login page");
		user.LogInPageController = new user.LogInPageController();
	}

}

/* Main */
/** function and class syntax examples */
user.main = function () {
	console.log("Ready user page");

	user.fbAuthManager = new user.FbAuthManager();
	user.fbUserManager = new user.FBUserManager();

	user.fbAuthManager.beginListening(() => {
		console.log("isSignedin = ", user.fbAuthManager.isSignedIn);
		user.checkForRedirects();
		user.initializePage();
	});

};

user.main();