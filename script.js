 // This will let you use the .remove() function later on
if (!("remove" in Element.prototype)) {
  Element.prototype.remove = function() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  };
}

mapboxgl.accessToken =
  "pk.eyJ1IjoicmZrb3JlYyIsImEiOiJjamlua3VpbzgwZG9nM2t0OGZjdW4zbXBkIn0.nZw1fQ8SsauGL8GldssE0Q";

// Create map
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v9',
  center: [-122.332953, 47.616286],
  zoom: 11,
  scrollZoom: true,
  bearing: 0,
  pitch: 0 // for tilt: use 45
});

// Zoom and rotation controls
const nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'bottom-right');

// Enable user location button 
map.addControl(new mapboxgl.GeolocateControl({
  positionOptions: {
    enableHighAccuracy: true
  },
  trackUserLocation: true
}));

// Add data to the map
map.on('load', function(e) {
  map.addSource('places', {
    type: 'geojson',
    data: restaurants
  });
  
// Add restaurant data to sidebear
buildLocationList(restaurants);
  
restaurants.features.forEach(function(feature) {
        let symbol = feature.properties['type'];
        let layerID = 'poi-' + symbol;

        if (!map.getLayer(layerID)) {
            map.addLayer({
                'id': layerID,
                'type': 'symbol',
                'source': 'places',
                'layout': {
                    'icon-image': symbol + '-15',
                    'icon-allow-overlap': true
                },
                'filter': ['==', 'type', symbol]
            });

            // Add checkbox and label elements for the layer
            let input = document.createElement('input');
            input.type = 'checkbox';
            input.id = layerID;
            input.checked = true;
            //filterGroup.appendChild(input);

            let label = document.createElement('label');
            label.setAttribute('for', layerID);
            label.textContent = symbol;
            //filterGroup.appendChild(label);

            // When the checkbox changes, update the visibility of the layer.
            input.addEventListener('change', function(e) {
                map.setLayoutProperty(layerID, 'visibility',
                    e.target.checked ? 'visible' : 'none');
            });
        }
    });
});  

// This is where your interactions with the symbol layer used to be
// Now you have interactions with DOM markers instead
restaurants.features.forEach(function(marker, i) {
  // Create an img element for the marker
  let el = document.createElement('div');
  el.id = 'marker-' + i;
  el.className = 'marker';
  // Add markers to the map at all points
  new mapboxgl.Marker(el, { offset: [0, -23] })
    .setLngLat(marker.geometry.coordinates)
    .addTo(map);

  // Click functionality for restaurant icon marker
  el.addEventListener('click', function(e) {
    // Fly to the point
    flyToRestaurant(marker);

    // Close all other popups and display popup for clicked store
    createPopUp(marker);

    // Highlight listing in sidebar (and remove highlight for all other listings)
    let activeItem = document.getElementsByClassName('active');

    e.stopPropagation();
    if (activeItem[0]) {
      activeItem[0].classList.remove('active');
    }

    let listing = document.getElementById('listing-' + i);
    listing.classList.add('active');   
    
    // Snap to sidebar to active listing
    document.querySelector('.active').scrollIntoView({behavior: 'smooth'});
  });
});

function flyToRestaurant(currentFeature) {
  map.flyTo({
    center: currentFeature.geometry.coordinates,
    speed: 2
  });
}

// Create restaurant pop up conent
function createPopUp(currentFeature) {
  let popUps = document.getElementsByClassName('mapboxgl-popup');
  if (popUps[0]) popUps[0].remove();

  let popup = new mapboxgl.Popup({ closeOnClick: true })
    .setLngLat(currentFeature.geometry.coordinates)
    .setHTML(
      '<h3>' + '<a target="_blank" href=' + currentFeature.properties.websiteFull + '>' +
      currentFeature.properties.restaurant + '</a>' +
      '</h3>' + 
      '<div class="card-contents-wrapper">'  +  
        '<div class="card-left">' +
          '<b>' + currentFeature.properties.type + '</b>' + '<br>' +
          currentFeature.properties.cuisine + '<br>' +
          currentFeature.properties.address + '<br>' +
          '<a class="URL-address" href="' +
          currentFeature.properties.websiteMenuURL +
          '" target="_blank">' + 
          currentFeature.properties.menu +
          '</a>' +
      '</div>' +
      '<div class="card-image">' + 
      currentFeature.properties.image + 
      '</div>' +
      '</div>'
    )
    .addTo(map);
}

// Create restaurant listings on sidebar
function buildLocationList(data) {
  for (i = 0; i < data.features.length; i++) {
    let currentFeature = data.features[i];
    let prop = currentFeature.properties;

    let listings = document.getElementById('listings');
    let listing = listings.appendChild(document.createElement('div'));
    listing.className = 'item';
    listing.id = 'listing-' + i;

    let link = listing.appendChild(document.createElement("a"));
    link.href = '#';
    link.className = 'title';
    link.dataPosition = i;
    link.innerHTML = prop.restaurant; 
  
    let details = listing.appendChild(document.createElement('div'));
    details.innerHTML =
       '<i class="fas fa-heart"></i> ' + 
      prop.type + 
      '</br>' +
      '<i class="fas fa-utensils"></i> ' +
      prop.cuisine +
      '</br>' +
      '<i class="fas fa-location-arrow"></i> ' +
      prop.neighborhood + 
      '</br>' +
      '<a class="URL-address" href="' +
      prop.websiteMenuURL +
      '" target="_blank">' +
      prop.menu +
      '</a>' + 
      prop.image;
     
    details.className = 'title-info';

    link.addEventListener('click', function(e) {
      // Update the currentFeature to the restaurant associated with the clicked link in sidebar
      let clickedListing = data.features[this.dataPosition];

      // Fly to the icon marker
      flyToRestaurant(clickedListing);

      // Close all other popups and display popup for clicked restaurant
      createPopUp(clickedListing);

      // Highlight listing in sidebar (and remove highlight for all other listings)
      var activeItem = document.getElementsByClassName('active');

      if (activeItem[0]) {
        activeItem[0].classList.remove('active');
      }
      this.parentNode.classList.add('active');
    });
  }
}

// let trigger = document.querySelector('.list-menu-btn');
// let sidebar = document.querySelector('.sidebar');

// function toggleSidebar() {
//   sidebar.classList.toggle('.toggle-sidebar');
// }

// function windowOnClick(event) {
//   if (event.target === sidebar) {
//     toggleSidebar();
//   }
// }

// trigger.addEventListener('click', toggleSidebar);
// window.addEventListener('click', windowOnClick);

// jQuery
$(document).ready(function(){
  
  let listMenuBtn = $('.list-menu-btn');
  let hiddenSidebar = $('.sidebar');
  let mobileHeader = $('.mobile-heading'); 
  let map = $('.map'); 
  let mapViewBtn = $('.map-view-btn');
  
  // For mobile - List View and Map View button functionality
  listMenuBtn.on('click', function(){
    hiddenSidebar.toggleClass('toggle-sidebar');
    map.toggleClass('map-motion');
    mapViewBtn.toggleClass('map-view-btn-show');
    mobileHeader.toggleClass('hide-mobile-header');
  });
  
  mapViewBtn.on('click', function(){
    hiddenSidebar.toggleClass('toggle-sidebar');
    map.toggleClass('map-motion');
    mapViewBtn.toggleClass('map-view-btn-show');
    mobileHeader.toggleClass('hide-mobile-header');
  });

  // Trigger overlay for about section when About clicked
  $('.navbar-toggler').on('click', function() { 
    $('.overlay').toggleClass('show-overlay');
    $('.overlay-content').toggleClass('show-overlay-content');   
    $('.mobile-heading').toggleClass('mobile-heading-fade');
  });
  $('.overlay-back-btn').on('click', function() {
    $('.overlay').removeClass('show-overlay');
    $('.overlay-content').removeClass('show-overlay-content');   
    $('.mobile-heading ').removeClass('mobile-heading-fade');
  });
});

