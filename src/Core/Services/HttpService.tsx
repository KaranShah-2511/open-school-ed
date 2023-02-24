/* 
Author: Zankat Kalpesh
Email: zankatkalpesh@gmail.com
*/

import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import _ from "lodash";
import qs from 'qs';
import { Auth } from "./AuthService";

const HttpService = (function () {

  const setHeaders = (headers: any) => {
    //Default Headers
    const _HEADERS: any = {
      'Content-Type': 'application/json'
    };
    // Add Authorization
    const user = Auth.getUser();
    if (Auth.isAuthorized()) {
      _HEADERS['Authorization'] = ['JWT', user.Token].join(' ');
    }
    //Add Headers
    _.each(_HEADERS, (val, key) => {
      if (headers[key] === undefined) {
        headers[key] = val;
      }
    });
    return headers;
  }

  const transformRequest = (data: any, headers: any) => {
    headers = setHeaders(headers);
    const contentType = headers['Content-Type'];
    if (data !== undefined && contentType === 'application/json') {
      data = JSON.stringify(data);
    } else if (data !== undefined && contentType === 'application/x-www-form-urlencoded') {
      data = qs.stringify(data);
    } else if (data !== undefined && (!(data instanceof FormData) && contentType === 'multipart/form-data')) {
      let frmData = new FormData();
      for (let key in data) {
        if (data[key] instanceof Array && data[key].length) {
          for (let k in data[key]) {
            frmData.append(key, data[key][k]);
          }
        } else {
          frmData.append(key, data[key]);
        }
      }
      data = frmData;
    }
    return data;
  }

  // const transformResponse = (data: any, headers: any) => {
  //   return JSON.parse(data);
  // }

  const handleResponse = (response: any) => {
    const user = Auth.getUser();
    if (Auth.isAuthorized()) {
      if (response.data.code === "401" && response.data.flag === false) {
        Auth.logout()
          .then(() => {
            window.location.replace('/login/' + user.userType.Type);
          });
      }
    }
    return response;
  }

  const handleError = (errors: any) => {
    throw errors;
  }

  let _CONFIG: AxiosRequestConfig = {
    baseURL: process.env.REACT_APP_API_ENDPOINT || '',
    timeout: Number(process.env.REACT_APP_API_TIMEOUT) || 0,
    transformRequest: transformRequest,
    // transformResponse: transformResponse,
  }

  class HttpService {

    constructor(config = {}) {
      _CONFIG = _.merge(_CONFIG, config);
    }

    get instance(): AxiosInstance {
      return axios.create(_CONFIG);
    }

    get(url: string, config = {}): Promise<any> {
      return this.instance.get(url, config)
        .then(handleResponse)
        .catch(handleError);
    }

    post(url: string, body = {}, config = {}): Promise<any> {
      return this.instance.post(url, body, config)
        .then(handleResponse)
        .catch(handleError);
    }

    put(url: string, body = {}, config = {}): Promise<any> {
      return this.instance.put(url, body, config)
        .then(handleResponse)
        .catch(handleError);
    }

    delete(url: string, config = {}): Promise<any> {
      return this.instance.delete(url, config)
        .then(handleResponse)
        .catch(handleError);
    }

  }

  return HttpService;
})();

export const Http = new HttpService();

export default HttpService;
