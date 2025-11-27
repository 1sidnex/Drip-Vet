<template>
  <q-page padding>
    <div class="text-h5 q-mb-md">Bem-vindo(a), {{ user?.user_metadata?.nome || 'Usuário' }}</div>

    <div class="row q-col-gutter-md">
      <!-- Tutores -->
      <div
        v-if="podeVer('tutores')"
        class="col-md-4 col-xs-12 col-sm-6"
      >
        <card-dashboard
          table="tutores" 
          label="Tutores"
          icon="mdi-account-heart"
        />
      </div>

      <!-- Pets -->
      <div
        v-if="podeVer('pets')"
        class="col-md-4 col-xs-12 col-sm-6"
      >
        <card-dashboard
          table="pets"
          label="Pets"
          icon="mdi-paw"
        />
      </div>

      <!-- Agendamentos -->
      <div
        v-if="podeVer('agendamentos')"
        class="col-md-4 col-xs-12 col-sm-6"
      >
        <card-dashboard
          table="agendamentos"
          label="Agendamentos"
          icon="mdi-calendar-clock"
        />
      </div>

      <!-- Estoque de medicamentos -->
      <div
        v-if="podeVer('estoque')"
        class="col-md-4 col-xs-12 col-sm-6"
      >
        <card-dashboard
          table="estoque"
          label="Estoque de Medicamentos"
          icon="mdi-pill"
        />
      </div>

      <!-- Usuários (somente master) -->
      <div
        v-if="podeVer('usuarios')"
        class="col-md-4 col-xs-12 col-sm-6"
      >
        <card-dashboard
          table="usuarios"
          label="Usuários"
          icon="mdi-account-multiple"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, defineAsyncComponent } from 'vue'
import useAuthUser from 'src/composables/UseAuthUser'

export default defineComponent({
  name: 'PageMe',
  components: {
    CardDashboard: defineAsyncComponent(() => import('components/CardDashbaord.vue'))
  },
  setup () {
    const { user } = useAuthUser()

    const permissoesPorNivel = {
      master: ['tutores', 'pets', 'agendamentos', 'estoque', 'usuarios'],
      veterinario: ['tutores', 'pets', 'agendamentos', 'estoque'],
      administrativo: ['tutores', 'pets', 'agendamentos', 'estoque']
    }

    const podeVer = (modulo) => {
      const nivel = user.value?.user_metadata?.tipoUsuario
      return permissoesPorNivel[nivel]?.includes(modulo)
    }

    return {
      user,
      podeVer
    }
  }
})
</script>
