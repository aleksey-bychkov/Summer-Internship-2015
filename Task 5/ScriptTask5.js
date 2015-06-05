// root namespace
var Eastbanc = Eastbanc || {};

// sub namespace
Eastbanc.Internship = Eastbanc.Internship || {};

// class
Eastbanc.Internship.Task5 = function()
{
    var that = this;
    that.map = new google.maps.Map(document.getElementById('map-canvas'),
    {
        center: new google.maps.LatLng(38.9055751, -77.0611825),
        zoom: 15
    });

    function placeMarker()
    {
        var url = document.getElementById("dataURL").value;

        $.ajax(
        {
            url: url,
            jsonp: "callback",
            dataType: "jsonp",
            success: function(data)
            {
                place(data);
            },
            error: function ()
            {
                alert("Failed to retrieve info!");
            }
        });

       function place(information)
       {
           var markers = [];


           for(var index = 0; index < information.length; index++)
           {
               (function makeMarkers()
               {
                   var current = information[index];
                   var latlng = new google.maps.LatLng(current.Lat, current.Lon);

                   //makes the markers
                   var marker = new google.maps.Marker
                   (
                       {
                           map: that.map,
                           title: index+"",
                           position: latlng
                       }
                   );

                   google.maps.event.addListener(marker, 'click', function makeWindows()
                   {
                       //closes window if one exists
                       if (window)
                           window.close();

                       var content = '<div id="content">' +
                           '<div id="siteNotice">' +
                           '</div>' +
                           '<h1 id="firstHeading" class="firstHeading"></h1>' +
                           '<div id="bodyContent">' +
                           '<table>' +
                           '<tr>' +
                           '<th>Agency Id</th><td>' + current.AgencyId + '</td>' +
                           '</tr>' +
                           '<tr>' +
                           '<th>Device Id</th><td>' + current.DeviceId + '</td>' +
                           '</tr>' +
                           '<tr>' +
                           '<th>Is Standing</th><td>' + current.IsStanding + '</td>' +
                           '</tr>' +
                           '<tr>' +
                           '<th>Location</th><td>' + latlng.toString() + '</td>' +
                           '</tr>' +
                           '<tr>' +
                           '<th>Date</th><td>' + current.Date + '</td>' +
                           '</tr>' +
                           '<tr>' +
                           '<th>Vehicle Id</th><td>' + current.VehicleId + '</td>' +
                           '</tr>' +
                           '</table>' +
                           '</div>' +
                           '</div>';
                       
                       //makes and opens a new window for the current marker
                       window = new google.maps.InfoWindow
                       (
                           {
                               content: content
                           }
                       );

                       //binds the window to the marker&map
                       window.open(that.map, marker);
                   });

                   //adds the markers
                   markers.push(marker);
               })();
           }

       }

    }

    // constructor
    return{
        placeMarkers: placeMarker
    };

};