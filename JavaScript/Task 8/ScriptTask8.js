function doThings()
{
    var publicAPI =
    {
        clearMarkers: clearMap,
        addListToElement: addListToElement,
        updateTime: updateTime,
        updateDate: updateDate,
        updateVehicleId: updateVehicleId,
        updateShowingOnlyNextBus: updateShowingOnlyNextBus,
        setBase: setBase,
        setMap: setMap,
        setNextBusImage: setNextBusImage,
        setTransitIQImage: setTransitIQImage
    };

    var map;
    var showingOnlyNextBus = false;
    var transitIQImage = 'transitIQ.png';
    var nextBusImage = 'nextBus.png';
    var allMarkers = [];
    var buses = [];
    var url =
    {
        allMarkers: "http://transitiqdatareceiver.cloudapp.net/DataReceiver.svc/GetRawCoords",
        busList: "http://transitiqapi.cloudapp.net/Service.svc/VehiclesListForServiceDate",
        vehicleId: "",
        key: "DcCi",
        currentDate: (new Date()).toJSON().substr(0,10),
        toUTC: new Date(),
        fromUTC: new Date((new Date()).getTime() - 900000),
        markerURL: function markerURL()
        {
            return url.allMarkers + "?vehicleId=" + url.vehicleId + "&key=" + url.key + "&toUtc=" + (url.toUTC.toJSON()).substr(0,19) + "&fromUtc=" + (url.fromUTC.toJSON()).substr(0,19) + "&format=json";
        },
        busListURL: function busListURL()
        {
            return url.busList + "?orgId=" + url.key + "&serviceDate=" + url.currentDate + "&inServiceOnly=true&activeDevicesOnly=true&format=json";
        }
    };

    return publicAPI;

    //updates the variables inside.
    function setBase(pallMarkers, pkey, pbusList)
    {
        url.allMarkers = pallMarkers;
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
    function updateShowingOnlyNextBus(checkBox)
    {
        showingOnlyNextBus = checkBox.checked;
        show();
    }

    //if showingOnlyNextBus is true then only shows showingOnlyNextBus
    function show()
    {
        //checks the buses first
        for(var index=0; index < buses.length; index++)
        {
            //if the bus is checked checks for next bus markers
            if(buses[index].checked)
            {
                for(var x = 0; x < buses[index].markers.length; x++)
                {
                    (function()
                    {
                        var current =  buses[index].markers[x];
                        if(showingOnlyNextBus)
                        {
                            if(current.icon.url === transitIQImage)
                                current.setVisible(false);
                            else
                                current.setVisible(true);
                        }
                        else
                        {
                            current.setVisible(true);
                        }
                    }());
                }
            }
        }
    }

    //adds a list of all the active buses to the toAddToElementID
    function addListToElement(toAddToElementID)
    {
        $.ajax(
            {
                url: url.busListURL(),
                jsonp: "callback",
                dataType: "jsonp",
                success: function(data)
                {
                    if(data.length >= 1)
                        addAll(toAddToElementID, data);
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


        function addAll(addElementID, data)
        {

            for(var index = 0; index < data.length; index++)
            {
                (function addBuses()
                {
                    var current = data[index];

                    var toAdd =
                    {
                        busNumber: current.VehicleId,
                        bounds: null,
                        markers: null
                    };

                    var $busListNode = $("<li>",
                    {
                        id: current.VehicleId
                    });

                    var $checkbox= $(document.createElement('input')).attr(
                    {
                        id:    "cb" + current.VehicleId,
                        type:  'checkbox'
                    });

                    $busListNode.append($checkbox);

                    $busListNode.append(current.VehicleType+ " " + current.VehicleId);

                    url.vehicleId = current.VehicleId;

                    var end = new Date();
                    var start = new Date(end.getTime() - (2 * 60 * 60 * 1000));
                    var temp = placeLotsOfMarkers(start, end, 900000, current.VehicleId);

                    toAdd.markers = temp.markers;
                    toAdd.bounds = temp.bounds;
                    toAdd.checked = $checkbox.is(":checked");

                    $busListNode.click(function onClick()
                    {
                        toAdd.checked = $checkbox.is(":checked");

                        for (var markerIndex = 0; markerIndex < toAdd.markers.length; markerIndex++) {
                            (function () {
                                var current = toAdd.markers[markerIndex];
                                if (showingOnlyNextBus) {
                                    if (current.icon.url === transitIQImage)
                                        current.setVisible(false);
                                    else
                                        current.setVisible(toAdd.checked);
                                }
                                else {
                                    current.setVisible(toAdd.checked);
                                }
                            }());
                        }

                        var bounds = new google.maps.LatLngBounds();

                        for (var x = 0; x < buses.length; x++) {
                            if (buses[x].checked) {
                                if (!buses[x].bounds.equals(new google.maps.LatLngBounds(null)))
                                    bounds.union(buses[x].bounds);
                            }
                        }

                        map.fitBounds(new google.maps.LatLngBounds(null));

                        if(!bounds.equals(new google.maps.LatLngBounds()))
                            map.fitBounds(bounds);
                        else
                        {
                            map.panTo(new google.maps.LatLng(38.8977, -77.0366));
                            map.setZoom(15);
                        }
                    });

                    buses.push(toAdd);

                    $("#" + addElementID).append($busListNode);
                })();
            }

        }
    }

    function gatherInfo(appendToID)
    {
        var nextBusPings = [];

        for(var index = 0; index < buses.length; index++)
        {
            (function()
            {
                var current = buses[index];
                for (var x = 0; x < current.markers.length; x++)
                {
                    (function ()
                    {
                        var currentb = current[x];

                        if (currentb.icon.url === nextBusImage)
                        {
                            nextBusPings.push(currentb);
                        }
                    }());
                }
            }());
        }

    }

    function placeLotsOfMarkers(pStartDate, pEndDate, pInterval, pVehicleId)
    {
        var endDate = pEndDate;
        var startDate = pStartDate;
        var interval = pInterval;

        url.vehicleId = pVehicleId;

        var bounds = new google.maps.LatLngBounds();
        var numIntervals = (endDate.getTime() - startDate.getTime()) / interval;
        var currentInterval = 1;
        var markers = [];

        url.fromUTC = startDate;
        url.toUTC = new Date(startDate.getTime() + (interval));

        placeIncrement(interval);

        return {
            bounds: bounds,
            markers: markers
        };

        function placeIncrement(pinterval)
        {
            if (url.toUTC.getTime() <= endDate.getTime())
            {
                $.ajax(
                    {
                        url: url.markerURL(),
                        jsonp: "callback",
                        dataType: "jsonp",
                        success: function (info)
                        {
                            placeInformation(info, (25 * currentInterval) / numIntervals);

                            url.fromUTC = url.toUTC;
                            url.toUTC = new Date(url.fromUTC.getTime() + pinterval);
                            currentInterval++;

                            placeIncrement(pinterval);
                        },
                        error: function ()
                        {
                            alert("Failed to retrieve info!");
                        }
                    });
            }

            function placeInformation(information, size)
            {
                var infoWindow;
                var latlng;

                //iterates through the array of information
                for (var index = information.length - 1; index >= 0; index--) {
                    (function makeMarkers() {

                        //makes a local variable of data that is being used
                        var current = information[index];

                        //sets the apropreate image for the marker
                        var markerImage = transitIQImage;
                        if (current.DeviceId == null)
                            markerImage = nextBusImage;

                        //grabs the location for the marker from current and adds it to the bounds of the map
                        latlng = new google.maps.LatLng(current.Lat, current.Lon);
                        bounds.extend(latlng);

                        //calculates the size diffrence between every data point
                        var mSize = ((index * size) / information.length) + 10;

                        //makes the marker image with the size and sets the origin on the center of the image
                        var image = {
                            url: markerImage,
                            size: new google.maps.Size(mSize, mSize),
                            origin: new google.maps.Point(mSize / 2, mSize / 2)
                        };

                        //makes the marker
                        var marker = new google.maps.Marker
                        (
                            {
                                map: map,
                                icon: image,
                                title: allMarkers.length + "",
                                position: latlng,
                                visible: false,
                                information: current
                            }
                        );

                        //makes the info window
                        var time = current.ReportDateUtc;
                        time = time.substring(time.indexOf("(") + 1, time.indexOf(")"));
                        time = new Date(parseInt(time));

                        var content = '<div id="content">' +
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

                        //makes the infoWindow operatable
                        google.maps.event.addListener(marker, 'click', function makeWindows() {
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

                            //binds the infoWindow to the marker & the map
                            infoWindow.open(map, marker);
                        });

                        //adds the markers to the total markers on the map and the array of markers added
                        markers.push(marker);
                        allMarkers.push(marker);
                    })();
                }
            }
        }
    }

    //clears the map of all allMarkers
    function clearMap()
    {
        for(var i = 0; i < allMarkers.length; i++)
        {
            allMarkers[i].setMap(null);
        }

        allMarkers = [];
    }
}