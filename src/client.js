import request from 'superagent';
import Promise from 'bluebird';
import cache   from 'memory-cache';
import config  from './config';
require('superagent-bluebird-promise');


const API_BASE_URL = 'http://api.openweathermap.org/data/2.5';


/**
 * @param {Mozaik} mozaik
 */
const client = mozaik => {
    mozaik.loadApiConfig(config);

    const token = config.get('weather.apiToken');

    const methods = {
        current(params) {
            const { city, country, lang, units, cid, lat, lon} = params;
            console.log(params);
            const cacheKey = `weather.current.${city}.${country}.${lang}.${units}.${cid}.${lat}.${lon}`;
            mozaik.logger.info(`[weather] fetching for city:${city} country:${country} lang:${lang} units:${units} id:${cid} lat:${lat} lon:${lon}`);

            if (cache.get(cacheKey) !== null) {
                return new Promise((resolve) => {
                    resolve(cache.get(cacheKey));
                });
            }

            return request.get(`${API_BASE_URL}/weather?lang=${lang}&q=${city},${country}&units=${units}&appid=${token}`)
                .promise()
                .then((res) => {
                    cache.put(cacheKey, res.body, 1800000);

                    return res.body;
                })
            ;
        },

        forecast(params) {
            const { city, country, lang, limit, units, cid, lat, lon } = params;
            const cacheKey = `weather.forecast.${city}.${country}.${lang}.${limit}.${units}.${cid}.${lat}.${lon}`;
            mozaik.logger.info(`[weather] fetching for city:${city} country:${country} lang:${lang} units:${units} id:${cid} lat:${lat} lon:${lon}`);

            if (cache.get(cacheKey) !== null) {
                return new Promise((resolve) => {
                    resolve(cache.get(cacheKey));
                });
            }

            return request.get(`${API_BASE_URL}/forecast/daily?mode=json&cnt=${limit}&lang=${lang}&q=${city},${country}&units=${units}&appid=${token}`)
                .promise()
                .then((res) => {
                    cache.put(cacheKey, res.body.list, 1800000);

                    return res.body.list;
                })
            ;
        },

        combined(params) {
            const { city, country, lang, limit, units, cid, lat, lon } = params;
            const cacheKey = `weather.combined.${city}.${country}.${lang}.${limit}.${units}.${cid}.${lat}.${lon}`;
            mozaik.logger.info(`[weather] fetching for city:${city} country:${country} lang:${lang} units:${units} id:${cid} lat:${lat} lon:${lon}`);

            if (cache.get(cacheKey) !== null) {
                return new Promise((resolve) => {
                    resolve(cache.get(cacheKey));
                });
            }

            return Promise.props({
                current:  methods.current(params),
                forecast: methods.forecast(params)
            })
                .then((res) => {
                    cache.put(cacheKey, res, 1800000);

                    return res;
                })
            ;
        }
    };

    return methods;
};


export default client;
