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
user.email= "test";

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

		user.email = email;
	}

	signUp(email, password) {
		console.log(`create account for email : ${email} password: ${password}`);

		firebase.auth().createUserWithEmailAndPassword(email, password).catch(function (error) {
			var errorCode = error.code;
			var errorMessage = error.message;
			console.log("create account error ", errorCode, errorMessage);
		});

		user.fbUserManager.add(email);
		this.signIn(email,password);

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

	addProfileURL(profileURL){
		this._ref.update({
			[user.FB_KEY_USER_PROFILE]: profileURL,
		})
		.then(() => {
			console.log("Profile picture successfully updated!");
		})
		.catch(function (error) {
			console.error("Error editting profile picture: ", error);
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

			const url = document.querySelector("#inputProfileURL").value;

			$("#profileImage").attr("src",url);
		};

		document.querySelector("#usernameText").innerHTML = firebase.auth().currentUser.email;

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

	const urlParams = new URLSearchParams(window.location.search);

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