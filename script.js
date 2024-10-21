const map = L.map('map', { zoomControl: false }).setView([24.723367492217395, 90.43526292660201], 15); 
const marker = L.marker([24.723367492217395, 90.43526292660201]).addTo(map);

// Tile layers
const normalLayer = L.tileLayer('https://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: '&copy; <a href="https://www.google.com/intl/en_us/help/terms_maps.html">Google</a>',
}).addTo(map); 

const satelliteLayer = L.tileLayer('https://{s}.google.com/vt?lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: '&copy; <a href="https://www.google.com/intl/en_us/help/terms_maps.html">Google</a>',
});

let locations = [];
let currentMarker;
let routingControl;

// Fetch locations from JSON
fetch('info.json')
    .then(response => response.json())
    .then(data => {
        locations = data; 
    })
    .catch(error => console.error('Error loading JSON:', error));

// Function to get user's location and create a route
function getLocation() {
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
            const destination = foundLocations[0]; // Using the first matched location
            const destinationLatLng = [destination.lat, destination.lng];

            if (currentMarker) {
                map.removeLayer(currentMarker);
            }

            currentMarker = L.marker(destinationLatLng).addTo(map)
                .bindPopup(`
                    <strong>Location: ${destination.description}</strong><br>
                    Roll Range: ${destination.start_roll} - ${destination.end_roll}<br>
                    <img src="${destination.image_url}" alt="${destination.description}" style="width:100px; height:auto;">
                `)
                .openPopup();

            // Center map on user location
            map.setView([userLat, userLng], 15);
            L.marker([userLat, userLng]).addTo(map).bindPopup('You are here!').openPopup();

            // Create route
            if (routingControl) {
                map.removeControl(routingControl);
            }
            routingControl = L.Routing.control({
                waypoints: [
                    L.latLng(userLat, userLng),
                    L.latLng(destination.lat, destination.lng)
                ],
                routeWhileDragging: true,
                geocoder: L.Control.Geocoder.nominatim(),
            }).addTo(map);
        }
    }, () => {
        alert('Could not get your location.');
    });
}

// Control for layer switching
const control = L.control({ position: 'bottomright' });

control.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'leaflet-control-custom');
    div.innerHTML = `
        <div>
            <button id="normalView">Normal View</button>
            <button id="satelliteView">Satellite View</button>
            <button id="getLocation">Get Location and Route</button>
        </div>
    `;

    div.querySelector('#normalView').onclick = function () {
        map.removeLayer(satelliteLayer);
        normalLayer.addTo(map);
    };
    div.querySelector('#satelliteView').onclick = function () {
        map.removeLayer(normalLayer);
        satelliteLayer.addTo(map);
    };
    div.querySelector('#getLocation').onclick = getLocation; // Trigger getLocation on button click

    return div;
};

control.addTo(map);
