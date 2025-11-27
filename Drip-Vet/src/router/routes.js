const routes = [
  {
    path: '/',
    component: () => import('layouts/LoginLayout.vue'),
    children: [
      { path: '', name: 'loginDefault', component: () => import('pages/Login.vue') },
      { path: 'login', name: 'login', component: () => import('pages/Login.vue') },
      { path: 'register', name: 'register', component: () => import('pages/Register.vue') },
      { path: 'email-confirmation', name: 'email-confirmation', component: () => import('pages/EmailConfirmation.vue') },
      { path: 'forgot-password', name: 'forgot-password', component: () => import('pages/ForgotPassword.vue') },
      { path: 'reset-password', name: 'reset-password', component: () => import('pages/ResetPassword.vue') }
    ]
  },
  {
    path: '/app',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: '/app/home' },

      { path: 'home', name: 'home', component: () => import('pages/Home.vue') },
      { path: 'me', name: 'me', component: () => import('pages/Me.vue') },
      
      // Rotas existentes
      { path: 'tutor', name: 'tutor', component: () => import('pages/tutor/List.vue') },
      { path: 'form-tutor/:id?', name: 'form-tutor', component: () => import('pages/tutor/Form.vue') },
      { path: 'pet', name: 'pet', component: () => import('pages/pet/List.vue') },
      { path: 'form-pet/:id?', name: 'form-pet', component: () => import('pages/pet/Form.vue') },
      { path: 'estoqueMed', name: 'estoqueMed', component: () => import('pages/estoqueMed/List.vue') },
      { path: 'form-estoqueMed/:id?', name: 'form-estoqueMed', component: () => import('pages/estoqueMed/Form.vue') },
      { path: 'agendamento', name: 'agendamento', component: () => import('pages/agendamento/List.vue') },
      { path: 'form-agendamento/:id?', name: 'form-agendamento', component: () => import('pages/agendamento/Form.vue') },
      { path: 'usuarios', name: 'usuarios', component: () => import('pages/usuarios/List.vue') },
      { path: 'form-usuarios/:id?', name: 'form-usuarios', component: () => import('pages/usuarios/Form.vue') },
      { path: 'form-config/:id?', name: 'form-config', component: () => import('pages/config/Form.vue') },

      // Rotas mantidas:
      { path: 'campanhas', name: 'campanhas', component: () => import('pages/campanhas/List.vue') },
      { path: 'form-campanha/:id?', name: 'form-campanha', component: () => import('pages/campanhas/Form.vue') },
      { path: 'vacinacao', name: 'vacinacao', component: () => import('pages/vacinacao/List.vue') },
      { path: 'form-vacinacao/:id?', name: 'form-vacinacao', component: () => import('pages/vacinacao/Form.vue') }
    ],
    meta: { requiresAuth: true }
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes