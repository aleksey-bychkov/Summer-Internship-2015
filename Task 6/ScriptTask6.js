// root namespace
var Eastbanc = Eastbanc || {};

// sub namespace
Eastbanc.Internship = Eastbanc.Internship || {};

// class
Eastbanc.Internship.Task6 = function(toAdd)
{
    var that = this;
    that.toUTE = new Date();
    that.fromUTE = new Date();

    update(toAdd);

    //updates fromUTE from the toAdd
    function update(toAdd)
    {
        that.toUTE = new Date();
        that.fromUTE.setTime(that.toUTE.getTime() - toAdd);

        return{
            toUTE: (that.toUTE.toJSON()).substr(0,19),
            fromUTE: (that.fromUTE.toJSON()).substr(0,19),
            update: update
        };
    }

    this.update = update;

    return{
        toUTE: (that.toUTE.toJSON()).substr(0,19),
        fromUTE: (that.fromUTE.toJSON()).substr(0,19),
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
        if(that.second >= 60)
        {
            that.minutes += Math.floor(that.second/60);
            that.second %= 60;
        }
        if(that.minutes >= 60)
        {
            that.hour += Math.floor(that.minutes/60);
            that.minutes %= 60;
        }
        if(that.hour >= 24)
        {
            that.date += Math.floor(that.hour/24);
            that.hour %= 24;
        }
        if(that.date >= 27)
        {
            if(that.date >= 28)//1 3 5 7 8 10 12 for 31
            {
                if(that.month === 2 && that.year%4 !== 0)
                {

                }
            }
            }
            if(that.month > 12)
            {
                that.year += Math.floor(that.month/12);
                that.month %= 12;
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

    this.toString = toString;
    this.add = add;

    return{
        year: that.year,
        month: that.month,
        date: that.date,
        hour: that.hour,
        minute: that.minute,
        second: that.second,
        add: add,
        toString: toString
    };


};