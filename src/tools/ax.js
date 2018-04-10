import axios from 'axios'
import Qs from 'qs'
import router from '@/router'
// axios 的一些配置
var ax = axios.create({
  baseURL: 'http://122.152.215.207:8080/api/',
  paramsSerializer: function (params) {
    return Qs.stringify(params, {arrayFormat: 'repeat'})
  }
})

ax.interceptors.request.use((config) => {
  if (config.url === '/user/login') return config;
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['x-token'] = token
  }
  return config
})

ax.interceptors.response.use(
  res => res,
  err => {
    if (err.response.status === 401) {
      localStorage.removeItem('token')
      router.push({name: 'Login'})
    }
    return Promise.reject(err)
  }
)

export {ax, storage}
