function doThings()
{
    var publicAPI =
    {
        placeMarkers: placeMarkers,
        clearMarkers: clearMap,
        addListToElement: addListToElement,
        updateTime: updateTime,
        updateDate: updateDate,
        updateVehicleId: updateVehicleId,
        updateShowingOnlyNextBus: updateShowingOnlyNextBus,
        setBase: setBase,
        setMap: setMap,
        setNextBusImage: setNextBusImage,
        setTransitIQImage: setTransitIQImage,
        placeAll: placeAll,
        returnMarkers: returnMarkers
    };

    var map;
    var showingOnlyNextBus = false;
    var transitIQImage = 'transitIQ.png';
    var nextBusImage = 'nextBus.png';
    var markers = [];
    var buses = [];
    var url =
    {
        markers: "http://transitiqdatareceiver.cloudapp.net/DataReceiver.svc/GetRawCoords",
        busList: "http://transitiqapi.cloudapp.net/Service.svc/VehiclesListForServiceDate",
        vehicleId: "",
        key: "DcCi",
        currentDate: (new Date()).toJSON().substr(0,10),
        toUTC: new Date(),
        fromUTC: new Date(),
        markerURL: function markerURL()
        {
            return url.markers + "?vehicleId=" + url.vehicleId + "&key=" + url.key + "&toUtc=" + (url.toUTC.toJSON()).substr(0,19) + "&fromUtc=" + (url.fromUTC.toJSON()).substr(0,19) + "&format=json";
        },
        busListURL: function busListURL()
        {
            return url.busList + "?orgId=" + url.key + "&serviceDate=" + url.currentDate + "&inServiceOnly=true&activeDevicesOnly=true&format=json";
        }
    };

    return publicAPI;

    //updates the variables inside.
    function setBase(pmarkers, pkey, pbusList)
    {
        url.markers = pmarkers;
        url.key = pkey;
        url.busList = pbusList;
    }

    //sets the map the the paramater map
    function setMap(pmap)
    {
        map = pmap;
    }

    //sets the image for the marker that show that the DeviceID is null
    function setNextBusImage(pmarkerImage)
    {
        nextBusImage = pmarkerImage;
    }

    //sets the image for the marker that show that the DeviceID isn't null
    function setTransitIQImage(pmarkerImage)
    {
        transitIQImage = pmarkerImage;
    }

    //sets the VehicleId to the paramater
    function updateVehicleId(pvehicleId)
    {
        url.vehicleId = pvehicleId;
    }

    //updates the date to the current date
    function updateDate()
    {
        this.currentDate = (new Date()).toJSON().substr(0,10);
    }

    //updates the time you want to grab things from
    function updateTime(ptoUTC, pfromUTC)
    {
        url.toUTC = ptoUTC;
        url.fromUTC = pfromUTC;
    }

    //when calles changes ShowingOnlyNextBus calls shows and returns the new ShowingOnlyNextBus value
    function updateShowingOnlyNextBus()
    {
        showingOnlyNextBus = !showingOnlyNextBus;
        show();
        return showingOnlyNextBus;
    }

    //adds a list of all the active buses to the toAddToElementID
    function addListToElement(toAddToElementID, timeElementID)
    {
        $.ajax(
            {
                url: url.busListURL(),
                jsonp: "callback",
                dataType: "jsonp",
                success: function(data)
                {
                    if(data.length >= 1)
                        addAll(toAddToElementID, timeElementID, data);
                    else
                    {
                        alert("No buses");
                    }

                },
                error: function ()
                {
                    alert("Failed to retrieve info!");
                }
            });


        function addAll(addElementID, timeID, data)
        {
            for(var index = 0; index < data.length; index++)
            {
                (function addBuses()
                {
                    var current = data[index];

                    buses.push(current.VehicleId);

                    var $busListNode = $("<li>",
                    {
                        id: current.VehicleId,
                        class: "notSelected"
                    });

                    $busListNode.append(current.VehicleType+ " " + current.VehicleId);

                    $busListNode.click(function onClick()
                    {
                        $("#" + addElementID).find("li.selected").attr("class", "notSelected");

                        $busListNode.attr("class", "selected");


                        updateVehicleId(current.VehicleId);
                        updateTime((new Date()), new Date((new Date()).getTime() - ($("#" + timeID).val()) * 60000));
                        placeMarkers();
                    });

                    $("#" + addElementID).append($busListNode);
                })();
            }
        }
    }

    //if showingOnlyNextBus is true then only shows showingOnlyNextBus
    function show()
    {
        if(showingOnlyNextBus)
        {
            showWhat(nextBusImage);
        }
        else
        {
            showWhat();
        }

        //if image is undefined shows all images. Otherwise only shows the paramater
        function showWhat(image)
        {
            for(var index = 0; index < markers.length; index++)
            {
                var current = markers[index];

                if(image == undefined)
                    current.setMap(map);
                else
                {
                    if(current.icon.url === image)
                        current.setMap(map);
                    else
                        current.setMap(null);
                }

            }
        }
    }

    function returnMarkers()
    {
        return markers;
    }

    //places all the markers for all the buses for the past time where time is the number of hours
    function placeAll()
    {
        clearMap();
        markers = [];
        url.vehicleId = buses[0];
        var endDate = new Date("Mon Jun 22 2015 15:00:00 GMT-0400 (Eastern Daylight Time)");
        var startDate = new Date(endDate.getTime() - (1 * 60 * 60 * 1000));
        var bounds = new google.maps.LatLngBounds(null);
        var interval = 15 * 60 * 1000;
        var numIntervals = (startDate.getTime() - endDate.getTime())/interval;
        var currentInterval = 1;

        url.fromUTC = startDate;
        url.toUTC = new Date(startDate.getTime() + (interval));


        place(interval, 30);

        show();

        function place(interval, startSize)
        {
            if(url.toUTC.toString() != endDate.toString())
            {
                $.ajax(
                    {
                        url: url.markerURL(),
                        jsonp: "callback",
                        dataType: "jsonp",
                        success: function(info)
                        {
                            doMarkers(info, (startSize * currentInterval)/numIntervals);

                            map.fitBounds(new google.maps.LatLngBounds(null));
                            map.fitBounds(bounds);
                            currentInterval++;

                            url.fromUTC = url.toUTC;
                            url.toUTC = new Date(url.fromUTC.getTime() + interval);

                            place(interval);
                        },
                        error: function ()
                        {
                            alert("Failed to retrieve info!");
                        }
                    });
            }

            function doMarkers(information, size)
            {

                var infoWindow;
                var latlng;

                for(var index = information.length-1; index >= 0; index--)
                {
                    (function makeMarkers()
                    {
                        var current = information[index];
                        var markerImage = transitIQImage;

                        latlng = new google.maps.LatLng(current.Lat, current.Lon);

                        bounds.extend(latlng);

                        var mSize = (index * size)/information.length + 10;

                        if(current.DeviceId == null)
                            markerImage= nextBusImage;

                        var image = {
                            url: markerImage,
                            size: new google.maps.Size(mSize, mSize),
                            origin: new google.maps.Point(mSize/2,mSize/2)
                        };

                        //makes the markers
                        var marker = new google.maps.Marker
                        (
                            {
                                map: map,
                                icon: image,
                                title: index+"",
                                position: latlng
                            }
                        );

                        //makes the info window
                        var time = current.ReportDateUtc;
                        time = time.substring(time.indexOf("(")+1, time.indexOf(")"));
                        time = new Date(parseInt(time));

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
                            //closes infoWindow if one exists
                            if (infoWindow)
                                infoWindow.close();

                            //makes and opens a new infoWindow for the current marker
                            infoWindow = new google.maps.InfoWindow
                            (
                                {
                                    content: content
                                }
                            );

                            //binds the infoWindow to the marker&map
                            infoWindow.open(map, marker);
                        });

                        //adds the markers
                        markers.push(marker);
                    })();
                }
            }
        }


    }

    //public method that places markers on the map using the information it has
    function placeMarkers()
    {
        clearMap();

        $.ajax(
            {
                url: url.markerURL(),
                jsonp: "callback",
                dataType: "jsonp",
                success: function(data)
                {
                    if(data.length >= 1)
                        place(data);
                    else
                    {
                        $("#" + url.vehicleId).attr("class", "notWorking");
                        alert("Data was empty");
                    }

                },
                error: function ()
                {
                    alert("Failed to retrieve info!");
                }
            });

        //takes in an array of JSON objects and adds makers on a map based off of the array
        function place(information)
        {
            markers = [];
            map.fitBounds(new google.maps.LatLngBounds(null));

            var infoWindow;
            var size = 23;
            var bounds = new google.maps.LatLngBounds(null);
            var latlng;

            for(var index = information.length-1; index >= 0; index--)
            {
                (function makeMarkers()
                {
                    var current = information[index];
                    var markerImage = transitIQImage;

                    latlng = new google.maps.LatLng(current.Lat, current.Lon);

                    bounds.extend(latlng);

                    var mSize = (index * size)/information.length + 15;

                    if(current.DeviceId == null)
                        markerImage= nextBusImage;

                    var image = {
                        url: markerImage,
                        size: new google.maps.Size(mSize, mSize),
                        origin: new google.maps.Point(mSize/2,mSize/2)
                    };

                    //makes the markers
                    var marker = new google.maps.Marker
                    (
                        {
                            map: map,
                            icon: image,
                            title: markers.length+"",
                            position: latlng
                        }
                    );

                    //makes the info window
                    var time = current.ReportDateUtc;
                    time = time.substring(time.indexOf("(")+1, time.indexOf(")"));
                    time = new Date(parseInt(time));

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
                        //closes infoWindow if one exists
                        if (infoWindow)
                            infoWindow.close();

                        //makes and opens a new infoWindow for the current marker
                        infoWindow = new google.maps.InfoWindow
                        (
                            {
                                content: content
                            }
                        );

                        //binds the infoWindow to the marker&map
                        infoWindow.open(map, marker);
                    });

                    //adds the markers
                    markers.push(marker);
                })();
            }

            map.fitBounds(bounds);
            show();
        }
    }

    //clears the map of all markers
    function clearMap()
    {
        for(var i = 0; i < markers.length; i++)
        {
            markers[i].setMap(null);
        }

        markers = [];
    }
}