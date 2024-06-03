   // Initialize Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyDVRFJbWO73yFmh4fBoLE4kMzXHTt7SDfU",
    authDomain: "testing-e23dc.firebaseapp.com",
    projectId: "testing-e23dc",
    storageBucket: "testing-e23dc.appspot.com",
    messagingSenderId: "298882443019",
    appId: "1:298882443019:web:4522efa3f87bfad3aba40e"
  };

  firebase.initializeApp(firebaseConfig);


  const db = firebase.firestore();

  // Get references to form and input fields
  const signupForm = document.getElementById('signup-form');
  const fullnameInput = document.querySelector('input[name="Name"]');
  const emailInput = document.querySelector('input[name="Email"]');
  const passwordInput = document.querySelector('input[name="Password"]');
  const confirmPasswordInput = document.querySelector('input[name="Confirm-Password"]');

  // Handle form submission
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const Name = fullnameInput.value;
    const Email = emailInput.value;
    const Password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (Password !== confirmPassword) {
      alert("Password and Confirm Password must match.");
      return;
    }

    // Create user with email and password
    firebase.auth().createUserWithEmailAndPassword(Email, Password)
      .then((userCredential) => {
        // Update user profile with fullname
        const user = userCredential.user;
        return user.updateProfile({
          displayName: Name
        }).then(() => {
          // Store user data in Firestore
          return db.collection('Admin').doc(Email).set({
            Name: Name,
            Email: Email,
            Password:Password,
            Status: 'admin',
            Created: firebase.firestore.FieldValue.serverTimestamp()
          });
        });
      })
      .then(() => {
        // Show success message
        alert("Successfully Added New Admin.");
        window.location.href = "addAdmin.html";

      })
      .catch((error) => {
        console.error("Error:", error);
        alert(error.message);
      });
  });