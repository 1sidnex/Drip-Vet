<template>
  <q-layout view="lHh Lpr lFf">
    <q-header style="background-color: #357a44;">
      <q-toolbar>
        </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'LoginLayout'
  // A função setup foi removida daqui
})
</script>