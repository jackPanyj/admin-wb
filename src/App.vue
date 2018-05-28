<template lang="pug">
div#app
  router-view
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="scss">
@import './sass/base';
#app {
  display: flex;
  height: 100vh;
  min-width: 100vw;
  flex-direction: column;
}
</style>
