const firebaseConfig = {
  apiKey: "AIzaSyDVRFJbWO73yFmh4fBoLE4kMzXHTt7SDfU",
  authDomain: "testing-e23dc.firebaseapp.com",
  projectId: "testing-e23dc",
  storageBucket: "testing-e23dc.appspot.com",
  messagingSenderId: "298882443019",
  appId: "1:298882443019:web:4522efa3f87bfad3aba40e"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firestore reference
const db = firebase.firestore();

// Fetch all patients on load
db.collection("Users").get().then((querySnapshot) => {
  const patientData = [];
  
  querySnapshot.forEach((doc) => {
    const patient = doc.data();
    console.log("Retrieved patient data:", patient); // Debugging line
    patientData.push({
      id: doc.id, // email as the ID
      name: patient.Name,
      icNumber: patient.IC,
      contact: patient.Contact
    });
  });

  displayPatientData(patientData);
}).catch((error) => {
  console.error("Error fetching patient data: ", error);
});

// Search function
function searchPatients() {
  const searchValue = document.getElementById("search-input").value.trim().toLowerCase();

  db.collection("Users").get().then((querySnapshot) => {
    const patientData = [];

    querySnapshot.forEach((doc) => {
      const patient = doc.data();
      if (patient.Name.toLowerCase().includes(searchValue)) {
        console.log("Matched patient data:", patient); // Debugging line
        patientData.push({
          id: doc.id, // email as the ID
          name: patient.Name,
          icNumber: patient.IC,
          contact: patient.Contact
        });
      }
    });

    displayPatientData(patientData);
  }).catch((error) => {
    console.error("Error searching patient data: ", error);
  });
}

// Display the patient data in the table
function displayPatientData(data) {
  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = ""; // Clear existing table rows

  data.forEach((patient) => {
    const row = tableBody.insertRow();
    row.insertCell().textContent = patient.name;
    row.insertCell().textContent = patient.icNumber;
    row.insertCell().textContent = patient.contact;

    const viewButton = document.createElement("button");
    viewButton.textContent = "View Data";

    // Add event listener to button to redirect to patientDetail.html when clicked
    viewButton.addEventListener("click", () => {
      window.location.href = "patientDetail.html?email=" + patient.id;
    });

    const dataCell = row.insertCell();
    dataCell.appendChild(viewButton);
  });
}

// Event listener for search button
const searchButton = document.getElementById("search-button");
searchButton.addEventListener("click", searchPatients);

function clearSearchInput() {
  document.getElementById("search-input").value = "";
  searchPatients();
}
