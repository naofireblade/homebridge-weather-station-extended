/*jshint esversion: 6,node: true,-W041: false */
"use strict";
const request = require('request'),
	converter = require('../util/converter');

class WundergroundAPI_new {
    constructor(apiKey, location, l, d) {
        this.attribution = 'Powered by Weather Underground';
        this.reportCharacteristics = [
            'ObservationStation',
            'ObservationTime',
            'WindDirection',
            'Humidity',
            'SolarRadiation',
            'UVIndex',
            'Temperature',
            'DewPoint',
            'AirPressure',
            'WindSpeed',
            'WindSpeedMax'
        ];
        
        /* no example data for forecasts */
        /*
        this.forecastCharacteristics = [
            'Condition',
            'ConditionCategory',
            'ForecastDay',
            'Humidity',
            'RainChance',
            'RainDay',
            'Temperature',
            'TemperatureMin',
            'WindDirection',
            'WindSpeed',
            'WindSpeedMax'
        ];
        this.forecastDays = 4;
        */
        
        this.location = location;
        this.apiKey = apiKey;
        
        this.log = l;
        this.debug = d;

    }

    update(callback) {
        this.debug("Updating weather with weather underground");

        const queryUri = "https://api.weather.com/v2/pws/observations/current?apiKey="+this.apiKey+"&stationId="+this.location+"&format=json&units=s";
        request(encodeURI(queryUri), function (err, response, body) {
            if (!err) {
                // Current weather report
                const jsonObj = JSON.parse(body);
                this.parseReport(jsonObj, callback);
            } else {
                this.log.error("Error retrieving weather report and forecast");
                this.log.error("Error Message: " + err);
                callback(err);
            }
        }.bind(this));
    }

    parseReport(values) {
        let report = {};
        
        /* EXAMPLE values
        	
		observations	
			0	
				stationID	"KCASANJO898"
				obsTimeUtc	"2019-09-01T19:03:41Z"
				obsTimeLocal	"2019-09-01 12:03:41"
				neighborhood	"West San Jose - Casa de la Niles"
				softwareType	"WS-1002 V2.4.6"
				country	"US"
				solarRadiation	719.2
				lon	-122.01569366
				realtimeFrequency	null
				epoch	1567364621
				lat	37.30566025
				uv	9
				winddir	326
				humidity	49
				qcStatus	1
				metric_si	# imperial | metric | metric_si | uk_hybrid	(I always fetch metric_si)
					temp	30
					heatIndex	31
					dewpt	18
					windChill	30
					windSpeed	3
					windGust	3
					pressure	1010.16
					precipRate	0
					precipTotal	0
					elev	105
		*/

        try {
        	var observation = values.observations[0]
            var metric = observation.metric_si;
        	
            report.ObservationStation = observation.stationID + " : " + observation.neighborhood;
            report.ObservationTime = observation.obsTimeUtc.split(' ')[4];

        	report.WindDirection = converter.getWindDirection(isNaN(parseInt(observation.wind_dir)) ? 0 : parseInt(values.wind_dir));
            report.Humidity 		= isNaN(parseInt(observation.humidity)) ? 0 : parseInt(values.humidity);
            report.SolarRadiation 	= isNaN(parseInt(observation.solarRadiation)) ? 0 : parseInt(observation.solarRadiation);
            report.UVIndex 			= isNaN(parseInt(observation.uv)) ? 0 : parseInt(observation.uv);
            
            report.Temperature 		= isNaN(parseInt(metric.temp)) ? 0 : parseInt(metric.temp);
            report.DewPoint 		= isNaN(parseInt(metric.dewpt)) ? 0 : parseInt(metric.dewpt);
            report.AirPressure 		= isNaN(parseInt(metric.pressure)) ? 0 : parseInt(metric.pressure);
            report.WindSpeed 		= isNaN(parseInt(metric.windSpeed)) ? 0 : parseInt(metric.windSpeed);
            report.WindSpeedMax 	= isNaN(parseInt(metric.windGusts)) ? 0 : parseInt(metric.windGusts);
        }
        catch(error) {
            this.log.error("Error retrieving weather report for Weather Underground");
            this.log.error("Error Message: " + error);
        }

        return report;
    }

    parseForecasts(forecastObjs, timezone) {
        let forecasts = [];
        var observation = values.observations[0]

    /* I DON'T HAVE AN EXAMPLE WITH FORECASTS*/
    /*
        for (let i = 0; i < forecastObjs.length; i++) {
            const values = forecastObjs[i];
            const forecast = {};
            forecast.Condition = values.text;
            forecast.ConditionCategory = converter.getConditionCategoryOwm(parseInt(values.code));
            forecast.ForecastDay = moment(values.date, "DD MMM YYYY").tz(timezone).format("dddd");
            forecast.Temperature = values.high;
            forecast.TemperatureMin = values.low;
            forecasts[forecasts.length] = forecast;
        }
    */
        return forecasts;
    }
}

module.exports = {
    WundergroundAPI_new: WundergroundAPI_new
};