<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-green-moss text-white">
      <q-toolbar>
        <q-toolbar-title 
          class="text-white logo-clickable" 
          @click="goToHome"
        >
          DripVet
        </q-toolbar-title>

        <div class="q-gutter-sm row items-center">
          <q-btn
            flat
            label="Home"
            @click="goToHome"
            :class="[{ 'active-tab': isActive('home') }, 'tab']"
          />
          <q-btn
            flat
            label="Tutores"
            @click="goTo('tutor')"
            :class="[{ 'active-tab': isActive('tutor') }, 'tab']"
          />
          <q-btn
            flat
            label="Pets"
            @click="goTo('pet')"
            :class="[{ 'active-tab': isActive('pet') }, 'tab']"
          />
          <q-btn
            flat
            label="Agendamentos"
            @click="goTo('agendamento')"
            :class="[{ 'active-tab': isActive('agendamento') }, 'tab']"
          />
          <q-btn
            flat
            label="Remédios"
            @click="goTo('estoqueMed')"
            :class="[{ 'active-tab': isActive('estoqueMed') }, 'tab']"
          />
          <q-btn
            flat
            label="Campanhas"
            @click="goTo('campanhas')"
            :class="[{ 'active-tab': isActive('campanhas') }, 'tab']"
          />
          <q-btn
            flat
            label="Vacinação"
            @click="goTo('vacinacao')"
            :class="[{ 'active-tab': isActive('vacinacao') }, 'tab']"
          />

          <q-btn
            flat
            dense
            icon="logout"
            aria-label="Logout"
            @click="logoutUser"
            class="tab"
          />
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container class="bg-menta-light">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import useAuthUser from 'src/composables/UseAuthUser'
import useApi from 'src/composables/UseApi'

const router = useRouter()
const route = useRoute()
const { logout } = useAuthUser()
const { getBrand } = useApi()

onMounted(() => {
  getBrand()
})

function goTo(page) {
  router.push(`/app/${page}`)
}

function goToHome() {
  if (route.path === '/app/home') {
    router.go(0)
  } else {
    router.push('/app/home')
  }
}

async function logoutUser() {
  await logout()
  router.push('/')
}

function isActive(page) {
  return route.path === `/app/${page}`
}
</script>

<style scoped>
.bg-green-moss {
  background-color: #357a44;
}

.bg-menta-light {
  background-color: #bdecc5;
  min-height: 100vh;
}

.active-tab {
  font-weight: bold;
  background-color: #78a282;
  border-radius: 6px;
}

.tab {
  color: white;
}

.tab:hover{
  background-color: #78a282;
}

.logo-clickable {
  cursor: pointer;
  user-select: none;
  transition: opacity 0.2s ease;
}

.logo-clickable:hover {
  opacity: 0.8;
}
</style>