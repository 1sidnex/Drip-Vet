import { useQuasar } from 'quasar'

export default function useNotify () {
  const $q = useQuasar()

  const notifySuccess = (message) => {
    $q.notify({
      type: 'positive',
      message: message || 'Sucesso!',
      position: 'top'
    })
  }

  const notifyError = (message) => {
    $q.notify({
      type: 'negative',
      message: message || 'Erro!',
      position: 'top'
    })
  }

  // ESTA É A VERSÃO CORRIGIDA DA FUNÇÃO
  const confirmDialog = (title, message) => {
    return new Promise((resolve) => {
      $q.dialog({
        title: title,
        message: message,
        cancel: true,
        persistent: true
      }).onOk(() => {
        resolve(true) // Retorna 'true' se o usuário clicar em "OK"
      }).onCancel(() => {
        resolve(false) // Retorna 'false' se o usuário clicar em "Cancelar"
      })
    })
  }

  return {
    notifySuccess,
    notifyError,
    confirmDialog
  }
}