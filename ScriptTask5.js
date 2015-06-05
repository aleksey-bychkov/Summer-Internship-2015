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

    function placeMarkers()
    {
        var url = document.getElementById("dataURL").value;
        var data = getData(url);
        var markers = [];


        for(var x = 0; x < data.length; x++)
        {
            (function makeMarkers()
            {
                var current = data[x];
                var latlng = getLatLng(current);

                //makes the markers
                var marker = new google.maps.Marker
                (
                    {
                        map: that.map,
                        title: x,
                        position: latlng
                    }
                );


                google.maps.event.addListener(marker, 'click', function makeWindows() {
                    //closes window if one exists
                    if (window)
                        window.close();

                    //makes and opens a new window for the current marker
                    window = new google.maps.InfoWindow
                    (
                        {
                            content: info = '<div id="content">' +
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
                                '</div>'
                        }
                    );

                    //binds the window to the marker&map
                    window.open(that.map, marker);
                });

                //adds the markers
                markers.push(marker);
            })();
        }

        function getData(url)
        {
            $.ajax(
                {
                    url: url,
                    jsonp: "callback",
                    dataType: "jsonp",
                    success: function(data)
                    {
                        return data;
                    },
                    error: function ()
                    {
                        alert("Failed to retrieve data!");
                    }
                });
        }

        function getLatLng(data)
        {
            return new google.maps.LatLng(data.lat, data.lon);
        }

    }

    // constructor
    return
    {
        placeMarkers: placeMarkers
    };

};