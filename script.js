const map = L.map('map').setView([24.7234, 90.4353], 15);
const normalLayer = L.tileLayer('https://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: '&copy; <a href="https://www.google.com/intl/en_us/help/terms_maps.html">Google</a>',
}).addTo(map);

let locations = [];
let currentMarker;
let directionsService;
let directionsRenderer;

// Load JSON data
fetch('info.json')
    .then(response => response.json())
    .then(data => {
        locations = data; 
    })
    .catch(error => console.error('Error loading JSON:', error));

// Initialize Google Directions Service and Renderer
function initGoogleRouting() {
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        draggable: false,
        map: map,
        panel: document.getElementById('directionsPanel')
    });
}

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

                    // Set up waypoints for Google Directions API
                    const destination = new google.maps.LatLng(location.lat, location.lng);
                    const origin = new google.maps.LatLng(userLat, userLng);
                    calculateAndDisplayRoute(directionsService, directionsRenderer, origin, destination);
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

// Calculate and display route
function calculateAndDisplayRoute(directionsService, directionsRenderer, origin, destination) {
    directionsService.route({
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING
    }, (response, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(response);
        } else {
            alert('Directions request failed due to ' + status);
        }
    });
}

// Initialize the Google Routing
initGoogleRouting();
