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

const urlParams = new URLSearchParams(window.location.search);
const patientEmail = urlParams.get("email");

console.log("Patient Email:", patientEmail); // Debugging line

db.collection("Users")
      .doc(patientEmail)
      .get()
      .then((doc) => {
        if (!doc.exists) {
          console.log("No matching document.");
          return;
        }

        const patient = doc.data();
        console.log("Patient Data:", patient); // Debugging line

        const patientInfoDiv = document.getElementById("patient-info");
        
        // Populate table with patient data
        const nameValue = document.getElementById("name-value");
        nameValue.innerText = patient.Name;

        const icValue = document.getElementById("ic-value");
        icValue.innerText = patient.IC;

        const ageValue = document.getElementById("age-value");
        ageValue.innerText = patient.Age;

        const genderValue = document.getElementById("gender-value");
        genderValue.innerText = patient.Gender;

        const heightValue = document.getElementById("height-value");
        heightValue.innerText = `${patient.Height}cm`;

        const weightValue = document.getElementById("weight-value");
        weightValue.innerText = `${patient.Weight}kg`;

        const contactValue = document.getElementById("contact-value");
        contactValue.innerText = patient.Contact;

        const bpMeasurements = [];
        const hrMeasurements = [];

        db.collection("Users")
          .doc(patientEmail)
          .collection("BP")
          .orderBy("Last Updated", "desc")
          .limit(30)
          .get()
          .then((querySnapshotBP) => {
            querySnapshotBP.forEach((docBP) => {
              const measurementBP = docBP.data();
              const dbp = measurementBP.DBP;
              const sbp = measurementBP.SBP;
              const timestampBP = measurementBP["Last Updated"].toDate();

              bpMeasurements.push({
                dbp: dbp,
                sbp: sbp,
                timestamp: timestampBP,
              });
            });

            bpMeasurements.sort((a, b) => a.timestamp - b.timestamp);

            db.collection("Users")
              .doc(patientEmail)
              .collection("HR")
              .orderBy("Last Updated", "desc")
              .limit(30)
              .get()
              .then((querySnapshotHR) => {
                querySnapshotHR.forEach((docHR) => {
                  const measurementHR = docHR.data();
                  const hr = measurementHR.HR;
                  const timestampHR = measurementHR["Last Updated"].toDate();

                  hrMeasurements.push({
                    hr: hr,
                    timestamp: timestampHR,
                  });
                });

                hrMeasurements.sort((a, b) => a.timestamp - b.timestamp);

                const dateSelect = document.getElementById("date-select");
                const intervalSelect = document.getElementById("interval-select");
                
                let chartBP;
                let chartHR;

                // Event listeners for date and interval selection
                document.getElementById("date-select").addEventListener("change", handleChartUpdate);
                document.getElementById("interval-select").addEventListener("change", handleChartUpdate);

                // Function to handle chart update based on selected date and interval
                function handleChartUpdate() {
                    const selectedDate = new Date(document.getElementById("date-select").value);
                    const selectedInterval = parseInt(document.getElementById("interval-select").value);

                    const filteredBPMeasurements = getFilteredMeasurements(bpMeasurements, selectedDate, selectedInterval);
                    const filteredHRMeasurements = getFilteredMeasurements(hrMeasurements, selectedDate, selectedInterval);

                    updateChartBP(filteredBPMeasurements, selectedDate, selectedInterval);
                    updateChartHR(filteredHRMeasurements, selectedDate, selectedInterval);
                }

                // Function to fetch the latest 30 measurements for BP and HR and update the charts
                function fetchLatestMeasurementsAndRenderCharts() {
                  const selectedDate = new Date();
                  const selectedInterval = 30; // Default to showing the latest 30 measurements

                  const filteredBPMeasurements = getFilteredMeasurements(bpMeasurements, selectedDate, selectedInterval);
                  const filteredHRMeasurements = getFilteredMeasurements(hrMeasurements, selectedDate, selectedInterval);

                  updateChartBP(filteredBPMeasurements, selectedDate, selectedInterval);
                  updateChartHR(filteredHRMeasurements, selectedDate, selectedInterval);
                }

                // Call the function when the page loads
                fetchLatestMeasurementsAndRenderCharts();


                function getFilteredMeasurements(measurements, selectedDate, selectedInterval) {
                  const filteredMeasurements = measurements.filter((measurement) => {
                    const measurementDate = measurement.timestamp.toDateString();
                    const selectedDateFormatted = selectedDate.toDateString();
                    return measurementDate === selectedDateFormatted;
                  });

                  const startIndex = Math.max(0, filteredMeasurements.length - selectedInterval);
                  return filteredMeasurements.slice(startIndex);
                }

                function updateChartBP(measurements, selectedDate, selectedInterval) {
                  const chartDataBP = {
                    labels: measurements.map((_, index) => (index + 1).toString()),
                    datasets: [
                      {
                        label: "DBP",
                        data: measurements.map((m) => m.dbp),
                        fill: false,
                        borderColor: "blue",
                        tension: 0.1,
                      },
                      {
                        label: "SBP",
                        data: measurements.map((m) => m.sbp),
                        fill: false,
                        borderColor: "green",
                        tension: 0.1,
                      },
                      {
                        label: "MAP",
                        data: measurements.map((m) => calculateMAP(m.dbp, m.sbp)),
                        fill: false,
                        borderColor: "orange",
                        tension: 0.1,
                      },
                    ],
                  };

                  const chartOptionsBP = {
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "top",
                      },
                      title: {
                        display: true,
                        text: `Blood Pressure Chart - Date: ${selectedDate.toLocaleDateString()}`,
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const dataIndex = context.dataIndex;
                            const measurement = measurements[dataIndex];
                            const timestamp = measurement.timestamp.toLocaleString();
                            const dbp = measurement.dbp;
                            const sbp = measurement.sbp;
                            const map = calculateMAP(dbp, sbp).toFixed(2);
                            return `${timestamp} - DBP: ${dbp}, SBP: ${sbp}, MAP: ${map}`;
                          },
                        },
                      },
                    },
                    scales: {
                      y: {
                        display: true,
                        title: {
                          display: true,
                          text: "Blood Pressure (mmHg)",
                        },
                        suggestedMin: 0,
                      },
                    },
                  };

                  if (chartBP) {
                    chartBP.data = chartDataBP;
                    chartBP.options = chartOptionsBP;
                    chartBP.update();
                  } else {
                    const chartElementBP = document.getElementById("chartBP");
                    chartBP = new Chart(chartElementBP, {
                      type: "line",
                      data: chartDataBP,
                      options: chartOptionsBP,
                    });
                  }
                }

                function calculateMAP(dbp, sbp) {
                  return (2 * dbp + sbp) / 3;
                }

                function updateChartHR(measurements, selectedDate, selectedInterval) {
                  const chartDataHR = {
                    labels: measurements.map((_, index) => (index + 1).toString()),
                    datasets: [
                      {
                        label: "Heart Rate",
                        data: measurements.map((m) => m.hr),
                        fill: false,
                        borderColor: "red",
                        tension: 0.1,
                      },
                    ],
                  };

                  const chartOptionsHR = {
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "top",
                      },
                      title: {
                        display: true,
                        text: `Heart Rate Chart - Date: ${selectedDate.toLocaleDateString()}`,
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const dataIndex = context.dataIndex;
                            const measurement = measurements[dataIndex];
                            const timestamp = measurement.timestamp.toLocaleString();
                            const hr = measurement.hr;
                            return `${timestamp} - HR: ${hr}`;
                          },
                        },
                      },
                    },
                    scales: {
                      y: {
                        display: true,
                        title: {
                          display: true,
                          text: "Heart Rate (bpm)",
                        },
                        suggestedMin: 0,
                      },
                    },
                  };

                  if (chartHR) {
                    chartHR.data = chartDataHR;
                    chartHR.options = chartOptionsHR;
                    chartHR.update();
                  } else {
                    const chartElementHR = document.getElementById("chartHR");
                    chartHR = new Chart(chartElementHR, {
                      type: "line",
                      data: chartDataHR,
                      options: chartOptionsHR,
                    });
                  }
                }
              });
          });
      })
      .catch((error) => {
        console.error("Error getting document: ", error);
      });