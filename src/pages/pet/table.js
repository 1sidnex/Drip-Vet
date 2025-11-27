import { ref } from 'vue'

const columnsPets = [
  { name: 'nome', align: 'left', label: 'Nome', field: 'nome', sortable: true },
  { name: 'tutor', align: 'left', label: 'Tutor', field: 'tutor', sortable: true },
  { name: 'raca', align: 'left', label: 'Raça', field: 'raca', sortable: true },
  { name: 'sexo', align: 'left', label: 'Sexo', field: 'sexo', sortable: true },
  { name: 'dataNasc', align: 'left', label: 'Data de Nascimento', field: 'dataNasc', sortable: true },
  { name: 'idade', align: 'left', label: 'Idade', field: 'idade', sortable: true },
  { name: 'peso', align: 'left', label: 'Peso', field: 'peso', sortable: true },
  { name: 'chip', align: 'left', label: 'Possui Chip', field: 'chip', sortable: true },
  { name: 'saude', align: 'left', label: 'Saúde', field: 'saude', sortable: true },
  { name: 'observacoes', align: 'left', label: 'Observações', field: 'observacoes', sortable: true },
  { name: 'imgUrl', align: 'left', label: 'Imagem', field: 'imgUrl', sortable: false },
  { name: 'actions', align: 'right', label: 'Ações', field: 'actions', sortable: false }
]

const initialPagination = ref({
  page: 1,
  rowsPerPage: 8
})

export {
  columnsPets,
  initialPagination
}
