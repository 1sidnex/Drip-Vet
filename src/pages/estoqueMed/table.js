const columns_estoqueMed = [
  { name: 'nome', align: 'left', label: 'Nome', field: 'nome', sortable: true },
  { name: 'quantidade', align: 'left', label: 'Quantidade', field: 'quantidade', sortable: true },
  { name: 'fornecedor', align: 'left', label: 'Fornecedor', field: 'fornecedor', sortable: true },
  { name: 'dataEntrada', align: 'left', label: 'Última Entrada', field: 'dataEntrada', sortable: true },
  { name: 'dataSaida', align: 'left', label: 'Última Saída', field: 'dataSaida', sortable: true },
  { name: 'observacoes', align: 'left', label: 'Observações', field: 'observacoes', sortable: true },
  { name: 'actions', align: 'right', label: 'Ações', field: 'actions', sortable: false }
]

export {
  columns_estoqueMed
}