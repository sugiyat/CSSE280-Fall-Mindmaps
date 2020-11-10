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
rhit.email = "";
rhit.displayName = "";
rhit.photoURL = "";
rhit.displayName = "";
rhit.LogInPageController = null;
rhit.changePasswordPageController = null;
rhit.userHomePageController = null;
rhit.fbAuthManager = null;

/** function and class syntax examples */
rhit.functionName = function () {
	/** function body */
};

rhit.ClassName = class {
	constructor() {

	}

	methodName() {

	}
}

rhit.FbAuthManager = class {
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
			window.location.href = "/user.html";
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


rhit.LogInPageController = class {

	constructor() {

		const inputEmailEl = document.querySelector("#inputEmail");
		const inputPasswordEl = document.querySelector("#inputPassword");

		document.querySelector("#signUpButton").onclick = (event) => {
			console.log("clicked sign up button");

			rhit.fbAuthManager.signUp(inputEmailEl.value, inputPasswordEl.value);

		};

		document.querySelector("#logInButton").onclick = (event) => {
			console.log("clicked log in button");
			rhit.fbAuthManager.signIn(inputEmailEl.value, inputPasswordEl.value);

		};

		// rhit.fbMovieQuotesManager.beginListening(this.updateList.bind(this));
	}



}

rhit.changePasswordPageController = class {
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

			rhit.fbAuthManager._user.reauthenticateWithCredential(credential).then(function () {
				// User re-authenticated.
				if (newPassword == confirmPassword) {
					rhit.fbAuthManager.changePassword(newPassword);
				} else {
					console.log("change password reauthenticate failed");
				}
			}).catch(function (error) {
				// An error happened.
				console.log("err: ", error);
			});

		};
	}
}

rhit.userHomePageController = class {
	constructor() {

		document.querySelector("#signOutButton").onclick = (event) => {
			rhit.fbAuthManager.signOut;
		};

		document.querySelector("#changePasswordButton").onclick = (event) => {

			console.log("go to change password html");
			window.location.href = "/userChangePassword.html";

		};


	}
}

rhit.checkForRedirects = function () {

	console.log("check for redirect");
	if (document.querySelector("#loginPage") && rhit.fbAuthManager.isSignedIn) {
		window.location.href = "/userHomePage.html";
	}

}

rhit.initializePage = function () {
	console.log("initialize pages");

	const urlParams = new URLSearchParams(window.location.search);

	if (document.querySelector("#userHomaPage")) {
		console.log("user home page");

		// const uid = urlParams.get("uid");

		rhit.userHomePageController = new this.userHomePageController();
	}

	if (document.querySelector("#changePasswordPage")) {
		console.log("change password page");

		// const movieQuoteId = urlParams.get("id");

		// if (!movieQuoteId) {
		// 	window.location.href = "/";
		// }

		rhit.changePasswordPageController = new this.changePasswordPageController();

	}

	if (document.querySelector("#loginPage")) {
		console.log("login page");
		rhit.LogInPageController = new rhit.LogInPageController();
	}



}

/* Main */
/** function and class syntax examples */
rhit.main = function () {
	console.log("Ready");

	rhit.fbAuthManager = new rhit.FbAuthManager();

	rhit.fbAuthManager.beginListening(() => {
		console.log("isSignedin = ", rhit.fbAuthManager.isSignedIn);
		rhit.checkForRedirects();
		rhit.initializePage();
	});

};

rhit.main();