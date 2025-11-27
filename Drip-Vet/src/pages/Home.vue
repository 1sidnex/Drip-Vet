<template>
  <q-page padding class="home-page">
    <div class="welcome-text">
      <h1>Drip Vet</h1>
      <p>Sistema de Gerenciamento <br />para Clínica Veterinária</p>

      <ul class="action-links">
        <li @click="goTo('form-pet')" class="action-item">
          <div class="icon-circle">
            <q-icon name="pets" size="20px" />
          </div>
          <span class="action-label">Novo Pet</span>
        </li>
        <li @click="goTo('tutor')" class="action-item">
          <div class="icon-circle">
            <q-icon name="people" size="20px" />
          </div>
          <span class="action-label">Tutores</span>
        </li>
        <li @click="goTo('form-agendamento')" class="action-item">
          <div class="icon-circle">
            <q-icon name="calendar_today" size="20px" />
          </div>
          <span class="action-label">Novo Agendamento</span>
        </li>
        <li @click="goTo('agendamento')" class="action-item">
          <div class="icon-circle">
            <q-icon name="event_note" size="20px" />
          </div>
          <span class="action-label">Agenda</span>
        </li>
      </ul>
    </div>

    <div class="agenda-container">
      <h2 class="agenda-title">Agenda de Hoje</h2>
      <p class="agenda-subtitle">Próximos atendimentos agendados</p>

      <div v-if="loading" class="text-center q-pa-md">
        <q-spinner color="primary" size="3em" />
        <p class="q-mt-md">Carregando agenda...</p>
      </div>

      <div v-else-if="agenda.length === 0" class="text-center q-pa-md">
        <p class="text-grey">Nenhum agendamento para hoje</p>
      </div>

      <div class="agenda-card" v-for="(item, index) in agenda" :key="item.id || index">
        <div class="agenda-icon">
          <q-icon name="pets" size="24px" />
        </div>
        <div class="agenda-info">
          <strong>{{ item.horario }} - {{ item.nomePet }}</strong>
          <p>Tutor: {{ item.nomeTutor }}</p>
          <p>Tipo: {{ item.tipoConsulta || 'Não informado' }}</p>
        </div>
        <q-btn
          unelevated
          :color="botaoClicado[index] ? 'green-10' : 'white'"
          :text-color="botaoClicado[index] ? 'white' : 'black'"
          label="Ver Detalhes"
          size="sm"
          class="agenda-btn"
          @click="abrirDetalhes(item)"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import useNotify from 'src/composables/UseNotify'
import { supabase } from 'src/boot/supabase'
import { date, useQuasar } from 'quasar'

const router = useRouter()
const { notifyError } = useNotify()
const $q = useQuasar()

const agenda = ref([])
const loading = ref(true)
const botaoClicado = ref([]) // controla a cor de cada botão
const detalhesAgendamento = ref(null)

function goTo(page) {
  router.push(`/app/${page}`)
}

const carregarAgendaDoDia = async () => {
  try {
    loading.value = true

    // Obtém a data de hoje no formato YYYY-MM-DD
    const hoje = new Date()
    const dataHoje = date.formatDate(hoje, 'YYYY-MM-DD')

    // Busca agendamentos do dia atual
    const { data: agendamentos, error } = await supabase
      .from('agendamento')
      .select('*')
      .eq('dataConsulta', dataHoje)
      .order('horaConsulta', { ascending: true })

    if (error) throw error

    // Busca os nomes dos tutores, pets e veterinários
    const agendaFormatada = await Promise.all(
      (agendamentos || []).map(async (agendamento) => {
        let nomeTutor = 'Não informado'
        let nomePet = 'Não informado'
        let nomeVeterinario = 'Não informado'

        // Busca nome do tutor
        if (agendamento.tutor) {
          try {
            const { data: tutor } = await supabase
              .from('tutores')
              .select('nome')
              .eq('id', agendamento.tutor)
              .single()

            if (tutor) {
              nomeTutor = tutor.nome
            }
          } catch (err) {
            console.warn('Erro ao buscar tutor:', err)
          }
        }

        // Busca nome do pet
        if (agendamento.pet) {
          try {
            const { data: pet } = await supabase
              .from('pets')
              .select('nome')
              .eq('id', agendamento.pet)
              .single()

            if (pet) {
              nomePet = pet.nome
            }
          } catch (err) {
            console.warn('Erro ao buscar pet:', err)
          }
        }

        // Busca nome do veterinário
        if (agendamento.vet) {
          try {
            const { data: veterinario } = await supabase
              .from('usuarios')
              .select('nome')
              .eq('id', agendamento.vet)
              .single()

            if (veterinario) {
              nomeVeterinario = veterinario.nome
            }
          } catch (err) {
            console.warn('Erro ao buscar veterinário:', err)
          }
        }

        // Formata o horário (remove segundos se existirem)
        let horarioFormatado = agendamento.horaConsulta || 'Não informado'
        if (horarioFormatado && horarioFormatado.includes(':')) {
          const partes = horarioFormatado.split(':')
          if (partes.length >= 2) {
            horarioFormatado = `${partes[0]}:${partes[1]}`
          }
        }

        return {
          id: agendamento.id,
          horario: horarioFormatado,
          nomePet: nomePet,
          nomeTutor: nomeTutor,
          nomeVeterinario: nomeVeterinario,
          tipoConsulta: agendamento.tipoConsulta || 'Não informado',
          observacoes: agendamento.observacoes || '',
        }
      }),
    )

    agenda.value = agendaFormatada
    loading.value = false
  } catch (error) {
    console.error('Erro ao carregar agenda:', error)
    notifyError('Erro ao carregar agenda do dia: ' + error.message)
    loading.value = false
  }
}

const abrirDetalhes = (agendamento) => {
  detalhesAgendamento.value = agendamento

  $q.dialog({
    title: 'Detalhes do Agendamento',
    message: `
      <div style="text-align: left; padding: 10px;">
        <p><strong>Horário:</strong> ${agendamento.horario}</p>
        <p><strong>Pet:</strong> ${agendamento.nomePet}</p>
        <p><strong>Tutor:</strong> ${agendamento.nomeTutor}</p>
        <p><strong>Veterinário:</strong> ${agendamento.nomeVeterinario}</p>
        <p><strong>Tipo de Consulta:</strong> ${agendamento.tipoConsulta}</p>
        ${agendamento.observacoes ? `<p><strong>Observações:</strong></p><p style="background: #f5f5f5; padding: 10px; border-radius: 5px; margin-top: 5px;">${agendamento.observacoes}</p>` : '<p><strong>Observações:</strong> Nenhuma observação cadastrada.</p>'}
      </div>
    `,
    html: true,
    ok: {
      label: 'Fechar',
      color: 'primary',
      flat: true,
    },
    persistent: true,
  }).onOk(() => {
    detalhesAgendamento.value = null
  })
}

onMounted(() => {
  carregarAgendaDoDia()
})
</script>

<style scoped>
.home-page {
  display: flex;
  align-items: flex-start;
  padding-top: 80px;
  padding-left: 200px;
  padding-right: 80px;
  flex-wrap: wrap;
  gap: 40px;
}

.welcome-text {
  max-width: 400px;
}

.welcome-text h1 {
  font-size: 4rem;
  margin: 0;
  font-weight: bold;
  color: black;
}

.welcome-text p {
  font-size: 1.5rem;
  margin-top: 0.5rem;
  color: black;
  font-weight: 600;
}

.action-links {
  list-style: none;
  padding-left: 0;
  margin-top: 1.5rem;
}

.action-links li {
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  transition: background-color 0.2s ease;
  padding: 6px 10px;
  border-radius: 6px;
}

.action-links li:hover {
  background-color: #a7f3d0;
}

.icon-circle {
  width: 32px;
  height: 32px;
  background-color: #14532d;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  transition: background-color 0.2s ease;
}

.action-links li:hover .icon-circle {
  background-color: #86efac;
}

.icon-circle .q-icon {
  color: white;
  transition: color 0.2s ease;
}

.action-links li:hover .icon-circle .q-icon {
  color: #14532d;
}

.action-label {
  font-size: 1.3rem;
  color: black;
  user-select: none;
  transition: color 0.2s ease;
}

.action-links li:hover .action-label {
  color: #14532d;
}

/* ======== AGENDA DE HOJE ======== */

.agenda-container {
  background-color: #a0e2a9;
  padding: 24px;
  border-radius: 16px;
  max-width: 500px;
  flex: 1;
  min-width: 320px;
  margin-left: 60px;
}

.agenda-title {
  font-size: 1.8rem;
  color: black;
  margin-bottom: 4px;
  text-align: center;
  font-weight: bold;
}

.agenda-subtitle {
  color: black;
  margin-bottom: 20px;
  font-weight: 500;
  text-align: center;
}

.agenda-card {
  background-color: #82c993;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.agenda-icon {
  margin-right: 12px;
  margin-top: 4px;
  color: #14532d;
}

.agenda-info {
  flex: 1;
}

.agenda-info strong {
  color: #065f46;
  display: block;
  margin-bottom: 4px;
}

.agenda-info p {
  margin: 0;
  font-size: 0.9rem;
  color: #07080a;
}

.agenda-btn {
  margin-left: 12px;
  white-space: nowrap;
}
</style>