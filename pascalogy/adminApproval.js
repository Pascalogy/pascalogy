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

function fetchPendingAccounts() {
    const pendingAccountsContainer = document.getElementById('pending-accounts');
    pendingAccountsContainer.innerHTML = '';

    db.collection('Admin').get()
        .then(querySnapshot => {
            if (querySnapshot.empty) {
                console.log('No accounts found in the Admin collection.');
                pendingAccountsContainer.innerHTML = '<p>No accounts found.</p>';
            } else {
                let count = 1;
                querySnapshot.forEach(doc => {
                    const account = doc.data();
                    console.log('Account found:', account);  // Debugging log
                    if (account.Status === 'pending') {
                        const accountRow = document.createElement('tr');
                        accountRow.innerHTML = `
                            <td>${count++}</td>
                            <td>${account.Name}</td>
                            <td>${account.Email}</td>
                            <td>
                                <button class="approve-button" onclick="approveAccount('${doc.id}')">Approve</button>
                                <button class="decline-button" onclick="declineAccount('${doc.id}')">Decline</button>
                            </td>
                        `;
                        pendingAccountsContainer.appendChild(accountRow);
                    }
                });
                if (pendingAccountsContainer.innerHTML === '') {
                    pendingAccountsContainer.innerHTML = '<p>No pending accounts found.</p>';
                }
            }
        })
        .catch(error => {
            console.error('Error fetching accounts:', error);
            pendingAccountsContainer.innerHTML = `<tr><td colspan="4">Error fetching accounts: ${error.message}</td></tr>`;
        });
}

//To DO: send notification to user after approve/decline (sendGrid)
// Function to approve an account
function approveAccount(email) {
    db.collection('Admin').doc(email).update({
        Status: 'admin'
    })
    .then(() => {
        alert('Account approved.');
        fetchPendingAccounts();
    })
    .catch(error => {
        console.error('Error approving account:', error);
    });
}

// Function to decline an account
function declineAccount(email) {
    db.collection('Admin').doc(email).update({
        Status: 'rejected'
    })
    .then(() => {
        alert('Account declined.');
        fetchPendingAccounts();
    })
    .catch(error => {
        console.error('Error declining account:', error);
    });
}

// Fetch pending accounts on page load
window.onload = fetchPendingAccounts;

