// root namespace
var Eastbanc = Eastbanc || {};

// sub namespace
Eastbanc.Internship = Eastbanc.Internship || {};

// class
Eastbanc.Internship.MapsLocator = function(message)
{
    var that = this;
    that.quote = message;

    var soundAlarm = function()
    {
        alert(that.quote);
    };

    // constructor
    return {
        soundAlarm: soundAlarm,
    };
};

var a1 = new Eastbanc.Internship.MapsLocator("CK");
