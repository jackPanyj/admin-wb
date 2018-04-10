<template>
<div class="login flex-d">
  <header class="flex">
    <div class="logo"></div>
    <div style="margin: 10px 168px; color: #0172bd;">
      <p class="fz-14 bold" style="letter-spacing: 1em;">为式智能</p>
      <p class="fz-12" style="color: #666;">wizer intelligence</p>
    </div>
    <div class="login-btn" @click="hasOverlay=true">登录</div>
  </header>
  <div class="content fg-1">
    <p>寻找那片光</p>
  </div>
  <div class="footer center">关于为式</div>
  <div class="overlay" v-show="hasOverlay">
    <div class="pannel flex-d">
      <el-input v-model.trim="params.mobile" placeholder="请输入手机号" prefix-icon="el-icon-phone"></el-input>
      <el-input v-model.trim="params.password" placeholder="请输入密码" prefix-icon="el-icon-sold-out" type="password"></el-input>
      <el-button type="primary" @click="login">登录</el-button>
      <div class="close" @click="hasOverlay = false">
        <i  class="el-icon-close"></i>
      </div>
    </div>
  </div>
</div>
</template>

<script>
export default {
  data () {
    return {
      hasOverlay: false,
      params: {
        mobile: '',
        password: ''
      }
    }
  },
  methods: {
    login () {
      if (!this.params.mobile || !this.params.password) {
        return this.$message.error('手机号或密码输入不正确')
      }
      this.$http({
        url: '/user/login',
        type: 'post',
        data: this.params
      })
      .then(res => {
        localStorage.token = res.data.token
        this.$router.push({name: 'Map', params: {id: 1}})
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.pannel {
  width: 300px;
  height: 300px;
  margin: auto;
  > * {
    margin-bottom: 20px;
  }
}
.overlay {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, .3);
  .close {
    font-size: 36px;
    text-align: center;
    i {
      border: 1px solid;
      border-radius: 50%;
      color: white;
    }
  }
}
header {
  height: 50px;
  position: relative;
}
.login-btn {
  margin-right: 50px;
  margin-left: auto;
  line-height: 50px;
  cursor: pointer;
}
.logo {
  position: absolute;
  height: 100px;
  width: 100px;
  left: 50px;
  top: 0;
  background: url(../assets/wizer_logo.png) no-repeat;
}
.content {
  background: url(../assets/bg.png) center / 100% 100% no-repeat;
  font-size: 48px;
  p {
    color: white;
    margin-top: 121px;
    text-align: center;
  }
}
.login {
  min-height: 100vh;
  position: relative;
}
.footer {
  height: 60px;
  background-color: #464646;
  color: white;
}
</style>
