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

let bpmeasurements = [];
let hrmeasurements = [];

if (patientEmail) {
    const patientDocRef = db.collection("Users").doc(patientEmail);

    patientDocRef.get()
        .then((doc) => {
        if (!doc.exists) {
            console.log("No matching document.");
            return;
        }

        const patient = doc.data();
        document.getElementById("name-value").innerText = patient.Name;
        document.getElementById("ic-value").innerText = patient.IC;
        document.getElementById("age-value").innerText = patient.Age;
        document.getElementById("gender-value").innerText = patient.Gender;
        document.getElementById("height-value").innerText = `${patient.Height}cm`;
        document.getElementById("weight-value").innerText = `${patient.Weight}kg`;
        document.getElementById("contact-value").innerText = `${patient.CountryCode} ${patient.Contact}`;

        fetchAndDisplayBPMeasurements(patientDocRef);
        fetchAndDisplayHRMeasurements(patientDocRef);
        })
        .catch((error) => {
        console.error("Error retrieving patient document: ", error);
        });
    } else {
    console.error("No patient email provided in URL.");
    }

    function fetchAndDisplayBPMeasurements(patientDocRef) {
    bpmeasurements = [];

    patientDocRef.collection("BP").orderBy("Last Updated", "desc").limit(30).get()
        .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const bpmeasurement = doc.data();
            const timestamp = bpmeasurement["Last Updated"].toDate();
            bpmeasurement.timestamp = timestamp;
            bpmeasurements.push(bpmeasurement);
        });

        bpmeasurements.sort((a, b) => a.timestamp - b.timestamp);
        updateChartBP(bpmeasurements,"chartBP");
        })
        .catch((error) => {
        console.error(`Error retrieving BP measurements: `, error);
        });
    }

    function fetchAndDisplayHRMeasurements(patientDocRef) {
        hrmeasurements = [];
    
        patientDocRef.collection("HR").orderBy("Last Updated", "desc").limit(30).get()
            .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const hrmeasurement = doc.data();
                const timestamp = hrmeasurement["Last Updated"].toDate();
                hrmeasurement.timestamp = timestamp;
                hrmeasurements.push(hrmeasurement);
            });
    
            hrmeasurements.sort((a, b) => a.timestamp - b.timestamp);
            updateChartHR(hrmeasurements,"chartHR");
            })
            .catch((error) => {
            console.error(`Error retrieving HR measurements: `, error);
            });
        }


    const endDateInput = document.getElementById("date-select");
    const dataPointsSelect = document.getElementById("data-points");

    document.getElementById("date-select").addEventListener("change", () => handleChartUpdate());
    document.getElementById("data-points").addEventListener("change", () => handleChartUpdate());


    function handleChartUpdate() {
        let endDate = new Date(endDateInput.value);
        const dataPoints = parseInt(dataPointsSelect.value);
    
        if (!endDateInput.value) {
            endDate = new Date(); // Set end date to today if not selected
        }
    
        const filteredBPMeasurements = getFilteredMeasurements(bpmeasurements, endDate, dataPoints);
        const filteredHRMeasurements = getFilteredMeasurements(hrmeasurements, endDate, dataPoints);

        updateChartBP(filteredBPMeasurements, "chartBP");
        updateChartHR(filteredHRMeasurements, "chartHR");
    }
    
    
    
    function getFilteredMeasurements(measurements, endDate, dataPoints) {
        const filteredMeasurements = measurements.filter((measurement) => {
            const measurementDate = measurement.timestamp;
            return measurementDate <= endDate;
        });
    
        return filteredMeasurements.slice(-dataPoints);
    }
    

    function updateChartBP(measurements,chartElementId) {
    const chartDataBP = {
        labels: measurements.map((_, index) => (index + 1).toString()),
        datasets: [
        {
            label: "DBP",
            data: measurements.map((m) => m.DBP),
            fill: false,
            borderColor: "blue",
            backgroundColor: "blue",
            tension: 0.4,
            borderWidth: 1,
            pointRadius: 2,
            pointBackgroundColor: "blue",
        },
        {
            label: "SBP",
            data: measurements.map((m) => m.SBP),
            fill: false,
            borderColor: "green",
            backgroundColor: "green",
            tension: 0.4,
            borderWidth: 1,
            pointRadius: 2,
            pointBackgroundColor: "green",
        },
        {
            label: "MAP",
            data: measurements.map((m) => calculateMAP(m.DBP, m.SBP)),
            fill: false,
            borderColor: "orange",
            backgroundColor: "orange",
            tension: 0.4,
            borderWidth: 1,
            pointRadius: 2,
            pointBackgroundColor: "orange",
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
            text: `Blood Pressure Chart`,
        },
        tooltip: {
            callbacks: {
            label: (context) => {
                const dataIndex = context.dataIndex;
                const measurement = measurements[dataIndex];
                const timestamp = measurement.timestamp.toLocaleString();
                const dbp = measurement.DBP;
                const sbp = measurement.SBP;
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

    const chartElementBP = document.getElementById(chartElementId);
    if (chartElementBP.chart) {
        chartElementBP.chart.data = chartDataBP;
        chartElementBP.chart.options = chartOptionsBP;
        chartElementBP.chart.update();
    } else {
        chartElementBP.chart = new Chart(chartElementBP, {
        type: "line",
        data: chartDataBP,
        options: chartOptionsBP,
        });
    }
    }

    function updateChartHR(measurements,chartElementId) {
        const chartDataHR = {
            labels: Array.from({ length: measurements.length }, (_, index) => (index + 1).toString()),
            datasets: [
            {
                label: "HR",
                data: measurements.map((m) => m.HR),
                fill: false,
                borderColor: "red",
                backgroundColor: "red",
                tension: 0.4,
                borderWidth: 1,
                pointRadius: 2,
                pointBackgroundColor: "red",
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
                text: `Heart Rate Chart`,
            },
            tooltip: {
                callbacks: {
                label: (context) => {
                    const dataIndex = context.dataIndex;
                    const measurement = measurements[dataIndex];
                    const timestamp = measurement.timestamp.toLocaleString();
                    const hr = measurement.HR;
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
    
        const chartElementHR = document.getElementById(chartElementId);
        if (chartElementHR.chart) {
            chartElementHR.chart.data = chartDataHR;
            chartElementHR.chart.options = chartOptionsHR;
            chartElementHR.chart.update();
        } else {
            chartElementHR.chart = new Chart(chartElementHR, {
            type: "line",
            data: chartDataHR,
            options: chartOptionsHR,
            });
        }
        }
    
    function calculateMAP(dbp, sbp) {
    return (2 * dbp + sbp) / 3;
    }
