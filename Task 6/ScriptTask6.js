// root namespace
var Eastbanc = Eastbanc || {};

// sub namespace
Eastbanc.Internship = Eastbanc.Internship || {};

// class
Eastbanc.Internship.Task6 = function(toAdd)
{
    var d = new Date();
    var fromUTE = new Time(d.getFullYear(), d.getMonth()+1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());
    var toUTE;

    update(toAdd);

    //updates toUTE from the toAdd
    function update(toAdd)
    {
        toUTE = new Time();
        toUTE.add(fromUTE);
        toUTE.add(toAdd);
    }

    return{
        fromUTE: fromUTE.toString(),
        toUTE: toUTE.toString(),
        update: update
    };
};

//time class
Time = function(pyear, pmonth, pdate, phour, pminute, psecond)
{
    var that = this;
    that.year = 0;
    that.month = 0;
    that.date = 0;
    that.hour = 0;
    that.minute = 0;
    that.second= 0;

    //constructor
    if(pyear !== undefined)
    {
        that.year = pyear;
        that.month = pmonth;
        that.date = pdate;
        that.hour = phour;
        that.minute = pminute;
        that.second = psecond;
    }

    //adds toAdd time object to time
    function add(toAdd)
    {
        that.year += toAdd.year;
        that.month += toAdd.month;
        that.date += toAdd.date;
        that.hour += toAdd.hour;
        that.minute += toAdd.minute;
        that.second += toAdd.second;
    }

    function wrap()
    {
        if(second > 60)
        {
            //second
        }
    }

    //returns time as a String
    function toString()
    {
        var toReturn = "";
        if(that.year < 1000)
        {
            if(that.year < 100)
            {
                if(that.year < 10)
                {
                    toReturn += "0";
                }
                toReturn += "0";
            }
            toReturn += "0";
        }
        
        toReturn += that.year + "-";
        
        if(that.month < 10)
        {
            toReturn += "0";
        }
        
        toReturn += that.month +"-";
        
        if(that.date < 10)
        {
            toReturn += "0";
        }
        
        toReturn += that.date +"T";
        
        if(that.minute < 10)
        {
            toReturn += "0";
        }
        
        toReturn += that.minute +":";
        
        if(that.second < 10)
        {
            toReturn += "0";
        }

        toReturn += that.second;
        //year +"-"+ month +"-"+ date +"T"+ hour +":"+ minute +":"+ second
        return toReturn;
    }

    return{
        year: that.year,
        month: that.month,
        date: that.date,
        hour: that.hour,
        minute: that.minute,
        second: that.second,
        add: add,
        toString: toString
    }
};