import {ax} from './ax'
// import { MessageBox } from 'mint-ui'

// 统一处理请求
function request ({url = '', type = 'get', data = {}}) {
  type = type.toLowerCase()
  // 对参数进行处理，将没有用的参数去除
  for (var key in data) { if (data[key] === '' || data[key] == null) delete data[key] }
  if (type === 'get') data = {params: data}
  return ax[type](url, data)
    .then(res => res.data)
    .catch(err => {
      console.log(err)
      return err;
    })
}

function isElInView (el) {
  if (el.style.display === 'none') return false
  var rect = el.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    Math.floor(rect.bottom) <= (window.innerHeight || document.documentElement.clientHeight) &&
    Math.floor(rect.right) <= (window.innerWidth || document.documentElement.clientWidth)
  )
}
export {request, isElInView}
