// src/pages/consultas/table.js

const columnsConsultas = [
  { name: 'pet_nome', align: 'left', label: 'Pet', field: 'pet_nome', sortable: true },
  { name: 'motivo', align: 'left', label: 'Motivo', field: 'motivo', sortable: true },
  { name: 'observacoes', align: 'left', label: 'Observações', field: 'observacoes', sortable: true },
  { name: 'actions', align: 'right', label: 'Ações', field: 'actions', sortable: false }
]

export {
  columnsConsultas
}