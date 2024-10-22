let map = L.map('map', { zoomControl: false }).setView([24.723367492217395, 90.43526292660201], 15); 
    let currentMarker = L.marker([24.723367492217395, 90.43526292660201]).addTo(map);


    let normalLayer = L.tileLayer('https://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '&copy; <a href="https://www.google.com/intl/en_us/help/terms_maps.html">Google</a>',
    }).addTo(map); 

    let satelliteLayer = L.tileLayer('https://{s}.google.com/vt?lyrs=s&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '&copy; <a href="https://www.google.com/intl/en_us/help/terms_maps.html">Google</a>',
    });

    let locations = [];
    
    let routingControl;

    fetch('info.json')
        .then(response => response.json())
        .then(data => {
            locations = data; 
        })
        .catch(error => console.error('Error loading JSON:', error));

    function getLocation() {
        if (currentMarker) {
                    map.removeLayer(currentMarker);
                }
        let inputRoll = parseInt(document.getElementById('idInput').value);

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

                
                  map.setView([location.lat, location.lng], 10,{ animate: true });
                  map.setView([location.lat, location.lng], 19,{ animate: true });
               
                currentMarker = L.marker([location.lat, location.lng]).addTo(map)
                    .bindPopup(`
                        <b>Building: </b><strong> ${location.building}</strong><br>
                        <b>Floor: </b>${location.floor}<br>
                         <b>Room: </b>${location.room}<br>
                        <button type="button" class="btn btn-primary btn-sm" style="padding-top:2px;"  id= "getDirectionsButton">Get Directions</button>
                    `);
                   // Open the popup immediately after creating the marker
        currentMarker.openPopup();
                

              
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
