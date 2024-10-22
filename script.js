const map = L.map('map', { zoomControl: false }).setView([24.723367492217395, 90.43526292660201], 15); 
    const marker = L.marker([24.723367492217395, 90.43526292660201]).addTo(map);

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

    fetch('info.json')
        .then(response => response.json())
        .then(data => {
            locations = data; 
        })
        .catch(error => console.error('Error loading JSON:', error));

    function getLocation() {
        map.removeLayer(marker);
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
                map.setView([location.lat, location.lng], 18,{ animate: true });
                
                if (currentMarker) {
                    map.removeLayer(currentMarker);
                }
                
                currentMarker = L.marker([location.lat, location.lng]).addTo(map)
                    .bindPopup(`
                        <strong>Location: ${location.building}</strong><br>
                        ${location.floor}<br>
                        ${location.room}<br>
                        <button  id= "getDirectionsButton">Get Directions</button>
                    `)
                    .openPopup();
 // Event listener for the "Get Directions" button
            currentMarker.on('popupopen', () => {
                document.getElementById('getDirectionsButton').onclick = function () {
                    getDirections(location.lat, location.lng);
                };
            });
            
            });
        } else {
            alert('No locations found for this roll number.');
        }
    }

function getDirections(destLat, destLng) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            const url = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${destLat},${destLng}&travelmode=driving`;
            window.open(url, '_blank');
        }, () => {
            alert('Unable to retrieve your location.');
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}


    const control = L.control({ position: 'bottomright' });

    control.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'leaflet-control-custom');
        div.innerHTML = `
            <div>
                <button id="normalView">Normal View</button>
                <button id="satelliteView">Satellite View</button>
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
        return div;
    };

    control.addTo(map);
