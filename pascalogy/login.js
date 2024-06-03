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

const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  firebase.auth().signInWithEmailAndPassword(email, password)
  .then((userCredential) => {
      console.log('User signed in successfully');

      firebase.firestore().collection('Admin').doc(email).get()
          .then((adminDoc) => {
              if (adminDoc.exists) {
                  console.log('Admin document found:', adminDoc.data());
                  window.location.href = 'dashboard.html';
              } else {
                  console.error("Not admin: Admin document does not exist");
                  firebase.firestore().collection('Users').doc(email).get()
                      .then((usersDoc) => {
                          console.log('User document found:', usersDoc.data());
                          window.location.href = `patientDetail.html?email=${email}`;
                      })
                  //alert('You are not authorized to access this page.');
              }
          })
          .catch((error) => {
              console.error('Error checking admin status: ', error);
              alert('An error occurred while checking admin status.');
          });
  })
  .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(`Error: ${errorCode} - ${errorMessage}`);
      alert('Login failed. Please check your email and password.');
  });
});