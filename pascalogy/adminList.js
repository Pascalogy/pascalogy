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

// Reference to the admin list tbody element
const adminList = document.getElementById('admin-list');

// Function to fetch admin data from Firestore and populate the HTML
db.collection('Admin').get().then((querySnapshot) => {
  let count = 1;
  querySnapshot.forEach((doc) => {
    const adminData = doc.data();
    const name = adminData.Name;
    const email = adminData.Email;
    const status = adminData.Status;

    if (status === 'admin') {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${count}</td>
      <td>${name}</td>
      <td>${email}</td>
    `;
    adminList.appendChild(row);
    count++;
    }
  });
}).catch((error) => {
  console.error("Error getting admin data: ", error);
});

// Function to navigate back to the dashboard
function goToDashboard() {
  window.location.href = "dashboard.html";
}

const modal = document.getElementById("addAdminModal");
const btn = document.getElementById("addAdminBtn");
const span = document.getElementsByClassName("close")[0];

// Open the modal
btn.onclick = function() {
  modal.style.display = "block";
  addadmin();
}

// Close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// Close the modal when clicking outside of it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

function addadmin(){
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
              Status:'admin',
              Created: firebase.firestore.FieldValue.serverTimestamp()
            });
          });
        })
        .then(() => {
          // Show success message
          alert("Successfully Added New Admin!");
          window.location.href = "addAdmin.html";

        })
        .catch((error) => {
          console.error("Error:", error);
          alert(error.message);
        });
    });
}


function searchAdmins() {
  const searchValue = document.getElementById("search-input").value.trim().toLowerCase();

  db.collection("Admin").get().then((querySnapshot) => {
    const adminData = [];

    querySnapshot.forEach((doc) => {
      const admin = doc.data();
      if (admin.Name.toLowerCase().includes(searchValue)) {
        console.log("Matched admin data:", admin); // Debugging line
        adminData.push({
          id: doc.id, // document ID
          name: admin.Name,
          email: admin.Email,
          status: admin.Status
        });
      }
    });

    displayAdminData(adminData);
  }).catch((error) => {
    console.error("Error searching admin data: ", error);
  });
}

function displayAdminData(adminData) {
  // Display admin data in the UI, e.g., update a table or list
  const adminList = document.getElementById('admin-list');
  adminList.innerHTML = ''; // Clear previous results

  adminData.forEach((admin, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${admin.name}</td>
      <td>${admin.email}</td>
    `;
    adminList.appendChild(row);
  });
}

// Event listener for search button
const searchButton = document.getElementById("search-button");
searchButton.addEventListener("click", searchAdmins);

function clearSearchInput() {
  document.getElementById("search-input").value = "";
  searchAdmins();
}




