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
           var window;
           var size = 25;

           for(var index = information.length-1; index >= 0; index--)
           {
               (function makeMarkers()
               {
                   var current = information[index];
                   var latlng = new google.maps.LatLng(current.Lat, current.Lon);

                   size *= .985;

                   var image = {
                       url: 'newMarker.png',
                       // This marker is 20 pixels wide by 32 pixels tall.
                       size: new google.maps.Size(size, size),
                       // The origin for this image is 0,0.
                       origin: new google.maps.Point(size/2,size/2)
                   };

                   //makes the markers
                   var marker = new google.maps.Marker
                   (
                       {
                           map: that.map,
                           icon: image,
                           title: index+"",
                           position: latlng
                       }
                   );

                   var time = current.ReportDateUtc;
                   time = time.substring(time.indexOf("(")+1, time.indexOf(")"));
                   time = parseInt(time);

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
                           '<th>Vehicle Id</th><td>' + current.VehicleId + '</td>' +
                           '</tr>' +
                           '<tr>' +
                           '<th>Time</th><td>' + time + '</td>' +
                           '</tr>' +
                       '</table>' +
                       '</div>' +
                       '</div>';

                   google.maps.event.addListener(marker, 'click', function makeWindows()
                   {
                       //closes window if one exists
                       if (window)
                           window.close();

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