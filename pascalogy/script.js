const firebaseConfig = {
	apiKey: "AIzaSyDVRFJbWO73yFmh4fBoLE4kMzXHTt7SDfU",
  authDomain: "testing-e23dc.firebaseapp.com",
  projectId: "testing-e23dc",
  storageBucket: "testing-e23dc.appspot.com",
  messagingSenderId: "298882443019",
  appId: "1:298882443019:web:4522efa3f87bfad3aba40e"
  };
  
  firebase.initializeApp(firebaseConfig);
  
  function logout() {
	firebase.auth().signOut().then(() => {
	  // Redirect to the login page or perform any other desired action
	  window.location.href = "login.html";
	}).catch((error) => {
	  console.log(error);
	});
  }
  
  // Function to retrieve patient data and display it in the table
  function fetchPatientData() {
	const tableBody = document.getElementById("tableBody");
	tableBody.innerHTML = ""; // Clear existing table body
  
	db.collection("Users").get().then((querySnapshot) => {
	  querySnapshot.forEach((doc) => {
		const patient = doc.data();
		const row = tableBody.insertRow();
  
		row.insertCell().textContent = patient.Name;
		row.insertCell().textContent = patient.IC;
		row.insertCell().textContent = patient.Contact;
  
		const viewButton = document.createElement("button");
		viewButton.textContent = "View Data";
  
		// Add event listener to button to redirect to patient detail page when clicked
		viewButton.addEventListener("click", () => {
		  window.location.href = `patientDetail.html?email=${doc.id}`;
		});
  
		const dataCell = row.insertCell();
		dataCell.appendChild(viewButton);
	  });
	});
  }
  
  // Function to handle the search functionality
  function searchPatients() {
	const searchInput = document.getElementById("search-input").value.toLowerCase();
	const patientTable = document.getElementById("patient-table");
	const tableRows = patientTable.getElementsByTagName("tr");
  
	for (let i = 0; i < tableRows.length; i++) {
	  const patientName = tableRows[i].getElementsByTagName("td")[0];
  
	  if (patientName) {
		const nameValue = patientName.textContent || patientName.innerText;
		if (nameValue.toLowerCase().indexOf(searchInput) > -1) {
		  tableRows[i].style.display = "";
		} else {
		  tableRows[i].style.display = "none";
		}
	  }
	}
  }
  
  // Event listener for search button click
  const searchButton = document.getElementById("search-button");
  searchButton.addEventListener("click", searchPatients);
  
  // Initialize Firestore database
  const db = firebase.firestore();
  
  // Fetch patient data on page load
  fetchPatientData();
  