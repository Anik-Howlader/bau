const map = L.map('map').setView([24.7234, 90.4353], 15);
const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

let locations = [];
let currentMarker;
let routingControl;

// Load JSON data
fetch('info.json')
    .then(response => response.json())
    .then(data => {
        locations = data; 
    })
    .catch(error => console.error('Error loading JSON:', error));

// Get user location and calculate route
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;

            const inputRoll = parseInt(document.getElementById('idInput').value);
            if (isNaN(inputRoll)) {
                alert('Please enter a valid roll number.');
                return;
            }

            const foundLocations = locations.filter(loc => {
                const startRoll = parseInt(loc.start_roll);
                const endRoll = parseInt(loc.end_roll);
                return inputRoll >= startRoll && inputRoll <= endRoll;
            });

            if (foundLocations.length > 0) {
                foundLocations.forEach(location => {
                    map.setView([location.lat, location.lng], 20);

                    if (currentMarker) {
                        map.removeLayer(currentMarker);
                    }

                    currentMarker = L.marker([location.lat, location.lng]).addTo(map)
                        .bindPopup(`
                            <strong>Location: ${location.description}</strong><br>
                            Roll Range: ${location.start_roll} - ${location.end_roll}<br>
                            <img src="${location.image_url}" alt="${location.description}" style="width:100px; height:auto;">
                        `)
                        .openPopup();

                    // Set up routing
                    if (routingControl) {
                        map.removeControl(routingControl);
                    }

                    const start = L.latLng(userLat, userLng);
                    const end = L.latLng(location.lat, location.lng);

                    routingControl = L.Routing.control({
                        waypoints: [start, end],
                        router: L.Routing.osrmv1({
                            serviceUrl: 'https://router.project-osrm.org/route/v1'
                        }),
                        routeWhileDragging: true
                    }).addTo(map);
                });
            } else {
                alert('No locations found for this roll number.');
            }
        }, () => {
            alert('Unable to retrieve your location.');
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}
