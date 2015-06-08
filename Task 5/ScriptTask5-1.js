// root namespace
var Eastbanc = Eastbanc || {};

// sub namespace
Eastbanc.Internship = Eastbanc.Internship || {};

// class
Eastbanc.Internship.Task5 = function(map)
{
    var that = this;
    that.map = map;

    function placeMarker(data, markerImage)
    {
       place(data, markerImage);
        
        function place(data, markerImage, startSize, endSize)
        {
            var markers = [];
            var window;
            var size = startSize;
            var increment = (startSize - endSize)/data.length;

            for(var index = data.length-1; index >= 0; index--)
            {
                (function makeMarkers()
                {
                    var current = data[index];
                    var latlng = new google.maps.LatLng(current.Lat, current.Lon);

                    size *= increment;

                    var image =
                    {
                        url: markerImage,
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
        placeMarkers: placeMarker(data, markerImage)
    };

};