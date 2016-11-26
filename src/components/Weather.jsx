import React, { Component, PropTypes } from 'react'; // eslint-disable-line no-unused-vars
import reactMixin                      from 'react-mixin';
import { ListenerMixin }               from 'reflux';
import Mozaik                          from 'mozaik/browser';
import WeatherForecastItem             from './WeatherForecastItem.jsx';
import {
  icon as iconHelper,
  tempType
} from './WeatherCodeHelper';


// see http://openweathermap.org/weather-conditions for `weather.id` meaning

class Weather extends Component {
    constructor(props) {
        super(props);

        this.state = {
            current:  null,
            forecast: []
        };
    }

    getApiRequest() {
        const { city, country, lang, limit, units } = this.props;
        const params = {
            city,
            country,
            lang,
            limit,
            units
        };

        return {
            id:     `weather.combined.${city}.${country}.${lang}.${limit}.${units}`,
            params: params
        };
    }

    onApiData(weather) {
        this.setState(weather);
    }
    render() {
        const { city, country, units }     = this.props;
        const { current, forecast } = this.state;
        let descriptionNode = null;
        let tempNode        = null;
        let iconNode        = null;

        if (current && current.weather) {
            if (current.weather.length > 0) {
                descriptionNode = (
                    <div className="weather__weather__description">{current.weather[0].description}</div>
                );

                const iconClass = `weather__icon weather__icon--${iconHelper(current.weather[0].id)}`;
                iconNode = <i className={iconClass} />;
            }

            tempNode = (
                <span className="weather__weather__temp">
                    <span className="weather__weather__temp__value">{Math.round(current.main.temp)}</span>
                    <span className="weather__weather__temp__unit">°{tempType(units)}</span>
                </span>
            );
        }

        const forecastItemNodes = forecast.map((data, i) => (
            <WeatherForecastItem key={i} {...data} units={units} />
        ));

        return (
            <div>
                <div className="widget__header">
                    <span className="widget__header__subject">{city} - {country}</span>
                    <i className="fa fa-info-circle" />
                </div>
                <div className="widget__body">
                    <div className="weather__weather__current">
                        {iconNode}
                        {tempNode}
                        {descriptionNode}
                    </div>
                    <div className="weather__weather__forecast">
                        {forecastItemNodes}
                    </div>
                </div>
            </div>
        );
    }
}

Weather.displayName = 'Weather';

Weather.propTypes = {
    city:    PropTypes.string.isRequired,
    country: PropTypes.string.isRequired,
    limit:   PropTypes.number.isRequired,
    units:   PropTypes.oneOf([
        'imperial',
        'metric',
        'standard'
    ]),
    lang:    PropTypes.oneOf([
        'en',          // English
        'ru',          // Russian
        'it',          // Italian
        'es', 'sp',    // Spanish
        'uk', 'ua',    // Ukrainian
        'de',          // German
        'pt',          // Portuguese
        'ro',          // Romanian
        'pl',          // Polish
        'fi',          // Finnish
        'nl',          // Dutch
        'fr',          // French
        'bg',          // Bulgarian
        'sv', 'se',    // Swedish
        'zh_tw',       // Chinese Traditional
        'zh', 'zh_cn', // Chinese Simplified
        'tr',          // Turkish
        'hr',          // Croatian
        'ca'           // Catalan
    ]).isRequired
};

Weather.defaultProps = {
    lang:  'en',
    limit: 3,
    units: 'metric'
};

reactMixin(Weather.prototype, ListenerMixin);
reactMixin(Weather.prototype, Mozaik.Mixin.ApiConsumer);


export default Weather;
